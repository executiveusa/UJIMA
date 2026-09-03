import { describe, expect, it } from 'vitest';
import { registerArtifact } from '@asc3nd/core/artifacts';
import { requestApproval, updateApprovalStatus, APPROVAL_STATES } from '@asc3nd/core/approval-lifecycle';
import { createClientChatStore } from '../../../services/mission-api/src/agent/client-chat-store.js';
import { latestConversationWorkState, transitionClientMissionState } from '../../../services/mission-api/src/agent/client-work-state.js';
import { routeFirstMateMission } from '../../../services/mission-api/src/agent/firstmate-mission-router.js';

function eventHarness({ sameTimestamp = false } = {}) {
  const events = [];
  let sequence = 0;
  const read = ({ tenantId, type } = {}) => events.filter((event) => {
    if (tenantId && event.tenantId !== tenantId) return false;
    if (type && event.type !== type) return false;
    return true;
  });
  const append = (event) => {
    sequence += 1;
    const offset = sameTimestamp ? 0 : sequence;
    const row = { id: `evt-${sequence}`, createdAt: new Date(2_000_000_000_000 + offset).toISOString(), ...event };
    events.push(row);
    return row;
  };
  return { events, read, append };
}

async function routeMessage({ store, read, append, tenantId, userId, conversationId, text }) {
  const message = await store.appendMessage({ tenantId, userId, conversationId, role: 'user', text });
  return routeFirstMateMission({ tenantId, userId, conversationId, sourceMessage: message, read, append });
}

