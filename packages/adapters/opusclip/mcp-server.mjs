#!/usr/bin/env node
/**
 * Official OpusClip MCP Server for Agenix Studio OS
 * Transport: Stdio (standard JSON-RPC over process stdio)
 * SDK: @modelcontextprotocol/sdk
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { OpusClipClient } from './index.mjs';

const client = new OpusClipClient();

const server = new Server(
  { name: 'opusclip-mcp-server', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'opusclip.health',
        description: 'Validate OpusClip API authentication status without spending credits',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'opusclip.get_brand_templates',
        description: 'Retrieve list of brand templates available for organization',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'opusclip.get_collections',
        description: 'Retrieve list of user collections',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'opusclip.get_social_accounts',
        description: 'Retrieve list of connected social accounts',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'opusclip.get_transcript',
        description: 'Retrieve trimmed transcript for a given project ID',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'OpusClip Project ID' }
          },
          required: ['projectId']
        }
      },
      {
        name: 'opusclip.get_clips',
        description: 'Retrieve list of generated clips for a given project ID',
        inputSchema: {
          type: 'object',
          properties: {
            projectId: { type: 'string', description: 'OpusClip Project ID' }
          },
          required: ['projectId']
        }
      },
      {
        name: 'opusclip.create_project',
        description: '[GUARDED WRITE] Submit long-form video to create clip project. Requires policy approval.',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'Source video URL' }
          },
          required: ['url']
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    switch (name) {
      case 'opusclip.health': {
        const result = await client.health();
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      }

      case 'opusclip.get_brand_templates': {
        const result = await client.getBrandTemplates();
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      }

      case 'opusclip.get_collections': {
        const result = await client.getCollections();
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      }

      case 'opusclip.get_social_accounts': {
        const result = await client.getSocialAccounts();
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      }

      case 'opusclip.get_transcript': {
        const result = await client.getTranscript(args.projectId);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      }

      case 'opusclip.get_clips': {
        const result = await client.getClips(args.projectId);
        return { content: [{ type: 'text', text: JSON.stringify(result) }] };
      }

      case 'opusclip.create_project': {
        await client.createProject(args);
        return { content: [{ type: 'text', text: 'SHOULD_NOT_REACH' }] };
      }

      default:
        throw new Error(`UNKNOWN_TOOL: ${name}`);
    }
  } catch (err) {
    return {
      isError: true,
      content: [{ type: 'text', text: JSON.stringify({ error: err.message }) }]
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
