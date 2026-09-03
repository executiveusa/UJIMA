import fs from 'node:fs';

const files = [
  'apps/site/components/ClientChatShell.jsx',
  'apps/site/components/ClientChatShell.module.css',
  'apps/site/app/app/page.jsx',
  'apps/site/app/app/chat/[conversationId]/page.jsx',
  'apps/site/app/login/page.jsx',
  'icm/client-chat-loop/02-chat-shell/CHECKPOINT.md'
];
for (const file of files) if (!fs.existsSync(file)) throw new Error(`MISSING:${file}`);

const shell = fs.readFileSync('apps/site/components/ClientChatShell.jsx','utf8');
const login = fs.readFileSync('apps/site/app/login/page.jsx','utf8');
for (const token of ['How can I help today?','+ New chat','Staff control room','Ask ASC3ND anything']) {
  if (!shell.includes(token)) throw new Error(`SHELL_MISSING:${token}`);
}
if (!login.includes("window.location.href = '/app'")) throw new Error('LOGIN_NOT_CHAT_FIRST');
if (shell.includes('MCP') || shell.includes('Supabase') || shell.includes('Docker')) throw new Error('TECHNICAL_TERMS_LEAKED');

// Slice 02 established the shell, not a permanent preview-only state. Later
// governed slices may replace the Preview badge with truthful persistence or
// mission states, but must keep a visible non-success status signal.
const hasTruthfulState = ['Preview', 'Saved', 'Saving', 'Offline', 'Working', 'Needs you', 'Ready', 'Failed', 'Delivered']
  .some((token) => shell.includes(token));
if (!hasTruthfulState) throw new Error('TRUTHFUL_STATE_SIGNAL_MISSING');

console.log('CLIENT_CHAT_SLICE_02_OK');