describe('Slice 05 critic regressions', () => {
  it('selects the mission with the most recently updated durable state, not merely the last routed mission', async () => {
    const harness = eventHarness();
    const store = createClientChatStore({ read: harness.read, append: harness.append });
    const tenantId = 'asc3nd';
    const userId = 'u1';
    const conversation = await store.createConversation({ tenantId, userId, title: 'Latest work' });
    const first = await routeMessage({ store, ...harness, tenantId, userId, conversationId: conversation.conversationId, text: 'Prepare a grant research plan.' });
    const second = await routeMessage({ store, ...harness, tenantId, userId, conversationId: conversation.conversationId, text: 'Prepare next week’s content plan.' });

    expect(latestConversationWorkState({ tenantId, userId, conversationId: conversation.conversationId, read: harness.read }).id).toBe(second.mission.mission_id);

    transitionClientMissionState({
      tenantId,
      userId,
      conversationId: conversation.conversationId,
      missionId: first.mission.mission_id,
      to: 'needs_you',
      nextAction: 'Confirm the missing funding constraint.',
      idempotencyKey: 'state-latest-review-12345678',
      read: harness.read,
      append: harness.append
    });

    expect(latestConversationWorkState({ tenantId, userId, conversationId: conversation.conversationId, read: harness.read })).toMatchObject({
      id: first.mission.mission_id,
      status: 'needs_you',
      nextAction: 'Confirm the missing funding constraint.'
    });
  });

  it('breaks equal-timestamp ties using durable journal order', async () => {
    const harness = eventHarness({ sameTimestamp: true });
    const store = createClientChatStore({ read: harness.read, append: harness.append });
    const tenantId = 'asc3nd';
    const userId = 'u1';
    const conversation = await store.createConversation({ tenantId, userId, title: 'Journal order' });
    const first = await routeMessage({ store, ...harness, tenantId, userId, conversationId: conversation.conversationId, text: 'Prepare a grant research plan.' });
    const second = await routeMessage({ store, ...harness, tenantId, userId, conversationId: conversation.conversationId, text: 'Prepare next week’s content plan.' });

    expect(latestConversationWorkState({ tenantId, userId, conversationId: conversation.conversationId, read: harness.read }).id).toBe(second.mission.mission_id);

    transitionClientMissionState({
      tenantId,
      userId,
      conversationId: conversation.conversationId,
      missionId: first.mission.mission_id,
      to: 'needs_you',
      nextAction: 'Confirm the missing funding constraint.',
      idempotencyKey: 'state-journal-order-12345678',
      read: harness.read,
      append: harness.append
    });

    expect(latestConversationWorkState({ tenantId, userId, conversationId: conversation.conversationId, read: harness.read })).toMatchObject({
      id: first.mission.mission_id,
      status: 'needs_you'
    });
  });

  it('rejects Ready when proof is only a routing or state event rather than a result-bearing proof', async () => {
    const harness = eventHarness();
    const store = createClientChatStore({ read: harness.read, append: harness.append });
    const tenantId = 'asc3nd';
    const userId = 'u1';
    const conversation = await store.createConversation({ tenantId, userId, title: 'Ready proof' });
    const routed = await routeMessage({ store, ...harness, tenantId, userId, conversationId: conversation.conversationId, text: 'Prepare a grant research plan.' });
    const started = transitionClientMissionState({
      tenantId,
      userId,
      conversationId: conversation.conversationId,
      missionId: routed.mission.mission_id,
      to: 'working',
      idempotencyKey: 'state-ready-proof-start-12345678',
      read: harness.read,
      append: harness.append
    });

    expect(() => transitionClientMissionState({
      tenantId,
      userId,
      conversationId: conversation.conversationId,
      missionId: routed.mission.mission_id,
      to: 'ready',
      proofRefs: [`event:${started.eventId}`],
      idempotencyKey: 'state-ready-proof-fail-12345678',
      read: harness.read,
      append: harness.append
    })).toThrow('READY_RESULT_PROOF_REQUIRED');

    const artifact = registerArtifact({ tenantId, runId: null, kind: 'grant-fit', title: 'Approved result packet', storagePath: 'proof/result.json', approvalStatus: 'approved', createdBy: 'critic' });
    expect(transitionClientMissionState({
      tenantId,
      userId,
      conversationId: conversation.conversationId,
      missionId: routed.mission.mission_id,
      to: 'ready',
      proofRefs: [`artifact:${artifact.id}`],
      idempotencyKey: 'state-ready-proof-pass-12345678',
      read: harness.read,
      append: harness.append
    }).projection.status).toBe('ready');
  });

  it('preserves approval gating across Needs you -> Failed -> recovery to Working', async () => {
    const harness = eventHarness();
    const store = createClientChatStore({ read: harness.read, append: harness.append });
    const tenantId = 'asc3nd';
    const userId = 'u1';
    const conversation = await store.createConversation({ tenantId, userId, title: 'Approval recovery' });
    const routed = await routeMessage({ store, ...harness, tenantId, userId, conversationId: conversation.conversationId, text: 'Submit the strongest grant application today.' });
    expect(routed.mission.status).toBe('needs_you');

    transitionClientMissionState({
      tenantId,
      userId,
      conversationId: conversation.conversationId,
      missionId: routed.mission.mission_id,
      to: 'failed',
      idempotencyKey: 'state-approval-recovery-fail-12345678',
      read: harness.read,
      append: harness.append
    });

    expect(() => transitionClientMissionState({
      tenantId,
      userId,
      conversationId: conversation.conversationId,
      missionId: routed.mission.mission_id,
      to: 'working',
      recovery: true,
      idempotencyKey: 'state-approval-recovery-block-12345678',
      read: harness.read,
      append: harness.append
    })).toThrow('APPROVAL_REF_REQUIRED');

    const approval = requestApproval({ tenantId, actionType: 'GRANT_SUBMISSION', actionPayload: { missionId: routed.mission.mission_id }, requester: 'firstmate' });
    updateApprovalStatus({ tenantId, approvalId: approval.id, nextStatus: APPROVAL_STATES.REVIEW, actor: { id: 'owner-1', role: 'owner', tenantId } });
    updateApprovalStatus({ tenantId, approvalId: approval.id, nextStatus: APPROVAL_STATES.APPROVED, actor: { id: 'owner-1', role: 'owner', tenantId } });

    expect(transitionClientMissionState({
      tenantId,
      userId,
      conversationId: conversation.conversationId,
      missionId: routed.mission.mission_id,
      to: 'working',
      recovery: true,
      approvalRef: `approval:${approval.id}`,
      idempotencyKey: 'state-approval-recovery-pass-12345678',
      read: harness.read,
      append: harness.append
    }).projection).toMatchObject({ status: 'working', approvalRef: `approval:${approval.id}` });
  });

  it('derives a non-empty recovery action for every Failed transition', async () => {
    const harness = eventHarness();
    const store = createClientChatStore({ read: harness.read, append: harness.append });
    const tenantId = 'asc3nd';
    const userId = 'u1';
    const conversation = await store.createConversation({ tenantId, userId, title: 'Failure action' });
    const routed = await routeMessage({ store, ...harness, tenantId, userId, conversationId: conversation.conversationId, text: 'Prepare a grant research plan.' });

    const failed = transitionClientMissionState({
      tenantId,
      userId,
      conversationId: conversation.conversationId,
      missionId: routed.mission.mission_id,
      to: 'failed',
      idempotencyKey: 'state-failed-action-12345678',
      read: harness.read,
      append: harness.append
    });

    expect(failed.projection.status).toBe('failed');
    expect(failed.projection.nextAction).toBeTruthy();
    expect(latestConversationWorkState({ tenantId, userId, conversationId: conversation.conversationId, read: harness.read }).nextAction).toBe(failed.projection.nextAction);
  });
});
