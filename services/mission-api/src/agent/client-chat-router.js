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
    area: mission.domain,
    approvalRequired: mission.approval.required
  };
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
    const message = await store.appendMessage({
      tenantId,
      userId,
      conversationId,
      role: 'user',
      text: req.body?.text,
      provenanceRefs: []
    });

    try {
      const routed = routeFirstMateMission({
        tenantId,
        userId,
        conversationId,
        sourceMessage: message
      });
      const assistant = await store.appendMessage({
        tenantId,
        userId,
        actor: 'firstmate',
        conversationId,
        role: 'assistant',
        text: missionAcknowledgement(routed),
        provenanceRefs: [`event:${routed.eventId}`, `mission:${routed.mission.mission_id}`]
      });
      return res.status(201).json({
        ok: true,
        message,
        assistant,
        work: clientWorkProjection(routed.mission)
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
          provenanceRefs: [`routing-error:${routingError.message}`]
        });
      } catch {}
      return res.status(202).json({
        ok: true,
        message,
        assistant,
        work: { status: 'failed', area: 'planning', approvalRequired: false }
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
