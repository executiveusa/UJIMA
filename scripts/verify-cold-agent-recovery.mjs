import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const m=read('recovery/cold-agent-manifest.json');
for(const p of m.required_read_order) if(!fs.existsSync(p)) throw Error(`cold-agent required file missing: ${p}`);
const f=read('control-plane/domain-federation.json');
const a=read('control-plane/automation-fabric.json');
const answers={
  'truth-owner':f.tenant_truth_owner,
  'grant-engine':f.domains.grants.engine,
  'database-owner':'executiveusa/asc3nd-supabase-landing',
  'frontend-mutation-during-loop':false,
  'builder-final-approval':a.proof.builder_cannot_final_approve===false?true:false,
  'tier3-human-approval':a.risk.tier3==='consequential explicit human approval'
};
// builder-final-approval asks whether a builder may final approve; contract must resolve to false.
answers['builder-final-approval']=a.proof.builder_cannot_final_approve===true?false:true;
for(const q of m.proof_questions) if(answers[q.id]!==q.answer) throw Error(`cold-agent proof mismatch: ${q.id}`);
const db=m.external_authorities.find(x=>x.repo==='executiveusa/asc3nd-supabase-landing');
const grant=m.external_authorities.find(x=>x.repo==='executiveusa/grant-agent');
if(!db?.required_main_sha||!grant?.required_merge_sha||grant.required_merged_pr!==6) throw Error('external recovery proof missing');
if(!m.must_recover.includes('no direct main')||!m.must_recover.includes('rollback required')) throw Error('recovery laws incomplete');
console.log('SOCIAL_PURPOSE_COLD_AGENT_RECOVERY_OK');
