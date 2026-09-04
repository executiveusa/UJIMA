import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { registerArtifact } from '@asc3nd/core/artifacts';
import { listApprovals } from '@asc3nd/core/approval-lifecycle';
import { createClientChatStore } from '../../../services/mission-api/src/agent/client-chat-store.js';
import { routeFirstMateMission } from '../../../services/mission-api/src/agent/firstmate-mission-router.js';
import {
  decideMissionApproval,
  ensureMissionApproval,
  missionEvidence,
  resolveMissionArtifactFile
} from '../../../services/mission-api/src/agent/client-mission-evidence.js';

function eventHarness() {
  const events = [];
  let sequence = 0;
  const read = ({ tenantId, type } = {}) => events.filter((event) => {
    if (tenantId && event.tenantId !== tenantId) return false;
    if (type && event.type !== type) return false;
    return true;
  });
  const append = (event) => {
    sequence += 1;
    const row = { id: `evt-${sequence}`, createdAt: new Date(2_100_000_000_000 + sequence).toISOString(), ...event };
    events.push(row);
    return row;
  };
  return { events, read, append };
}

async function fixture(text = 'Prepare next week’s content plan.') {
  const harness = eventHarness();
  const store = createClientChatStore({ read: harness.read, append: harness.append });
  const tenantId = 'asc3nd';
  const userId = 'owner-1';
  const conversation = await store.createConversation({ tenantId, userId, title: 'Evidence' });
  const message = await store.appendMessage({ tenantId, userId, conversationId: conversation.conversationId, role: 'user', text });
  const routed = routeFirstMateMission({ tenantId, userId, conversationId: conversation.conversationId, sourceMessage: message, read: harness.read, append: harness.append });
  return { ...harness, store, tenantId, userId, conversation, routed };
}

let dataDir;
beforeEach(() => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'asc3nd-slice06-'));
  process.env.DATA_DIR = dataDir;
});
afterEach(() => {
  delete process.env.DATA_DIR;
  fs.rmSync(dataDir, { recursive: true, force: true });
});

describe('Slice 06 mission artifacts and approvals', () => {
  it('returns only tenant-owned artifacts explicitly linked to the active mission', async () => {
    const fx = await fixture();
    const linked = registerArtifact({ tenantId: fx.tenantId, kind: 'content-plan', title: 'Week plan', storagePath: 'artifacts/week-plan.txt', sourceRefs: [`mission:${fx.routed.mission.mission_id}`], approvalStatus: 'approved' });
    registerArtifact({ tenantId: fx.tenantId, kind: 'other', title: 'Other mission', storagePath: 'artifacts/other.txt', sourceRefs: ['mission:msn_other'], approvalStatus: 'approved' });

    const evidence = missionEvidence({ tenantId: fx.tenantId, userId: fx.userId, conversationId: fx.conversation.conversationId, missionId: fx.routed.mission.mission_id, read: fx.read });
    expect(evidence.artifacts.map((artifact) => artifact.id)).toEqual([linked.id]);
    expect(() => missionEvidence({ tenantId: fx.tenantId, userId: 'other-user', conversationId: fx.conversation.conversationId, missionId: fx.routed.mission.mission_id, read: fx.read })).toThrow('MISSION_NOT_FOUND');
  });

  it('resolves artifact content only inside the tenant data root', async () => {
    const fx = await fixture();
    const dir = path.join(dataDir, fx.tenantId, 'artifacts');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'result.txt'), 'verified result', 'utf8');
    const artifact = registerArtifact({ tenantId: fx.tenantId, kind: 'result', title: 'Verified result', storagePath: 'artifacts/result.txt', sourceRefs: [`mission:${fx.routed.mission.mission_id}`], approvalStatus: 'approved' });
    const resolved = resolveMissionArtifactFile({ tenantId: fx.tenantId, userId: fx.userId, conversationId: fx.conversation.conversationId, missionId: fx.routed.mission.mission_id, artifactId: artifact.id, read: fx.read });
    expect(resolved.exists).toBe(true);
    expect(fs.readFileSync(resolved.absolute, 'utf8')).toBe('verified result');
  });

  it('creates one durable mission-linked approval and shares its state through the core store', async () => {
    const fx = await fixture('Submit the strongest grant application today.');
    expect(fx.routed.mission.approval.required).toBe(true);
    const first = ensureMissionApproval({ tenantId: fx.tenantId, userId: fx.userId, conversationId: fx.conversation.conversationId, missionId: fx.routed.mission.mission_id, read: fx.read });
    const second = ensureMissionApproval({ tenantId: fx.tenantId, userId: fx.userId, conversationId: fx.conversation.conversationId, missionId: fx.routed.mission.mission_id, read: fx.read });
    expect(second.id).toBe(first.id);
    expect(first.actionPayload.missionId).toBe(fx.routed.mission.mission_id);
    expect(first.status).toBe('draft');
    expect(listApprovals({ tenantId: fx.tenantId }).map((row) => row.id)).toEqual([first.id]);
  });

  it('allows an authorized browser owner to approve but never executes the consequential action', async () => {
    const fx = await fixture('Submit the strongest grant application today.');
    ensureMissionApproval({ tenantId: fx.tenantId, userId: fx.userId, conversationId: fx.conversation.conversationId, missionId: fx.routed.mission.mission_id, read: fx.read });
    const approved = decideMissionApproval({
      tenantId: fx.tenantId,
      userId: fx.userId,
      conversationId: fx.conversation.conversationId,
      missionId: fx.routed.mission.mission_id,
      decision: 'approve',
      actor: { sub: fx.userId, role: 'owner', tenantId: fx.tenantId },
      read: fx.read
    });
    expect(approved.status).toBe('approved');
    expect(approved.approver).toBe(fx.userId);
    expect(approved.actionPayload.missionId).toBe(fx.routed.mission.mission_id);
    expect(approved.status).not.toBe('executed');
  });

  it('rejects a mission approval into a terminal recoverable decision without delivery claims', async () => {
    const fx = await fixture('Publish this campaign today.');
    ensureMissionApproval({ tenantId: fx.tenantId, userId: fx.userId, conversationId: fx.conversation.conversationId, missionId: fx.routed.mission.mission_id, read: fx.read });
    const rejected = decideMissionApproval({
      tenantId: fx.tenantId,
      userId: fx.userId,
      conversationId: fx.conversation.conversationId,
      missionId: fx.routed.mission.mission_id,
      decision: 'reject',
      actor: { sub: fx.userId, role: 'owner', tenantId: fx.tenantId },
      read: fx.read
    });
    expect(rejected.status).toBe('rejected');
    expect(rejected.status).not.toBe('executed');
    expect(rejected.status).not.toBe('verified');
  });
});