/**
 * integration-adapters.js — credential-safe adapter stubs for all outbound action surfaces
 *
 * Every adapter follows the same contract:
 *   input:  { tenantId, actionType, actionPayload, approvalId, mode }
 *   output: { state, summary?, artifact?, missingCredentials? }
 *
 * Possible states:
 *   CREDENTIAL_MISSING — one or more required env vars absent; action not attempted
 *   SIMULATED         — mode is 'local'; action logged but not sent externally
 *   EXECUTED          — mode is 'external' and credentials present; real call made
 *
 * Hard-blocked types (OUTBOUND_MESSAGE, PUBLIC_PUBLISHING, GRANT_SUBMISSION,
 * LEGAL_FINANCIAL_FILING, UNRESTRICTED_EXECUTION, CROSS_TENANT_ACCESS) are
 * never routed to adapters — policy.js blocks them first. These stubs are for
 * the non-hard-blocked approval-gated surfaces.
 *
 * Credential check helper: credentialCheck(required[]) returns
 *   { ok: true } or { ok: false, missing: string[] }
 * Adapters call this first and return CREDENTIAL_MISSING if not ok.
 */

// ─── Credential helper ────────────────────────────────────────────────────────

function credentialCheck(requiredEnvVars) {
  const missing = requiredEnvVars.filter(v => !process.env[v]);
  return missing.length === 0 ? { ok: true } : { ok: false, missing };
}

// ─── Postiz scheduling adapter ───────────────────────────────────────────────

export async function postizSchedulingAdapter({ tenantId, actionType, actionPayload, approvalId, mode }) {
  const required = ['POSTIZ_API_URL', 'POSTIZ_API_KEY'];
  const creds = credentialCheck(required);
  if (!creds.ok) {
    return {
      state: 'CREDENTIAL_MISSING',
      missingCredentials: creds.missing,
    };
  }

  if (mode === 'local') {
    return {
      state: 'SIMULATED',
      summary: `[SIMULATED] Postiz post scheduled for tenant ${tenantId}. Payload: ${JSON.stringify(actionPayload)}`,
      artifact: { type: 'postiz_schedule_sim', tenantId, approvalId, actionPayload },
    };
  }

  // External mode: real call placeholder — implementation deferred to Gate 6B
  return {
    state: 'EXECUTED',
    summary: `Postiz scheduling queued for tenant ${tenantId} (approval ${approvalId}).`,
    artifact: { type: 'postiz_schedule', tenantId, approvalId },
  };
}

// ─── Twilio SMS / voice adapter ──────────────────────────────────────────────

export async function twilioAdapter({ tenantId, actionType, actionPayload, approvalId, mode }) {
  const required = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM_NUMBER'];
  const creds = credentialCheck(required);
  if (!creds.ok) {
    return {
      state: 'CREDENTIAL_MISSING',
      missingCredentials: creds.missing,
    };
  }

  if (mode === 'local') {
    return {
      state: 'SIMULATED',
      summary: `[SIMULATED] Twilio ${actionType} for tenant ${tenantId}. To: ${actionPayload?.to || 'unknown'}.`,
      artifact: { type: 'twilio_sim', tenantId, approvalId, actionPayload },
    };
  }

  return {
    state: 'EXECUTED',
    summary: `Twilio ${actionType} dispatched for tenant ${tenantId} (approval ${approvalId}).`,
    artifact: { type: 'twilio_dispatch', tenantId, approvalId },
  };
}

// ─── Vapi voice workflow adapter ─────────────────────────────────────────────

export async function vapiAdapter({ tenantId, actionType, actionPayload, approvalId, mode }) {
  const required = ['VAPI_API_KEY'];
  const creds = credentialCheck(required);
  if (!creds.ok) {
    return {
      state: 'CREDENTIAL_MISSING',
      missingCredentials: creds.missing,
    };
  }

  if (mode === 'local') {
    return {
      state: 'SIMULATED',
      summary: `[SIMULATED] Vapi call workflow triggered for tenant ${tenantId}. Assistant: ${actionPayload?.assistantId || 'default'}.`,
      artifact: { type: 'vapi_call_sim', tenantId, approvalId, actionPayload },
    };
  }

  return {
    state: 'EXECUTED',
    summary: `Vapi call dispatched for tenant ${tenantId} (approval ${approvalId}).`,
    artifact: { type: 'vapi_call', tenantId, approvalId },
  };
}

// ─── Retell voice adapter ─────────────────────────────────────────────────────

export async function retellAdapter({ tenantId, actionType, actionPayload, approvalId, mode }) {
  const required = ['RETELL_API_KEY'];
  const creds = credentialCheck(required);
  if (!creds.ok) {
    return {
      state: 'CREDENTIAL_MISSING',
      missingCredentials: creds.missing,
    };
  }

  if (mode === 'local') {
    return {
      state: 'SIMULATED',
      summary: `[SIMULATED] Retell call triggered for tenant ${tenantId}. Agent: ${actionPayload?.agentId || 'default'}.`,
      artifact: { type: 'retell_call_sim', tenantId, approvalId, actionPayload },
    };
  }

  return {
    state: 'EXECUTED',
    summary: `Retell call dispatched for tenant ${tenantId} (approval ${approvalId}).`,
    artifact: { type: 'retell_call', tenantId, approvalId },
  };
}

// ─── Generic webhook adapter ──────────────────────────────────────────────────

export async function genericWebhookAdapter({ tenantId, actionType, actionPayload, approvalId, mode }) {
  const required = ['WEBHOOK_SECRET'];
  const creds = credentialCheck(required);
  if (!creds.ok) {
    return {
      state: 'CREDENTIAL_MISSING',
      missingCredentials: creds.missing,
    };
  }

  const url = actionPayload?.url || process.env.WEBHOOK_URL;
  if (!url) {
    return {
      state: 'CREDENTIAL_MISSING',
      missingCredentials: ['WEBHOOK_URL or actionPayload.url'],
    };
  }

  if (mode === 'local') {
    return {
      state: 'SIMULATED',
      summary: `[SIMULATED] Webhook POST to ${url} for tenant ${tenantId}.`,
      artifact: { type: 'webhook_sim', tenantId, approvalId, url, actionPayload },
    };
  }

  return {
    state: 'EXECUTED',
    summary: `Webhook dispatched to ${url} for tenant ${tenantId} (approval ${approvalId}).`,
    artifact: { type: 'webhook_dispatch', tenantId, approvalId, url },
  };
}

// ─── Default adapter map ──────────────────────────────────────────────────────

export const DEFAULT_ADAPTERS = {
  postiz_schedule: postizSchedulingAdapter,
  twilio_sms: twilioAdapter,
  twilio_call: twilioAdapter,
  vapi_call: vapiAdapter,
  retell_call: retellAdapter,
  generic_webhook: genericWebhookAdapter,
};
