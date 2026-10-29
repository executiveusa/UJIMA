import fs from 'node:fs';

const files = [
  'apps/site/components/ClientChatShell.jsx',
  'apps/site/components/ClientChatShell.module.css',
  'apps/site/app/app/page.jsx',
  'apps/site/app/app/chat/[conversationId]/page.jsx',
  'apps/site/app/login/page.jsx',
  'apps/site/app/onboarding/page.jsx',
  'apps/site/lib/api.js',
  'icm/client-chat-loop/02-chat-shell/CHECKPOINT.md'
];
for (const file of files) if (!fs.existsSync(file)) throw new Error(`MISSING:${file}`);

const shell = fs.readFileSync('apps/site/components/ClientChatShell.jsx','utf8');
const login = fs.readFileSync('apps/site/app/login/page.jsx','utf8');
const onboarding = fs.readFileSync('apps/site/app/onboarding/page.jsx','utf8');
const api = fs.readFileSync('apps/site/lib/api.js','utf8');

for (const token of ['How can I help today?','+ New chat','Ujima operations','Switch workspace','Run Groundwork']) {
  if (!shell.includes(token)) throw new Error(`SHELL_MISSING:${token}`);
}

if (!login.includes('exchangeSupabaseSession')) throw new Error('LOGIN_NOT_SUPABASE_EXCHANGE_FIRST');
if (!login.includes("'/onboarding'") || !login.includes("'/app'")) throw new Error('LOGIN_MISSING_TENANT_AWARE_DESTINATIONS');
if (!onboarding.includes('onboardSupabaseSession') || !onboarding.includes('Organization name')) throw new Error('MINIMAL_ONBOARDING_MISSING');
if (!api.includes('/api/auth/supabase-exchange') || !api.includes('/api/auth/supabase-onboard')) throw new Error('AUTH_BRIDGE_MISSING');
if (!shell.includes(`${CHAT_API}/context`) || shell.includes('const ACTIVE_CLIENT')) throw new Error('CHAT_NOT_TENANT_NEUTRAL');
if (shell.includes('MCP') || shell.includes('Supabase') || shell.includes('Docker')) throw new Error('TECHNICAL_TERMS_LEAKED');

// The client workspace must preserve visible truthful persistence or mission state.
const hasTruthfulState = ['Saved', 'Saving', 'Offline', 'Working', 'Needs your approval', 'Ready', 'Blocked', 'Delivered']
  .some((token) => shell.includes(token));
if (!hasTruthfulState) throw new Error('TRUTHFUL_STATE_SIGNAL_MISSING');

console.log('CLIENT_CHAT_SLICE_02_OK');
