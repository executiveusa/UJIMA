import fs from 'node:fs';
const c=JSON.parse(fs.readFileSync('control-plane/automation-fabric.json','utf8'));
if(c.execution_model!=='github-native-first') throw Error('execution model drift');
if(c.branch_law.direct_main!==false||c.branch_law.one_slice_one_branch!==true||c.branch_law.one_slice_one_pr!==true||c.branch_law.merge_only_after_ci_and_conflict_check!==true||c.branch_law.next_slice_starts_from_fresh_main!==true) throw Error('branch law violation');
for(const x of ['dangerously-skip-permissions','full-auto','yolo']) if(!c.worker_policy.ralphy.forbidden.includes(x)) throw Error(`dangerous ralphy mode not denied: ${x}`);
if(c.worker_policy.openhands.canonical_memory!==false||c.worker_policy.openhands.consequential_authority!==false||c.worker_policy.firstmate.may_approve_own_work!==false) throw Error('worker authority violation');
for(const x of ['tenant_id','owner_repo','acceptance_gates','allowed_capabilities','denied_capabilities','risk_tier','evidence_policy','rollback','approval_policy']) if(!c.mission_requirements.includes(x)) throw Error(`mission field missing: ${x}`);
if(c.risk.tier3!=='consequential explicit human approval'||c.proof.builder_cannot_final_approve!==true||c.proof.completion_requires_exit_zero!==true||c.proof.completion_requires_expected_evidence!==true) throw Error('proof or risk law violation');
console.log('SOCIAL_PURPOSE_AUTOMATION_FABRIC_OK');
