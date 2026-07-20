import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { assertTenantBoundary } from './safety.js';

export const stageDefinitions = [
  ['01_onboarding', 'Collect the organization profile and write stable Layer 3 configuration.'],
  ['02_opportunity_scan', 'Find grants, credits, sponsors, and local Seattle resources.'],
  ['03_grant_application', 'Prepare grant/app draft materials. Human approval required before submission.'],
  ['04_campaign_creation', 'Create donor, volunteer, and social campaign drafts.'],
  ['05_approval_gate', 'Review risk, source claims, and approval requirements.'],
  ['06_publish_or_submit', 'Prepare final send/post/submit package after approval.'],
  ['07_outcome_logging', 'Log outputs, program outcomes, metrics, and donor/staff feedback.'],
  ['08_workspace_learning', 'Convert repeated human edits into source-level improvements.']
];

export const factoryStageDefinitions = [
  ['00_intake', 'Collect client discovery information before building anything.'],
  ['01_tenant_profile', 'Generate tenant slug, create tenant record, populate _config files.'],
  ['02_knowledge_ingestion', 'Upload and distill client documents into stable ICM reference config.'],
  ['03_policy_and_approvals', 'Define named approvers and org-specific red/orange action policy.'],
  ['04_agent_pack', 'Generate and validate the tenant agent pack with missionctl.'],
  ['05_asset_generation', 'Generate managed bundle, provision Hermes, pass bundle smoke.'],
  ['06_ops_dashboard_setup', 'Create operator key, verify /ops dashboard reads tenant state.'],
  ['07_vps_deployment_plan', 'Write VPS deployment plan, DNS plan, and secret inventory.'],
  ['08_training_and_handoff', 'Create client training guide and operator handoff checklist.'],
  ['09_go_live_readiness', 'Final gate: full validation sequence, both sign-offs required.']
];

const DEFAULT_SHARED_FILES = [
  'README.md',
  'REVIEW-GATES.md',
  'laws/human-centered-design.md',
  'laws/design-ux-and-brand.md',
  'laws/story-documentary-and-production.md',
  'laws/growth-offer-and-retention.md',
  'laws/nonprofit-trust-and-ethics.md'
];

const BLOCKING_GATE_IDS = new Set(['truth', 'consent', 'youth_safety', 'dignity', 'destination']);

export function tenantRoot(base, tenantId) {
  assertTenantBoundary(tenantId);
  return path.join(base, 'tenants', tenantId);
}

export function ensureIcmWorkspace({ base = 'icm', tenantId = 'asc3nd', orgName = 'Asc3nd Collective' } = {}) {
  const root = tenantRoot(base, tenantId);
  fs.mkdirSync(root, { recursive: true });
  fs.mkdirSync(path.join(root, '_config'), { recursive: true });
  fs.mkdirSync(path.join(root, 'memory'), { recursive: true });
  fs.mkdirSync(path.join(root, 'audit_log'), { recursive: true });

  writeIfMissing(path.join(root, 'AGENT.md'), `# ${orgName} Mission Agent\n\nYou are the primary Pi-compatible mission operations agent for ${orgName}. Use ICM folders as the control surface. Never skip approval gates.\n`);
  writeIfMissing(path.join(root, 'CONTEXT.md'), `# Workspace Routing\n\nTenant: ${tenantId}\nOrganization: ${orgName}\n\nRead AGENT.md first, then select the numbered stage that matches the requested outcome. Load only the files listed by that stage contract.\n`);

  const config = {
    'mission.md': `# Mission\n\n${orgName} exists to create measurable community outcomes. Replace this with the final client mission during onboarding.\n`,
    'brand.md': '# Brand\n\nVoice: clear, warm, direct, youth-safe, outcome-focused.\n',
    'safety-policy.md': '# Safety Policy\n\nRed actions require authorized human approval: youth records, money, legal/compliance, grant submissions, donor commitments, public claims.\n',
    'model-routing.md': '# Model Routing\n\nCheap models handle extraction and formatting. Standard models handle drafting and comparison. Critical models handle high-risk reasoning.\n'
  };
  for (const [file, body] of Object.entries(config)) writeIfMissing(path.join(root, '_config', file), body);

  for (const [stage, description] of stageDefinitions) {
    const dir = path.join(root, 'stages', stage);
    fs.mkdirSync(path.join(dir, 'references'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'output'), { recursive: true });
    writeIfMissing(path.join(dir, 'CONTEXT.md'), stageContext(stage, description));
  }
  return root;
}

export function stageContext(stage, description) {
  return `# ${stage}\n\n${description}\n\n## Inputs\n\n- Layer 0: ../../AGENT.md\n- Layer 1: ../../CONTEXT.md\n- Layer 2: this CONTEXT.md\n- Layer 3: ../../_config/*.md and references/*.md\n- Shared laws: ../../../shared/creative-operating-system/\n- Layer 4: previous stage output/ as applicable\n\n## Process\n\n1. Load only relevant context.\n2. Produce a concrete artifact, not vague advice.\n3. Apply the shared creative review gates.\n4. Classify the action risk as green, yellow, orange, or red.\n5. Write outputs to this stage's output folder.\n6. If approval is needed, create an approval request.\n\n## Outputs\n\n- output/result.md\n- output/audit.json\n- optional output/approval-request.json\n\n## Verify\n\n- Output matches mission, safety policy, and shared creative laws.\n- Claims have source notes or are marked for verification.\n- Blocking review-gate failures prevent approval.\n- No red/orange action is performed without approval.\n`;
}

