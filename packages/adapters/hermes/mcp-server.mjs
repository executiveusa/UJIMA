#!/usr/bin/env node
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { CallToolRequestSchema, ListToolsRequestSchema, isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { HermesClient, HERMES_GOVERNOR_INSTRUCTIONS } from './index.mjs';

const PORT = Number(process.env.AGENIX_HERMES_MCP_PORT || 8787);
const HOST = process.env.AGENIX_HERMES_MCP_HOST || '127.0.0.1';
const MCP_BEARER_TOKEN = process.env.AGENIX_MCP_BEARER_TOKEN || '';
const ALLOWED_ORIGINS = new Set((process.env.AGENIX_MCP_ALLOWED_ORIGINS || '').split(',').map(v => v.trim()).filter(Boolean));
const sessions = new Map();

function toolResult(value) {
  return { content: [{ type: 'text', text: JSON.stringify(value) }] };
}

function toolError(error) {
  const safe = {
    error: error?.message || 'HERMES_TOOL_ERROR',
    ...(error?.statusCode ? { statusCode: error.statusCode } : {})
  };
  return { isError: true, content: [{ type: 'text', text: JSON.stringify(safe) }] };
}

function createHermesMcpServer() {
  const client = new HermesClient();
  const server = new Server(
    { name: 'agenix-hermes-gateway', version: '0.1.0' },
    {
      capabilities: { tools: {} },
      instructions: 'Use Hermes as an execution runtime. Read status before starting work. Never expose secrets. Execution tools require explicit approval arguments. Publishing, spending, destructive actions, credential changes, production deploys, and merge-to-main remain human approval gates.'
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'hermes.health',
        description: 'Read-only health check for the configured Hermes Agent API server.',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'hermes.health_detailed',
        description: 'Read-only detailed Hermes runtime health and active-session status.',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'hermes.capabilities',
        description: 'Read-only discovery of the Hermes API capabilities exposed by the running agent.',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'hermes.models',
        description: 'Read-only list of Hermes API model/profile identifiers.',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'hermes.run_status',
        description: 'Read-only status for an existing Hermes run.',
        inputSchema: {
          type: 'object',
          properties: { runId: { type: 'string' } },
          required: ['runId']
        }
      },
      {
        name: 'hermes.run',
        description: '[APPROVAL-GATED EXECUTION] Start a bounded Hermes agent run. Hermes keeps downstream secrets. Set approved=true only when the human has authorized this exact bounded task.',
        inputSchema: {
          type: 'object',
          properties: {
            input: { type: 'string', description: 'Bounded outcome requested from Hermes.' },
            approved: { type: 'boolean', description: 'Must be true only after explicit human authorization for this bounded run.' },
            approvalReason: { type: 'string', description: 'Short human-approval basis.' },
            sessionId: { type: 'string' },
            instructions: { type: 'string', description: 'Optional extra bounded instructions layered after Agenix safety instructions.' }
          },
          required: ['input', 'approved', 'approvalReason']
        }
      },
      {
        name: 'hermes.stop_run',
        description: 'Stop an existing Hermes run. This is a safety/cancellation action.',
        inputSchema: {
          type: 'object',
          properties: { runId: { type: 'string' } },
          required: ['runId']
        }
      },
      {
        name: 'hermes.resolve_approval',
        description: '[HUMAN GATE] Resolve a pending Hermes approval using an official choice: once, session, always, or deny. Caller must provide the explicit human decision and reason.',
        inputSchema: {
          type: 'object',
          properties: {
            runId: { type: 'string' },
            choice: { type: 'string', enum: ['once', 'session', 'always', 'deny'] },
            resolveAll: { type: 'boolean', description: 'Resolve all pending approvals for this run/session using the same explicit human choice.' },
            reason: { type: 'string', description: 'Human-readable audit basis retained at the Agenix boundary; not sent as a provider secret.' },
            humanConfirmed: { type: 'boolean', description: 'Must be true; represents an explicit human decision in the current interaction.' }
          },
          required: ['runId', 'choice', 'reason', 'humanConfirmed']
        }
      }
    ]
  }));

  server.setRequestHandler(CallToolRequestSchema, async request => {
    const { name, arguments: args = {} } = request.params;
    try {
      switch (name) {
        case 'hermes.health': return toolResult(await client.health());
        case 'hermes.health_detailed': return toolResult(await client.detailedHealth());
        case 'hermes.capabilities': return toolResult(await client.capabilities());
        case 'hermes.models': return toolResult(await client.models());
        case 'hermes.run_status': return toolResult(await client.runStatus(args.runId));
        case 'hermes.stop_run': return toolResult(await client.stopRun(args.runId));
        case 'hermes.run': {
          if (args.approved !== true || !args.approvalReason?.trim()) {
            throw new Error('APPROVAL_REQUIRED: hermes.run requires approved=true plus approvalReason from an explicit human authorization.');
          }
          const instructions = [HERMES_GOVERNOR_INSTRUCTIONS, args.instructions || ''].filter(Boolean).join(' ');
          return toolResult(await client.startRun({ input: args.input, sessionId: args.sessionId, instructions }));
        }
        case 'hermes.resolve_approval': {
          if (args.humanConfirmed !== true || !args.reason?.trim()) {
            throw new Error('HUMAN_CONFIRMATION_REQUIRED: approval resolution cannot be inferred or delegated.');
          }
          return toolResult(await client.resolveApproval(args.runId, {
            choice: args.choice,
            resolveAll: args.resolveAll === true
          }));
        }
        default: throw new Error(`UNKNOWN_TOOL:${name}`);
      }
    } catch (error) {
      return toolError(error);
    }
  });

  return server;
}

function unauthorized(res) {
  res.writeHead(401, { 'Content-Type': 'application/json', 'WWW-Authenticate': 'Bearer' });
  res.end(JSON.stringify({ error: 'unauthorized' }));
}

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, MCP-Session-Id, Last-Event-ID');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  }
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return undefined;
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

const httpServer = http.createServer(async (req, res) => {
  try {
    applyCors(req, res);
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'ok', service: 'agenix-hermes-mcp' }));
    }

    if (req.url !== '/mcp') {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'not_found' }));
    }

    if (!MCP_BEARER_TOKEN) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'AGENIX_MCP_BEARER_TOKEN_NOT_CONFIGURED' }));
    }
    if (req.headers.authorization !== `Bearer ${MCP_BEARER_TOKEN}`) return unauthorized(res);

    const sessionId = req.headers['mcp-session-id'];
    let transport = sessionId ? sessions.get(sessionId) : undefined;
    let body;
    if (req.method === 'POST') body = await readJson(req);

    if (!transport && req.method === 'POST' && isInitializeRequest(body)) {
      const server = createHermesMcpServer();
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: id => sessions.set(id, transport)
      });
      transport.onclose = () => {
        if (transport?.sessionId) sessions.delete(transport.sessionId);
      };
      await server.connect(transport);
    }

    if (!transport) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32000, message: 'Bad Request: valid MCP session required' }, id: null }));
    }

    await transport.handleRequest(req, res, body);
  } catch (error) {
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json' });
    if (!res.writableEnded) res.end(JSON.stringify({ error: 'internal_error', message: error?.message || 'unknown' }));
  }
});

httpServer.listen(PORT, HOST, () => {
  console.error(`[agenix-hermes-mcp] listening on http://${HOST}:${PORT}/mcp`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, async () => {
    for (const transport of sessions.values()) {
      try { await transport.close(); } catch (_) {}
    }
    httpServer.close(() => process.exit(0));
  });
}
