import fs from 'node:fs';

const mustExist = [
  'docs/CLIENT-CHAT-ARCHITECTURE.md',
  'control-plane/contracts/client-chat-session.schema.json',
  'control-plane/contracts/chat-mission-handoff.schema.json',
  'icm/client-chat-loop/01-popebot-contracts/CHECKPOINT.md'
];

for (const path of mustExist) {
  if (!fs.existsSync(path)) throw new Error(`MISSING:${path}`);
}

const session = JSON.parse(fs.readFileSync('control-plane/contracts/client-chat-session.schema.json', 'utf8'));
const handoff = JSON.parse(fs.readFileSync('control-plane/contracts/chat-mission-handoff.schema.json', 'utf8'));
const architecture = fs.readFileSync('docs/CLIENT-CHAT-ARCHITECTURE.md', 'utf8');

for (const schema of [session, handoff]) {
  if (schema.$schema !== 'https://json-schema.org/draft/2020-12/schema') throw new Error('SCHEMA_DRAFT_MISMATCH');
  if (schema.type !== 'object' || schema.additionalProperties !== false) throw new Error('SCHEMA_NOT_FAIL_CLOSED');
}

const requiredArchitectureTokens = [
  '33f032ddedee93ee139fba0464d5a765dc10e99f',
  '/app',
  '/ops/*',
  'frozen',
  'ICM',
  'Working',
  'Needs you',
  'Ready',
  'Failed',
  'Delivered'
];
for (const token of requiredArchitectureTokens) {
  if (!architecture.includes(token)) throw new Error(`ARCHITECTURE_MISSING:${token}`);
}

const missionRequired = new Set(handoff.required || []);
for (const key of ['tenant_id','conversation_id','objective','domain','risk_tier','acceptance_gates','evidence_requirements','approval','status']) {
  if (!missionRequired.has(key)) throw new Error(`HANDOFF_REQUIRED_MISSING:${key}`);
}

const sessionRequired = new Set(session.required || []);
for (const key of ['tenant_id','user_id','conversation_id','status','messages','mission_refs','artifact_refs','approval_refs']) {
  if (!sessionRequired.has(key)) throw new Error(`SESSION_REQUIRED_MISSING:${key}`);
}

console.log('CLIENT_CHAT_SLICE_01_OK');
