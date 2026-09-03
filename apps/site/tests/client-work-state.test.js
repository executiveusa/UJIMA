import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createClientChatStore } from '../../../services/mission-api/src/agent/client-chat-store.js';
import clientChatRouter from '../../../services/mission-api/src/agent/client-chat-router.js';
import {
  CLIENT_MISSION_STATE_EVENT,
  getClientMissionWorkState,
  latestConversationWorkState,
  transitionClientMissionState
} from '../../../services/mission-api/src/agent/client-work-state.js';
import { routeFirstMateMission } from '../../../services/mission-api/src/agent/firstmate-mission-router.js';

function eventHarness() {
  const events = [];
  let sequence = 0;
  const read = ({ tenantId, type } = {}) => events.filter((event) => {
    if (tenantId && event.tenantId !== tenantId) return false;
    if (type && event.type !== type) return false;
    return true;
  });
  const append = (event) => {
    sequence += 1;
    const row = { id: `evt-${sequence}`, createdAt: new Date(1_900_000_000_000 + sequence).toISOString(), ...event };
    events.push(row);
    return row;
  };
  return { events, read, append };
}

async function missionFixture({ text = 'Prepare a draft grant application.' } = {}) {
  const harness = eventHarness();
  const store = createClientChatStore({ read: harness.read, append: harness.append });
  const tenantId = 'asc3nd';
  const userId = 'u1';
  const conversation = await store.createConversation({ tenantId, userId, title: 'State machine' });
  const message = await store.appendMessage({ tenantId, userId, conversationId: conversation.conversationId, role: 'user', text });
  const routed = routeFirstMateMission({ tenantId, userId, conversationId: conversation.conversationId, sourceMessage: message, read: harness.read, append: harness.append });
  return { ...harness, store, tenantId, userId, conversation, message, routed };
}

describe('durable client work-state engine', () => {
  it('keeps routed internal work truthful and only exposes Working after execution starts', async () => {
    const fx = await missionFixture();
    const initial = getClientMissionWorkState({
      tenantId: fx.tenantId,
      userId: fx.userId,
      conversationId: fx.conversation.conversationId,
      missionId: fx.routed.mission.mission_id,
      read: fx.read
    });
    expect(initial.phase).toBe('routed');
    expect(initial.status).toBeNull();
    expect(initial.label).toBeNull();

    const started = transitionClientMissionState({
      tenantId: fx.tenantId,
      userId: fx.userId,
      conversationId: fx.conversation.conversationId,
      missionId: fx.routed.mission.mission_id,
      to: 'working',
      actor: 'grant-worker',
      idempotencyKey: 'state-start-12345678',
      read: fx.read,
      append: fx.append
    });
    expect(started.projection).toMatchObject({ status: 'working', label: 'Working', phase: 'working' });
    expect(fx.events.filter((event) => event.type === CLIENT_MISSION_STATE_EVENT)).toHaveLength(1);
  });

  it('requires proof for Ready and Delivered and forbids skipping directly to Delivered', async () => {
    const fx = await missionFixture();
    const scope = {
      tenantId: fx.tenantId,
      userId: fx.userId,
      conversationId: fx.conversation.conversationId,
      missionId: fx.routed.mission.mission_id,
      read: fx.read,
      append: fx.append
    };
    transitionClientMissionState({ ...scope, to: 'working', idempotencyKey: 'state-start-22345678' });
    expect(() => transitionClientMissionState({ ...scope, to: 'ready', idempotencyKey: 'state-ready-22345678' })).toThrow('READY_PROOF_REQUIRED');
    const ready = transitionClientMissionState({ ...scope, to: 'ready', proofRefs: ['artifact:grant-fit-1'], idempotencyKey: 'state-ready-32345678' });
    expect(ready.projection.status).toBe('ready');
    expect(() => transitionClientMissionState({ ...scope, to: 'delivered', idempotencyKey: 'state-deliver-22345678' })).toThrow('DELIVERY_PROOF_REQUIRED');
    const delivered = transitionClientMissionState({ ...scope, to: 'delivered', proofRefs: ['delivery:packet-1'], idempotencyKey: 'state-deliver-32345678' });
    expect(delivered.projection).toMatchObject({ status: 'delivered', label: 'Delivered' });

    const other = await missionFixture();
    expect(() => transitionClientMissionState({
      tenantId: other.tenantId,
      userId: other.userId,
      conversationId: other.conversation.conversationId,
      missionId: other.routed.mission.mission_id,
      to: 'delivered',
      proofRefs: ['delivery:fake'],
      idempotencyKey: 'state-skip-12345678',
      read: other.read,
      append: other.append
    })).toThrow('INVALID_WORK_TRANSITION:routed->delivered');
  });

  it('requires a recorded approval reference to leave a consequential Needs you gate', async () => {
    const fx = await missionFixture({ text: 'Submit the strongest grant application today.' });
    expect(fx.routed.mission.status).toBe('needs_you');
    const scope = {
      tenantId: fx.tenantId,
      userId: fx.userId,
      conversationId: fx.conversation.conversationId,
      missionId: fx.routed.mission.mission_id,
      read: fx.read,
      append: fx.append
    };
    expect(() => transitionClientMissionState({ ...scope, to: 'working', idempotencyKey: 'state-approval-12345678' })).toThrow('APPROVAL_REF_REQUIRED');
    const approved = transitionClientMissionState({ ...scope, to: 'working', approvalRef: 'approval:human-1', idempotencyKey: 'state-approval-22345678' });
    expect(approved.projection.status).toBe('working');
    expect(approved.projection.approvalRef).toBe('approval:human-1');
  });

  it('fails closed across tenant/user boundaries and makes transition retries idempotent', async () => {
    const fx = await missionFixture();
    const args = {
      tenantId: fx.tenantId,
      userId: fx.userId,
      conversationId: fx.conversation.conversationId,
      missionId: fx.routed.mission.mission_id,
      to: 'working',
      idempotencyKey: 'state-idempotent-12345678',
      read: fx.read,
      append: fx.append
    };
    const first = transitionClientMissionState(args);
    const second = transitionClientMissionState(args);
    expect(second.reused).toBe(true);
    expect(second.eventId).toBe(first.eventId);
    expect(fx.events.filter((event) => event.type === CLIENT_MISSION_STATE_EVENT)).toHaveLength(1);

    expect(() => getClientMissionWorkState({
      tenantId: fx.tenantId,
      userId: 'u2',
      conversationId: fx.conversation.conversationId,
      missionId: fx.routed.mission.mission_id,
      read: fx.read
    })).not.toThrow();
    expect(getClientMissionWorkState({
      tenantId: fx.tenantId,
      userId: 'u2',
      conversationId: fx.conversation.conversationId,
      missionId: fx.routed.mission.mission_id,
      read: fx.read
    })).toBeNull();
    expect(() => transitionClientMissionState({ ...args, userId: 'u2', idempotencyKey: 'state-cross-user-12345678' })).toThrow('MISSION_NOT_FOUND');
  });

  it('returns the latest durable state for a conversation', async () => {
    const fx = await missionFixture({ text: 'Prepare next week’s content plan.' });
    transitionClientMissionState({
      tenantId: fx.tenantId,
      userId: fx.userId,
      conversationId: fx.conversation.conversationId,
      missionId: fx.routed.mission.mission_id,
      to: 'working',
      idempotencyKey: 'state-latest-12345678',
      read: fx.read,
      append: fx.append
    });
    expect(latestConversationWorkState({ tenantId: fx.tenantId, userId: fx.userId, conversationId: fx.conversation.conversationId, read: fx.read })).toMatchObject({ status: 'working', area: 'content' });
  });
});

