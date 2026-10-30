import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRepositories } from '@asc3nd/db';
import { buildGroundworkReadinessEvidence } from '@asc3nd/core/groundwork-readiness';
import { registerAgentArtifact } from '@asc3nd/core/agent-service';
import { readEvents, emitEvent } from '@asc3nd/core/events';
import { getArtifacts } from '@asc3nd/core/artifacts';
import { loadAgentTenantId } from './tenant-context.js';
import { agentSuccess, agentError } from './response.js';
import { CLIENT_MISSION_EVENT } from './firstmate-mission-router.js';
import {
  getClientMissionWorkState,
  transitionGroundworkStage,
  verifyGroundworkEvidence
} from './client-work-state.js';

function idempotencyKey(req) {
  return String(req.headers?.['x-idempotency-key'] || req.body?.idempotencyKey || '').trim();
}

export function resolveGroundworkMissionScope({ tenantId, missionId, read = readEvents }) {
  if (!tenantId || !missionId) throw new Error('GROUNDWORK_MISSION_SCOPE_REQUIRED');
  const event = (read({ tenantId, type: CLIENT_MISSION_EVENT }) || []).find((row) => {
    const mission = row.payload?.handoff;
    return mission?.mission_id === missionId && mission?.tenant_id === tenantId;
  });
  const mission = event?.payload?.handoff;
  if (!mission || mission.domain !== 'groundwork') throw new Error('GROUNDWORK_MISSION_NOT_FOUND');
  if (!mission.user_id || !mission.conversation_id) throw new Error('GROUNDWORK_MISSION_SCOPE_INVALID');
  return {
    tenantId,
    userId: mission.user_id,
    conversationId: mission.conversation_id,
    missionId: mission.mission_id,
    mission
  };
}

function statusForError(error) {
  const message = String(error?.message || '');
  if (message.includes('NOT_FOUND')) return 404;
  if (
    message.includes('OUT_OF_ORDER') ||
    message.includes('INVALID_GROUNDWORK_STAGE_TRANSITION') ||
    message.includes('IDEMPOTENCY_CONFLICT') ||
    message.includes('SELF_VERIFICATION') ||
    message.includes('NOT_INDEPENDENTLY_VERIFIED')
  ) return 409;
  return 400;
}

function respondError(res, error) {
  return agentError(res, 'GROUNDWORK_ERROR', error.message, statusForError(error));
}

export function getGroundworkMission(req, res) {
  try {
    const tenantId = loadAgentTenantId(req);
    const scope = resolveGroundworkMissionScope({ tenantId, missionId: req.params.missionId });
    const work = getClientMissionWorkState(scope);
    return agentSuccess(res, { mission: scope.mission, work });
  } catch (error) {
    return respondError(res, error);
  }
}

export function startGroundworkStage(req, res) {
  try {
    const tenantId = loadAgentTenantId(req);
    const scope = resolveGroundworkMissionScope({ tenantId, missionId: req.params.missionId });
    const result = transitionGroundworkStage({
      ...scope,
      stageId: req.params.stageId,
      to: 'working',
      actor: req.operator.id,
      idempotencyKey: idempotencyKey(req)
    });
    return agentSuccess(res, result);
  } catch (error) {
    return respondError(res, error);
  }
}

export function blockGroundworkStage(req, res) {
  try {
    const tenantId = loadAgentTenantId(req);
    const scope = resolveGroundworkMissionScope({ tenantId, missionId: req.params.missionId });
    const result = transitionGroundworkStage({
      ...scope,
      stageId: req.params.stageId,
      to: 'blocked',
      actor: req.operator.id,
      nextAction: String(req.body?.nextAction || '').trim(),
      idempotencyKey: idempotencyKey(req)
    });
    return agentSuccess(res, result);
  } catch (error) {
    return respondError(res, error);
  }
}

export function verifyGroundworkArtifact(req, res) {
  try {
    const tenantId = loadAgentTenantId(req);
    const scope = resolveGroundworkMissionScope({ tenantId, missionId: req.params.missionId });
    const result = verifyGroundworkEvidence({
      ...scope,
      artifactId: req.params.artifactId,
      verifier: req.operator.id,
      idempotencyKey: idempotencyKey(req)
    });
    return agentSuccess(res, result);
  } catch (error) {
    return respondError(res, error);
  }
}

