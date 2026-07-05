/**
 * action-dispatcher.js — approval-gated action dispatcher
 *
 * Dispatches an action through the policy/approval/adapter pipeline.
 * Every attempt writes an audit event regardless of outcome.
 *
 * Execution states returned by dispatch():
 *   DRY_RUN            — execution mode is dry-run; no adapter called
 *   HARD_BLOCKED       — policy hard-block; requires human override
 *   PENDING_APPROVAL   — orange/red action queued for human approval
 *   CREDENTIAL_MISSING — adapter configured but credentials absent
 *   ADAPTER_UNAVAILABLE — adapter not configured for this action type
 *   EXECUTED           — action executed by adapter (local/simulated)
 *   REJECTED           — approval was denied
 *   ERROR              — unexpected error; see error field
 */

import { evaluateActionPolicy, HARD_BLOCK_KEYWORDS } from './policy.js';
import { emitEvent } from './events.js';
import { requestApproval } from './approval-lifecycle.js';
import { registerArtifact } from './artifacts.js';

const HARD_BLOCKED_TYPES = new Set(Object.values(HARD_BLOCK_KEYWORDS));

// ─── Execution mode ───────────────────────────────────────────────────────────

function executionMode() {
  const mode = process.env.AGENT_EXECUTION_MODE || 'dry-run';
  if (!['dry-run', 'local', 'external'].includes(mode)) return 'dry-run';
  return mode;
}

// ─── Dispatch ─────────────────────────────────────────────────────────────────

/**
 * Dispatch an action through the policy → approval → adapter pipeline.
 *
 * @param {object} opts
 * @param {string} opts.tenantId
 * @param {string} opts.actionType  — one of HARD_BLOCK_KEYWORDS or a free-form type
 * @param {object} [opts.actionPayload]
 * @param {string} [opts.approvalId] — if provided, action is being executed post-approval
 * @param {object} [opts.adapters]   — map of { [actionType]: adapterFn }
 * @param {string} [opts.requestedBy]
 * @returns {Promise<DispatchResult>}
 */
export async function dispatch({
  tenantId,
  actionType,
  actionPayload = {},
  approvalId = null,
  adapters = {},
  requestedBy = 'system',
}) {
  if (!tenantId) throw new Error('dispatch requires tenantId');
  if (!actionType) throw new Error('dispatch requires actionType');

  const timestamp = new Date().toISOString();
  const mode = executionMode();

  // Base audit event fields
  const auditBase = { tenantId, actionType, requestedBy, timestamp, executionMode: mode };

  // 1 — Policy evaluation
  const policyResult = evaluateActionPolicy({ actionType, actionPayload });

  // Hard-blocked types are never allowed regardless of approval or approval class.
  // Note: policyResult.allowed may be false for orange-class actions too (requires approval)
  // but those are routed to PENDING_APPROVAL below, not HARD_BLOCKED.
  if (HARD_BLOCKED_TYPES.has(actionType)) {
    emitEvent({ tenantId, type: 'action.hard_blocked', ...auditBase, policyReason: policyResult.reason });
    return {
      state: 'HARD_BLOCKED',
      tenantId,
      actionType,
      policyResult,
      timestamp,
      executionMode: mode,
      message: policyResult.reason,
    };
  }

  // 2 — Dry-run: stop here, log intent
  if (mode === 'dry-run') {
    emitEvent({ tenantId, type: 'action.dry_run', ...auditBase, approvalClass: policyResult.approvalClass });
    return {
      state: 'DRY_RUN',
      tenantId,
      actionType,
      policyResult,
      timestamp,
      executionMode: mode,
      message: 'Dry-run mode — no adapter called. Set AGENT_EXECUTION_MODE=local or external to execute.',
    };
  }

  // 3 — Orange/red without an approval ID → queue for approval
  if (['orange', 'red', 'yellow'].includes(policyResult.approvalClass) && !approvalId) {
    const approval = requestApproval({
      tenantId,
      actionType,
      actionPayload,
      requester: requestedBy,
    });
    emitEvent({ tenantId, type: 'action.pending_approval', ...auditBase, approvalId: approval.id, approvalClass: policyResult.approvalClass });
    return {
      state: 'PENDING_APPROVAL',
      tenantId,
      actionType,
      policyResult,
      approvalId: approval.id,
      timestamp,
      executionMode: mode,
      message: `Action queued for human approval (${policyResult.approvalClass}). Approval ID: ${approval.id}`,
    };
  }

  // 4 — External mode safety check: refuse without explicit live-approval config
  if (mode === 'external') {
    const liveApproved = process.env.GATE_6B_LIVE_APPROVED === 'true';
    if (!liveApproved) {
      emitEvent({ tenantId, type: 'action.external_blocked', ...auditBase, reason: 'GATE_6B_LIVE_APPROVED not set' });
      return {
        state: 'HARD_BLOCKED',
        tenantId,
        actionType,
        policyResult,
        timestamp,
        executionMode: mode,
        message: 'External mode blocked: GATE_6B_LIVE_APPROVED=true required. This env var must not be set until the Architect approves Gate 6B.',
      };
    }
  }

  // 5 — Find adapter
  const adapter = adapters[actionType];
  if (!adapter) {
    emitEvent({ tenantId, type: 'action.adapter_unavailable', ...auditBase });
    return {
      state: 'ADAPTER_UNAVAILABLE',
      tenantId,
      actionType,
      policyResult,
      timestamp,
      executionMode: mode,
      message: `No adapter registered for action type "${actionType}". Register an adapter or use dry-run mode.`,
    };
  }

  // 6 — Execute adapter
  let adapterResult;
  try {
    adapterResult = await adapter({ tenantId, actionType, actionPayload, approvalId, mode });
  } catch (err) {
    emitEvent({ tenantId, type: 'action.error', ...auditBase, errorMessage: err.message });
    return {
      state: 'ERROR',
      tenantId,
      actionType,
      policyResult,
      timestamp,
      executionMode: mode,
      error: err.message,
    };
  }

  // Adapter signals CREDENTIAL_MISSING
  if (adapterResult.state === 'CREDENTIAL_MISSING') {
    emitEvent({ tenantId, type: 'action.credential_missing', ...auditBase, missingCredentials: adapterResult.missingCredentials });
    return {
      state: 'CREDENTIAL_MISSING',
      tenantId,
      actionType,
      policyResult,
      timestamp,
      executionMode: mode,
      missingCredentials: adapterResult.missingCredentials,
      message: `Adapter cannot execute: missing credentials: ${(adapterResult.missingCredentials || []).join(', ')}`,
    };
  }

  // 7 — Record artifact if adapter produced output
  if (adapterResult.artifact) {
    registerArtifact({
      tenantId,
      type: actionType,
      content: adapterResult.artifact,
      approvalId,
      requestedBy,
    });
  }

  emitEvent({
    tenantId,
    type: 'action.executed',
    ...auditBase,
    approvalId,
    adapterState: adapterResult.state,
    summary: adapterResult.summary || null,
  });

  return {
    state: 'EXECUTED',
    tenantId,
    actionType,
    policyResult,
    approvalId,
    timestamp,
    executionMode: mode,
    adapterResult,
    message: adapterResult.summary || `Action ${actionType} executed.`,
  };
}

// ─── Convenience: attempt with no adapters (audit + policy only) ──────────────

export function auditOnlyDispatch({ tenantId, actionType, actionPayload = {}, requestedBy = 'system' }) {
  return dispatch({ tenantId, actionType, actionPayload, adapters: {}, requestedBy });
}
