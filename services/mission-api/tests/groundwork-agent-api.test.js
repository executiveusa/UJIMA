import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { emitEvent, readEvents } from '../../../packages/core/src/events.js';
import { getArtifacts } from '../../../packages/core/src/artifacts.js';
import { CLIENT_MISSION_EVENT } from '../src/agent/firstmate-mission-router.js';
import { CLIENT_GROUNDWORK_STAGE_EVENT } from '../src/agent/client-work-state.js';
import { createArtifact } from '../src/agent/artifacts.js';
import {
  resolveGroundworkMissionScope,
  getGroundworkMission,
  startGroundworkStage,
  blockGroundworkStage,
  verifyGroundworkArtifact,
  completeGroundworkStage
} from '../src/agent/groundwork.js';

const TENANT = 'groundwork-agent-test';
const USER = 'user-real';
const CONVERSATION = 'conv-real';
const MISSION = 'msn_groundwork_test';

let dataDir;

function workflow() {
  return [
    ['identity', 'Identity'],
    ['trust', 'Trust'],
    ['discovery', 'Discovery'],
    ['readiness', 'Readiness'],
    ['repair', 'Repair'],
    ['proof', 'Proof']
  ].map(([id, label], index) => ({
    id,
    label,
    outcome: label + ' outcome',
    order: index + 1,
    status: 'pending'
  }));
}

function seedMission() {
  return emitEvent({
    tenantId: TENANT,
    type: CLIENT_MISSION_EVENT,
    actor: 'firstmate',
    subject: MISSION,
    payload: {
      execution_mode: 'route-only',
      execution_state: 'routed',
      handoff: {
        version: '1.0.0',
        mission_id: MISSION,
        tenant_id: TENANT,
        user_id: USER,
        conversation_id: CONVERSATION,
        originating_message_id: 'msg_groundwork',
        objective: 'Run Groundwork.',
        domain: 'groundwork',
        risk_tier: 1,
        status: 'routed',
        approval: { required: false, class: null },
        allowed_capabilities: ['nonprofit_identity_check'],
        denied_capabilities: ['production_deploy'],
        workflow: workflow()
      }
    }
  });
}

function makeRes() {
  const res = { statusCode: 200, body: null };
  res.status = (statusCode) => { res.statusCode = statusCode; return res; };
  res.json = (body) => { res.body = body; return res; };
  return res;
}

function req({ operatorId = 'op-producer', params = {}, body = {}, headers = {}, tenantId = TENANT } = {}) {
  return {
    operator: { id: operatorId, tenantId },
    params,
    body,
    headers,
    path: '/groundwork-test',
    method: 'POST'
  };
}

beforeEach(() => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ujima-groundwork-agent-'));
  process.env.DATA_DIR = dataDir;
  seedMission();
});

afterEach(() => {
  delete process.env.DATA_DIR;
  fs.rmSync(dataDir, { recursive: true, force: true });
});

