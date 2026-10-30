import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import express from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { emitEvent, readEvents } from '../../../packages/core/src/events.js';
import { createOperatorKey } from '../../../packages/core/src/auth.js';
import { createRepositories, clearRepositoryCache } from '../../../packages/db/src/index.js';
import { getArtifacts } from '../../../packages/core/src/artifacts.js';
import { CLIENT_MISSION_EVENT } from '../src/agent/firstmate-mission-router.js';
import { CLIENT_GROUNDWORK_STAGE_EVENT } from '../src/agent/client-work-state.js';
import { createArtifact } from '../src/agent/artifacts.js';
import agentRouter from '../src/agent/index.js';
import {
  resolveGroundworkMissionScope,
  getGroundworkMission,
  startGroundworkStage,
  blockGroundworkStage,
  verifyGroundworkArtifact,
  completeGroundworkStage,
  collectGroundworkReadiness,
  collectGroundworkIdentity
} from '../src/agent/groundwork.js';

const TENANT = 'groundwork-agent-test';
const USER = 'user-real';
const CONVERSATION = 'conv-real';
const MISSION = 'msn_groundwork_test';

let dataDir;
let httpServer = null;

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
  process.env.MISSION_STORAGE = 'memory';
  clearRepositoryCache();
  createRepositories({ forceNew: true });
  seedMission();
});

afterEach(async () => {
  if (httpServer) {
    await new Promise((resolve) => httpServer.close(resolve));
    httpServer = null;
  }
  delete process.env.DATA_DIR;
  delete process.env.MISSION_STORAGE;
  clearRepositoryCache();
  vi.unstubAllGlobals();
  fs.rmSync(dataDir, { recursive: true, force: true });
});

async function startAgentServer() {
  const app = express();
  app.use(express.json());
  app.use('/api/agent', agentRouter);
  return new Promise((resolve, reject) => {
    const server = app.listen(0, '127.0.0.1', () => {
      httpServer = server;
      const address = server.address();
      resolve(`http://127.0.0.1:${address.port}`);
    });
    server.on('error', reject);
  });
}

