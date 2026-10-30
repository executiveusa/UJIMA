import crypto from 'node:crypto';
import { emitEvent, readEvents } from '@asc3nd/core/events';
import { getArtifacts } from '@asc3nd/core/artifacts';
import { APPROVAL_STATES, getApproval } from '@asc3nd/core/approval-lifecycle';
import { CLIENT_MISSION_EVENT } from './firstmate-mission-router.js';

export const CLIENT_MISSION_STATE_EVENT = 'client_mission_state';
export const CLIENT_GROUNDWORK_STAGE_EVENT = 'client_groundwork_stage';
export const CLIENT_GROUNDWORK_EVIDENCE_VERIFIED_EVENT = 'client_groundwork_evidence_verified';
export const CLIENT_ROUTING_FAILURE_EVENT = 'client_routing_failure';

const CLIENT_LABELS = Object.freeze({ working: 'Working', needs_you: 'Needs you', ready: 'Ready', failed: 'Failed', delivered: 'Delivered' });
const ALLOWED = Object.freeze({
  routed: new Set(['working', 'needs_you', 'failed']),
  working: new Set(['needs_you', 'ready', 'failed']),
  needs_you: new Set(['working', 'ready', 'failed']),
  ready: new Set(['delivered', 'failed']), failed: new Set([]), delivered: new Set([])
});
const APPROVED_STATES = new Set([APPROVAL_STATES.APPROVED, APPROVAL_STATES.EXECUTED, APPROVAL_STATES.VERIFIED, APPROVAL_STATES.LOGGED]);
const TRUSTED_DELIVERY_VERIFIERS = new Map([
  ['DELIVERY.VERIFIED', new Set(['delivery-verifier', 'system-delivery-verifier'])],
  ['CLIENT.DELIVERY.VERIFIED', new Set(['client-delivery-verifier', 'system-delivery-verifier'])],
  ['ARTIFACT.DELIVERED', new Set(['artifact-delivery-verifier', 'system-delivery-verifier'])]
]);
const DEFAULT_FAILED_NEXT_ACTION = 'Review the failure details and retry or choose a smaller safe step.';

function normalizeRefs(refs = []) { return [...new Set(refs.filter(Boolean).map(String))]; }
function requestRef(value) { return value ? crypto.createHash('sha256').update(String(value)).digest('hex') : null; }
function missionEvents({ tenantId, read = readEvents }) { return read({ tenantId, type: CLIENT_MISSION_EVENT }) || []; }
function stateEvents({ tenantId, read = readEvents }) { return read({ tenantId, type: CLIENT_MISSION_STATE_EVENT }) || []; }
function stageEvents({ tenantId, read = readEvents }) { return read({ tenantId, type: CLIENT_GROUNDWORK_STAGE_EVENT }) || []; }
function evidenceVerificationEvents({ tenantId, read = readEvents }) { return read({ tenantId, type: CLIENT_GROUNDWORK_EVIDENCE_VERIFIED_EVENT }) || []; }
function failureEvents({ tenantId, read = readEvents }) { return read({ tenantId, type: CLIENT_ROUTING_FAILURE_EVENT }) || []; }
function missionRequiresApproval(mission) { return mission?.approval?.required === true || mission?.status === 'needs_you'; }
function initialMissionStatus(mission, routingEvent) {
  const routeOnly = routingEvent?.payload?.execution_mode === 'route-only' && routingEvent?.payload?.execution_state === 'routed';
  if (!routeOnly) return mission.status;
  return missionRequiresApproval(mission) ? 'needs_you' : 'routed';
}
function findMission({ tenantId, userId, conversationId, missionId, read = readEvents }) {
  for (const event of missionEvents({ tenantId, read })) {
    const mission = event.payload?.handoff;
    if (!mission || mission.mission_id !== missionId) continue;
    if (mission.tenant_id !== tenantId || mission.user_id !== userId || mission.conversation_id !== conversationId) return null;
    return { mission, routingEvent: event, eventId: event.id, createdAt: event.createdAt };
  }
  return null;
}
function latestStateEvent({ tenantId, userId, conversationId, missionId, read = readEvents }) {
  return stateEvents({ tenantId, read }).filter((event) => {
    const state = event.payload?.state;
    return state && state.mission_id === missionId && state.tenant_id === tenantId && state.user_id === userId && state.conversation_id === conversationId;
  }).at(-1) || null;
}

