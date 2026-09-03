import crypto from 'node:crypto';

const EVENT_TYPE = 'client_chat';
const now = () => new Date().toISOString();
const id = (prefix) => `${prefix}_${crypto.randomBytes(10).toString('hex')}`;

function makeEvent({ tenantId, actor, kind, payload }) {
  return {
    id: id('evt'),
    tenantId,
    type: EVENT_TYPE,
    version: '1',
    correlationId: id('corr'),
    traceId: null,
    actor: actor || 'client-web',
    subject: payload.conversationId || null,
    payload: { kind, ...payload },
    redactedKeys: [],
    createdAt: now()
  };
}

function chronological(events) {
  return [...events].sort((a, b) => {
    const time = String(a.createdAt || a.created_at || '').localeCompare(String(b.createdAt || b.created_at || ''));
    return time || String(a.id || '').localeCompare(String(b.id || ''));
  });
}

export function createClientChatStore(repos) {
  if (!repos?.events?.list || !repos?.events?.append) throw new Error('EVENT_REPOSITORY_REQUIRED');

  async function readEvents(tenantId) {
    // No tenant-wide truncation: recovery must not silently lose old chats.
    const events = await repos.events.list(tenantId, EVENT_TYPE);
    return chronological(events || []);
  }

  async function append(tenantId, actor, kind, payload) {
    const event = makeEvent({ tenantId, actor, kind, payload });
    await repos.events.append(tenantId, event);
    return event;
  }

  async function createConversation({ tenantId, userId, title = 'New chat' }) {
    if (!tenantId) throw new Error('TENANT_REQUIRED');
    if (!userId) throw new Error('USER_REQUIRED');
    const conversationId = id('chat');
    const event = await append(tenantId, userId, 'conversation.created', { conversationId, userId, title });
    return { conversationId, title, createdAt: event.createdAt, updatedAt: event.createdAt, messageCount: 0 };
  }

  async function appendMessage({ tenantId, conversationId, role, text, userId, provenanceRefs = [] }) {
    if (!tenantId) throw new Error('TENANT_REQUIRED');
    if (!userId) throw new Error('USER_REQUIRED');
    if (!conversationId) throw new Error('CONVERSATION_REQUIRED');
    if (!['user', 'assistant', 'system'].includes(role)) throw new Error('INVALID_ROLE');
    if (!String(text || '').trim()) throw new Error('MESSAGE_REQUIRED');

    // Fail closed instead of allowing messages to create orphan conversations.
    const existing = await getConversation({ tenantId, conversationId });
    if (!existing) throw new Error('CONVERSATION_NOT_FOUND');

    const messageId = id('msg');
    const event = await append(tenantId, userId, 'message.added', {
      conversationId,
      messageId,
      role,
      text: String(text).trim(),
      provenanceRefs: [...new Set(provenanceRefs)]
    });
    return {
      messageId,
      role,
      text: String(text).trim(),
      provenanceRefs: [...new Set(provenanceRefs)],
      createdAt: event.createdAt,
      eventId: event.id
    };
  }

  async function listConversations({ tenantId }) {
    if (!tenantId) throw new Error('TENANT_REQUIRED');
    const events = await readEvents(tenantId);
    const map = new Map();
    for (const event of events) {
      const p = event.payload || {};
      if (!p.conversationId) continue;
      if (p.kind === 'conversation.created') {
        map.set(p.conversationId, {
          conversationId: p.conversationId,
          title: p.title || 'New chat',
          createdAt: event.createdAt,
          updatedAt: event.createdAt,
          messageCount: 0
        });
      } else if (p.kind === 'message.added') {
        const row = map.get(p.conversationId);
        if (!row) continue;
        row.updatedAt = event.createdAt;
        row.messageCount += 1;
      }
    }
    return [...map.values()].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  }

  async function getConversation({ tenantId, conversationId }) {
    if (!tenantId) throw new Error('TENANT_REQUIRED');
    if (!conversationId) throw new Error('CONVERSATION_REQUIRED');
    const events = await readEvents(tenantId);
    let meta = null;
    const messages = [];
    for (const event of events) {
      const p = event.payload || {};
      if (p.conversationId !== conversationId) continue;
      if (p.kind === 'conversation.created') {
        meta = { conversationId, title: p.title || 'New chat', createdAt: event.createdAt };
      } else if (p.kind === 'message.added' && meta) {
        messages.push({
          messageId: p.messageId,
          role: p.role,
          text: p.text,
          provenanceRefs: p.provenanceRefs || [],
          createdAt: event.createdAt,
          eventId: event.id
        });
      }
    }
    if (!meta) return null;
    return { ...meta, messages };
  }

  async function exportPortableSession({ tenantId, conversationId, userId }) {
    const conversation = await getConversation({ tenantId, conversationId });
    if (!conversation) return null;
    const updatedAt = conversation.messages.at(-1)?.createdAt || conversation.createdAt;
    return {
      version: '1.0.0',
      session_id: `session:${conversationId}`,
      tenant_id: tenantId,
      user_id: userId,
      conversation_id: conversationId,
      title: conversation.title,
      status: 'ready',
      created_at: conversation.createdAt,
      updated_at: updatedAt,
      messages: conversation.messages.map((message) => ({
        message_id: message.messageId,
        role: message.role,
        created_at: message.createdAt,
        content_ref: `event:${message.eventId}`,
        provenance_refs: message.provenanceRefs
      })),
      mission_refs: [],
      artifact_refs: [],
      approval_refs: [],
      icm_context_refs: [`icm/tenants/${tenantId}`],
      sensitivity: 'internal',
      recovery: { exportable: true, last_export_ref: null }
    };
  }

  return { createConversation, appendMessage, listConversations, getConversation, exportPortableSession };
}
