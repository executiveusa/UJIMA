#!/usr/bin/env node
import assert from 'node:assert/strict';
import { HermesClient, HERMES_GOVERNOR_INSTRUCTIONS } from './index.mjs';

const originalFetch = globalThis.fetch;
const calls = [];

globalThis.fetch = async (url, options = {}) => {
  calls.push({ url: String(url), options });
  return new Response(JSON.stringify({ ok: true, run_id: 'run_test' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

try {
  const client = new HermesClient({
    baseUrl: 'http://hermes.test:8642/',
    apiKey: 'test-only-key',
    timeoutMs: 1000
  });

  await client.health();
  assert.equal(calls.at(-1).url, 'http://hermes.test:8642/health');
  assert.equal(calls.at(-1).options.headers.Authorization, 'Bearer test-only-key');

  await client.capabilities();
  assert.equal(calls.at(-1).url, 'http://hermes.test:8642/v1/capabilities');

  await client.startRun({ input: 'Inspect Opus read-only', sessionId: 'asc3nd-test', instructions: HERMES_GOVERNOR_INSTRUCTIONS });
  const runCall = calls.at(-1);
  assert.equal(runCall.url, 'http://hermes.test:8642/v1/runs');
  assert.equal(runCall.options.method, 'POST');
  const runBody = JSON.parse(runCall.options.body);
  assert.equal(runBody.input, 'Inspect Opus read-only');
  assert.equal(runBody.session_id, 'asc3nd-test');
  assert.ok(runBody.instructions.includes('Never reveal'));

  await client.runStatus('run 1');
  assert.equal(calls.at(-1).url, 'http://hermes.test:8642/v1/runs/run%201');

  await client.stopRun('run_test');
  assert.equal(calls.at(-1).url, 'http://hermes.test:8642/v1/runs/run_test/stop');

  await client.resolveApproval('run_test', { choice: 'deny', resolveAll: true });
  const approvalCall = calls.at(-1);
  assert.equal(approvalCall.url, 'http://hermes.test:8642/v1/runs/run_test/approval');
  const approvalBody = JSON.parse(approvalCall.options.body);
  assert.deepEqual(approvalBody, { choice: 'deny', resolve_all: true });

  await assert.rejects(() => new HermesClient({ baseUrl: 'http://hermes.test', apiKey: '' }).health(), /MISSING_HERMES_API_SERVER_KEY/);
  await assert.rejects(() => client.startRun({ input: '' }), /HERMES_RUN_INPUT_REQUIRED/);
  await assert.rejects(() => client.resolveApproval('run_test', {}), /HERMES_APPROVAL_CHOICE_REQUIRED/);
  await assert.rejects(() => client.resolveApproval('run_test', { choice: 'maybe' }), /HERMES_APPROVAL_CHOICE_REQUIRED/);

  console.log('PASS HermesClient contract tests');
} finally {
  globalThis.fetch = originalFetch;
}