function missionStageEvents({ tenantId, userId, conversationId, missionId, read = readEvents }) {
  return stageEvents({ tenantId, read }).filter((event) => {
    const stage = event.payload?.stage;
    return stage && stage.mission_id === missionId && stage.tenant_id === tenantId && stage.user_id === userId && stage.conversation_id === conversationId;
  });
}
function workflowProjection({ mission, tenantId, userId, conversationId, read = readEvents }) {
  if (mission?.domain !== 'groundwork' || !Array.isArray(mission?.workflow)) return [];
  const latestByStage = new Map();
  for (const event of missionStageEvents({ tenantId, userId, conversationId, missionId: mission.mission_id, read })) {
    latestByStage.set(event.payload.stage.stage_id, { ...event.payload.stage, event_ref: `event:${event.id}` });
  }
  return mission.workflow.map((stage) => {
    const current = latestByStage.get(stage.id);
    return {
      id: stage.id,
      label: stage.label,
      outcome: stage.outcome,
      order: stage.order,
      status: current?.status || stage.status || 'pending',
      proofRefs: normalizeRefs(current?.proof_refs || []),
      nextAction: current?.next_action || null,
      eventRef: current?.event_ref || null
    };
  });
}
function currentWorkflowStage(workflow = []) {
  return workflow.find((stage) => stage.status !== 'complete') || null;
}
function projection({ mission, state, eventId = null, routingEvent = null, workflow = [] }) {
  const internalState = state?.status || initialMissionStatus(mission, routingEvent);
  const currentStage = currentWorkflowStage(workflow);
  return {
    id: mission.mission_id,
    status: internalState === 'routed' ? null : internalState,
    label: CLIENT_LABELS[internalState] || null,
    phase: internalState,
    area: mission.domain,
    approvalRequired: missionRequiresApproval(mission),
    nextAction: state?.next_action || (internalState === 'needs_you' ? 'Review the request before anything consequential happens.' : null),
    proofRefs: normalizeRefs(state?.proof_refs || []), approvalRef: state?.approval_ref || null,
    workflow,
    currentStage,
    eventRef: eventId ? `event:${eventId}` : null
  };
}
function routingFailureProjection(event) {
  const failure = event.payload?.failure;
  return failure ? {
    id: failure.failure_id, status: 'failed', label: 'Failed', phase: 'routing_failed', area: 'planning', approvalRequired: false,
    nextAction: failure.next_action, proofRefs: [], approvalRef: null, eventRef: `event:${event.id}`
  } : null;
}
function approvalIdFromRef(ref) { return String(ref || '').replace(/^approval:/, ''); }
function verifyApprovalRef({ tenantId, missionId, approvalRef, getApprovalRecord = getApproval }) {
  if (!approvalRef) throw new Error('APPROVAL_REF_REQUIRED');
  const approval = getApprovalRecord(tenantId, approvalIdFromRef(approvalRef));
  if (!approval || approval.tenantId !== tenantId) throw new Error('APPROVAL_NOT_FOUND');
  if (!APPROVED_STATES.has(approval.status) || !approval.approver) throw new Error('APPROVAL_NOT_APPROVED');
  const linkedMission = approval.actionPayload?.missionId || approval.actionPayload?.mission_id;
  if (linkedMission !== missionId) throw new Error('APPROVAL_MISSION_MISMATCH');
  return approval;
}
function artifactLinkedToMission(artifact, missionId) {
  const refs = normalizeRefs(artifact?.sourceRefs || []);
  return refs.includes(missionId) || refs.includes(`mission:${missionId}`);
}
function isTrustedDeliveryEvent(event) {
  const actors = TRUSTED_DELIVERY_VERIFIERS.get(event?.type);
  return Boolean(actors?.has(event?.actor));
}
function verifyProofRefs({ tenantId, missionId, refs, mode, read = readEvents, listArtifacts = getArtifacts }) {
  if (!refs.length) throw new Error(mode === 'delivered' ? 'DELIVERY_PROOF_REQUIRED' : 'READY_PROOF_REQUIRED');
  const artifacts = listArtifacts({ tenantId }) || [];
  let verifiedDelivery = false;
  let resultBearingProof = false;
  for (const ref of refs) {
    if (ref.startsWith('artifact:')) {
      const id = ref.slice('artifact:'.length);
      const artifact = artifacts.find((row) => row.id === id);
      if (!artifact || artifact.tenantId !== tenantId || artifact.approvalStatus !== 'approved') throw new Error('PROOF_ARTIFACT_UNVERIFIED');
      if (!artifactLinkedToMission(artifact, missionId)) throw new Error('PROOF_ARTIFACT_MISSION_MISMATCH');
      resultBearingProof = true;
      continue;
    }
    if (ref.startsWith('event:')) {
      const id = ref.slice('event:'.length);
      const event = (read({ tenantId }) || []).find((row) => row.id === id);
      if (!event || event.tenantId !== tenantId) throw new Error('PROOF_EVENT_NOT_FOUND');
      const linkedMission = event.subject === missionId || event.payload?.missionId === missionId || event.payload?.mission_id === missionId;
      if (!linkedMission) throw new Error('PROOF_EVENT_MISSION_MISMATCH');
      if (isTrustedDeliveryEvent(event)) {
        verifiedDelivery = true;
        resultBearingProof = true;
      }
      continue;
    }
    throw new Error('UNSUPPORTED_PROOF_REF');
  }
  if (mode === 'ready' && !resultBearingProof) throw new Error('READY_RESULT_PROOF_REQUIRED');
  if (mode === 'delivered' && !verifiedDelivery) throw new Error('VERIFIED_DELIVERY_EVENT_REQUIRED');
}

