import { describe, expect, it } from 'vitest';
import { createClientChatStore } from '../../../services/mission-api/src/agent/client-chat-store.js';
import { latestConversationWorkState, transitionClientMissionState } from '../../../services/mission-api/src/agent/client-work-state.js';
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
    const row = { id: `evt-${sequence}`, createdAt: new Date(2_000_000_000_000 + sequence).toISOString(), ...event };
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
