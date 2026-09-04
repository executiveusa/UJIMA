import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { emitEvent } from '@asc3nd/core/events';
import { createArtifact } from '../../../services/mission-api/src/agent/artifacts.js';
import { CLIENT_MISSION_EVENT } from '../../../services/mission-api/src/agent/firstmate-mission-router.js';

let dataDir;

function mockResponse() {
  return {
    statusCode: null,
    payload: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return payload; }
  };
}

beforeEach(() => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'asc3nd-agent-artifact-'));
  process.env.DATA_DIR = dataDir;
});

afterEach(() => {
  delete process.env.DATA_DIR;
  fs.rmSync(dataDir, { recursive: true, force: true });
});

describe('agent artifact mission provenance', () => {
  it('accepts an existing tenant mission and persists the mission source reference', () => {
    const tenantId = 'asc3nd';
    const missionId = 'msn_artifact_api_proof';
    emitEvent({
      tenantId,
      type: CLIENT_MISSION_EVENT,
      actor: 'firstmate',
      subject: missionId,
      payload: {
        execution_mode: 'route-only',
        execution_state: 'routed',
        handoff: {
          mission_id: missionId,
          tenant_id: tenantId,
          user_id: 'u1',
          conversation_id: 'conv_1',
          status: 'routed',
          approval: { required: false }
        }
      }
    });

    const req = {
      operator: { tenantId },
      body: {
        missionId,
        kind: 'grant-fit',
        title: 'Mission result',
        storagePath: 'proof/mission-result.json',
        approvalClass: 'green'
      }
    };
    const res = mockResponse();
    createArtifact(req, res);

    expect(res.statusCode).toBe(201);
    expect(res.payload.ok).toBe(true);
    expect(res.payload.artifact.sourceRefs).toContain(`mission:${missionId}`);
  });

  it('rejects a mission reference that does not exist in the authenticated tenant', () => {
    const req = {
      operator: { tenantId: 'asc3nd' },
      body: {
        missionId: 'msn_missing',
        kind: 'grant-fit',
        title: 'Invalid result',
        storagePath: 'proof/invalid.json',
        approvalClass: 'green'
      }
    };
    const res = mockResponse();
    createArtifact(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.payload).toMatchObject({ ok: false, error: { code: 'AGENT_ERROR', message: 'MISSION_NOT_FOUND' } });
  });
});