export function getClientMissionWorkState({ tenantId, userId, conversationId, missionId, read = readEvents }) {
  if (!tenantId || !userId || !conversationId || !missionId) throw new Error('WORK_STATE_SCOPE_REQUIRED');
  const found = findMission({ tenantId, userId, conversationId, missionId, read });
  if (!found) return null;
  const stateEvent = latestStateEvent({ tenantId, userId, conversationId, missionId, read });
  const workflow = workflowProjection({ mission: found.mission, tenantId, userId, conversationId, read });
  return projection({ mission: found.mission, state: stateEvent?.payload?.state || null, eventId: stateEvent?.id || found.eventId, routingEvent: found.routingEvent, workflow });
}

export function listConversationWorkStates({ tenantId, userId, conversationId, read = readEvents }) {
  if (!tenantId || !userId || !conversationId) throw new Error('WORK_STATE_SCOPE_REQUIRED');
  const journal = read({ tenantId }) || [];
  const journalOrder = new Map(journal.map((event, index) => [event.id, index]));
  const rows = missionEvents({ tenantId, read }).map((event) => ({ mission: event.payload?.handoff, event }))
    .filter(({ mission }) => mission && mission.tenant_id === tenantId && mission.user_id === userId && mission.conversation_id === conversationId)
    .map(({ mission, event }) => {
      const stateEvent = latestStateEvent({ tenantId, userId, conversationId, missionId: mission.mission_id, read });
      const stageEvent = missionStageEvents({ tenantId, userId, conversationId, missionId: mission.mission_id, read }).at(-1) || null;
      const latestEvent = [event, stateEvent, stageEvent]
        .filter(Boolean)
        .sort((a, b) => (journalOrder.get(a.id) ?? -1) - (journalOrder.get(b.id) ?? -1))
        .at(-1);
      return {
        projection: projection({ mission, state: stateEvent?.payload?.state || null, eventId: latestEvent.id, routingEvent: event, workflow: workflowProjection({ mission, tenantId, userId, conversationId, read }) }),
        createdAt: latestEvent.createdAt,
        journalOrder: journalOrder.get(latestEvent.id) ?? -1
      };
    });
  for (const event of failureEvents({ tenantId, read })) {
    const failure = event.payload?.failure;
    if (failure?.tenant_id === tenantId && failure?.user_id === userId && failure?.conversation_id === conversationId) {
      rows.push({ projection: routingFailureProjection(event), createdAt: event.createdAt, journalOrder: journalOrder.get(event.id) ?? -1 });
    }
  }
  return rows.sort((a, b) => {
    const timestampOrder = String(a.createdAt || '').localeCompare(String(b.createdAt || ''));
    return timestampOrder || a.journalOrder - b.journalOrder;
  }).map((row) => row.projection).filter(Boolean);
}
export function latestConversationWorkState(args) { return listConversationWorkStates(args).at(-1) || null; }

