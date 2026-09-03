import { describe, expect, it } from 'vitest';
import { createClientChatStore } from '../../../services/mission-api/src/agent/client-chat-store.js';
import {
  CLIENT_MISSION_EVENT,
  classifyClientIntent,
  classifyRequestedRisk,
  missionAcknowledgement,
  routeFirstMateMission
} from '../../../services/mission-api/src/agent/firstmate-mission-router.js';

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
    const row = {
      id: `evt-${sequence}`,
      createdAt: new Date(1_800_000_000_000 + sequence).toISOString(),
      ...event
    };
    events.push(row);
    return row;
  };
  return { events, read, append };
}

async function createSourceMessage({ tenantId = 'asc3nd', userId = 'u1', text = 'Find three grants worth pursuing.' } = {}) {
  const harness = eventHarness();
  const store = createClientChatStore({ read: harness.read, append: harness.append });
  const conversation = await store.createConversation({ tenantId, userId, title: 'Mission routing' });
  const message = await store.appendMessage({
    tenantId,
    userId,
    conversationId: conversation.conversationId,
    role: 'user',
    text
  });
  return { ...harness, store, conversation, message, tenantId, userId };
}

describe('First Mate intent routing', () => {
  it('routes the minimum required grants, content, and CRM lanes deterministically', () => {
    expect(classifyClientIntent('Find three grants worth pursuing this month.').domain).toBe('grants');
    expect(classifyClientIntent('Prepare next week’s content plan and captions.').domain).toBe('content');
    expect(classifyClientIntent('Who needs a follow-up from our volunteers and partners?').domain).toBe('crm');
  });

  it('keeps unknown work bounded to general internal planning', () => {
    const route = classifyClientIntent('Help me organize what we should focus on in October.');
    expect(route.domain).toBe('general');
    expect(route.capabilities).toEqual(['context_read', 'planning_prepare']);
  });

  it('marks direct and broader consequential requests as approval-required risk tier 3', async () => {
    const source = await createSourceMessage({ text: 'Submit the strongest grant application today.' });
    const routed = routeFirstMateMission({
      tenantId: source.tenantId,
      userId: source.userId,
      conversationId: source.conversation.conversationId,
      sourceMessage: source.message,
      read: source.read,
      append: source.append
    });

    expect(classifyRequestedRisk(source.message.text)).toBe(3);
    expect(classifyRequestedRisk('Submit it now.')).toBe(3);
    expect(classifyRequestedRisk('Send it to them.')).toBe(3);
    expect(classifyRequestedRisk('Publish it today.')).toBe(3);
    expect(classifyRequestedRisk('Upload the reel to YouTube now.')).toBe(3);
    expect(classifyRequestedRisk('DM every donor today.')).toBe(3);
    expect(classifyRequestedRisk('Invite every volunteer to the portal.')).toBe(3);
    expect(classifyRequestedRisk('Contact all donors today.')).toBe(3);
    expect(classifyRequestedRisk('Reach out to our partners this afternoon.')).toBe(3);
    expect(classifyRequestedRisk('Notify every volunteer.')).toBe(3);
    expect(classifyRequestedRisk('Contact the families on the list.')).toBe(3);
    expect(classifyRequestedRisk('Notify all contacts.')).toBe(3);
    expect(classifyRequestedRisk('Review our YouTube channel performance.')).toBe(1);
    expect(routed.mission.status).toBe('needs_you');
    expect(routed.mission.approval).toMatchObject({ required: true, class: 'red' });
    expect(routed.mission.denied_capabilities).toContain('grant_submission');
    expect(routed.mission.denied_capabilities).toContain('public_publishing');
    expect(routed.mission.denied_capabilities).toContain('external_message');
    expect(missionAcknowledgement(routed)).toMatch(/^Needs you —/);
  });

  it('allows internal grant preparation without granting submission authority', async () => {
    const source = await createSourceMessage({ text: 'Prepare a draft grant application and eligibility checklist.' });
    const routed = routeFirstMateMission({
      tenantId: source.tenantId,
      userId: source.userId,
      conversationId: source.conversation.conversationId,
      sourceMessage: source.message,
      read: source.read,
      append: source.append
    });

    expect(routed.mission.domain).toBe('grants');
    expect(routed.mission.risk_tier).toBe(1);
    expect(routed.mission.approval.required).toBe(false);
    expect(routed.mission.allowed_capabilities).toContain('grant_draft_prepare');
    expect(routed.mission.denied_capabilities).toContain('grant_submission');
    expect(missionAcknowledgement(routed)).toMatch(/^Working —/);
    expect(missionAcknowledgement(routed)).toContain('Execution has not started yet');
  });
});

