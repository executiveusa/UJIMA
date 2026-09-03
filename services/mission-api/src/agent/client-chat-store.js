import crypto from 'node:crypto';
import { emitEvent, readEvents } from '@asc3nd/core/events';

const EVENT_TYPE = 'client_chat';
const MISSION_EVENT_TYPE = 'client_mission';
const id = (prefix) => `${prefix}_${crypto.randomBytes(10).toString('hex')}`;

function normalizeEvents(events) {
  // ECMAScript sort is stable. Returning 0 for equal timestamps preserves the
  // storage backend's append order instead of introducing random-ID reordering.
  return [...events].sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')));
}

function cleanTitle(value) {
  const title = String(value || 'New chat').trim() || 'New chat';
  return title.slice(0, 160);
}

function cleanIdempotencyKey(value) {
  if (value === null || value === undefined || value === '') return null;
  const key = String(value).trim();
  if (!/^[A-Za-z0-9._:-]{8,160}$/.test(key)) throw new Error('INVALID_IDEMPOTENCY_KEY');
  return key;
}

function messageFromEvent(event, reused = false) {
  return {
    messageId: event.payload.messageId,
    role: event.payload.role,
    text: event.payload.text,
    provenanceRefs: event.payload.provenanceRefs || [],
    createdAt: event.createdAt,
    eventId: event.id,
    reused
  };
}