describe('Groundwork Agent Service bridge', () => {
  it('enforces operator authentication at the HTTP boundary and accepts the tenant-bound key', async () => {
    const baseUrl = await startAgentServer();

    const denied = await fetch(`${baseUrl}/api/agent/groundwork/missions/${MISSION}`);
    expect(denied.status).toBe(401);

    const { rawKey } = createOperatorKey({
      tenantId: TENANT,
      label: 'groundwork-worker',
      scopes: ['operator'],
      createdBy: 'test'
    });
    const allowed = await fetch(`${baseUrl}/api/agent/groundwork/missions/${MISSION}`, {
      headers: { authorization: `Bearer ${rawKey}` }
    });
    expect(allowed.status).toBe(200);
    const payload = await allowed.json();
    expect(payload.ok).toBe(true);
    expect(payload.mission.mission_id).toBe(MISSION);
    expect(payload.work.currentStage.id).toBe('identity');
  });

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

  it('blocks Identity when the canonical tenant profile has no valid EIN and replays the blocked decision idempotently', async () => {
    const repos = createRepositories();
    repos.tenant.writeProfile(TENANT, {
      tenantId: TENANT,
      orgName: 'Groundwork Youth Collective',
      legalStatus: 'nonprofit'
    });

    const start = makeRes();
    startGroundworkStage(req({
      operatorId: 'op-producer',
      params: { missionId: MISSION, stageId: 'identity' },
      headers: { 'x-idempotency-key': 'gw-identity-start-missing-ein-12345678' }
    }), start);
    expect(start.statusCode).toBe(200);

    const collected = makeRes();
    await collectGroundworkIdentity(req({
      operatorId: 'op-producer',
      params: { missionId: MISSION },
      headers: { 'x-idempotency-key': 'gw-identity-missing-ein-12345678' }
    }), collected);
    expect(collected.statusCode).toBe(200);
    expect(collected.body).toMatchObject({
      blocked: true,
      reason: 'missing_or_invalid_ein',
      reused: false
    });
    expect(collected.body.work).toMatchObject({ status: 'needs_you' });
    expect(collected.body.nextAction).toMatch(/9-digit EIN/i);

    repos.tenant.writeProfile(TENANT, {
      tenantId: TENANT,
      orgName: 'Groundwork Youth Collective',
      ein: '14-2007220'
    });
    const replay = makeRes();
    await collectGroundworkIdentity(req({
      operatorId: 'op-producer',
      params: { missionId: MISSION },
      headers: { 'x-idempotency-key': 'gw-identity-missing-ein-12345678' }
    }), replay);
    expect(replay.statusCode).toBe(200);
    expect(replay.body.reused).toBe(true);
    expect(replay.body.reason).toBe('missing_or_invalid_ein');
  });

  it('blocks Identity when an exact EIN is not found and never falls back to fuzzy name matching', async () => {
    const repos = createRepositories();
    repos.tenant.writeProfile(TENANT, {
      tenantId: TENANT,
      orgName: 'Groundwork Youth Collective',
      legalName: 'Groundwork Youth Collective Inc',
      ein: '14-2007220'
    });

    vi.stubGlobal('fetch', vi.fn(async () => ({
      status: 404,
      ok: false,
      json: async () => ({})
    })));

    const start = makeRes();
    startGroundworkStage(req({
      operatorId: 'op-producer',
      params: { missionId: MISSION, stageId: 'identity' },
      headers: { 'x-idempotency-key': 'gw-identity-start-not-found-12345678' }
    }), start);

    const collected = makeRes();
    await collectGroundworkIdentity(req({
      operatorId: 'op-producer',
      params: { missionId: MISSION },
      headers: { 'x-idempotency-key': 'gw-identity-not-found-12345678' }
    }), collected);

    expect(collected.statusCode).toBe(200);
    expect(collected.body.reason).toBe('ein_not_found');
    expect(collected.body.work.status).toBe('needs_you');
    expect(collected.body.nextAction).toMatch(/will not choose an organization by name automatically/i);
    expect(getArtifacts({ tenantId: TENANT }).filter((artifact) => artifact.kind === 'groundwork-identity-evidence')).toHaveLength(0);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('creates exact-EIN record evidence, requires a separate verifier, completes Identity, and replays without another lookup', async () => {
    const repos = createRepositories();
    repos.tenant.writeProfile(TENANT, {
      tenantId: TENANT,
      orgName: 'Pro Publica',
      legalName: 'Pro Publica Inc',
      ein: '14-2007220'
    });

    vi.stubGlobal('fetch', vi.fn(async () => ({
      status: 200,
      ok: true,
      json: async () => ({
        organization: {
          ein: 142007220,
          name: 'Pro Publica Inc',
          city: 'New York',
          state: 'NY',
          ntee_code: 'A20',
          subseccd: 3
        },
        filings_with_data: [
          { tax_prd_yr: 2025, totrevenue: 1000000, totfuncexpns: 900000, pdf_url: 'https://example.test/990.pdf' }
        ]
      })
    })));

    const start = makeRes();
    startGroundworkStage(req({
      operatorId: 'op-producer',
      params: { missionId: MISSION, stageId: 'identity' },
      headers: { 'x-idempotency-key': 'gw-identity-start-record-12345678' }
    }), start);
    expect(start.statusCode).toBe(200);

    const collected = makeRes();
    await collectGroundworkIdentity(req({
      operatorId: 'op-producer',
      params: { missionId: MISSION },
      headers: { 'x-idempotency-key': 'gw-identity-record-12345678' }
    }), collected);
    expect(collected.statusCode).toBe(201);
    expect(collected.body.reused).toBe(false);
    expect(collected.body.artifact).toMatchObject({
      kind: 'groundwork-identity-evidence',
      createdBy: 'op-producer',
      approvalStatus: 'approved'
    });
    expect(collected.body.evidence.record).toMatchObject({
      ein: '14-2007220',
      name: 'Pro Publica Inc',
      state: 'NY',
      subsection: 3
    });
    expect(collected.body.evidence.source.evidenceClass).toBe('record_derived_fact');
    expect(collected.body.evidence.source.independentlyVerified).toBe(false);

    const artifactPath = path.join(dataDir, TENANT, collected.body.artifact.storagePath);
    const artifactBody = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    expect(artifactBody.completionEligible).toBe(true);
    expect(artifactBody.reconciliation.nameMatch).toBe('match');

    const selfVerify = makeRes();
    verifyGroundworkArtifact(req({
      operatorId: 'op-producer',
      params: { missionId: MISSION, artifactId: collected.body.artifact.id },
      headers: { 'x-idempotency-key': 'gw-identity-self-verify-record-12345678' }
    }), selfVerify);
    expect(selfVerify.statusCode).toBe(409);

    const verified = makeRes();
    verifyGroundworkArtifact(req({
      operatorId: 'op-verifier',
      params: { missionId: MISSION, artifactId: collected.body.artifact.id },
      headers: { 'x-idempotency-key': 'gw-identity-verify-record-12345678' }
    }), verified);
    expect(verified.statusCode).toBe(200);

    const completed = makeRes();
    completeGroundworkStage(req({
      operatorId: 'op-producer',
      params: { missionId: MISSION, stageId: 'identity' },
      headers: { 'x-idempotency-key': 'gw-identity-complete-record-12345678' },
      body: { artifactIds: [collected.body.artifact.id] }
    }), completed);
    expect(completed.statusCode).toBe(200);
    expect(completed.body.projection.currentStage).toMatchObject({ id: 'trust', status: 'pending' });

    const replay = makeRes();
    await collectGroundworkIdentity(req({
      operatorId: 'op-producer',
      params: { missionId: MISSION },
      headers: { 'x-idempotency-key': 'gw-identity-record-12345678' }
    }), replay);
    expect(replay.statusCode).toBe(200);
    expect(replay.body.reused).toBe(true);
    expect(replay.body.artifact.id).toBe(collected.body.artifact.id);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(getArtifacts({ tenantId: TENANT }).filter((artifact) => artifact.kind === 'groundwork-identity-evidence')).toHaveLength(1);
  });

  it('collects canonical profile readiness as a real unverified artifact and requires independent verification before completion', async () => {
    const repos = createRepositories();
    repos.tenant.writeProfile(TENANT, {
      tenantId: TENANT,
      orgName: 'Groundwork Youth Collective',
      legalStatus: '501(c)(3) claimed by organization',
      region: 'Washington State',
      mission: 'Support youth through mentorship and sports.',
      programs: 'Mentorship, sports, leadership development.',
      audience: 'Youth, families, donors, volunteers.',
      priorities: 'Funding, volunteers, partnerships.',
      founderName: 'Example Founder',
      secretToken: 'must-never-enter-evidence'
    });

    for (const [index, stageId] of ['identity', 'trust', 'discovery'].entries()) {
      emitEvent({
        tenantId: TENANT,
        type: CLIENT_GROUNDWORK_STAGE_EVENT,
        actor: 'test-fixture',
        subject: MISSION,
        payload: {
          stage: {
            version: '1.0.0',
            mission_id: MISSION,
            tenant_id: TENANT,
            user_id: USER,
            conversation_id: CONVERSATION,
            stage_id: stageId,
            from: index === 0 ? 'pending' : 'working',
            status: 'complete',
            proof_refs: [],
            next_action: null,
            request_ref: 'fixture-' + stageId,
            changed_at: new Date().toISOString()
          }
        }
      });
    }

    const tooEarly = makeRes();
    await collectGroundworkReadiness(req({
      operatorId: 'op-producer',
      params: { missionId: MISSION },
      headers: { 'x-idempotency-key': 'gw-readiness-too-early-12345678' }
    }), tooEarly);
    expect(tooEarly.statusCode).toBe(400);
    expect(tooEarly.body.error.message).toBe('GROUNDWORK_READINESS_STAGE_NOT_WORKING');

    const start = makeRes();
    startGroundworkStage(req({
      operatorId: 'op-producer',
      params: { missionId: MISSION, stageId: 'readiness' },
      headers: { 'x-idempotency-key': 'gw-readiness-start-12345678' }
    }), start);
    expect(start.statusCode).toBe(200);
    expect(start.body.projection.currentStage).toMatchObject({ id: 'readiness', status: 'working' });

    const collected = makeRes();
    await collectGroundworkReadiness(req({
      operatorId: 'op-producer',
      params: { missionId: MISSION },
      headers: { 'x-idempotency-key': 'gw-readiness-collect-12345678' }
    }), collected);
    expect(collected.statusCode).toBe(201);
    expect(collected.body.artifact).toMatchObject({
      kind: 'groundwork-readiness-evidence',
      createdBy: 'op-producer',
      approvalStatus: 'approved'
    });
    expect(collected.body.evidence.source).toEqual({
      type: 'tenant_profile_repository',
      evidenceClass: 'profile_assertion',
      independentlyVerified: false
    });
    expect(collected.body.evidence.limitations.join(' ')).toMatch(/does not independently verify/i);

    const artifactPath = path.join(dataDir, TENANT, collected.body.artifact.storagePath);
    expect(fs.existsSync(artifactPath)).toBe(true);
    const artifactBody = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    expect(artifactBody.profileSnapshot.orgName).toBe('Groundwork Youth Collective');
    expect(artifactBody.profileSnapshot.legalStatus).toBe('501(c)(3) claimed by organization');
    expect(JSON.stringify(artifactBody)).not.toContain('must-never-enter-evidence');
    expect(artifactBody.source.independentlyVerified).toBe(false);

    const selfVerify = makeRes();
    verifyGroundworkArtifact(req({
      operatorId: 'op-producer',
      params: { missionId: MISSION, artifactId: collected.body.artifact.id },
      headers: { 'x-idempotency-key': 'gw-readiness-self-verify-12345678' }
    }), selfVerify);
    expect(selfVerify.statusCode).toBe(409);
    expect(selfVerify.body.error.message).toBe('GROUNDWORK_SELF_VERIFICATION_PROHIBITED');

    const verified = makeRes();
    verifyGroundworkArtifact(req({
      operatorId: 'op-verifier',
      params: { missionId: MISSION, artifactId: collected.body.artifact.id },
      headers: { 'x-idempotency-key': 'gw-readiness-independent-verify-12345678' }
    }), verified);
    expect(verified.statusCode).toBe(200);

    const completed = makeRes();
    completeGroundworkStage(req({
      operatorId: 'op-producer',
      params: { missionId: MISSION, stageId: 'readiness' },
      headers: { 'x-idempotency-key': 'gw-readiness-complete-12345678' },
      body: { artifactIds: [collected.body.artifact.id] }
    }), completed);
    expect(completed.statusCode).toBe(200);
    expect(completed.body.projection.workflow.find((stage) => stage.id === 'readiness').status).toBe('complete');
    expect(completed.body.projection.currentStage).toMatchObject({ id: 'repair', status: 'pending' });

    const replay = makeRes();
    await collectGroundworkReadiness(req({
      operatorId: 'op-producer',
      params: { missionId: MISSION },
      headers: { 'x-idempotency-key': 'gw-readiness-collect-12345678' }
    }), replay);
    expect(replay.statusCode).toBe(200);
    expect(replay.body.reused).toBe(true);
    expect(replay.body.artifact.id).toBe(collected.body.artifact.id);
    expect(getArtifacts({ tenantId: TENANT }).filter((artifact) => artifact.kind === 'groundwork-readiness-evidence')).toHaveLength(1);
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