export function validateStageName(stage) {
  if (!/^[a-z0-9][a-z0-9_]*$/.test(stage)) {
    throw new Error(`Invalid stage name: ${stage}. Use lowercase letters, numbers, and underscores.`);
  }
  return stage;
}

export function safeStagePath(base, tenantId, stage, filename = '') {
  assertTenantBoundary(tenantId, `${stage}/${filename}`);
  validateStageName(stage);
  const target = path.join(tenantRoot(base, tenantId), 'stages', stage, 'output');
  const resolved = filename ? path.resolve(target, filename) : path.resolve(target);
  const targetRoot = path.resolve(target);
  if (resolved !== targetRoot && !resolved.startsWith(`${targetRoot}${path.sep}`)) {
    throw new Error('Path traversal refused. Stage output cannot escape the stage output directory.');
  }
  return resolved;
}

export function loadSharedCreativeContext({ base = 'icm', files = DEFAULT_SHARED_FILES, maxBytes = 250000 } = {}) {
  const sharedRoot = path.resolve(base, 'shared', 'creative-operating-system');
  if (!fs.existsSync(sharedRoot)) return { files: [], reviewGates: null, totalBytes: 0 };

  const loaded = [];
  let totalBytes = 0;
  for (const relativePath of files) {
    if (typeof relativePath !== 'string' || relativePath.includes('..') || path.isAbsolute(relativePath)) {
      throw new Error(`Unsafe shared creative context path: ${relativePath}`);
    }
    const absolutePath = path.resolve(sharedRoot, relativePath);
    if (absolutePath !== sharedRoot && !absolutePath.startsWith(`${sharedRoot}${path.sep}`)) {
      throw new Error(`Shared creative context path escaped root: ${relativePath}`);
    }
    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) continue;
    const content = fs.readFileSync(absolutePath, 'utf8');
    totalBytes += Buffer.byteLength(content, 'utf8');
    if (totalBytes > maxBytes) throw new Error(`Shared creative context exceeds ${maxBytes} bytes.`);
    loaded.push({
      file: relativePath,
      content,
      sha256: crypto.createHash('sha256').update(content).digest('hex')
    });
  }

  const gatesPath = path.join(sharedRoot, 'review-gates.json');
  const reviewGates = fs.existsSync(gatesPath) ? JSON.parse(fs.readFileSync(gatesPath, 'utf8')) : null;
  return { files: loaded, reviewGates, totalBytes };
}

export function evaluateCreativeReviewGates({ checks = {}, gateDefinition = null } = {}) {
  const configuredGates = gateDefinition?.gates || [];
  const ids = configuredGates.length
    ? configuredGates.map((gate) => gate.id)
    : ['purpose', 'human_truth', 'clarity', 'story', 'truth', 'consent', 'youth_safety', 'dignity', 'destination', 'brand', 'production', 'approval'];

  const results = ids.map((id) => {
    const value = checks[id];
    const status = value === true || value === 'pass' ? 'pass' : value === false || value === 'fail' ? 'fail' : 'unknown';
    const configured = configuredGates.find((gate) => gate.id === id);
    const blocking = configured?.blocking === true || BLOCKING_GATE_IDS.has(id);
    return { id, status, blocking };
  });
  const blockingFailures = results.filter((item) => item.blocking && item.status !== 'pass');
  return {
    status: blockingFailures.length ? 'blocked' : 'pass',
    canApprove: blockingFailures.length === 0,
    results,
    blockingFailures: blockingFailures.map((item) => item.id)
  };
}

export function readStageContext({ base = 'icm', tenantId, stage, sharedFiles } = {}) {
  assertTenantBoundary(tenantId, stage);
  validateStageName(stage);
  const root = tenantRoot(base, tenantId);
  const stageDir = path.join(root, 'stages', stage);
  if (!fs.existsSync(stageDir)) throw new Error(`Stage not found: ${stage}`);

  const configDir = path.join(root, '_config');
  const refsDir = path.join(stageDir, 'references');
  const previousStage = stageDefinitions[stageDefinitions.findIndex(([name]) => name === stage) - 1];
  const sharedCreative = loadSharedCreativeContext({ base, files: sharedFiles || DEFAULT_SHARED_FILES });

  return {
    agent: readText(path.join(root, 'AGENT.md')),
    workspace: readText(path.join(root, 'CONTEXT.md')),
    stageContext: readText(path.join(stageDir, 'CONTEXT.md')),
    config: readMarkdownDirectory(configDir),
    references: readMarkdownDirectory(refsDir),
    sharedCreative,
    previousStage: previousStage?.[0] || null,
    previousOutput: previousStage ? readPreviousOutput(base, tenantId, previousStage[0]) : null
  };
}

