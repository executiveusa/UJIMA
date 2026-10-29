#!/usr/bin/env node
import crypto from 'node:crypto';
import readline from 'node:readline';

const API_URL = String(process.env.UJIMA_API_URL || process.env.NEXT_PUBLIC_MISSION_API_URL || '').replace(/\/$/, '');
const TOKEN = String(process.env.UJIMA_MISSION_TOKEN || '').trim();

function rpcError(id, code, message, data) {
  return { jsonrpc: '2.0', id, error: { code, message, ...(data ? { data } : {}) } };
}

function rpcResult(id, result) {
  return { jsonrpc: '2.0', id, result };
}

function textResult(value) {
  return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}

function toolError(error) {
  return {
    isError: true,
    content: [{ type: 'text', text: JSON.stringify({
      error: error?.message || 'UJIMA_MCP_ERROR',
      status: error?.status || null
    }) }]
  };
}

function requireConfig() {
  if (!API_URL) throw new Error('UJIMA_API_URL_NOT_CONFIGURED');
  if (!TOKEN) throw new Error('UJIMA_MISSION_TOKEN_NOT_CONFIGURED');
}

async function ujima(path, options = {}) {
  requireConfig();
  const response = await fetch(API_URL + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + TOKEN,
      ...(options.headers || {})
    }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(typeof body.error === 'string' ? body.error : 'UJIMA_API_ERROR');
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body;
}

function requestKey() {
  return 'mcp-' + (crypto.randomUUID?.() || crypto.randomBytes(16).toString('hex'));
}

async function createConversation(title = 'External assistant') {
  const data = await ujima('/api/agent/client-chat/conversations', {
    method: 'POST',
    body: JSON.stringify({ title })
  });
  return data.conversation;
}

async function sendMessage(conversationId, text) {
  return ujima('/api/agent/client-chat/conversations/' + encodeURIComponent(conversationId), {
    method: 'POST',
    body: JSON.stringify({ text, idempotencyKey: requestKey() })
  });
}

const tools = [
  {
    name: 'ujima.health',
    description: 'Check whether the configured UJIMA Mission API is reachable. This does not mutate tenant state.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false }
  },
  {
    name: 'ujima.context',
    description: 'Return the authenticated UJIMA workspace and user context derived from the mission token.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false }
  },
  {
    name: 'ujima.list_conversations',
    description: 'List conversations for the authenticated user inside the token-bound tenant.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false }
  },
  {
    name: 'ujima.create_conversation',
    description: 'Create a new UJIMA conversation in the authenticated tenant.',
    inputSchema: {
      type: 'object',
      properties: { title: { type: 'string', maxLength: 160 } },
      additionalProperties: false
    }
  },
  {
    name: 'ujima.get_conversation',
    description: 'Read one owned conversation plus its current work, evidence, artifacts and approval state.',
    inputSchema: {
      type: 'object',
      properties: { conversationId: { type: 'string', minLength: 1 } },
      required: ['conversationId'],
      additionalProperties: false
    }
  },
  {
    name: 'ujima.send_message',
    description: 'Send a request through UJIMA chat. UJIMA performs tenant routing and approval checks; this tool does not bypass them.',
    inputSchema: {
      type: 'object',
      properties: {
        conversationId: { type: 'string', minLength: 1 },
        text: { type: 'string', minLength: 1, maxLength: 2000 }
      },
      required: ['conversationId', 'text'],
      additionalProperties: false
    }
  },
  {
    name: 'ujima.run_groundwork',
    description: 'Start the governed Groundwork nonprofit readiness workflow. Creates a conversation when one is not supplied.',
    inputSchema: {
      type: 'object',
      properties: {
        conversationId: { type: 'string' },
        note: { type: 'string', maxLength: 1200 }
      },
      additionalProperties: false
    }
  },
  {
    name: 'ujima.approve',
    description: '[HUMAN DECISION REQUIRED] Record an explicit human approval for a pending UJIMA mission. Never call unless the human approved this exact action.',
    inputSchema: {
      type: 'object',
      properties: {
        conversationId: { type: 'string', minLength: 1 },
        missionId: { type: 'string', minLength: 1 },
        comments: { type: 'string', maxLength: 1200 },
        humanConfirmed: { type: 'boolean' }
      },
      required: ['conversationId', 'missionId', 'humanConfirmed'],
      additionalProperties: false
    }
  },
  {
    name: 'ujima.reject',
    description: 'Record an explicit human rejection for a pending UJIMA mission.',
    inputSchema: {
      type: 'object',
      properties: {
        conversationId: { type: 'string', minLength: 1 },
        missionId: { type: 'string', minLength: 1 },
        comments: { type: 'string', maxLength: 1200 },
        humanConfirmed: { type: 'boolean' }
      },
      required: ['conversationId', 'missionId', 'humanConfirmed'],
      additionalProperties: false
    }
  },
  {
    name: 'ujima.export_conversation',
    description: 'Export the portable recovery record for an owned UJIMA conversation.',
    inputSchema: {
      type: 'object',
      properties: { conversationId: { type: 'string', minLength: 1 } },
      required: ['conversationId'],
      additionalProperties: false
    }
  }
];

