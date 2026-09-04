import crypto from 'node:crypto';
import { Router } from 'express';
import { can } from '@asc3nd/core/rbac';
import { browserSessionAuth } from './browser-session-auth.js';
import { createClientChatStore } from './client-chat-store.js';
import { getClientMissionWorkState, latestConversationWorkState, recordClientRoutingFailure } from './client-work-state.js';
import { missionAcknowledgement, routeFirstMateMission } from './firstmate-mission-router.js';
import { decideMissionApproval, ensureMissionApproval, missionEvidence, resolveMissionArtifactFile } from './client-mission-evidence.js';

const router = Router();
const store = createClientChatStore();

router.use(browserSessionAuth);

function identity(req) { return { tenantId: req.user.tenantId, userId: req.user.sub }; }
function safeRoutingCode(error) {
  const message = String(error?.message || '');
  return /^[A-Z0-9_]+$/.test(message) ? message : 'ROUTING_FAILED';
}
function idempotencyKeyFrom(req) {
  const key = String(req.body?.idempotencyKey || '').trim();
  if (!key) throw new Error('IDEMPOTENCY_KEY_REQUIRED');
  return key;
}
function derivedIdempotencyKey(base, purpose) {
  const digest = crypto.createHash('sha256').update(`${base}\0${purpose}`).digest('hex');
  return `derived:${digest}`;
}
function requirePermission(req, permission) {
  if (!can(req.user, permission)) {
    const error = new Error('FORBIDDEN');
    error.status = 403;
    throw error;
  }
}
function uniqueRefs(...values) {
  return [...new Set(values.flatMap((value) => Array.isArray(value) ? value : []).filter(Boolean).map(String))];
}
function evidenceForWork({ tenantId, userId, conversationId, work, recoverApproval = false }) {
  if (!work?.id || work.phase === 'routing_failed') return { artifacts: [], approval: null };
  return missionEvidence({ tenantId, userId, conversationId, missionId: work.id, recoverApproval });
}

router.get('/conversations', async (req, res) => {
  try {
    const { tenantId, userId } = identity(req);
    return res.json({ ok: true, conversations: await store.listConversations({ tenantId, userId }) });
  } catch (error) { return res.status(500).json({ ok: false, error: error.message }); }
});

router.post('/conversations', async (req, res) => {
  try {
    const { tenantId, userId } = identity(req);
    const conversation = await store.createConversation({ tenantId, userId, title: req.body?.title || 'New chat' });
    return res.status(201).json({ ok: true, conversation });
  } catch (error) { return res.status(400).json({ ok: false, error: error.message }); }
});

router.get('/conversations/:conversationId', async (req, res) => {
  try {
    const { tenantId, userId } = identity(req);
    const conversationId = req.params.conversationId;
    const conversation = await store.getConversation({ tenantId, userId, conversationId });
    if (!conversation) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
    const work = latestConversationWorkState({ tenantId, userId, conversationId });
    const recoverApproval = work?.status === 'needs_you' && work?.approvalRequired === true;
    return res.json({ ok: true, conversation, work, evidence: evidenceForWork({ tenantId, userId, conversationId, work, recoverApproval }) });
  } catch (error) { return res.status(error.status || 500).json({ ok: false, error: error.message }); }
});

