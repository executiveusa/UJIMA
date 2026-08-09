/**
 * Real MCP Client End-to-End Smoke Test for OpusClip MCP Stdio Server
 * Connects to mcp-server.mjs over Stdio JSON-RPC transport using @modelcontextprotocol/sdk
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

async function runMcpSmokeTest() {
  console.log('=== OpusClip Real MCP Server End-to-End Smoke Test ===');

  const serverScript = resolve(__dirname, 'mcp-server.mjs');
  const transport = new StdioClientTransport({
    command: 'node',
    args: [serverScript],
    env: { ...process.env }
  });

  const client = new Client(
    { name: 'mcp-test-client', version: '0.1.0' },
    { capabilities: {} }
  );

  console.log('1. Connecting to OpusClip MCP Stdio Server...');
  await client.connect(transport);
  console.log('   CONNECTED via Stdio JSON-RPC transport');

  console.log('2. Listing MCP tools (tools/list)...');
  const toolsResponse = await client.listTools();
  const toolNames = toolsResponse.tools.map(t => t.name);
  console.log('   Exposed tools:', toolNames.join(', '));

  console.log('3. Calling tool: opusclip.health ...');
  const healthRes = await client.callTool({ name: 'opusclip.health', arguments: {} });
  const healthText = healthRes.content[0].text;
  console.log('   Result:', healthText);

  console.log('4. Calling tool: opusclip.get_brand_templates ...');
  const templatesRes = await client.callTool({ name: 'opusclip.get_brand_templates', arguments: {} });
  const templatesText = templatesRes.content[0].text;
  const templatesOk = JSON.parse(templatesText).statusCode === 200;
  console.log('   Result status:', templatesOk ? '200 OK' : 'FAILED');

  console.log('5. Calling tool: opusclip.get_collections ...');
  const collectionsRes = await client.callTool({ name: 'opusclip.get_collections', arguments: {} });
  const collectionsText = collectionsRes.content[0].text;
  const collectionsOk = JSON.parse(collectionsText).statusCode === 200;
  console.log('   Result status:', collectionsOk ? '200 OK' : 'FAILED');

  // Conditional project-scoped tests
  const testProjectId = process.env.OPUS_CLIP_TEST_PROJECT_ID;
  let projectScopedPassed = true;

  if (testProjectId) {
    console.log(`6. Calling project-scoped tools for supplied testProjectId...`);
    const transcriptRes = await client.callTool({ name: 'opusclip.get_transcript', arguments: { projectId: testProjectId } });
    const transcriptOk = JSON.parse(transcriptRes.content[0].text).statusCode === 200;
    console.log('   - Transcript:', transcriptOk ? '200 OK' : 'FAILED');

    const clipsRes = await client.callTool({ name: 'opusclip.get_clips', arguments: { projectId: testProjectId } });
    const clipsOk = JSON.parse(clipsRes.content[0].text).statusCode === 200;
    console.log('   - Exportable Clips:', clipsOk ? '200 OK' : 'FAILED');

    projectScopedPassed = transcriptOk && clipsOk;
  } else {
    console.log('6. Project-scoped tool tests (opusclip.get_transcript, opusclip.get_clips): SKIPPED_NO_PROJECT_ID');
  }

  console.log('7. Testing write tool policy guard (opusclip.create_project) ...');
  const writeRes = await client.callTool({ name: 'opusclip.create_project', arguments: { url: 'https://example.com/video.mp4' } });
  const writeBlocked = writeRes.isError && writeRes.content[0].text.includes('WRITE_POLICY_GUARD');
  console.log('   Policy guard test:', writeBlocked ? 'PASS (WRITE_POLICY_GUARD BLOCKED)' : 'FAIL');

  const basePassed = toolNames.includes('opusclip.health') &&
                     healthText.includes('"ok":true') &&
                     templatesOk &&
                     collectionsOk &&
                     writeBlocked;

  const allPassed = basePassed && projectScopedPassed;

  console.log('=== MCP End-to-End Smoke Test Result:', allPassed ? (testProjectId ? 'ALL TESTS PASSED (BASE + PROJECT-SCOPED)' : 'BASE TESTS PASSED (PROJECT-SCOPED SKIPPED)') : 'SOME TESTS FAILED', '===');

  await transport.close();
  if (!allPassed) {
    process.exit(1);
  }
}

runMcpSmokeTest().catch(err => {
  console.error('MCP Smoke test exception:', err);
  process.exit(1);
});