export function recordClientRoutingFailure({ tenantId, userId, conversationId, sourceMessageId, code = 'ROUTING_FAILED', nextAction = 'Try again or ask for a smaller internal planning step.', append = emitEvent, read = readEvents }) {
  if (!tenantId || !userId || !conversationId || !sourceMessageId) throw new Error('ROUTING_FAILURE_SCOPE_REQUIRED');
  const existing = failureEvents({ tenantId, read }).find((event) => {
    const failure = event.payload?.failure;
    return failure?.tenant_id === tenantId && failure?.user_id === userId && failure?.conversation_id === conversationId && failure?.source_message_id === sourceMessageId;
  });
  if (existing) return { projection: routingFailureProjection(existing), eventId: existing.id, reused: true };
  const failure = {
    version: '1.0.0', failure_id: `fail_${crypto.randomBytes(10).toString('hex')}`, tenant_id: tenantId, user_id: userId,
    conversation_id: conversationId, source_message_id: sourceMessageId, status: 'failed', code, next_action: nextAction, changed_at: new Date().toISOString()
  };
  const event = append({ tenantId, type: CLIENT_ROUTING_FAILURE_EVENT, version: '1', actor: 'firstmate', subject: failure.failure_id, payload: { failure } });
  return { projection: routingFailureProjection(event), eventId: event.id, reused: false };
}


function groundworkArtifactVerification({ tenantId, userId, conversationId, missionId, artifact, read = readEvents }) {
  return evidenceVerificationEvents({ tenantId, read }).find((event) => {
    const verification = event.payload?.verification;
    return verification
      && verification.tenant_id === tenantId
      && verification.user_id === userId
      && verification.conversation_id === conversationId
      && verification.mission_id === missionId
      && verification.artifact_id === artifact.id
      && verification.verifier
      && verification.verifier !== artifact.createdBy;
  }) || null;
}

function verifyGroundworkStageProof({ tenantId, userId, conversationId, missionId, refs, read = readEvents, listArtifacts = getArtifacts }) {
  if (!refs.length) throw new Error('GROUNDWORK_STAGE_PROOF_REQUIRED');
  const artifacts = listArtifacts({ tenantId }) || [];
  let verifiedArtifact = false;
  for (const ref of refs) {
    if (!ref.startsWith('artifact:')) throw new Error('GROUNDWORK_STAGE_PROOF_MUST_BE_ARTIFACT');
    const id = ref.slice('artifact:'.length);
    const artifact = artifacts.find((row) => row.id === id);
    if (!artifact || artifact.tenantId !== tenantId || artifact.approvalStatus !== 'approved') throw new Error('GROUNDWORK_STAGE_PROOF_UNVERIFIED');
    if (!artifactLinkedToMission(artifact, missionId)) throw new Error('GROUNDWORK_STAGE_PROOF_MISSION_MISMATCH');
    if (!artifact.createdBy) throw new Error('GROUNDWORK_STAGE_PROOF_PRODUCER_UNKNOWN');
    if (!groundworkArtifactVerification({ tenantId, userId, conversationId, missionId, artifact, read })) {
      throw new Error('GROUNDWORK_STAGE_PROOF_NOT_INDEPENDENTLY_VERIFIED');
    }
    verifiedArtifact = true;
  }
  if (!verifiedArtifact) throw new Error('GROUNDWORK_STAGE_PROOF_REQUIRED');
}

