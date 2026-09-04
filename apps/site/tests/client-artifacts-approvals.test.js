import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { registerArtifact } from '@asc3nd/core/artifacts';
import { listApprovals } from '@asc3nd/core/approval-lifecycle';
import { createClientChatStore } from '../../../services/mission-api/src/agent/client-chat-store.js';
import clientChatRouter from '../../../services/mission-api/src/agent/client-chat-router.js';
import { getClientMissionWorkState } from '../../../services/mission-api/src/agent/client-work-state.js';
import { CLIENT_MISSION_EVENT, routeFirstMateMission } from '../../../services/mission-api/src/agent/firstmate-mission-router.js';
import {
  decideMissionApproval,
  ensureMissionApproval,
  missionEvidence,
  resolveMissionArtifactFile
} from '../../../services/mission-api/src/agent/client-mission-evidence.js';
import { GET as getOpsApprovals } from '../app/api/ops/approvals/route.js';

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
    const row = { id: `evt-${sequence}`, createdAt: new Date(2_100_000_000_000 + sequence).toISOString(), ...event };
    events.push(row);
    return row;
  };
  return { events, read, append };
}

async function fixture(text = 'Prepare next week’s content plan.') {
  const harness = eventHarness();
  const store = createClientChatStore({ read: harness.read, append: harness.append });
  const tenantId = 'asc3nd';
  const userId = 'owner-1';
  const conversation = await store.createConversation({ tenantId, userId, title: 'Evidence' });
  const message = await store.appendMessage({ tenantId, userId, conversationId: conversation.conversationId, role: 'user', text });
  const routed = routeFirstMateMission({ tenantId, userId, conversationId: conversation.conversationId, sourceMessage: message, read: harness.read, append: harness.append });
  return { ...harness, store, tenantId, userId, conversation, routed };
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 60_000 })).toString('base64url');
  const sig = crypto.createHmac('sha256', process.env.JWT_SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

let dataDir;
let httpServer = null;
beforeEach(() => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'asc3nd-slice06-'));
  process.env.DATA_DIR = dataDir;
  process.env.JWT_SECRET = 'slice06-browser-session-secret-123456789';
});
afterEach(async () => {
  if (httpServer) {
    await new Promise((resolve) => httpServer.close(resolve));
    httpServer = null;
  }
  delete process.env.DATA_DIR;
  delete process.env.JWT_SECRET;
  fs.rmSync(dataDir, { recursive: true, force: true });
});

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

