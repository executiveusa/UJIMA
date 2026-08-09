#!/usr/bin/env node
import { HermesClient } from './index.mjs';

async function main() {
  const client = new HermesClient({ timeoutMs: 15000 });
  const checks = [];

  for (const [name, fn] of [
    ['health', () => client.health()],
    ['capabilities', () => client.capabilities()],
    ['models', () => client.models()]
  ]) {
    try {
      const result = await fn();
      checks.push({ name, ok: result.statusCode >= 200 && result.statusCode < 300, statusCode: result.statusCode });
    } catch (error) {
      checks.push({ name, ok: false, error: error.message, statusCode: error.statusCode });
    }
  }

  const passed = checks.every(check => check.ok);
  console.log(JSON.stringify({
    service: 'agenix-hermes-gateway',
    baseUrlConfigured: Boolean(process.env.HERMES_API_BASE_URL),
    apiKeyConfigured: Boolean(process.env.HERMES_API_SERVER_KEY),
    checks,
    passed
  }, null, 2));

  process.exit(passed ? 0 : 1);
}

main().catch(error => {
  console.error(JSON.stringify({ error: error.message }));
  process.exit(1);
});
