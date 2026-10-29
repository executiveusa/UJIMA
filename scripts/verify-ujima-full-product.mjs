import fs from 'node:fs';

function read(file) {
  if (!fs.existsSync(file)) throw new Error('WALK_MISSING:' + file);
  return fs.readFileSync(file, 'utf8');
}
function requireText(content, token, code) {
  if (!content.includes(token)) throw new Error(code + ':' + token);
}
function forbidText(content, token, code) {
  if (content.includes(token)) throw new Error(code + ':' + token);
}

const landing = read('apps/site/app/page.jsx');
for (const token of ['Run a Groundwork scan','See how UJIMA works','I found four issues','WE HANDLE IT']) {
  requireText(landing, token, 'WALK_LANDING');
}

const login = read('apps/site/app/login/page.jsx');
for (const token of ['signInWithPassword','signUpWithPassword','sendMagicLink','signInWithGoogle','sendPasswordRecovery','exchangeSupabaseSession']) {
  requireText(login, token, 'WALK_AUTH_ENTRY');
}

const callback = read('apps/site/app/auth/callback/page.jsx');
requireText(callback, 'exchangeSupabaseSession', 'WALK_AUTH_CALLBACK');
requireText(callback, 'updatePassword', 'WALK_AUTH_RECOVERY');

const onboarding = read('apps/site/app/onboarding/page.jsx');
for (const token of ['Organization name','Website','onboardSupabaseSession','/app?start=groundwork']) {
  requireText(onboarding, token, 'WALK_ONBOARDING');
}

const chat = read('apps/site/components/ClientChatShell.jsx');
for (const token of ['/context','Run Groundwork on our organization.','workspace.name','MissionEvidencePanel']) {
  requireText(chat, token, 'WALK_CHAT');
}
forbidText(chat, 'const ACTIVE_CLIENT', 'WALK_CHAT_HARDCODED_TENANT');
forbidText(chat, 'ASC3ND client workspace', 'WALK_CHAT_HARDCODED_TENANT');

const authBridge = read('services/mission-api/src/supabase-session-exchange.js');
for (const token of ['/auth/v1/user','memberships?tenant_id','SUPABASE_SERVICE_ROLE_KEY','UJIMA_TENANT_NOT_ACTIVE']) {
  requireText(authBridge, token, 'WALK_SUPABASE_BRIDGE');
}

const server = read('services/mission-api/server.js');
for (const token of ['/api/auth/supabase-exchange','/api/auth/supabase-onboard','profilePath(identity.tenantId)']) {
  requireText(server, token, 'WALK_MISSION_AUTH');
}

const router = read('services/mission-api/src/agent/firstmate-mission-router.js');
requireText(router, "domain: 'groundwork'", 'WALK_GROUNDWORK_ROUTE');

const executor = read('services/mission-api/src/agent/groundwork-executor.js');
for (const token of ['assertPublicUrl','GROUNDWORK_PRIVATE_IP_FORBIDDEN','registerArtifact','proofRefs:[',"to:'ready'"]) {
  requireText(executor, token, 'WALK_GROUNDWORK_EXECUTOR');
}

const chatRouter = read('services/mission-api/src/agent/client-chat-router.js');
for (const token of ['executeGroundworkAssessment','summarizeGroundworkAssessment',"/context"]) {
  requireText(chatRouter, token, 'WALK_GROUNDWORK_CHAT');
}

const skill = read('.agents/skills/groundwork/SKILL.md');
for (const token of ['LEGAL / PUBLIC IDENTITY','DIGITAL OWNERSHIP','GOOGLE + DISCOVERY','FUNDING READINESS','VERIFY','MONITOR']) {
  requireText(skill, token, 'WALK_GROUNDWORK_SKILL');
}

const icm = read('icm/workflows/groundwork/README.md');
for (const token of ['Which tenant is this?','Which Groundwork run is this?','Which stage is current?','What authority does the agent have?','What is the single next valid action?']) {
  requireText(icm, token, 'WALK_ICM_COLD_AGENT');
}

const migration = read('db/supabase/0001_ujima_canonical.sql');
forbidText(migration, 'end $;', 'WALK_SUPABASE_SQL_SYNTAX');
for (const token of ['executive_director','program_director','volunteer_manager','finance','ujima_conversations','enable row level security']) {
  requireText(migration, token, 'WALK_SUPABASE_SCHEMA');
}

const pluginManifest = JSON.parse(read('plugins/ujima/plugin.json'));
if (pluginManifest.name !== 'ujima') throw new Error('WALK_PLUGIN_NAME');
const pluginServer = read('plugins/ujima/server.mjs');
for (const token of ['ujima.context','ujima.run_groundwork','ujima.approve','humanConfirmed','ujima.export_conversation']) {
  requireText(pluginServer, token, 'WALK_PLUGIN_TOOLS');
}

const clientTree = [
  'apps/site/lib/supabase.js',
  'apps/site/lib/api.js',
  'apps/site/app/login/page.jsx',
  'apps/site/app/auth/callback/page.jsx',
  'apps/site/app/onboarding/page.jsx',
  'apps/site/components/ClientChatShell.jsx'
].map(read).join('\n');
forbidText(clientTree, 'SUPABASE_SERVICE_ROLE_KEY', 'WALK_SERVICE_ROLE_LEAK');

console.log('UJIMA_FULL_PRODUCT_STATIC_WALK_OK');
