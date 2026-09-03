import { Router } from 'express';
import { browserSessionAuth } from './browser-session-auth.js';
import { createClientChatStore } from './client-chat-store.js';
import { missionAcknowledgement, routeFirstMateMission } from './firstmate-mission-router.js';

const router = Router();
const store = createClientChatStore();

router.use(browserSessionAuth);

function identity(req) {
  return { tenantId: req.user.tenantId, userId: req.user.sub };
}

function clientWorkProjection(mission) {
  return {
    id: mission.mission_id,
    status: mission.status,
    phase: mission.status === 'needs_you' ? 'approval_required' : 'routed',
    area: mission.domain,
    approvalRequired: mission.approval.required
  };
}

function safeRoutingCode(error) {
  const message = String(error?.message || '');
  return /^[A-Z0-9_]+$/.test(message) ? message : 'ROUTING_FAILED';
}

function idempotencyKeyFrom(req) {
  const key = String(req.body?.idempotencyKey || '').trim();
  if (!key) throw new Error('IDEMPOTENCY_KEY_REQUIRED');
  return key;
}

router.get('/conversations', async (req, res) => {
  try {
    const { tenantId, userId } = identity(req);
    const conversations = await store.listConversations({ tenantId, userId });
    return res.json({ ok: true, conversations });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

router.post('/conversations', async (req, res) => {
  try {
    const { tenantId, userId } = identity(req);
    const conversation = await store.createConversation({
      tenantId,
      userId,
      title: req.body?.title || 'New chat'
    });
    return res.status(201).json({ ok: true, conversation });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error.message });
  }
});

router.get('/conversations/:conversationId', async (req, res) => {
  try {
    const { tenantId, userId } = identity(req);
    const conversation = await store.getConversation({
      tenantId,
      userId,
      conversationId: req.params.conversationId
    });
    if (!conversation) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
    return res.json({ ok: true, conversation });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

router.post('/conversations/:conversationId', async (req, res) => {
  try {
    const { tenantId, userId } = identity(req);
    const conversationId = req.params.conversationId;
    const requestKey = idempotencyKeyFrom(req);
    const message = await store.appendMessage({
      tenantId,
      userId,
      conversationId,
      role: 'user',
      text: req.body?.text,
      provenanceRefs: [],
      idempotencyKey: requestKey
    });

    let routed;
    try {
      routed = routeFirstMateMission({
        tenantId,
        userId,
        conversationId,
        sourceMessage: message
      });
    } catch (routingError) {
      let assistant = null;
      try {
        assistant = await store.appendMessage({
          tenantId,
          userId,
          actor: 'firstmate',
          conversationId,
          role: 'assistant',
          text: 'Failed — I saved your message, but I could not safely route the next step. Nothing was sent, submitted, published, or changed externally.',
          provenanceRefs: [`routing-error:${safeRoutingCode(routingError)}`],
          idempotencyKey: `${requestKey}:routing-failed`
        });
      } catch {}
      return res.status(202).json({
        ok: true,
        message,
        assistant,
        work: { status: 'failed', phase: 'routing_failed', area: 'planning', approvalRequired: false }
      });
    }

    const work = clientWorkProjection(routed.mission);
    try {
      const assistant = await store.appendMessage({
        tenantId,
        userId,
        actor: 'firstmate',
        conversationId,
        role: 'assistant',
        text: missionAcknowledgement(routed),
        provenanceRefs: [`event:${routed.eventId}`, `mission:${routed.mission.mission_id}`],
        idempotencyKey: `${requestKey}:assistant`
      });
      return res.status(message.reused && assistant.reused ? 200 : 201).json({
        ok: true,
        message,
        assistant,
        work
      });
    } catch {
      // Mission creation already succeeded. Do not rewrite that durable truth as
      // a routing failure just because the client acknowledgement could not be
      // persisted. A retry with the same request key can safely fill this gap.
      return res.status(202).json({
        ok: true,
        message,
        assistant: null,
        work,
        warning: 'ACKNOWLEDGEMENT_PENDING'
      });
    }
  } catch (error) {
    const status = error.message === 'CONVERSATION_NOT_FOUND' ? 404 : 400;
    return res.status(status).json({ ok: false, error: error.message });
  }
});

router.get('/conversations/:conversationId/export', async (req, res) => {
  try {
    const { tenantId, userId } = identity(req);
    const session = await store.exportPortableSession({
      tenantId,
      userId,
      conversationId: req.params.conversationId
    });
    if (!session) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
    return res.json({ ok: true, session });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;
