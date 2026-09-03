import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'control-plane/backend-execution-loop.json');
const docPath = path.join(root, 'docs/BACKEND_EXECUTION_LOOP.md');

function fail(message) {
  console.error(`BACKEND_LOOP_FAIL: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(manifestPath)) fail('missing backend execution manifest');
if (!fs.existsSync(docPath)) fail('missing backend execution documentation');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const requiredSkills = ['unlazy','ponytail','humanizer','ralphy','gauntlet_loop','claude_seo','emilkowalski_skills'];
const requiredSteps = [
  'write_acceptance_ledger',
  'run_ponytail_minimum_check',
  'run_tests_and_reverify',
  'run_independent_gauntlet_checkpoint',
  'verify_no_merge_conflict',
  'verify_required_ci',
  'merge_one_pr_only',
  'refresh_main'
];

if (manifest.decision !== 'backend_first_public_frontend_frozen') fail('backend-first/public-site freeze decision missing');
if (manifest.public_frontend?.state !== 'frozen') fail('public frontend must remain frozen');
if (!manifest.laws?.serialized_slice_merges) fail('serialized slice merge law missing');
if (!manifest.laws?.builder_cannot_final_approve) fail('builder/final-approver separation missing');
if (manifest.slices?.length !== 10) fail('exactly ten backend slices must be registered');

for (const skill of requiredSkills) {
  if (!manifest.quality_stack?.[skill]) fail(`missing quality skill: ${skill}`);
}
for (const step of requiredSteps) {
  if (!manifest.slice_loop?.includes(step)) fail(`missing required loop step: ${step}`);
}

const ids = manifest.slices.map((slice) => slice.id);
if (new Set(ids).size !== 10) fail('slice ids must be unique');

const doc = fs.readFileSync(docPath, 'utf8');
for (const forbidden of ['redesign the public ASC3ND site', 'silently deploy production']) {
  if (doc.toLowerCase().includes(forbidden)) fail(`documentation contains prohibited instruction: ${forbidden}`);
}
if (!doc.includes('public ASC3ND brand site is frozen')) fail('documentation must state public-site freeze');

console.log('BACKEND_LOOP_OK');
