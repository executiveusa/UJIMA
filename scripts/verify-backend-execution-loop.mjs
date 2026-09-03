import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'control-plane/backend-execution-loop.json');
const docPath = path.join(root, 'docs/BACKEND_EXECUTION_LOOP.md');

function fail(message) {
  console.error(`BACKEND_LOOP_FAIL: ${message}`);
  process.exit(1);
}
function requireFile(rel) {
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) fail(`missing required file: ${rel}`);
  return abs;
}
function readJson(rel) {
  return JSON.parse(fs.readFileSync(requireFile(rel), 'utf8'));
}

requireFile('control-plane/backend-execution-loop.json');
requireFile('docs/BACKEND_EXECUTION_LOOP.md');

const manifest = readJson('control-plane/backend-execution-loop.json');
const requiredSkills = ['unlazy','ponytail','humanizer','ralphy','gauntlet_loop','claude_seo','emilkowalski_skills'];
const requiredSteps = [
  'write_acceptance_ledger','run_ponytail_minimum_check','run_tests_and_reverify',
  'run_independent_gauntlet_checkpoint','verify_no_merge_conflict','verify_required_ci',
  'merge_one_pr_only','refresh_main'
];

if (manifest.decision !== 'backend_first_public_frontend_frozen') fail('backend-first/public-site freeze decision missing');
if (manifest.public_frontend?.state !== 'frozen') fail('public frontend must remain frozen');
if (!manifest.laws?.serialized_slice_merges) fail('serialized slice merge law missing');
if (!manifest.laws?.builder_cannot_final_approve) fail('builder/final-approver separation missing');
if (manifest.slices?.length !== 10) fail('exactly ten backend slices must be registered');
for (const skill of requiredSkills) if (!manifest.quality_stack?.[skill]) fail(`missing quality skill: ${skill}`);
for (const step of requiredSteps) if (!manifest.slice_loop?.includes(step)) fail(`missing required loop step: ${step}`);
if (new Set(manifest.slices.map((slice) => slice.id)).size !== 10) fail('slice ids must be unique');
if (!fs.readFileSync(docPath, 'utf8').includes('public ASC3ND brand site is frozen')) fail('documentation must state public-site freeze');

// Slice 01 — reality and ownership.
for (const rel of [
  'control-plane/asc3nd-system-inventory.json',
  'icm/tenants/asc3nd/01-reality-ownership/INPUT.md',
  'icm/tenants/asc3nd/01-reality-ownership/INSTRUCTIONS.md',
  'icm/tenants/asc3nd/01-reality-ownership/OUTPUTS.md',
  'icm/tenants/asc3nd/01-reality-ownership/STATUS.json'
]) requireFile(rel);
const inventory = readJson('control-plane/asc3nd-system-inventory.json');
if (inventory.public_frontend_freeze !== true) fail('slice 01 must preserve public frontend freeze');
for (const owner of ['organization_truth','live_database_rows','public_frontend','grant_domain','deployment_runtime','source_code_and_migrations']) {
  if (!inventory.owner_resolution?.[owner]) fail(`slice 01 missing owner resolution: ${owner}`);
}
const slice01 = readJson('icm/tenants/asc3nd/01-reality-ownership/STATUS.json');
if (slice01.public_frontend_touched !== false || slice01.state !== 'MERGE_READY') fail('slice 01 status invalid');

// Slice 02 — canonical ASC3ND ICM brain.
for (const rel of [
  'icm/tenants/asc3nd/02-canonical-icm/INPUT.md',
  'icm/tenants/asc3nd/02-canonical-icm/INSTRUCTIONS.md',
  'icm/tenants/asc3nd/02-canonical-icm/OUTPUTS.md',
  'icm/tenants/asc3nd/02-canonical-icm/organization.json',
  'icm/tenants/asc3nd/02-canonical-icm/PROVENANCE.json',
  'icm/tenants/asc3nd/02-canonical-icm/STATUS.json'
]) requireFile(rel);
const org = readJson('icm/tenants/asc3nd/02-canonical-icm/organization.json');
if (org.tenant_id !== 'asc3nd') fail('slice 02 tenant mismatch');
if (org.organization?.name !== 'ASC3ND Collective') fail('slice 02 canonical name missing');
if (!Array.isArray(org.known_unknowns) || org.known_unknowns.length < 3) fail('slice 02 must record unknowns');
if (org.truth_rules?.event_identity_does_not_equal_marketing_consent !== true) fail('slice 02 consent separation missing');
if (org.truth_rules?.no_biometric_identity !== true) fail('slice 02 biometric prohibition missing');
const provenance = readJson('icm/tenants/asc3nd/02-canonical-icm/PROVENANCE.json');
if (!Array.isArray(provenance.facts) || provenance.facts.length < 4) fail('slice 02 provenance insufficient');
const slice02 = readJson('icm/tenants/asc3nd/02-canonical-icm/STATUS.json');
if (slice02.public_frontend_touched !== false || slice02.sensitive_records_committed !== false || slice02.state !== 'MERGE_READY') fail('slice 02 status invalid');

console.log('BACKEND_LOOP_OK');
