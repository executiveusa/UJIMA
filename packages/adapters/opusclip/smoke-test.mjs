/**
 * Read-Only Smoke Test for OpusClip Client
 * Loads credential in local smoke-tooling context ONLY.
 */

import fs from 'fs';
import { OpusClipClient } from './index.mjs';

// Load credential into process memory for local smoke testing ONLY
function loadLocalVaultKey() {
  if (process.env.OPUS_CLIP_API || process.env.OPUS_CLIP_API_KEY) return;
  try {
    const vaultPath = 'E:\\THE PAULI FILES\\Cosmos_Vault.env';
    if (fs.existsSync(vaultPath)) {
      const content = fs.readFileSync(vaultPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed.startsWith('OPUS_CLIP_API=')) {
          process.env.OPUS_CLIP_API = trimmed.split('=')[1].trim();
          return;
        }
      }
    }
  } catch (_) {}
}

loadLocalVaultKey();

async function runSmokeTest() {
  console.log('=== OpusClip Client Read-Only Smoke Test ===');
  const client = new OpusClipClient();

  const health = await client.health();
  console.log('1. Health check:', health.ok ? 'PASS (200 OK)' : `FAIL (${health.statusCode || health.error})`);

  const templates = await client.getBrandTemplates();
  console.log('2. Brand templates:', templates.statusCode === 200 ? 'PASS (200 OK)' : `FAIL (${templates.statusCode})`);

  const collections = await client.getCollections();
  console.log('3. Collections:', collections.statusCode === 200 ? 'PASS (200 OK)' : `FAIL (${collections.statusCode})`);

  const social = await client.getSocialAccounts();
  console.log('4. Social accounts:', social.statusCode === 200 ? 'PASS (200 OK)' : `FAIL (${social.statusCode})`);

  // Verify write policy guard
  let writeBlocked = false;
  try {
    await client.createProject({ url: 'https://example.com/video.mp4' });
  } catch (err) {
    writeBlocked = err.message.includes('WRITE_POLICY_GUARD');
  }
  console.log('5. Write tool policy guard:', writeBlocked ? 'PASS (WRITE_POLICY_GUARD ACTIVE)' : 'FAIL');

  const allPassed = health.ok && templates.statusCode === 200 && collections.statusCode === 200 && social.statusCode === 200 && writeBlocked;
  console.log('=== Smoke Test Result:', allPassed ? 'ALL TESTS PASSED (100%)' : 'SOME TESTS FAILED', '===');
  
  if (!allPassed) {
    process.exit(1);
  }
}

runSmokeTest().catch(err => {
  console.error('Smoke test exception:', err.message);
  process.exit(1);
});