let dataDir;
let httpServer = null;

beforeEach(() => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'asc3nd-work-state-'));
  process.env.DATA_DIR = dataDir;
  process.env.JWT_SECRET = 'client-work-state-secret-1234567890';
});

afterEach(async () => {
  if (httpServer) {
    await new Promise((resolve) => httpServer.close(resolve));
    httpServer = null;
  }
  if (dataDir) fs.rmSync(dataDir, { recursive: true, force: true });
  delete process.env.DATA_DIR;
  delete process.env.JWT_SECRET;
});

function sign(payload) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 60_000 })).toString('base64url');
  const sig = crypto.createHmac('sha256', process.env.JWT_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use('/api/agent/client-chat', clientChatRouter);
  return new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1', () => {
      httpServer = server;
      resolve(`http://127.0.0.1:${server.address().port}`);
    });
    server.on('error', reject);
  });
}

describe('durable work-state HTTP reload projection', () => {
  it('reconstructs the latest client-safe work state after a conversation reload', async () => {
    const baseUrl = await startServer();
    const token = sign({ sub: 'u1', tenantId: 'asc3nd', role: 'owner' });
    const headers = { authorization: `Bearer ${token}`, 'content-type': 'application/json' };
    const createdResponse = await fetch(`${baseUrl}/api/agent/client-chat/conversations`, { method: 'POST', headers, body: JSON.stringify({ title: 'Reload state' }) });
    const created = await createdResponse.json();
    const conversationId = created.conversation.conversationId;
    const postResponse = await fetch(`${baseUrl}/api/agent/client-chat/conversations/${conversationId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ text: 'Prepare a draft grant application.', idempotencyKey: 'chat-reload-state-12345678' })
    });
    const posted = await postResponse.json();
    expect(posted.work).toMatchObject({ phase: 'routed', status: null, label: null });

    transitionClientMissionState({
      tenantId: 'asc3nd',
      userId: 'u1',
      conversationId,
      missionId: posted.work.id,
      to: 'working',
      actor: 'grant-worker',
      idempotencyKey: 'state-http-start-12345678'
    });

    const reloadResponse = await fetch(`${baseUrl}/api/agent/client-chat/conversations/${conversationId}`, { headers });
    expect(reloadResponse.status).toBe(200);
    const reloaded = await reloadResponse.json();
    expect(reloaded.work).toMatchObject({ id: posted.work.id, status: 'working', label: 'Working', phase: 'working' });
  });
});
