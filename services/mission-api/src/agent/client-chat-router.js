import { Router } from 'express';
import { browserSessionAuth } from './browser-session-auth.js';
import { createClientChatStore } from './client-chat-store.js';

const router = Router();
const store = createClientChatStore();

router.use(browserSessionAuth);

function identity(req) {
  return { tenantId: req.user.tenantId, userId: req.user.sub };
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
    const message = await store.appendMessage({
      tenantId,
      userId,
      conversationId: req.params.conversationId,
      role: 'user',
      text: req.body?.text,
      provenanceRefs: []
    });
    return res.status(201).json({ ok: true, message });
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
