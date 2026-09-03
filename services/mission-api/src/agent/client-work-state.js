import crypto from 'node:crypto';
import { emitEvent, readEvents } from '@asc3nd/core/events';
import { CLIENT_MISSION_EVENT } from './firstmate-mission-router.js';

export const CLIENT_MISSION_STATE_EVENT = 'client_mission_state';

const CLIENT_LABELS = Object.freeze({
  working: 'Working',
  needs_you: 'Needs you',
  ready: 'Ready',
  failed: 'Failed',
  delivered: 'Delivered'
});

const ALLOWED = Object.freeze({
  routed: new Set(['working', 'needs_you', 'failed']),
  working: new Set(['needs_you', 'ready', 'failed']),
  needs_you: new Set(['working', 'ready', 'failed']),
  ready: new Set(['delivered', 'failed']),
  failed: new Set([]),
  delivered: new Set([])
});

function normalizeRefs(refs = []) {
  return [...new Set(refs.filter(Boolean).map(String))];
}

function requestRef(value) {
  if (!value) return null;
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function missionEvents({ tenantId, read = readEvents }) {
  return read({ tenantId, type: CLIENT_MISSION_EVENT }) || [];
}

function stateEvents({ tenantId, read = readEvents }) {
  return read({ tenantId, type: CLIENT_MISSION_STATE_EVENT }) || [];
}

function findMission({ tenantId, userId, conversationId, missionId, read = readEvents }) {
  for (const event of missionEvents({ tenantId, read })) {
    const mission = event.payload?.handoff;
    if (!mission) continue;
    if (mission.mission_id !== missionId) continue;
    if (mission.tenant_id !== tenantId || mission.user_id !== userId || mission.conversation_id !== conversationId) return null;
    return { mission, eventId: event.id, createdAt: event.createdAt };
  }
  return null;
}

function latestStateEvent({ tenantId, userId, conversationId, missionId, read = readEvents }) {
  const rows = stateEvents({ tenantId, read }).filter((event) => {
    const state = event.payload?.state;
    return state
      && state.mission_id === missionId
      && state.tenant_id === tenantId
      && state.user_id === userId
      && state.conversation_id === conversationId;
  });
  return rows.at(-1) || null;
}

function projection({ mission, state, eventId = null }) {
  const internalState = state?.status || mission.status;
  return {
    id: mission.mission_id,
    status: internalState === 'routed' ? null : internalState,
    label: CLIENT_LABELS[internalState] || null,
    phase: internalState,
    area: mission.domain,
    approvalRequired: Boolean(mission.approval?.required),
    nextAction: state?.next_action || (internalState === 'needs_you' ? 'Review the request before anything consequential happens.' : null),
    proofRefs: normalizeRefs(state?.proof_refs || []),
    approvalRef: state?.approval_ref || null,
    eventRef: eventId ? `event:${eventId}` : null
  };
}

export function getClientMissionWorkState({ tenantId, userId, conversationId, missionId, read = readEvents }) {
  if (!tenantId || !userId || !conversationId || !missionId) throw new Error('WORK_STATE_SCOPE_REQUIRED');
  const found = findMission({ tenantId, userId, conversationId, missionId, read });
  if (!found) return null;
  const stateEvent = latestStateEvent({ tenantId, userId, conversationId, missionId, read });
  return projection({ mission: found.mission, state: stateEvent?.payload?.state || null, eventId: stateEvent?.id || found.eventId });
}

export function listConversationWorkStates({ tenantId, userId, conversationId, read = readEvents }) {
  if (!tenantId || !userId || !conversationId) throw new Error('WORK_STATE_SCOPE_REQUIRED');
  const missions = missionEvents({ tenantId, read })
    .map((event) => ({ mission: event.payload?.handoff, event }))
    .filter(({ mission }) => mission
      && mission.tenant_id === tenantId
      && mission.user_id === userId
      && mission.conversation_id === conversationId);

  return missions.map(({ mission }) => getClientMissionWorkState({
    tenantId,
    userId,
    conversationId,
    missionId: mission.mission_id,
    read
  })).filter(Boolean);
}

export function latestConversationWorkState(args) {
  return listConversationWorkStates(args).at(-1) || null;
}

export function transitionClientMissionState({
  tenantId,
  userId,
  conversationId,
  missionId,
  to,
  actor = userId,
  proofRefs = [],
  approvalRef = null,
  nextAction = null,
  idempotencyKey,
  recovery = false,
  read = readEvents,
  append = emitEvent
}) {
  if (!tenantId || !userId || !conversationId || !missionId) throw new Error('WORK_STATE_SCOPE_REQUIRED');
  if (!ALLOWED[to] && to !== 'routed') throw new Error('INVALID_WORK_STATE');
  const key = String(idempotencyKey || '').trim();
  if (!key) throw new Error('IDEMPOTENCY_KEY_REQUIRED');

  const found = findMission({ tenantId, userId, conversationId, missionId, read });
  if (!found) throw new Error('MISSION_NOT_FOUND');
  const currentEvent = latestStateEvent({ tenantId, userId, conversationId, missionId, read });
  const current = currentEvent?.payload?.state?.status || found.mission.status;
  const keyRef = requestRef(key);

  const duplicate = stateEvents({ tenantId, read }).find((event) => {
    const state = event.payload?.state;
    return state
      && state.mission_id === missionId
      && state.tenant_id === tenantId
      && state.user_id === userId
      && state.conversation_id === conversationId
      && state.request_ref === keyRef;
  });
  if (duplicate) {
    if (duplicate.payload.state.status !== to) throw new Error('IDEMPOTENCY_CONFLICT');
    return { projection: projection({ mission: found.mission, state: duplicate.payload.state, eventId: duplicate.id }), eventId: duplicate.id, reused: true };
  }

  const isRecovery = recovery && current === 'failed' && to === 'working';
  if (!isRecovery && !ALLOWED[current]?.has(to)) throw new Error(`INVALID_WORK_TRANSITION:${current}->${to}`);

  const refs = normalizeRefs(proofRefs);
  if (to === 'ready' && refs.length === 0) throw new Error('READY_PROOF_REQUIRED');
  if (to === 'delivered' && refs.length === 0) throw new Error('DELIVERY_PROOF_REQUIRED');
  if (current === 'needs_you' && found.mission.approval?.required && !approvalRef && to !== 'failed') throw new Error('APPROVAL_REF_REQUIRED');
  if (to === 'needs_you' && !String(nextAction || '').trim()) throw new Error('NEXT_ACTION_REQUIRED');

  const state = {
    version: '1.0.0',
    mission_id: missionId,
    tenant_id: tenantId,
    user_id: userId,
    conversation_id: conversationId,
    from: current,
    status: to,
    proof_refs: refs,
    approval_ref: approvalRef || null,
    next_action: String(nextAction || '').trim() || null,
    request_ref: keyRef,
    recovery: Boolean(isRecovery),
    changed_at: new Date().toISOString()
  };
  const event = append({
    tenantId,
    type: CLIENT_MISSION_STATE_EVENT,
    version: '1',
    actor,
    subject: missionId,
    payload: { state }
  });
  return { projection: projection({ mission: found.mission, state, eventId: event.id }), eventId: event.id, reused: false };
}
