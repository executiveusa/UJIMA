import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getArtifacts } from '@asc3nd/core/artifacts';
import { createClientChatStore } from '../../../services/mission-api/src/agent/client-chat-store.js';
import { getClientMissionWorkState } from '../../../services/mission-api/src/agent/client-work-state.js';
import { routeFirstMateMission } from '../../../services/mission-api/src/agent/firstmate-mission-router.js';
import { analyzeGroundworkPage, assertPublicUrl, executeGroundworkAssessment } from '../../../services/mission-api/src/agent/groundwork-executor.js';

let tmp;
let previousDataDir;

beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ujima-groundwork-'));
  previousDataDir = process.env.DATA_DIR;
  process.env.DATA_DIR = tmp;
});

afterEach(() => {
  if (previousDataDir === undefined) delete process.env.DATA_DIR;
  else process.env.DATA_DIR = previousDataDir;
  fs.rmSync(tmp, { recursive: true, force: true });
});

describe('Groundwork safe public executor', () => {
  it('blocks private and loopback targets before fetching', async () => {
    await expect(assertPublicUrl(new URL('http://127.0.0.1'))).rejects.toThrow('GROUNDWORK_PRIVATE_IP_FORBIDDEN');
    await expect(assertPublicUrl(new URL('http://localhost'))).rejects.toThrow('GROUNDWORK_PRIVATE_HOST_FORBIDDEN');
    await expect(assertPublicUrl(new URL('https://example.org'), async () => [{ address: '10.0.0.5', family: 4 }]))
      .rejects.toThrow('GROUNDWORK_PRIVATE_DNS_TARGET_FORBIDDEN');
  });

  it('separates observed public evidence from identity and ownership unknowns', () => {
    const assessment = analyzeGroundworkPage({
      url: 'https://example.org/',
      html: '<html lang="en"><head><title>Hope Center</title><meta name="description" content="Youth programs"><meta name="viewport" content="width=device-width"><link rel="canonical" href="https://example.org/"><script type="application/ld+json">{"@type":"NonprofitOrganization"}</script></head><body><h1>After-school programs for Tacoma youth</h1><a href="/about">About</a><a href="/contact">Contact</a><a href="/donate">Donate</a><a href="/privacy">Privacy</a><a href="/annual-report">Annual report</a></body></html>'
    });
    expect(assessment.evidence.title).toBe('Hope Center');
    expect(assessment.evidence.contactPath).toBe(true);
    expect(assessment.outcomes.find((row) => row.key === 'identity').status).toBe('UNKNOWN');
    expect(assessment.outcomes.find((row) => row.key === 'ownership').status).toBe('UNKNOWN');
    expect(assessment.evidenceClass).toBe('OBSERVED_EVIDENCE');
    expect(assessment.findings.every((row) => row.evidenceClass === 'OBSERVED_EVIDENCE')).toBe(true);
    expect(assessment.limitations.join(' ')).toContain('does not make legal');
  });

  it('creates an inspectable mission artifact before the Groundwork mission becomes Ready', async () => {
    const tenantId = 'hope-center';
    const userId = 'usr_owner';
    fs.mkdirSync(path.join(tmp, tenantId), { recursive: true });
    fs.writeFileSync(path.join(tmp, tenantId, 'profile.json'), JSON.stringify({
      orgName: 'Hope Center',
      website: 'https://example.org'
    }));

    const store = createClientChatStore();
    const conversation = await store.createConversation({ tenantId, userId, title: 'Groundwork' });
    const message = await store.appendMessage({
      tenantId, userId, conversationId: conversation.conversationId, role: 'user',
      text: 'Run Groundwork on our organization.', idempotencyKey: 'groundwork-test-request'
    });
    const routed = routeFirstMateMission({
      tenantId, userId, conversationId: conversation.conversationId, sourceMessage: message
    });

    const fetchImpl = async () => new Response(
      '<html lang="en"><head><title>Hope Center</title><meta name="description" content="Community youth programs"><meta name="viewport" content="width=device-width"><link rel="canonical" href="https://example.org/"></head><body><h1>Hope Center youth programs</h1><a href="/about">About</a><a href="/contact">Contact</a><a href="/volunteer">Volunteer</a><a href="/privacy">Privacy</a></body></html>',
      { status: 200, headers: { 'content-type': 'text/html' } }
    );
    const lookup = async () => [{ address: '93.184.216.34', family: 4 }];

    const result = await executeGroundworkAssessment({
      tenantId, userId, conversationId: conversation.conversationId, missionId: routed.mission.mission_id,
      fetchImpl, lookup
    });

    expect(result.work.status).toBe('ready');
    const artifacts = getArtifacts({ tenantId });
    expect(artifacts).toHaveLength(1);
    expect(artifacts[0].kind).toBe('groundwork-assessment');
    expect(artifacts[0].sourceRefs).toContain('mission:' + routed.mission.mission_id);
    const artifactFile = path.join(tmp, tenantId, artifacts[0].storagePath);
    expect(fs.existsSync(artifactFile)).toBe(true);

    const work = getClientMissionWorkState({
      tenantId, userId, conversationId: conversation.conversationId, missionId: routed.mission.mission_id
    });
    expect(work.status).toBe('ready');
    expect(work.proofRefs).toEqual(['artifact:' + artifacts[0].id]);
  });
});
