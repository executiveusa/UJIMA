import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
function fail(m){console.error(`BACKEND_LOOP_FAIL: ${m}`);process.exit(1)}
function req(r){const a=path.join(root,r);if(!fs.existsSync(a))fail(`missing required file: ${r}`);return a}
function json(r){return JSON.parse(fs.readFileSync(req(r),'utf8'))}
const manifest=json('control-plane/backend-execution-loop.json');
if(manifest.decision!=='backend_first_public_frontend_frozen'||manifest.public_frontend?.state!=='frozen')fail('frontend freeze missing');
for(const s of ['unlazy','ponytail','humanizer','ralphy','gauntlet_loop','claude_seo','emilkowalski_skills'])if(!manifest.quality_stack?.[s])fail(`missing skill ${s}`);
if(manifest.slices?.length!==10)fail('ten slices required');
if(!fs.readFileSync(req('docs/BACKEND_EXECUTION_LOOP.md'),'utf8').includes('public ASC3ND brand site is frozen'))fail('freeze doc missing');
const stages=fs.readdirSync(path.join(root,'icm/tenants/asc3nd'),{withFileTypes:true}).filter(d=>d.isDirectory()&&/^\d\d-/.test(d.name));
for(const stage of stages){const base=`icm/tenants/asc3nd/${stage.name}`;for(const f of ['INPUT.md','INSTRUCTIONS.md','OUTPUTS.md','STATUS.json'])req(`${base}/${f}`);const st=json(`${base}/STATUS.json`);if(st.public_frontend_touched!==false)fail(`${stage.name} touched public frontend`);if(!['MERGE_READY','MERGED'].includes(st.state))fail(`${stage.name} invalid state ${st.state}`)}
const inv=json('control-plane/asc3nd-system-inventory.json');if(inv.public_frontend_freeze!==true)fail('inventory freeze missing');
const org=json('icm/tenants/asc3nd/02-canonical-icm/organization.json');if(org.tenant_id!=='asc3nd'||org.truth_rules?.no_biometric_identity!==true)fail('canonical brain invalid');
const dm=json('icm/tenants/asc3nd/03-portable-data-model/domain-manifest.json');
const domains=['people','relationships','consents','participation','grants','content','followups','evidence','metrics','approvals','audit'];
for(const d of domains)if(!dm.domains?.includes(d))fail(`portable domain missing: ${d}`);
const schema=json('schemas/asc3nd/portable-record.schema.json');if(schema.properties?.tenant_id?.const!=='asc3nd')fail('portable schema tenant mismatch');
console.log('BACKEND_LOOP_OK');
