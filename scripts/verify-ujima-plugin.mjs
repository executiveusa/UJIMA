import fs from 'node:fs';
import { spawn } from 'node:child_process';

const root = 'plugins/ujima';
const required = [
  root + '/plugin.json',
  root + '/mcp.json',
  root + '/server.mjs',
  root + '/skills/ujima/SKILL.md',
  root + '/skills/groundwork/SKILL.md',
  root + '/.claude-plugin/plugin.json',
  root + '/.codex-plugin/plugin.json',
  root + '/.mcp.json',
  root + '/SECURITY.md'
];
for (const file of required) if (!fs.existsSync(file)) throw new Error('PLUGIN_MISSING:' + file);

const manifest = JSON.parse(fs.readFileSync(root + '/plugin.json', 'utf8'));
if (manifest.$schema !== 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json') throw new Error('PORTABLE_PLUGIN_SCHEMA_INVALID');
if (manifest.name !== 'ujima') throw new Error('PLUGIN_NAME_INVALID');
const portableAllowed = new Set(['$schema','name','version','description','author','homepage','repository','license','keywords','extensions']);
for (const key of Object.keys(manifest)) if (!portableAllowed.has(key)) throw new Error('PLUGIN_UNKNOWN_FIELD:' + key);

const mcp = JSON.parse(fs.readFileSync(root + '/mcp.json', 'utf8'));
if (mcp.$schema !== 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json') throw new Error('PORTABLE_MCP_SCHEMA_INVALID');
const serverConfig = mcp.mcpServers?.ujima;
if (serverConfig?.type !== 'stdio' || serverConfig.command !== 'node') throw new Error('PORTABLE_MCP_STDIO_INVALID');
if (!serverConfig.args?.includes('${PLUGIN_ROOT}/server.mjs')) throw new Error('PORTABLE_MCP_ENTRYPOINT_INVALID');

const packageText = required.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
if (/UJIMA_MISSION_TOKEN\s*[:=]\s*['"][^$]/.test(packageText)) throw new Error('PLUGIN_EMBEDDED_TOKEN_RISK');
if (!fs.readFileSync(root + '/skills/groundwork/SKILL.md', 'utf8').includes('humanConfirmed')) {
  throw new Error('GROUNDWORK_SKILL_MISSING_HUMAN_GATE');
}

const child = spawn(process.execPath, [root + '/server.mjs'], {
  stdio: ['pipe','pipe','pipe'],
  env: { ...process.env, UJIMA_API_URL: '', UJIMA_MISSION_TOKEN: '' }
});

const lines = [];
let stderr = '';
child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
child.stdout.setEncoding('utf8');

function send(message) {
  child.stdin.write(JSON.stringify(message) + '\n');
}

function waitForResponse(id, timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    let buffer = '';
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('PLUGIN_MCP_TIMEOUT:' + id + ':' + stderr));
    }, timeoutMs);
    function onData(chunk) {
      buffer += chunk;
      const parts = buffer.split('\n');
      buffer = parts.pop() || '';
      for (const line of parts) {
        if (!line.trim()) continue;
        const parsed = JSON.parse(line);
        lines.push(parsed);
        if (parsed.id === id) {
          cleanup();
          resolve(parsed);
          return;
        }
      }
    }
    function cleanup() {
      clearTimeout(timer);
      child.stdout.off('data', onData);
    }
    child.stdout.on('data', onData);
  });
}

send({ jsonrpc:'2.0', id:1, method:'initialize', params:{ protocolVersion:'2025-06-18', capabilities:{}, clientInfo:{name:'ujima-test',version:'1'} } });
const init = await waitForResponse(1);
if (init.result?.serverInfo?.name !== 'ujima') throw new Error('PLUGIN_MCP_INIT_FAILED');

send({ jsonrpc:'2.0', method:'notifications/initialized', params:{} });
send({ jsonrpc:'2.0', id:2, method:'tools/list', params:{} });
const listed = await waitForResponse(2);
const names = (listed.result?.tools || []).map((tool) => tool.name);
for (const name of ['ujima.context','ujima.run_groundwork','ujima.approve','ujima.reject','ujima.export_conversation']) {
  if (!names.includes(name)) throw new Error('PLUGIN_TOOL_MISSING:' + name);
}
const approve = listed.result.tools.find((tool) => tool.name === 'ujima.approve');
if (!approve?.inputSchema?.required?.includes('humanConfirmed')) throw new Error('PLUGIN_APPROVAL_NOT_HUMAN_GATED');

child.kill('SIGTERM');
console.log('UJIMA_PLUGIN_OK');
