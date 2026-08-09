/**
 * OpusClip MCP Tool Gateway Contracts for Agenix Studio OS
 */

import { OpusClipClient } from './index.mjs';

const client = new OpusClipClient();

export const opusClipMcpTools = {
  'opusclip.health': {
    description: 'Validate OpusClip API authentication status without spending credits',
    parameters: {},
    handler: async () => client.health()
  },
  'opusclip.get_brand_templates': {
    description: 'Retrieve list of brand templates available for organization',
    parameters: {},
    handler: async () => client.getBrandTemplates()
  },
  'opusclip.get_collections': {
    description: 'Retrieve list of user collections',
    parameters: {},
    handler: async () => client.getCollections()
  },
  'opusclip.get_social_accounts': {
    description: 'Retrieve list of connected social accounts',
    parameters: {},
    handler: async () => client.getSocialAccounts()
  },
  'opusclip.get_transcript': {
    description: 'Retrieve transcript for a given project ID',
    parameters: { projectId: { type: 'string', required: true } },
    handler: async ({ projectId }) => client.getTranscript(projectId)
  },
  'opusclip.get_clips': {
    description: 'Retrieve list of generated clips for a given project ID',
    parameters: { projectId: { type: 'string', required: true } },
    handler: async ({ projectId }) => client.getClips(projectId)
  }
};
