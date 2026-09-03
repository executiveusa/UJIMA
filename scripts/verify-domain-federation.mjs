import fs from 'node:fs';
const c=JSON.parse(fs.readFileSync('control-plane/domain-federation.json','utf8'));
if(c.law!=='one-boss-per-truth'||c.tenant_truth_owner!=='ICM') throw Error('truth ownership violation');
if(c.domains.grants.engine!=='executiveusa/grant-agent'||c.domains.grants.merged_pr!==6||!c.domains.grants.merge_sha) throw Error('grant federation proof missing');
for(const x of ['organization truth','consent','relationship truth','cross-domain approvals']) if(!c.domains.grants.may_not_own.includes(x)) throw Error(`grant boundary missing: ${x}`);
if(c.domains.approvals.builder_cannot_final_approve!==true) throw Error('approval independence missing');
if(c.consequential_actions_require_human_approval!==true||c.consequential_actions.length<8) throw Error('human approval boundary missing');
if(c.executor_limits.ralphy!=='engineering-only'||!c.executor_limits.openhands.startsWith('optional-bounded')) throw Error('executor authority too broad');
console.log('SOCIAL_PURPOSE_DOMAIN_FEDERATION_OK');
