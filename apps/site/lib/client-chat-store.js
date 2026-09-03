import crypto from 'node:crypto';
import { createRepositories } from '@asc3nd/db';

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

export function createClientChatStore(repos = createRepositories()) {
  async function readEvents(tenantId) {
    return await repos.listEvents(tenantId, EVENT_TYPE, 2000);
  }

  async function append(tenantId, actor, kind, payload) {
    const event = makeEvent({ tenantId, actor, kind, payload });
    await repos.appendEvent(tenantId, event);
    return event;
  }

  async function createConversation({ tenantId, userId = 'client-web', title = 'New chat' }) {
    const conversationId = id('chat');
    const event = await append(tenantId, userId, 'conversation.created', { conversationId, userId, title });
    return { conversationId, title, createdAt: event.createdAt, updatedAt: event.createdAt };
  }

  async function appendMessage({ tenantId, conversationId, role, text, userId = 'client-web', provenanceRefs = [] }) {
    if (!['user', 'assistant', 'system'].includes(role)) throw new Error('INVALID_ROLE');
    if (!String(text || '').trim()) throw new Error('MESSAGE_REQUIRED');
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
      }
      if (p.kind === 'message.added') {
        const row = map.get(p.conversationId) || {
          conversationId: p.conversationId,
          title: 'Conversation',
          createdAt: event.createdAt,
          updatedAt: event.createdAt,
          messageCount: 0
        };
        row.updatedAt = event.createdAt;
        row.messageCount += 1;
        map.set(p.conversationId, row);
      }
    }
    return [...map.values()].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  }

  async function getConversation({ tenantId, conversationId }) {
    const events = await readEvents(tenantId);
    let meta = null;
    const messages = [];
    for (const event of events) {
      const p = event.payload || {};
      if (p.conversationId !== conversationId) continue;
      if (p.kind === 'conversation.created') {
        meta = { conversationId, title: p.title || 'New chat', createdAt: event.createdAt };
      }
      if (p.kind === 'message.added') {
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
    if (!meta && messages.length === 0) return null;
    return { ...(meta || { conversationId, title: 'Conversation', createdAt: messages[0]?.createdAt }), messages };
  }

  async function exportPortableSession({ tenantId, conversationId, userId = 'client-web' }) {
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
      icm_context_refs: ['icm/tenants/asc3nd/02-canonical-icm'],
      sensitivity: 'internal',
      recovery: { exportable: true, last_export_ref: null }
    };
  }

  return { createConversation, appendMessage, listConversations, getConversation, exportPortableSession };
}
