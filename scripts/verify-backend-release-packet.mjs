import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const l=read('release/asc3nd-backend-loop-ledger.json');
const h=read('handoffs/asc3nd-backend-integration-freeze.json');
const f=read('control-plane/domain-federation.json');
const a=read('control-plane/automation-fabric.json');
const r=read('recovery/cold-agent-manifest.json');
if(l.status!=='READY_FOR_HUMAN_MERGE'||l.tenant!=='asc3nd'||l.public_frontend_mutated!==false) throw Error('release state invalid');
const expected=Array.from({length:11},(_,i)=>String(i).padStart(2,'0'));
if(l.slices.length!==expected.length) throw Error('slice count mismatch');
for(let i=0;i<expected.length;i++){
  const s=l.slices[i];
  if(s.slice!==expected[i]) throw Error(`slice order mismatch at ${expected[i]}`);
  if(!Number.isInteger(s.pr)||s.pr<1) throw Error(`PR proof missing for ${s.slice}`);
  if(!/^[0-9a-f]{40}$/.test(s.merge_sha)) throw Error(`merge SHA invalid for ${s.slice}`);
}
if(new Set(l.slices.map(s=>`${s.repo}#${s.pr}`)).size!==l.slices.length) throw Error('duplicate slice PR');
if(l.verified_repository_truth.social_purpose_os_main!=='203ea04ccde4840f057a7472da087300fe99ca65') throw Error('main freeze SHA drift');
if(l.verified_repository_truth.asc3nd_database_contract_main!==h.database_contract.main_sha) throw Error('database handoff drift');
if(l.verified_repository_truth.asc3nd_public_frontend_observed_main!==h.public_frontend.main_sha) throw Error('frontend observed SHA drift');
for(const [k,v] of Object.entries(l.production_claims)) if(v!==false) throw Error(`unverified production claim became true: ${k}`);
for(const k of ['unlazy','ponytail','humanizer','ralphy','gauntlet','claude-seo','emilkowalski-skills']) if(!l.quality_stack[k]) throw Error(`quality skill missing: ${k}`);
if(f.tenant_truth_owner!=='ICM'||f.domains.grants.engine!=='executiveusa/grant-agent') throw Error('federation truth drift');
if(a.branch_law.direct_main!==false||a.proof.builder_cannot_final_approve!==true) throw Error('execution governance drift');
if(r.proof_questions.length<6) throw Error('cold-agent gauntlet incomplete');
if(!l.human_only_gates.includes('final merge of this release packet')||!l.rollback.public_frontend) throw Error('human gate or rollback missing');
console.log('ASC3ND_BACKEND_RELEASE_PACKET_OK');