describe('Groundwork Agent Service bridge', () => {
  it('derives client scope from the durable mission instead of worker-controlled fields', () => {
    const scope = resolveGroundworkMissionScope({ tenantId: TENANT, missionId: MISSION });
    expect(scope).toMatchObject({
      tenantId: TENANT,
      userId: USER,
      conversationId: CONVERSATION,
      missionId: MISSION
    });

    const res = makeRes();
    startGroundworkStage(req({
      params: { missionId: MISSION, stageId: 'identity' },
      headers: { 'x-idempotency-key': 'worker-start-identity-12345678' },
      body: { tenantId: 'evil-tenant', userId: 'evil-user', conversationId: 'evil-conversation' }
    }), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.projection.currentStage).toMatchObject({ id: 'identity', status: 'working' });

    const stage = readEvents({ tenantId: TENANT, type: CLIENT_GROUNDWORK_STAGE_EVENT }).at(-1).payload.stage;
    expect(stage.tenant_id).toBe(TENANT);
    expect(stage.user_id).toBe(USER);
    expect(stage.conversation_id).toBe(CONVERSATION);
  });

  it('binds artifact producer identity to the authenticated operator and ignores spoofed createdBy', () => {
    const res = makeRes();
    createArtifact(req({
      operatorId: 'op-producer',
      body: {
        missionId: MISSION,
        kind: 'groundwork-evidence',
        title: 'Identity evidence',
        storagePath: 'groundwork/identity.json',
        approvalClass: 'green',
        createdBy: 'op-verifier'
      }
    }), res);

    expect(res.statusCode).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.artifact.createdBy).toBe('op-producer');
    expect(getArtifacts({ tenantId: TENANT })[0].createdBy).toBe('op-producer');
  });

  it('requires a separate verifier before the producer can complete a stage', () => {
    const artifactRes = makeRes();
    createArtifact(req({
      operatorId: 'op-producer',
      body: {
        missionId: MISSION,
        kind: 'groundwork-evidence',
        title: 'Identity evidence',
        storagePath: 'groundwork/identity.json',
        approvalClass: 'green'
      }
    }), artifactRes);
    const artifactId = artifactRes.body.artifact.id;

    const startRes = makeRes();
    startGroundworkStage(req({
      operatorId: 'op-producer',
      params: { missionId: MISSION, stageId: 'identity' },
      headers: { 'x-idempotency-key': 'gw-start-identity-12345678' }
    }), startRes);
    expect(startRes.statusCode).toBe(200);

    const earlyComplete = makeRes();
    completeGroundworkStage(req({
      operatorId: 'op-producer',
      params: { missionId: MISSION, stageId: 'identity' },
      headers: { 'x-idempotency-key': 'gw-complete-early-12345678' },
      body: { artifactIds: [artifactId] }
    }), earlyComplete);
    expect(earlyComplete.statusCode).toBe(409);
    expect(earlyComplete.body.error.message).toBe('GROUNDWORK_STAGE_PROOF_NOT_INDEPENDENTLY_VERIFIED');

    const selfVerify = makeRes();
    verifyGroundworkArtifact(req({
      operatorId: 'op-producer',
      params: { missionId: MISSION, artifactId },
      headers: { 'x-idempotency-key': 'gw-self-verify-12345678' }
    }), selfVerify);
    expect(selfVerify.statusCode).toBe(409);
    expect(selfVerify.body.error.message).toBe('GROUNDWORK_SELF_VERIFICATION_PROHIBITED');

    const verifyRes = makeRes();
    verifyGroundworkArtifact(req({
      operatorId: 'op-verifier',
      params: { missionId: MISSION, artifactId },
      headers: { 'x-idempotency-key': 'gw-independent-verify-12345678' }
    }), verifyRes);
    expect(verifyRes.statusCode).toBe(200);
    expect(verifyRes.body.verification.verifier).toBe('op-verifier');
    expect(verifyRes.body.verification.artifact_created_by).toBe('op-producer');

    const completeRes = makeRes();
    completeGroundworkStage(req({
      operatorId: 'op-producer',
      params: { missionId: MISSION, stageId: 'identity' },
      headers: { 'x-idempotency-key': 'gw-complete-identity-12345678' },
      body: { artifactIds: [artifactId], userId: 'spoofed-user' }
    }), completeRes);
    expect(completeRes.statusCode).toBe(200);
    expect(completeRes.body.projection.workflow[0]).toMatchObject({ id: 'identity', status: 'complete' });
    expect(completeRes.body.projection.currentStage).toMatchObject({ id: 'trust', status: 'pending' });
  });

  it('surfaces a worker block as Needs you with a concrete next action', () => {
    const res = makeRes();
    blockGroundworkStage(req({
      operatorId: 'op-producer',
      params: { missionId: MISSION, stageId: 'identity' },
      headers: { 'x-idempotency-key': 'gw-block-identity-12345678' },
      body: { nextAction: 'Provide the legal organization name.' }
    }), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.projection).toMatchObject({
      status: 'needs_you',
      nextAction: 'Provide the legal organization name.'
    });
    expect(res.body.projection.currentStage).toMatchObject({ id: 'identity', status: 'blocked' });
  });

  it('returns mission state through operator scope and refuses cross-tenant mission lookup', () => {
    const ok = makeRes();
    getGroundworkMission(req({ params: { missionId: MISSION } }), ok);
    expect(ok.statusCode).toBe(200);
    expect(ok.body.mission.user_id).toBe(USER);
    expect(ok.body.work.currentStage.id).toBe('identity');

    const denied = makeRes();
    getGroundworkMission(req({
      tenantId: 'other-tenant',
      params: { missionId: MISSION }
    }), denied);
    expect(denied.statusCode).toBe(404);
    expect(denied.body.error.message).toBe('GROUNDWORK_MISSION_NOT_FOUND');
  });

  it('requires idempotency keys for stage and verification mutations', () => {
    const res = makeRes();
    startGroundworkStage(req({ params: { missionId: MISSION, stageId: 'identity' } }), res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toBe('IDEMPOTENCY_KEY_REQUIRED');
  });
});