describe('Slice 06 mission artifacts and approvals', () => {
  it('returns only tenant-owned artifacts explicitly linked to the active mission', async () => {
    const fx = await fixture();
    const linked = registerArtifact({ tenantId: fx.tenantId, kind: 'content-plan', title: 'Week plan', storagePath: 'artifacts/week-plan.txt', sourceRefs: [`mission:${fx.routed.mission.mission_id}`], approvalStatus: 'approved' });
    registerArtifact({ tenantId: fx.tenantId, kind: 'other', title: 'Other mission', storagePath: 'artifacts/other.txt', sourceRefs: ['mission:msn_other'], approvalStatus: 'approved' });
    const evidence = missionEvidence({ tenantId: fx.tenantId, userId: fx.userId, conversationId: fx.conversation.conversationId, missionId: fx.routed.mission.mission_id, read: fx.read });
    expect(evidence.artifacts.map((artifact) => artifact.id)).toEqual([linked.id]);
    expect(() => missionEvidence({ tenantId: fx.tenantId, userId: 'other-user', conversationId: fx.conversation.conversationId, missionId: fx.routed.mission.mission_id, read: fx.read })).toThrow('MISSION_NOT_FOUND');
  });

  it('resolves artifact content only inside the tenant data root', async () => {
    const fx = await fixture();
    const dir = path.join(dataDir, fx.tenantId, 'artifacts');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'result.txt'), 'verified result', 'utf8');
    const artifact = registerArtifact({ tenantId: fx.tenantId, kind: 'result', title: 'Verified result', storagePath: 'artifacts/result.txt', sourceRefs: [`mission:${fx.routed.mission.mission_id}`], approvalStatus: 'approved' });
    const resolved = resolveMissionArtifactFile({ tenantId: fx.tenantId, userId: fx.userId, conversationId: fx.conversation.conversationId, missionId: fx.routed.mission.mission_id, artifactId: artifact.id, read: fx.read });
    expect(resolved.exists).toBe(true);
    expect(fs.readFileSync(resolved.absolute, 'utf8')).toBe('verified result');
  });

  it('rejects a mission-linked artifact symlink that escapes the tenant root', async () => {
    const fx = await fixture();
    const tenantArtifacts = path.join(dataDir, fx.tenantId, 'artifacts');
    fs.mkdirSync(tenantArtifacts, { recursive: true });
    const outside = path.join(dataDir, 'outside-secret.txt');
    fs.writeFileSync(outside, 'do not expose', 'utf8');
    const linkedPath = path.join(tenantArtifacts, 'linked-secret.txt');
    fs.symlinkSync(outside, linkedPath);
    const artifact = registerArtifact({ tenantId: fx.tenantId, kind: 'result', title: 'Linked secret', storagePath: 'artifacts/linked-secret.txt', sourceRefs: [`mission:${fx.routed.mission.mission_id}`], approvalStatus: 'approved' });
    expect(() => resolveMissionArtifactFile({ tenantId: fx.tenantId, userId: fx.userId, conversationId: fx.conversation.conversationId, missionId: fx.routed.mission.mission_id, artifactId: artifact.id, read: fx.read })).toThrow('ARTIFACT_SYMLINK_FORBIDDEN');
  });

  it('creates one durable mission-linked approval and shares its state through the core store', async () => {
    const fx = await fixture('Submit the strongest grant application today.');
    expect(fx.routed.mission.approval.required).toBe(true);
    const first = ensureMissionApproval({ tenantId: fx.tenantId, userId: fx.userId, conversationId: fx.conversation.conversationId, missionId: fx.routed.mission.mission_id, read: fx.read });
    const second = ensureMissionApproval({ tenantId: fx.tenantId, userId: fx.userId, conversationId: fx.conversation.conversationId, missionId: fx.routed.mission.mission_id, read: fx.read });
    expect(second.id).toBe(first.id);
    expect(first.actionPayload.missionId).toBe(fx.routed.mission.mission_id);
    expect(first.status).toBe('draft');
    expect(listApprovals({ tenantId: fx.tenantId }).map((row) => row.id)).toEqual([first.id]);
  });

  it('recovers a durable approval for a legacy needs_you mission with a missing approval flag', async () => {
    const fx = await fixture();
    const legacyMission = {
      version: '1.0.0',
      mission_id: 'msn_legacy_needs_you',
      tenant_id: fx.tenantId,
      user_id: fx.userId,
      conversation_id: fx.conversation.conversationId,
      domain: 'grants',
      objective: 'Review this legacy grant submission.',
      status: 'needs_you',
      approval: { required: false }
    };
    fx.append({ tenantId: fx.tenantId, type: CLIENT_MISSION_EVENT, actor: 'firstmate', subject: legacyMission.mission_id, payload: { handoff: legacyMission, execution_mode: 'route-only', execution_state: 'routed' } });
    const work = getClientMissionWorkState({ tenantId: fx.tenantId, userId: fx.userId, conversationId: fx.conversation.conversationId, missionId: legacyMission.mission_id, read: fx.read });
    expect(work).toMatchObject({ status: 'needs_you', approvalRequired: true });
    const evidence = missionEvidence({ tenantId: fx.tenantId, userId: fx.userId, conversationId: fx.conversation.conversationId, missionId: legacyMission.mission_id, read: fx.read, recoverApproval: true });
    expect(evidence.approval).toMatchObject({ status: 'draft', actionType: 'GRANT_SUBMISSION' });
    expect(evidence.approval.actionPayload.missionId).toBe(legacyMission.mission_id);
  });

  it('allows an authorized browser owner to approve but never executes the consequential action', async () => {
    const fx = await fixture('Submit the strongest grant application today.');
    ensureMissionApproval({ tenantId: fx.tenantId, userId: fx.userId, conversationId: fx.conversation.conversationId, missionId: fx.routed.mission.mission_id, read: fx.read });
    const approved = decideMissionApproval({ tenantId: fx.tenantId, userId: fx.userId, conversationId: fx.conversation.conversationId, missionId: fx.routed.mission.mission_id, decision: 'approve', actor: { sub: fx.userId, role: 'owner', tenantId: fx.tenantId }, read: fx.read });
    expect(approved.status).toBe('approved');
    expect(approved.approver).toBe(fx.userId);
    expect(approved.actionPayload.missionId).toBe(fx.routed.mission.mission_id);
    expect(approved.status).not.toBe('executed');
  });

  it('rejects a mission approval into a terminal recoverable decision without delivery claims', async () => {
    const fx = await fixture('Publish this campaign today.');
    ensureMissionApproval({ tenantId: fx.tenantId, userId: fx.userId, conversationId: fx.conversation.conversationId, missionId: fx.routed.mission.mission_id, read: fx.read });
    const rejected = decideMissionApproval({ tenantId: fx.tenantId, userId: fx.userId, conversationId: fx.conversation.conversationId, missionId: fx.routed.mission.mission_id, decision: 'reject', actor: { sub: fx.userId, role: 'owner', tenantId: fx.tenantId }, read: fx.read });
    expect(rejected.status).toBe('rejected');
    expect(rejected.status).not.toBe('executed');
    expect(rejected.status).not.toBe('verified');
  });

  it('requires a signed browser session before the shared ops approval route can read data', async () => {
    const unauthorized = await getOpsApprovals(new Request('http://localhost/api/ops/approvals'));
    expect(unauthorized.status).toBe(401);
    const token = sign({ sub: 'owner-1', tenantId: 'asc3nd', role: 'owner' });
    const authorized = await getOpsApprovals(new Request('http://localhost/api/ops/approvals', { headers: { authorization: `Bearer ${token}` } }));
    expect(authorized.status).toBe(200);
    const body = await authorized.json();
    expect(body).toMatchObject({ ok: true, tenantId: 'asc3nd' });
  });

  it('preserves artifact references from earlier missions in portable conversation export', async () => {
    const baseUrl = await startServer();
    const token = sign({ sub: 'owner-1', tenantId: 'asc3nd', role: 'owner' });
    const headers = { authorization: `Bearer ${token}`, 'content-type': 'application/json' };
    const created = await (await fetch(`${baseUrl}/api/agent/client-chat/conversations`, { method: 'POST', headers, body: JSON.stringify({ title: 'Multi mission' }) })).json();
    const conversationId = created.conversation.conversationId;
    const first = await (await fetch(`${baseUrl}/api/agent/client-chat/conversations/${conversationId}`, { method: 'POST', headers, body: JSON.stringify({ text: 'Prepare next week’s content plan.', idempotencyKey: 'slice06-export-first-12345678' }) })).json();
    const firstArtifact = registerArtifact({ tenantId: 'asc3nd', kind: 'content-plan', title: 'Earlier work', storagePath: 'artifacts/earlier.txt', sourceRefs: [`mission:${first.work.id}`], approvalStatus: 'approved' });
    await fetch(`${baseUrl}/api/agent/client-chat/conversations/${conversationId}`, { method: 'POST', headers, body: JSON.stringify({ text: 'Prepare a grant research plan.', idempotencyKey: 'slice06-export-second-12345678' }) });
    const exported = await (await fetch(`${baseUrl}/api/agent/client-chat/conversations/${conversationId}/export`, { headers })).json();
    expect(exported.session.artifact_refs).toContain(`artifact:${firstArtifact.id}`);
  });
});