export function verifyGroundworkEvidence({
  tenantId, userId, conversationId, missionId, artifactId,
  verifier, idempotencyKey, read = readEvents, append = emitEvent, listArtifacts = getArtifacts
}) {
  if (!tenantId || !userId || !conversationId || !missionId || !artifactId || !verifier) throw new Error('GROUNDWORK_VERIFICATION_SCOPE_REQUIRED');
  const key = String(idempotencyKey || '').trim();
  if (!key) throw new Error('IDEMPOTENCY_KEY_REQUIRED');
  const found = findMission({ tenantId, userId, conversationId, missionId, read });
  if (!found || found.mission.domain !== 'groundwork') throw new Error('GROUNDWORK_MISSION_NOT_FOUND');

  const artifact = (listArtifacts({ tenantId }) || []).find((row) => row.id === artifactId);
  if (!artifact || artifact.tenantId !== tenantId || artifact.approvalStatus !== 'approved') throw new Error('GROUNDWORK_STAGE_PROOF_UNVERIFIED');
  if (!artifactLinkedToMission(artifact, missionId)) throw new Error('GROUNDWORK_STAGE_PROOF_MISSION_MISMATCH');
  if (!artifact.createdBy) throw new Error('GROUNDWORK_STAGE_PROOF_PRODUCER_UNKNOWN');
  if (artifact.createdBy === verifier) throw new Error('GROUNDWORK_SELF_VERIFICATION_PROHIBITED');

  const requestRefValue = requestRef(key);
  const existing = evidenceVerificationEvents({ tenantId, read }).find((event) => {
    const verification = event.payload?.verification;
    return verification
      && verification.tenant_id === tenantId
      && verification.user_id === userId
      && verification.conversation_id === conversationId
      && verification.mission_id === missionId
      && verification.request_ref === requestRefValue;
  });
  if (existing) {
    const verification = existing.payload.verification;
    if (verification.artifact_id !== artifactId || verification.verifier !== verifier) throw new Error('IDEMPOTENCY_CONFLICT');
    return { verification, eventId: existing.id, reused: true };
  }

  const verification = {
    version: '1.0.0',
    mission_id: missionId,
    tenant_id: tenantId,
    user_id: userId,
    conversation_id: conversationId,
    artifact_id: artifactId,
    artifact_created_by: artifact.createdBy,
    verifier,
    request_ref: requestRefValue,
    verified_at: new Date().toISOString()
  };
  const event = append({
    tenantId,
    type: CLIENT_GROUNDWORK_EVIDENCE_VERIFIED_EVENT,
    version: '1',
    actor: verifier,
    subject: artifactId,
    payload: { verification }
  });
  return { verification, eventId: event.id, reused: false };
}