async function callTool(name, args = {}) {
  try {
    switch (name) {
      case 'ujima.health': {
        if (!API_URL) throw new Error('UJIMA_API_URL_NOT_CONFIGURED');
        const response = await fetch(API_URL + '/api/health');
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error('UJIMA_HEALTH_FAILED');
        return textResult(body);
      }
      case 'ujima.context':
        return textResult(await ujima('/api/agent/client-chat/context'));
      case 'ujima.list_conversations':
        return textResult(await ujima('/api/agent/client-chat/conversations'));
      case 'ujima.create_conversation':
        return textResult(await createConversation(args.title || 'External assistant'));
      case 'ujima.get_conversation':
        return textResult(await ujima('/api/agent/client-chat/conversations/' + encodeURIComponent(args.conversationId)));
      case 'ujima.send_message':
        return textResult(await sendMessage(args.conversationId, args.text));
      case 'ujima.run_groundwork': {
        const conversation = args.conversationId
          ? { conversationId: args.conversationId }
          : await createConversation('Groundwork');
        const extra = String(args.note || '').trim();
        const text = extra ? 'Run Groundwork on our organization. Context from the user: ' + extra : 'Run Groundwork on our organization.';
        const result = await sendMessage(conversation.conversationId, text);
        return textResult({ conversationId: conversation.conversationId, ...result });
      }
      case 'ujima.approve':
      case 'ujima.reject': {
        if (args.humanConfirmed !== true) throw new Error('HUMAN_CONFIRMATION_REQUIRED');
        const decision = name === 'ujima.approve' ? 'approve' : 'reject';
        return textResult(await ujima(
          '/api/agent/client-chat/conversations/' + encodeURIComponent(args.conversationId) +
          '/missions/' + encodeURIComponent(args.missionId) + '/approval',
          {
            method: 'POST',
            body: JSON.stringify({ decision, comments: String(args.comments || '').trim() || null })
          }
        ));
      }
      case 'ujima.export_conversation':
        return textResult(await ujima('/api/agent/client-chat/conversations/' + encodeURIComponent(args.conversationId) + '/export'));
      default:
        throw new Error('UNKNOWN_TOOL:' + name);
    }
  } catch (error) {
    return toolError(error);
  }
}

async function handle(message) {
  const id = message?.id;
  const method = message?.method;
  if (method === 'notifications/initialized') return null;
  if (method === 'initialize') {
    return rpcResult(id, {
      protocolVersion: message?.params?.protocolVersion || '2025-06-18',
      capabilities: { tools: {} },
      serverInfo: { name: 'ujima', version: '1.0.0' },
      instructions: 'UJIMA is the governing nonprofit operating system. Use tenant-scoped tools only. Never infer human approval. Groundwork is evidence-first. Consequential work remains approval-gated.'
    });
  }
  if (method === 'tools/list') return rpcResult(id, { tools });
  if (method === 'tools/call') {
    const name = message?.params?.name;
    const args = message?.params?.arguments || {};
    return rpcResult(id, await callTool(name, args));
  }
  if (id === undefined || id === null) return null;
  return rpcError(id, -32601, 'Method not found');
}

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on('line', async (line) => {
  if (!line.trim()) return;
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    process.stdout.write(JSON.stringify(rpcError(null, -32700, 'Parse error')) + '\n');
    return;
  }
  try {
    const response = await handle(message);
    if (response) process.stdout.write(JSON.stringify(response) + '\n');
  } catch (error) {
    if (message?.id !== undefined) {
      process.stdout.write(JSON.stringify(rpcError(message.id, -32603, error?.message || 'Internal error')) + '\n');
    }
  }
});