describe('First Mate mission persistence and recovery', () => {
  it('persists one mission per originating message and reuses it on duplicate routing', async () => {
    const source = await createSourceMessage();
    const args = {
      tenantId: source.tenantId,
      userId: source.userId,
      conversationId: source.conversation.conversationId,
      sourceMessage: source.message,
      read: source.read,
      append: source.append
    };
    const first = routeFirstMateMission(args);
    const second = routeFirstMateMission(args);
    const missionEvents = source.events.filter((event) => event.type === CLIENT_MISSION_EVENT);

    expect(second.reused).toBe(true);
    expect(second.mission.mission_id).toBe(first.mission.mission_id);
    expect(missionEvents).toHaveLength(1);
    expect(missionEvents[0].payload.source_message_event_ref).toBe(`event:${source.message.eventId}`);
    expect(missionEvents[0].payload.execution_state).toBe('routed');
  });

  it('reuses the same durable message and mission when a client retries with the same request key', async () => {
    const harness = eventHarness();
    const store = createClientChatStore({ read: harness.read, append: harness.append });
    const tenantId = 'asc3nd';
    const userId = 'u1';
    const conversation = await store.createConversation({ tenantId, userId, title: 'Retry safety' });
    const idempotencyKey = 'chat-request-12345678';

    const firstMessage = await store.appendMessage({
      tenantId,
      userId,
      conversationId: conversation.conversationId,
      role: 'user',
      text: 'Find three grants worth pursuing.',
      idempotencyKey
    });
    const firstMission = routeFirstMateMission({
      tenantId,
      userId,
      conversationId: conversation.conversationId,
      sourceMessage: firstMessage,
      read: harness.read,
      append: harness.append
    });

    const retryMessage = await store.appendMessage({
      tenantId,
      userId,
      conversationId: conversation.conversationId,
      role: 'user',
      text: 'Find three grants worth pursuing.',
      idempotencyKey
    });
    const retryMission = routeFirstMateMission({
      tenantId,
      userId,
      conversationId: conversation.conversationId,
      sourceMessage: retryMessage,
      read: harness.read,
      append: harness.append
    });

    expect(retryMessage.reused).toBe(true);
    expect(retryMessage.messageId).toBe(firstMessage.messageId);
    expect(retryMission.reused).toBe(true);
    expect(retryMission.mission.mission_id).toBe(firstMission.mission.mission_id);
    expect(harness.events.filter((event) => event.type === 'client_chat' && event.payload?.kind === 'message.added')).toHaveLength(1);
    expect(harness.events.filter((event) => event.type === CLIENT_MISSION_EVENT)).toHaveLength(1);

    await expect(store.appendMessage({
      tenantId,
      userId,
      conversationId: conversation.conversationId,
      role: 'user',
      text: 'A different instruction must not reuse the same key.',
      idempotencyKey
    })).rejects.toThrow('IDEMPOTENCY_CONFLICT');
  });

  it('reuses a persisted acknowledgement when the same request is replayed', async () => {
    const source = await createSourceMessage({ text: 'Prepare next week’s content plan.' });
    const routed = routeFirstMateMission({
      tenantId: source.tenantId,
      userId: source.userId,
      conversationId: source.conversation.conversationId,
      sourceMessage: source.message,
      read: source.read,
      append: source.append
    });
    const text = missionAcknowledgement(routed);
    const key = 'chat-ack-12345678:assistant';
    const first = await source.store.appendMessage({
      tenantId: source.tenantId,
      userId: source.userId,
      actor: 'firstmate',
      conversationId: source.conversation.conversationId,
      role: 'assistant',
      text,
      provenanceRefs: [`event:${routed.eventId}`, `mission:${routed.mission.mission_id}`],
      idempotencyKey: key
    });
    const retry = await source.store.appendMessage({
      tenantId: source.tenantId,
      userId: source.userId,
      actor: 'firstmate',
      conversationId: source.conversation.conversationId,
      role: 'assistant',
      text,
      provenanceRefs: [`event:${routed.eventId}`, `mission:${routed.mission.mission_id}`],
      idempotencyKey: key
    });

    expect(retry.reused).toBe(true);
    expect(retry.messageId).toBe(first.messageId);
    expect(source.events.filter((event) => event.type === 'client_chat' && event.payload?.role === 'assistant')).toHaveLength(1);
  });

  it('records a contract-shaped handoff and returns it to portable chat recovery', async () => {
    const source = await createSourceMessage({ text: 'Prepare next week’s content plan.' });
    const routed = routeFirstMateMission({
      tenantId: source.tenantId,
      userId: source.userId,
      conversationId: source.conversation.conversationId,
      sourceMessage: source.message,
      read: source.read,
      append: source.append
    });
    const assistantText = missionAcknowledgement(routed);
    await source.store.appendMessage({
      tenantId: source.tenantId,
      userId: source.userId,
      actor: 'firstmate',
      conversationId: source.conversation.conversationId,
      role: 'assistant',
      text: assistantText,
      provenanceRefs: [`event:${routed.eventId}`, `mission:${routed.mission.mission_id}`]
    });
    const exported = await source.store.exportPortableSession({
      tenantId: source.tenantId,
      userId: source.userId,
      conversationId: source.conversation.conversationId
    });

    expect(routed.mission).toMatchObject({
      version: '1.0.0',
      tenant_id: source.tenantId,
      user_id: source.userId,
      conversation_id: source.conversation.conversationId,
      originating_message_id: source.message.messageId,
      domain: 'content',
      risk_tier: 1,
      status: 'working'
    });
    expect(routed.mission.acceptance_gates.length).toBeGreaterThan(0);
    expect(routed.mission.evidence_requirements).toContain(`event:${source.message.eventId}`);
    expect(routed.mission.icm_context_refs).toEqual([`icm/tenants/${source.tenantId}`]);
    expect(exported.mission_refs).toEqual([`mission:${routed.mission.mission_id}`]);

    const loaded = await source.store.getConversation({
      tenantId: source.tenantId,
      userId: source.userId,
      conversationId: source.conversation.conversationId
    });
    expect(loaded.messages.at(-1)).toMatchObject({
      role: 'assistant',
      actor: 'firstmate',
      text: assistantText
    });
    expect(assistantText).not.toMatch(/repository|model|provider|worker|mcp|docker/i);
  });

  it('fails closed when source governance evidence is missing or malformed', () => {
    const base = {
      tenantId: 'asc3nd',
      userId: 'u1',
      conversationId: 'chat-1',
      read: () => [],
      append: () => { throw new Error('should not append'); }
    };

    expect(() => routeFirstMateMission({ ...base, sourceMessage: null })).toThrow('ORIGINATING_MESSAGE_REQUIRED');
    expect(() => routeFirstMateMission({ ...base, sourceMessage: { messageId: 'm1', eventId: 'e1', role: 'assistant', text: 'x' } })).toThrow('ORIGINATING_MESSAGE_MUST_BE_USER');
    expect(() => routeFirstMateMission({ ...base, sourceMessage: { messageId: 'm1', eventId: 'e1', role: 'user', text: '   ' } })).toThrow('OBJECTIVE_REQUIRED');
  });
});
