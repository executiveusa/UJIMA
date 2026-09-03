import fs from 'node:fs';

const path = 'control-plane/client-chat-execution-loop.json';
const loop = JSON.parse(fs.readFileSync(path, 'utf8'));
const fail = (msg) => { console.error(`CLIENT_CHAT_LOOP_FAIL: ${msg}`); process.exit(1); };

if (loop.version !== '1.0.0') fail('unexpected version');
if (loop.boundaries?.public_frontend?.state !== 'frozen') fail('public frontend must remain frozen');
if (loop.boundaries?.client_surface !== '/app/*') fail('client surface must be /app/*');
if (loop.boundaries?.staff_admin_surface !== '/ops/*') fail('admin surface must remain /ops/*');
if (!loop.laws?.one_slice_one_branch_one_pr || !loop.laws?.no_direct_main || !loop.laws?.fresh_main_before_every_slice) fail('serialized git discipline missing');
if (!loop.laws?.builder_cannot_final_approve || !loop.laws?.completion_requires_evidence) fail('review/completion law missing');
if (!Array.isArray(loop.slices) || loop.slices.length !== 7) fail('exactly seven slices required');
const expected = ['01','02','03','04','05','06','07'];
if (loop.slices.map(s => s.id).join(',') !== expected.join(',')) fail('slice IDs must be serialized 01-07');
for (const section of ['preflight','build','stop_and_review']) {
  if (!Array.isArray(loop.slice_cycle?.[section]) || loop.slice_cycle[section].length === 0) fail(`missing ${section}`);
}
if (!loop.slice_cycle.stop_and_review.includes('stop_after_slice_implementation')) fail('slice stop/review checkpoint missing');
if (!loop.slice_cycle.decision?.pass?.includes('kick_next_slice')) fail('automatic continuation missing');
for (const skill of ['unlazy','ponytail','ralphy','humanizer','claude_seo','emilkowalski_skills','gauntlet_loop']) {
  if (!loop.quality_stack?.[skill]) fail(`quality skill missing: ${skill}`);
}
if (!loop.required_checkpoint_fields.includes('merge_conflicts') || !loop.required_checkpoint_fields.includes('public_frontend_freeze')) fail('checkpoint safety fields missing');
if (!loop.references?.netlify_site_id || !loop.references?.popebot) fail('reference pins missing');
console.log('CLIENT_CHAT_LOOP_OK');