export function completeGroundworkStage(req, res) {
  try {
    const tenantId = loadAgentTenantId(req);
    const scope = resolveGroundworkMissionScope({ tenantId, missionId: req.params.missionId });
    const rawIds = Array.isArray(req.body?.artifactIds)
      ? req.body.artifactIds
      : req.body?.artifactId ? [req.body.artifactId] : [];
    const artifactIds = [...new Set(rawIds.filter(Boolean).map(String))];

    // Fail early when a worker references an artifact that is not in this tenant.
    const artifacts = getArtifacts({ tenantId }) || [];
    for (const artifactId of artifactIds) {
      if (!artifacts.some((artifact) => artifact.id === artifactId && artifact.tenantId === tenantId)) {
        throw new Error('GROUNDWORK_STAGE_PROOF_UNVERIFIED');
      }
    }

    const result = transitionGroundworkStage({
      ...scope,
      stageId: req.params.stageId,
      to: 'complete',
      actor: req.operator.id,
      proofRefs: artifactIds.map((id) => `artifact:${id}`),
      idempotencyKey: idempotencyKey(req)
    });
    return agentSuccess(res, result);
  } catch (error) {
    return respondError(res, error);
  }
}


function safePathSegment(value, fallback = 'item') {
  const clean = String(value || '').replace(/[^a-zA-Z0-9_-]/g, '-').replace(/^-+|-+$/g, '').slice(0, 100);
  return clean || fallback;
}

export async function collectGroundworkReadiness(req, res) {
  try {
    const tenantId = loadAgentTenantId(req);
    const scope = resolveGroundworkMissionScope({ tenantId, missionId: req.params.missionId });

    const key = idempotencyKey(req);
    if (!key) throw new Error('IDEMPOTENCY_KEY_REQUIRED');
    const requestRef = crypto.createHash('sha256').update(key).digest('hex');
    const prior = (readEvents({ tenantId, type: 'GROUNDWORK.READINESS.COLLECTED' }) || []).find((event) => {
      const receipt = event.payload?.receipt;
      return receipt?.mission_id === scope.missionId && receipt?.request_ref === requestRef;
    });
    if (prior) {
      const artifact = (getArtifacts({ tenantId }) || []).find((item) => item.id === prior.payload.receipt.artifact_id);
      if (!artifact) throw new Error('GROUNDWORK_READINESS_RECEIPT_ARTIFACT_MISSING');
      const absolute = path.join(
        process.env.DATA_DIR || path.resolve(process.cwd(), 'mission-data'),
        tenantId,
        ...artifact.storagePath.split('/')
      );
      const evidence = JSON.parse(fs.readFileSync(absolute, 'utf8'));
      return agentSuccess(res, {
        artifact,
        evidence: {
          stage: evidence.stage,
          source: evidence.source,
          summary: evidence.summary,
          limitations: evidence.limitations
        },
        reused: true
      });
    }

    const work = getClientMissionWorkState(scope);
    if (work.currentStage?.id !== 'readiness') throw new Error('GROUNDWORK_STAGE_OUT_OF_ORDER');
    if (work.currentStage?.status !== 'working') throw new Error('GROUNDWORK_READINESS_STAGE_NOT_WORKING');

    const repos = createRepositories();
    const profile = await repos.tenant.readProfile(tenantId);
    const evidence = buildGroundworkReadinessEvidence({
      tenantId,
      missionId: scope.missionId,
      profile: profile || {}
    });

    const relativePath = path.posix.join(
      'groundwork',
      safePathSegment(scope.missionId, 'mission'),
      'readiness',
      'profile-readiness.json'
    );
    const absolutePath = path.join(
      process.env.DATA_DIR || path.resolve(process.cwd(), 'mission-data'),
      tenantId,
      ...relativePath.split('/')
    );
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, JSON.stringify(evidence, null, 2), 'utf8');

    const artifact = registerAgentArtifact({
      tenantId,
      runId: null,
      kind: 'groundwork-readiness-evidence',
      title: 'Groundwork readiness profile evidence',
      storagePath: relativePath,
      approvalClass: 'green',
      mimeType: 'application/json',
      sourceRefs: [`mission:${scope.missionId}`],
      createdBy: req.operator.id
    });

    emitEvent({
      tenantId,
      type: 'GROUNDWORK.READINESS.COLLECTED',
      actor: req.operator.id,
      subject: artifact.id,
      payload: {
        receipt: {
          mission_id: scope.missionId,
          artifact_id: artifact.id,
          request_ref: requestRef,
          source_type: evidence.source.type,
          collected_at: evidence.collectedAt
        }
      }
    });

    return agentSuccess(res, {
      artifact,
      evidence: {
        stage: evidence.stage,
        source: evidence.source,
        summary: evidence.summary,
        limitations: evidence.limitations
      },
      reused: false
    }, 201);
  } catch (error) {
    return respondError(res, error);
  }
}