router.post('/conversations/:conversationId', async (req, res) => {
  try {
    const { tenantId, userId } = identity(req);
    const conversationId = req.params.conversationId;
    const requestKey = idempotencyKeyFrom(req);
    const message = await store.appendMessage({ tenantId, userId, conversationId, role: 'user', text: req.body?.text, provenanceRefs: [], idempotencyKey: requestKey });

    let routed;
    try {
      routed = routeFirstMateMission({ tenantId, userId, conversationId, sourceMessage: message });
    } catch (routingError) {
      const failure = recordClientRoutingFailure({ tenantId, userId, conversationId, sourceMessageId: message.messageId, code: safeRoutingCode(routingError) });
      let assistant = null;
      try {
        assistant = await store.appendMessage({
          tenantId, userId, actor: 'firstmate', conversationId, role: 'assistant',
          text: 'Failed — I saved your message, but I could not safely route the next step. Nothing was sent, submitted, published, or changed externally.',
          provenanceRefs: [`routing-error:${safeRoutingCode(routingError)}`, `event:${failure.eventId}`],
          idempotencyKey: derivedIdempotencyKey(requestKey, 'routing-failed')
        });
      } catch {}
      return res.status(202).json({ ok: true, message, assistant, work: failure.projection, evidence: { artifacts: [], approval: null } });
    }

    if (routed.mission.approval?.required || routed.mission.status === 'needs_you') {
      ensureMissionApproval({ tenantId, userId, conversationId, missionId: routed.mission.mission_id });
    }
    const work = getClientMissionWorkState({ tenantId, userId, conversationId, missionId: routed.mission.mission_id });
    const evidence = evidenceForWork({ tenantId, userId, conversationId, work });
    try {
      const assistant = await store.appendMessage({
        tenantId, userId, actor: 'firstmate', conversationId, role: 'assistant', text: missionAcknowledgement(routed),
        provenanceRefs: [`event:${routed.eventId}`, `mission:${routed.mission.mission_id}`],
        idempotencyKey: derivedIdempotencyKey(requestKey, 'assistant')
      });
      return res.status(message.reused && assistant.reused ? 200 : 201).json({ ok: true, message, assistant, work, evidence });
    } catch {
      return res.status(202).json({ ok: true, message, assistant: null, work, evidence, warning: 'ACKNOWLEDGEMENT_PENDING' });
    }
  } catch (error) {
    const status = error.message === 'CONVERSATION_NOT_FOUND' ? 404 : (error.status || 400);
    return res.status(status).json({ ok: false, error: error.message });
  }
});

router.post('/conversations/:conversationId/missions/:missionId/approval', async (req, res) => {
  try {
    requirePermission(req, 'approvals.review');
    const { tenantId, userId } = identity(req);
    const conversationId = req.params.conversationId;
    const missionId = req.params.missionId;
    const decision = String(req.body?.decision || '').trim().toLowerCase();
    const comments = String(req.body?.comments || '').trim() || null;
    const approval = decideMissionApproval({ tenantId, userId, conversationId, missionId, decision, actor: req.user, comments });
    const work = getClientMissionWorkState({ tenantId, userId, conversationId, missionId });
    return res.json({ ok: true, approval, work, evidence: evidenceForWork({ tenantId, userId, conversationId, work }) });
  } catch (error) {
    const status = error.status || (error.message === 'MISSION_NOT_FOUND' ? 404 : 400);
    return res.status(status).json({ ok: false, error: error.message });
  }
});

router.get('/conversations/:conversationId/missions/:missionId/artifacts/:artifactId', async (req, res) => {
  try {
    requirePermission(req, 'artifacts.read');
    const { tenantId, userId } = identity(req);
    const { artifact, absolute, exists } = resolveMissionArtifactFile({
      tenantId, userId, conversationId: req.params.conversationId, missionId: req.params.missionId, artifactId: req.params.artifactId
    });
    if (!exists) return res.status(404).json({ ok: false, error: 'ARTIFACT_CONTENT_NOT_AVAILABLE' });
    const safeName = String(artifact.title || artifact.id).replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '') || artifact.id;
    res.type(artifact.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `${req.query.download === '1' ? 'attachment' : 'inline'}; filename="${safeName}"`);
    return res.sendFile(absolute);
  } catch (error) {
    const status = error.status || (['MISSION_NOT_FOUND','ARTIFACT_NOT_FOUND'].includes(error.message) ? 404 : 400);
    return res.status(status).json({ ok: false, error: error.message });
  }
});

router.get('/conversations/:conversationId/export', async (req, res) => {
  try {
    const { tenantId, userId } = identity(req);
    const conversationId = req.params.conversationId;
    const session = await store.exportPortableSession({ tenantId, userId, conversationId });
    if (!session) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
    const work = latestConversationWorkState({ tenantId, userId, conversationId });
    const evidence = evidenceForWork({ tenantId, userId, conversationId, work });
    return res.json({
      ok: true,
      session: {
        ...session,
        artifact_refs: uniqueRefs(session.artifact_refs, evidence.artifacts.map((a) => `artifact:${a.id}`)),
        approval_refs: uniqueRefs(session.approval_refs, evidence.approval ? [`approval:${evidence.approval.id}`] : [])
      }
    });
  } catch (error) { return res.status(500).json({ ok: false, error: error.message }); }
});

export default router;