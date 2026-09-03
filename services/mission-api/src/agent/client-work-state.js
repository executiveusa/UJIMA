import crypto from 'node:crypto';
import { emitEvent, readEvents } from '@asc3nd/core/events';
import { getArtifacts } from '@asc3nd/core/artifacts';
import { APPROVAL_STATES, getApproval } from '@asc3nd/core/approval-lifecycle';
import { CLIENT_MISSION_EVENT } from './firstmate-mission-router.js';

export const CLIENT_MISSION_STATE_EVENT = 'client_mission_state';
export const CLIENT_ROUTING_FAILURE_EVENT = 'client_routing_failure';

const CLIENT_LABELS = Object.freeze({ working: 'Working', needs_you: 'Needs you', ready: 'Ready', failed: 'Failed', delivered: 'Delivered' });
const ALLOWED = Object.freeze({
  routed: new Set(['working', 'needs_you', 'failed']),
  working: new Set(['needs_you', 'ready', 'failed']),
  needs_you: new Set(['working', 'ready', 'failed']),
  ready: new Set(['delivered', 'failed']), failed: new Set([]), delivered: new Set([])
});
const APPROVED_STATES = new Set([APPROVAL_STATES.APPROVED, APPROVAL_STATES.EXECUTED, APPROVAL_STATES.VERIFIED, APPROVAL_STATES.LOGGED]);
const VERIFIED_DELIVERY_TYPES = new Set(['DELIVERY.VERIFIED', 'CLIENT.DELIVERY.VERIFIED', 'ARTIFACT.DELIVERED', 'AGENT.DELIVERY.VERIFIED']);
const DEFAULT_FAILED_NEXT_ACTION = 'Review the failure details and retry or choose a smaller safe step.';

function normalizeRefs(refs = []) { return [...new Set(refs.filter(Boolean).map(String))]; }
function requestRef(value) { return value ? crypto.createHash('sha256').update(String(value)).digest('hex') : null; }
function missionEvents({ tenantId, read = readEvents }) { return read({ tenantId, type: CLIENT_MISSION_EVENT }) || []; }
function stateEvents({ tenantId, read = readEvents }) { return read({ tenantId, type: CLIENT_MISSION_STATE_EVENT }) || []; }
function failureEvents({ tenantId, read = readEvents }) { return read({ tenantId, type: CLIENT_ROUTING_FAILURE_EVENT }) || []; }
function initialMissionStatus(mission, routingEvent) {
  const routeOnly = routingEvent?.payload?.execution_mode === 'route-only' && routingEvent?.payload?.execution_state === 'routed';
  if (!routeOnly) return mission.status;
  return mission.approval?.required ? 'needs_you' : 'routed';
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
function projection({ mission, state, eventId = null, routingEvent = null }) {
  const internalState = state?.status || initialMissionStatus(mission, routingEvent);
  return {
    id: mission.mission_id,
    status: internalState === 'routed' ? null : internalState,
    label: CLIENT_LABELS[internalState] || null,
    phase: internalState,
    area: mission.domain,
    approvalRequired: Boolean(mission.approval?.required),
    nextAction: state?.next_action || (internalState === 'needs_you' ? 'Review the request before anything consequential happens.' : null),
    proofRefs: normalizeRefs(state?.proof_refs || []), approvalRef: state?.approval_ref || null,
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
      if (VERIFIED_DELIVERY_TYPES.has(event.type)) {
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
  return projection({ mission: found.mission, state: stateEvent?.payload?.state || null, eventId: stateEvent?.id || found.eventId, routingEvent: found.routingEvent });
}

export function listConversationWorkStates({ tenantId, userId, conversationId, read = readEvents }) {
  if (!tenantId || !userId || !conversationId) throw new Error('WORK_STATE_SCOPE_REQUIRED');
  const journal = read({ tenantId }) || [];
  const journalOrder = new Map(journal.map((event, index) => [event.id, index]));
  const rows = missionEvents({ tenantId, read }).map((event) => ({ mission: event.payload?.handoff, event }))
    .filter(({ mission }) => mission && mission.tenant_id === tenantId && mission.user_id === userId && mission.conversation_id === conversationId)
    .map(({ mission, event }) => {
      const stateEvent = latestStateEvent({ tenantId, userId, conversationId, missionId: mission.mission_id, read });
      const latestEvent = stateEvent || event;
      return {
        projection: projection({ mission, state: stateEvent?.payload?.state || null, eventId: latestEvent.id, routingEvent: event }),
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
    return { projection: projection({ mission: found.mission, state: duplicate.payload.state, eventId: duplicate.id, routingEvent: found.routingEvent }), eventId: duplicate.id, reused: true };
  }
  const isRecovery = recovery && current === 'failed' && to === 'working';
  if (!isRecovery && !ALLOWED[current]?.has(to)) throw new Error(`INVALID_WORK_TRANSITION:${current}->${to}`);
  const refs = normalizeRefs(proofRefs);
  if (to === 'ready') verifyProofRefs({ tenantId, missionId, refs, mode: 'ready', read, listArtifacts });
  if (to === 'delivered') verifyProofRefs({ tenantId, missionId, refs, mode: 'delivered', read, listArtifacts });
  const inheritedApprovalRef = currentEvent?.payload?.state?.approval_ref || null;
  const effectiveApprovalRef = approvalRef || inheritedApprovalRef;
  if (found.mission.approval?.required && (to === 'working' || to === 'ready')) {
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
  return { projection: projection({ mission: found.mission, state, eventId: event.id, routingEvent: found.routingEvent }), eventId: event.id, reused: false };
}
