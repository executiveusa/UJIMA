import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  ensureIcmWorkspace,
  runIcmStage,
  readStageContext,
  safeStagePath,
  validateStageName,
  loadSharedCreativeContext,
  evaluateCreativeReviewGates
} from '../src/icm.js';

let tmp;
beforeEach(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'icm-test-'));
});
afterEach(() => {
  fs.rmSync(tmp, { recursive: true, force: true });
});

function seedSharedCreativeContext() {
  const root = path.join(tmp, 'shared', 'creative-operating-system');
  fs.mkdirSync(path.join(root, 'laws'), { recursive: true });
  fs.writeFileSync(path.join(root, 'README.md'), '# Shared creative system', 'utf8');
  fs.writeFileSync(path.join(root, 'REVIEW-GATES.md'), '# Review gates', 'utf8');
  fs.writeFileSync(path.join(root, 'laws', 'human-centered-design.md'), '# Human-centered design', 'utf8');
  fs.writeFileSync(path.join(root, 'review-gates.json'), JSON.stringify({
    version: '1.0.0',
    gates: [
      { id: 'truth', blocking: true },
      { id: 'consent', blocking: true },
      { id: 'clarity', blocking: false }
    ]
  }), 'utf8');
}

describe('ICM runner hardening', () => {
  it('validates tenant paths and refuses path traversal in stage names', () => {
    expect(() => validateStageName('../escape')).toThrow(/Invalid stage name/);
    expect(() => validateStageName('02_opportunity_scan')).not.toThrow();
  });

  it('safeStagePath refuses traversal via filename', () => {
    ensureIcmWorkspace({ base: tmp, tenantId: 'asc3nd' });
    expect(() => safeStagePath(tmp, 'asc3nd', '02_opportunity_scan', '../../../etc/passwd')).toThrow(/traversal|Unsafe path/);
  });

  it('refuses tenant path traversal via tenantId', () => {
    expect(() => ensureIcmWorkspace({ base: tmp, tenantId: '../escape' })).toThrow(/Invalid tenant id|Unsafe path/);
  });

  it('reads Layer 0-4 context for a stage', () => {
    ensureIcmWorkspace({ base: tmp, tenantId: 'asc3nd' });
    const ctx = readStageContext({ base: tmp, tenantId: 'asc3nd', stage: '02_opportunity_scan' });
    expect(ctx.agent).toContain('Mission Agent');
    expect(ctx.workspace).toContain('Workspace Routing');
    expect(ctx.stageContext).toContain('02_opportunity_scan');
    expect(ctx.config.length).toBeGreaterThan(0);
  });

  it('loads bounded shared creative context with source hashes', () => {
    ensureIcmWorkspace({ base: tmp, tenantId: 'asc3nd' });
    seedSharedCreativeContext();
    const shared = loadSharedCreativeContext({
      base: tmp,
      files: ['README.md', 'REVIEW-GATES.md', 'laws/human-centered-design.md']
    });
    expect(shared.files).toHaveLength(3);
    expect(shared.files.every((file) => /^[a-f0-9]{64}$/.test(file.sha256))).toBe(true);
    expect(shared.reviewGates.version).toBe('1.0.0');
  });

  it('refuses traversal and excessive shared context', () => {
    seedSharedCreativeContext();
    expect(() => loadSharedCreativeContext({ base: tmp, files: ['../secret.md'] })).toThrow(/Unsafe/);
    expect(() => loadSharedCreativeContext({ base: tmp, files: ['README.md'], maxBytes: 2 })).toThrow(/exceeds/);
  });

  it('blocks approval when a mandatory creative gate is failed or unknown', () => {
    const review = evaluateCreativeReviewGates({
      gateDefinition: {
        gates: [
          { id: 'truth', blocking: true },
          { id: 'consent', blocking: true },
          { id: 'clarity', blocking: false }
        ]
      },
      checks: { truth: true, consent: false, clarity: true }
    });
    expect(review.status).toBe('blocked');
    expect(review.canApprove).toBe(false);
    expect(review.blockingFailures).toEqual(['consent']);
  });

  it('writes result.md, audit.json, and a blocked approval request when required gates fail', () => {
    ensureIcmWorkspace({ base: tmp, tenantId: 'asc3nd' });
    seedSharedCreativeContext();
    const artifacts = [];
    const result = runIcmStage({
      base: tmp,
      tenantId: 'asc3nd',
      stage: '03_grant_application',
      result: '# Draft grant\n\nEligibility confirmed.',
      audit: { riskClass: 'red' },
      reviewChecks: { truth: true, consent: false, clarity: true },
      approvalRequest: { risk: 'red', title: 'Submit grant', summary: 'King County RFP' },
      onArtifact: (artifact) => artifacts.push(artifact)
    });
    expect(fs.existsSync(path.join(result.outDir, 'result.md'))).toBe(true);
    expect(fs.existsSync(path.join(result.outDir, 'audit.json'))).toBe(true);
    expect(fs.existsSync(path.join(result.outDir, 'approval-request.json'))).toBe(true);
    expect(result.review.canApprove).toBe(false);
    const approval = JSON.parse(fs.readFileSync(path.join(result.outDir, 'approval-request.json'), 'utf8'));
    expect(approval.status).toBe('blocked');
    expect(approval.blockingFailures).toEqual(['consent']);
    const audit = JSON.parse(fs.readFileSync(path.join(result.outDir, 'audit.json'), 'utf8'));
    expect(audit.contextLayers.sharedCreativeFiles.length).toBeGreaterThan(0);
    expect(artifacts).toHaveLength(3);
  });

  it('never loads unrelated tenant files', () => {
    ensureIcmWorkspace({ base: tmp, tenantId: 'asc3nd' });
    ensureIcmWorkspace({ base: tmp, tenantId: 'other-tenant' });
    const otherFile = path.join(tmp, 'tenants', 'other-tenant', 'stages', '02_opportunity_scan', 'output', 'result.md');
    fs.mkdirSync(path.dirname(otherFile), { recursive: true });
    fs.writeFileSync(otherFile, 'secret other tenant data', 'utf8');
    const ctx = readStageContext({ base: tmp, tenantId: 'asc3nd', stage: '02_opportunity_scan' });
    expect(JSON.stringify(ctx)).not.toContain('secret other tenant data');
  });

  it('indexes artifact metadata via onArtifact callback', () => {
    ensureIcmWorkspace({ base: tmp, tenantId: 'asc3nd' });
    const indexed = [];
    runIcmStage({
      base: tmp,
      tenantId: 'asc3nd',
      stage: '02_opportunity_scan',
      result: 'scan done',
      reviewChecks: {
        truth: true,
        consent: true,
        youth_safety: true,
        dignity: true,
        destination: true
      },
      onArtifact: (artifact) => indexed.push(artifact)
    });
    expect(indexed.length).toBeGreaterThanOrEqual(2);
    expect(indexed.every((artifact) => artifact.id && artifact.stage && artifact.filename && artifact.path && artifact.createdAt)).toBe(true);
  });
});