export function createClientChatStore({ read = readEvents, append = emitEvent } = {}) {
  function eventsForTenant(tenantId) {
    if (!tenantId) throw new Error('TENANT_REQUIRED');
    return normalizeEvents(read({ tenantId, type: EVENT_TYPE }) || []);
  }

  function findOwnedConversation(events, conversationId, userId) {
    return events.find((event) => {
      const payload = event.payload || {};
      return payload.kind === 'conversation.created'
        && payload.conversationId === conversationId
        && payload.userId === userId;
    }) || null;
  }

  function findIdempotentMessage(events, { conversationId, userId, role, idempotencyKey }) {
    if (!idempotencyKey) return null;
    return events.find((event) => {
      const payload = event.payload || {};
      return payload.kind === 'message.added'
        && payload.conversationId === conversationId
        && payload.userId === userId
        && payload.role === role
        && payload.idempotencyKey === idempotencyKey;
    }) || null;
  }

  function appendChatEvent({ tenantId, userId, actor = userId, kind, conversationId, payload = {} }) {
    return append({
      tenantId,
      type: EVENT_TYPE,
      version: '1',
      correlationId: id('corr'),
      actor,
      subject: conversationId || null,
      payload: { kind, conversationId, userId, ...payload }
    });
  }

  function missionRefsForConversation(tenantId, conversationId, userId) {
    const events = read({ tenantId, type: MISSION_EVENT_TYPE }) || [];
    const refs = events
      .filter((event) => !event.type || event.type === MISSION_EVENT_TYPE)
      .map((event) => event.payload?.handoff)
      .filter((mission) => mission
        && mission.tenant_id === tenantId
        && mission.user_id === userId
        && mission.conversation_id === conversationId)
      .map((mission) => `mission:${mission.mission_id}`);
    return [...new Set(refs)];
  }

  async function createConversation({ tenantId, userId, title = 'New chat' }) {
    if (!tenantId) throw new Error('TENANT_REQUIRED');
    if (!userId) throw new Error('USER_REQUIRED');
    const conversationId = id('chat');
    const event = appendChatEvent({
      tenantId,
      userId,
      kind: 'conversation.created',
      conversationId,
      payload: { title: cleanTitle(title) }
    });
    return {
      conversationId,
      title: cleanTitle(title),
      createdAt: event.createdAt,
      updatedAt: event.createdAt,
      messageCount: 0
    };
  }

  async function appendMessage({
    tenantId,
    conversationId,
    role,
    text,
    userId,
    actor = userId,
    provenanceRefs = [],
    idempotencyKey = null
  }) {
    if (!['user', 'assistant', 'system'].includes(role)) throw new Error('INVALID_ROLE');
    const normalizedText = String(text || '').trim();
    if (!normalizedText) throw new Error('MESSAGE_REQUIRED');
    if (!tenantId) throw new Error('TENANT_REQUIRED');
    if (!userId) throw new Error('USER_REQUIRED');

    const events = eventsForTenant(tenantId);
    if (!findOwnedConversation(events, conversationId, userId)) throw new Error('CONVERSATION_NOT_FOUND');

    const requestKey = cleanIdempotencyKey(idempotencyKey);
    const existing = findIdempotentMessage(events, {
      conversationId,
      userId,
      role,
      idempotencyKey: requestKey
    });
    if (existing) return messageFromEvent(existing, true);

    const messageId = id('msg');
    const uniqueProvenance = [...new Set((provenanceRefs || []).filter(Boolean).map(String))];
    const event = appendChatEvent({
      tenantId,
      userId,
      actor,
      kind: 'message.added',
      conversationId,
      payload: {
        messageId,
        role,
        text: normalizedText,
        provenanceRefs: uniqueProvenance,
        idempotencyKey: requestKey
      }
    });
    return messageFromEvent(event, false);
  }

  async function listConversations({ tenantId, userId }) {
    if (!userId) throw new Error('USER_REQUIRED');
    const events = eventsForTenant(tenantId);
    const map = new Map();

    for (const event of events) {
      const payload = event.payload || {};
      if (payload.kind === 'conversation.created' && payload.userId === userId) {
        map.set(payload.conversationId, {
          conversationId: payload.conversationId,
          title: payload.title || 'New chat',
          createdAt: event.createdAt,
          updatedAt: event.createdAt,
          messageCount: 0
        });
        continue;
      }
      if (payload.kind === 'message.added' && payload.userId === userId && map.has(payload.conversationId)) {
        const row = map.get(payload.conversationId);
        row.updatedAt = event.createdAt;
        row.messageCount += 1;
      }
    }

    return [...map.values()].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  }

  async function getConversation({ tenantId, conversationId, userId }) {
    if (!userId) throw new Error('USER_REQUIRED');
    const events = eventsForTenant(tenantId);
    const created = findOwnedConversation(events, conversationId, userId);
    if (!created) return null;

    const messages = events
      .filter((event) => {
        const payload = event.payload || {};
        return payload.kind === 'message.added'
          && payload.conversationId === conversationId
          && payload.userId === userId;
      })
      .map((event) => ({
        messageId: event.payload.messageId,
        role: event.payload.role,
        text: event.payload.text,
        provenanceRefs: event.payload.provenanceRefs || [],
        createdAt: event.createdAt,
        eventId: event.id,
        actor: event.actor || null
      }));

    return {
      conversationId,
      title: created.payload.title || 'New chat',
      createdAt: created.createdAt,
      updatedAt: messages.at(-1)?.createdAt || created.createdAt,
      messages
    };
  }

  async function exportPortableSession({ tenantId, conversationId, userId }) {
    const conversation = await getConversation({ tenantId, conversationId, userId });
    if (!conversation) return null;
    return {
      version: '1.0.0',
      session_id: `session:${conversationId}`,
      tenant_id: tenantId,
      user_id: userId,
      conversation_id: conversationId,
      title: conversation.title,
      status: 'ready',
      created_at: conversation.createdAt,
      updated_at: conversation.updatedAt,
      messages: conversation.messages.map((message) => ({
        message_id: message.messageId,
        role: message.role,
        created_at: message.createdAt,
        content_ref: `event:${message.eventId}`,
        provenance_refs: message.provenanceRefs
      })),
      mission_refs: missionRefsForConversation(tenantId, conversationId, userId),
      artifact_refs: [],
      approval_refs: [],
      icm_context_refs: [`icm/tenants/${tenantId}`],
      sensitivity: 'internal',
      recovery: { exportable: true, last_export_ref: null }
    };
  }

  return {
    createConversation,
    appendMessage,
    listConversations,
    getConversation,
    exportPortableSession
  };
}