export function runIcmStage({ base = 'icm', tenantId = 'asc3nd', stage, result = '', audit = {}, approvalRequest = null, reviewChecks = {}, onArtifact } = {}) {
  assertTenantBoundary(tenantId, stage);
  validateStageName(stage);
  const context = readStageContext({ base, tenantId, stage });
  const review = evaluateCreativeReviewGates({ checks: reviewChecks, gateDefinition: context.sharedCreative.reviewGates });
  const outDir = safeStagePath(base, tenantId, stage);
  fs.mkdirSync(outDir, { recursive: true });

  const now = new Date().toISOString();
  const artifacts = [];
  const resultPath = path.join(outDir, 'result.md');
  fs.writeFileSync(resultPath, result || `# ${stage} result\n\nGenerated ${now}\n`, 'utf8');
  artifacts.push({ stage, filename: 'result.md', path: resultPath, createdAt: now });

  const auditPath = path.join(outDir, 'audit.json');
  const auditBody = {
    stage,
    tenantId,
    ranAt: now,
    contextLayers: {
      agent: Boolean(context.agent),
      workspace: Boolean(context.workspace),
      stageContext: Boolean(context.stageContext),
      configFiles: context.config.length,
      referenceFiles: context.references.length,
      sharedCreativeFiles: context.sharedCreative.files.map(({ file, sha256 }) => ({ file, sha256 })),
      previousStage: context.previousStage
    },
    creativeReview: review,
    ...audit
  };
  fs.writeFileSync(auditPath, JSON.stringify(auditBody, null, 2), 'utf8');
  artifacts.push({ stage, filename: 'audit.json', path: auditPath, createdAt: now });

  const effectiveApprovalRequest = approvalRequest
    ? { ...approvalRequest, status: review.canApprove ? (approvalRequest.status || 'pending') : 'blocked', blockingFailures: review.blockingFailures }
    : null;
  if (effectiveApprovalRequest) {
    const approvalPath = path.join(outDir, 'approval-request.json');
    fs.writeFileSync(approvalPath, JSON.stringify({ stage, tenantId, createdAt: now, ...effectiveApprovalRequest }, null, 2), 'utf8');
    artifacts.push({ stage, filename: 'approval-request.json', path: approvalPath, createdAt: now });
  }

  if (typeof onArtifact === 'function') {
    for (const artifact of artifacts) {
      onArtifact({ id: `icm_${crypto.randomBytes(4).toString('hex')}`, tenantId, ...artifact });
    }
  }
  return { stage, tenantId, outDir, artifacts, context, review };
}

export function writeStageOutput({ base = 'icm', tenantId = 'asc3nd', stage = '02_opportunity_scan', filename = 'result.md', content = '' }) {
  const target = safeStagePath(base, tenantId, stage, filename);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
  return target;
}

export function listIcmTree({ base = 'icm', tenantId = 'asc3nd' } = {}) {
  const root = tenantRoot(base, tenantId);
  if (!fs.existsSync(root)) return [];
  const results = [];
  walk(root, root, results);
  return results;
}

export function validateIcmWorkspace({ base = 'icm', tenantId = 'asc3nd' } = {}) {
  assertTenantBoundary(tenantId);
  const root = tenantRoot(base, tenantId);
  const errors = [];
  if (!fs.existsSync(root)) return { ok: false, tenantId, errors: [`workspace missing: ${root}`], stages: [] };
  for (const file of ['AGENT.md', 'CONTEXT.md']) {
    if (!fs.existsSync(path.join(root, file))) errors.push(`missing root file: ${file}`);
  }
  if (!fs.existsSync(path.join(root, '_config'))) errors.push('missing _config/ directory');
  const stages = stageDefinitions.map(([stage]) => {
    const stageDir = path.join(root, 'stages', stage);
    const exists = fs.existsSync(stageDir);
    const hasContext = fs.existsSync(path.join(stageDir, 'CONTEXT.md'));
    if (!exists) errors.push(`missing stage directory: stages/${stage}`);
    else if (!hasContext) errors.push(`missing CONTEXT.md: stages/${stage}/CONTEXT.md`);
    return { stage, exists, hasContext };
  });
  return { ok: errors.length === 0, tenantId, errors, stages };
}

function readMarkdownDirectory(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory)
    .filter((file) => file.endsWith('.md'))
    .sort()
    .map((file) => ({ file, content: readText(path.join(directory, file)) }));
}

function readPreviousOutput(base, tenantId, stage) {
  const resultPath = path.join(tenantRoot(base, tenantId), 'stages', stage, 'output', 'result.md');
  return fs.existsSync(resultPath) ? readText(resultPath) : null;
}

function readText(file) {
  try { return fs.readFileSync(file, 'utf8'); } catch { return ''; }
}

function writeIfMissing(file, content) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, content, 'utf8');
}

function walk(root, current, results) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(current, entry.name);
    results.push({ path: path.relative(root, full), type: entry.isDirectory() ? 'dir' : 'file' });
    if (entry.isDirectory()) walk(root, full, results);
  }
}
