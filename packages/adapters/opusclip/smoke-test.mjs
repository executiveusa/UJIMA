/**
 * Read-Only Smoke Test for OpusClip MCP Gateway Adapter
 * Validates authentication & live endpoint responses without spending credits.
 */

import { OpusClipClient } from './index.mjs';

async function runSmokeTest() {
  console.log('=== OpusClip MCP Gateway Read-Only Smoke Test ===');
  const client = new OpusClipClient();

  const health = await client.health();
  console.log('1. Health check:', health.ok ? 'PASS (200 OK)' : `FAIL (${health.statusCode || health.error})`);

  const templates = await client.getBrandTemplates();
  console.log('2. Brand templates:', templates.statusCode === 200 ? 'PASS (200 OK)' : `FAIL (${templates.statusCode})`);

  const collections = await client.getCollections();
  console.log('3. Collections:', collections.statusCode === 200 ? 'PASS (200 OK)' : `FAIL (${collections.statusCode})`);

  const social = await client.getSocialAccounts();
  console.log('4. Social accounts:', social.statusCode === 200 ? 'PASS (200 OK)' : `FAIL (${social.statusCode})`);

  const allPassed = health.ok && templates.statusCode === 200 && collections.statusCode === 200 && social.statusCode === 200;
  console.log('=== Smoke Test Result:', allPassed ? 'ALL TESTS PASSED (100%)' : 'SOME TESTS FAILED', '===');
  
  if (!allPassed) {
    process.exit(1);
  }
}

runSmokeTest().catch(err => {
  console.error('Smoke test exception:', err.message);
  process.exit(1);
});