export function transitionGroundworkStage({
  tenantId, userId, conversationId, missionId, stageId, to,
  actor = userId, proofRefs = [], approvalRef = null, nextAction = null,
  idempotencyKey, read = readEvents, append = emitEvent,
  getApprovalRecord = getApproval, listArtifacts = getArtifacts
}) {
  if (!tenantId || !userId || !conversationId || !missionId || !stageId) throw new Error('GROUNDWORK_STAGE_SCOPE_REQUIRED');
  if (!['working', 'complete', 'blocked'].includes(to)) throw new Error('INVALID_GROUNDWORK_STAGE_STATE');
  const key = String(idempotencyKey || '').trim();
  if (!key) throw new Error('IDEMPOTENCY_KEY_REQUIRED');
  const found = findMission({ tenantId, userId, conversationId, missionId, read });
  if (!found || found.mission.domain !== 'groundwork' || !Array.isArray(found.mission.workflow)) throw new Error('GROUNDWORK_MISSION_NOT_FOUND');

  const workflow = workflowProjection({ mission: found.mission, tenantId, userId, conversationId, read });
  const target = workflow.find((stage) => stage.id === stageId);
  if (!target) throw new Error('GROUNDWORK_STAGE_NOT_FOUND');
  const current = currentWorkflowStage(workflow);
  if (current?.id !== stageId && target.status !== 'complete') throw new Error('GROUNDWORK_STAGE_OUT_OF_ORDER');

  const requestRefValue = requestRef(key);
  const duplicate = missionStageEvents({ tenantId, userId, conversationId, missionId, read }).find((event) => event.payload?.stage?.request_ref === requestRefValue);
  if (duplicate) {
    if (duplicate.payload.stage.stage_id !== stageId || duplicate.payload.stage.status !== to) throw new Error('IDEMPOTENCY_CONFLICT');
    return { projection: getClientMissionWorkState({ tenantId, userId, conversationId, missionId, read }), eventId: duplicate.id, reused: true };
  }

  const from = target.status || 'pending';
  const allowed = {
    pending: new Set(['working', 'blocked']),
    working: new Set(['complete', 'blocked']),
    blocked: new Set(['working']),
    complete: new Set([])
  };
  if (!allowed[from]?.has(to)) throw new Error(`INVALID_GROUNDWORK_STAGE_TRANSITION:${from}->${to}`);

  const refs = normalizeRefs(proofRefs);
  if (to === 'complete') verifyGroundworkStageProof({ tenantId, userId, conversationId, missionId, refs, read, listArtifacts });
  const requestedNextAction = String(nextAction || '').trim();
  if (to === 'blocked' && !requestedNextAction) throw new Error('NEXT_ACTION_REQUIRED');

  const currentMissionState = getClientMissionWorkState({ tenantId, userId, conversationId, missionId, read });
  if (to === 'working' && currentMissionState?.phase !== 'working') {
    transitionClientMissionState({
      tenantId, userId, conversationId, missionId, to: 'working', actor,
      approvalRef, idempotencyKey: `${key}:mission-working`, recovery: currentMissionState?.phase === 'failed',
      read, append, getApprovalRecord, listArtifacts
    });
  } else if (to === 'blocked' && ['routed', 'working'].includes(currentMissionState?.phase)) {
    transitionClientMissionState({
      tenantId, userId, conversationId, missionId, to: 'needs_you', actor,
      approvalRef, nextAction: requestedNextAction, idempotencyKey: `${key}:mission-blocked`,
      read, append, getApprovalRecord, listArtifacts
    });
  }

  const stage = {
    version: '1.0.0', mission_id: missionId, tenant_id: tenantId, user_id: userId, conversation_id: conversationId,
    stage_id: stageId, from, status: to, proof_refs: refs, next_action: requestedNextAction || null,
    request_ref: requestRefValue, changed_at: new Date().toISOString()
  };
  const event = append({ tenantId, type: CLIENT_GROUNDWORK_STAGE_EVENT, version: '1', actor, subject: missionId, payload: { stage } });

  const after = workflowProjection({ mission: found.mission, tenantId, userId, conversationId, read });
  const allComplete = after.length > 0 && after.every((item) => item.status === 'complete');
  if (allComplete) {
    const finalProofRefs = normalizeRefs(after.flatMap((item) => item.proofRefs));
    const latestMissionState = getClientMissionWorkState({ tenantId, userId, conversationId, missionId, read });
    if (latestMissionState?.phase === 'working') {
      transitionClientMissionState({
        tenantId, userId, conversationId, missionId, to: 'ready', actor,
        proofRefs: finalProofRefs, approvalRef,
        idempotencyKey: `${key}:mission-ready`,
        read, append, getApprovalRecord, listArtifacts
      });
    }
  }

  return { projection: getClientMissionWorkState({ tenantId, userId, conversationId, missionId, read }), eventId: event.id, reused: false };
}

