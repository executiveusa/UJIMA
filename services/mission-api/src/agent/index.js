import { Router } from 'express';
import { agentAuth, requireTenantMatch } from './auth-middleware.js';
import { getAgentContext } from './context.js';
import { getAgentPolicy } from './policy.js';
import { createRun, completeRun, getRun } from './runs.js';
import { emitAgentEvent } from './events.js';
import { createArtifact } from './artifacts.js';
import { createAsset, getAsset } from './assets.js';
import { requestApproval } from './approvals.js';

const router = Router();
const auth = agentAuth();
const tenantMatch = requireTenantMatch();

router.get('/context/:tenantId', auth, tenantMatch, getAgentContext);
router.get('/policy/:tenantId', auth, tenantMatch, getAgentPolicy);

router.post('/runs', auth, createRun);
router.post('/runs/:id/complete', auth, completeRun);
router.get('/runs/:id', auth, getRun);

router.post('/events', auth, emitAgentEvent);
router.post('/artifacts', auth, createArtifact);
router.post('/assets', auth, createAsset);
router.get('/assets/:id', auth, getAsset);

router.post('/approvals/request', auth, requestApproval);

export default router;
