import fs from 'node:fs';

const files = [
  'apps/site/components/ClientChatShell.jsx',
  'apps/site/components/ClientChatShell.module.css',
  'apps/site/app/app/page.jsx',
  'apps/site/app/app/chat/[conversationId]/page.jsx',
  'apps/site/app/login/page.jsx',
  'apps/site/app/workspaces/page.jsx',
  'apps/site/lib/ujima.js',
  'icm/client-chat-loop/02-chat-shell/CHECKPOINT.md'
];
for (const file of files) if (!fs.existsSync(file)) throw new Error(`MISSING:${file}`);

const shell = fs.readFileSync('apps/site/components/ClientChatShell.jsx','utf8');
const login = fs.readFileSync('apps/site/app/login/page.jsx','utf8');
const workspaces = fs.readFileSync('apps/site/app/workspaces/page.jsx','utf8');
for (const token of ['How can I help today?','+ New chat','Ujima operations','Switch workspace']) {
  if (!shell.includes(token)) throw new Error(`SHELL_MISSING:${token}`);
}
if (!login.includes("window.location.href = '/workspaces'")) throw new Error('LOGIN_NOT_WORKSPACE_FIRST');
if (!workspaces.includes('Client workspaces') || !workspaces.includes('ASC3ND')) throw new Error('WORKSPACE_SELECTOR_MISSING_CLIENT');
if (shell.includes('MCP') || shell.includes('Supabase') || shell.includes('Docker')) throw new Error('TECHNICAL_TERMS_LEAKED');

// The client workspace must preserve visible truthful persistence or mission state.
const hasTruthfulState = ['Preview', 'Saved', 'Saving', 'Offline', 'Working', 'Needs you', 'Ready', 'Failed', 'Delivered']
  .some((token) => shell.includes(token));
if (!hasTruthfulState) throw new Error('TRUTHFUL_STATE_SIGNAL_MISSING');

console.log('CLIENT_CHAT_SLICE_02_OK');