export function transitionClientMissionState({ tenantId, userId, conversationId, missionId, to, actor = userId, proofRefs = [], approvalRef = null, nextAction = null, idempotencyKey, recovery = false, read = readEvents, append = emitEvent, getApprovalRecord = getApproval, listArtifacts = getArtifacts }) {
  if (!tenantId || !userId || !conversationId || !missionId) throw new Error('WORK_STATE_SCOPE_REQUIRED');
  if (!ALLOWED[to] && to !== 'routed') throw new Error('INVALID_WORK_STATE');
  const key = String(idempotencyKey || '').trim();
  if (!key) throw new Error('IDEMPOTENCY_KEY_REQUIRED');
  const found = findMission({ tenantId, userId, conversationId, missionId, read });
  if (!found) throw new Error('MISSION_NOT_FOUND');
  const currentEvent = latestStateEvent({ tenantId, userId, conversationId, missionId, read });
  const current = currentEvent?.payload?.state?.status || initialMissionStatus(found.mission, found.routingEvent);
  const keyRef = requestRef(key);
  const duplicate = stateEvents({ tenantId, read }).find((event) => {
    const state = event.payload?.state;
    return state && state.mission_id === missionId && state.tenant_id === tenantId && state.user_id === userId && state.conversation_id === conversationId && state.request_ref === keyRef;
  });
  if (duplicate) {
    if (duplicate.payload.state.status !== to) throw new Error('IDEMPOTENCY_CONFLICT');
    return { projection: projection({ mission: found.mission, state: duplicate.payload.state, eventId: duplicate.id, routingEvent: found.routingEvent, workflow: workflowProjection({ mission: found.mission, tenantId, userId, conversationId, read }) }), eventId: duplicate.id, reused: true };
  }
  const isRecovery = recovery && current === 'failed' && to === 'working';
  if (!isRecovery && !ALLOWED[current]?.has(to)) throw new Error(`INVALID_WORK_TRANSITION:${current}->${to}`);
  const refs = normalizeRefs(proofRefs);
  if (to === 'ready') verifyProofRefs({ tenantId, missionId, refs, mode: 'ready', read, listArtifacts });
  if (to === 'delivered') verifyProofRefs({ tenantId, missionId, refs, mode: 'delivered', read, listArtifacts });
  const inheritedApprovalRef = currentEvent?.payload?.state?.approval_ref || null;
  const effectiveApprovalRef = approvalRef || inheritedApprovalRef;
  if (missionRequiresApproval(found.mission) && (to === 'working' || to === 'ready')) {
    verifyApprovalRef({ tenantId, missionId, approvalRef: effectiveApprovalRef, getApprovalRecord });
  }
  const requestedNextAction = String(nextAction || '').trim();
  if (to === 'needs_you' && !requestedNextAction) throw new Error('NEXT_ACTION_REQUIRED');
  const resolvedNextAction = requestedNextAction || (to === 'failed' ? DEFAULT_FAILED_NEXT_ACTION : null);
  const state = {
    version: '1.0.0', mission_id: missionId, tenant_id: tenantId, user_id: userId, conversation_id: conversationId,
    from: current, status: to, proof_refs: refs, approval_ref: effectiveApprovalRef || null,
    next_action: resolvedNextAction, request_ref: keyRef, recovery: Boolean(isRecovery), changed_at: new Date().toISOString()
  };
  const event = append({ tenantId, type: CLIENT_MISSION_STATE_EVENT, version: '1', actor, subject: missionId, payload: { state } });
  return { projection: projection({ mission: found.mission, state, eventId: event.id, routingEvent: found.routingEvent, workflow: workflowProjection({ mission: found.mission, tenantId, userId, conversationId, read }) }), eventId: event.id, reused: false };
}