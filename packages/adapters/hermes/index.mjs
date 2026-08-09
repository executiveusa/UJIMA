const DEFAULT_BASE_URL = 'http://127.0.0.1:8642';
const HERMES_APPROVAL_CHOICES = new Set(['once', 'session', 'always', 'deny']);

export class HermesClient {
  constructor(options = {}) {
    this.baseUrl = (options.baseUrl || process.env.HERMES_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
    this.apiKey = options.apiKey || process.env.HERMES_API_SERVER_KEY || '';
    this.timeoutMs = Number(options.timeoutMs || process.env.HERMES_API_TIMEOUT_MS || 120000);
  }

  async _request(path, { method = 'GET', body, signal } = {}) {
    if (!this.apiKey) throw new Error('MISSING_HERMES_API_SERVER_KEY');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(new Error(`HERMES_REQUEST_TIMEOUT:${this.timeoutMs}`)), this.timeoutMs);
    const abort = () => controller.abort(signal?.reason || new Error('HERMES_REQUEST_ABORTED'));
    signal?.addEventListener?.('abort', abort, { once: true });

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
          ...(body !== undefined ? { 'Content-Type': 'application/json' } : {})
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      const raw = await response.text();
      let data = raw;
      try { data = raw ? JSON.parse(raw) : null; } catch (_) {}

      if (!response.ok) {
        const err = new Error(`HERMES_HTTP_${response.status}`);
        err.statusCode = response.status;
        err.response = data;
        throw err;
      }

      return { statusCode: response.status, data };
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener?.('abort', abort);
    }
  }

  health() {
    return this._request('/health');
  }

  detailedHealth() {
    return this._request('/health/detailed');
  }

  capabilities() {
    return this._request('/v1/capabilities');
  }

  models() {
    return this._request('/v1/models');
  }

  startRun({ input, sessionId, instructions, previousResponseId, conversationHistory } = {}) {
    if (!input?.trim()) throw new Error('HERMES_RUN_INPUT_REQUIRED');
    return this._request('/v1/runs', {
      method: 'POST',
      body: {
        input,
        ...(sessionId ? { session_id: sessionId } : {}),
        ...(instructions ? { instructions } : {}),
        ...(previousResponseId ? { previous_response_id: previousResponseId } : {}),
        ...(conversationHistory ? { conversation_history: conversationHistory } : {})
      }
    });
  }

  runStatus(runId) {
    if (!runId) throw new Error('HERMES_RUN_ID_REQUIRED');
    return this._request(`/v1/runs/${encodeURIComponent(runId)}`);
  }

  stopRun(runId) {
    if (!runId) throw new Error('HERMES_RUN_ID_REQUIRED');
    return this._request(`/v1/runs/${encodeURIComponent(runId)}/stop`, { method: 'POST', body: {} });
  }

  resolveApproval(runId, { choice, resolveAll = false } = {}) {
    if (!runId) throw new Error('HERMES_RUN_ID_REQUIRED');
    if (!HERMES_APPROVAL_CHOICES.has(choice)) {
      throw new Error('HERMES_APPROVAL_CHOICE_REQUIRED: expected once, session, always, or deny');
    }
    return this._request(`/v1/runs/${encodeURIComponent(runId)}/approval`, {
      method: 'POST',
      body: {
        choice,
        ...(resolveAll ? { resolve_all: true } : {})
      }
    });
  }
}

export const HERMES_GOVERNOR_INSTRUCTIONS = [
  'You are executing a bounded task for Agenix Studio OS.',
  'Never reveal, print, return, or persist secret values.',
  'Do not publish, schedule social posts, buy credits, top up accounts, merge to main, deploy production, delete data, or perform irreversible/destructive actions without an explicit human approval gate.',
  'Use existing configured provider credentials inside Hermes; do not ask the caller to transmit downstream provider secrets.',
  'Return evidence: actions taken, provider/resource IDs when safe, cost/credit delta when applicable, blockers, and whether anything was published.',
  'If an action needs approval, stop and return the approval request rather than bypassing it.'
].join(' ');
