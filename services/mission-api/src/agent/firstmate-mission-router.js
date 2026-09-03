import crypto from 'node:crypto';
import { emitEvent, readEvents } from '@asc3nd/core/events';

export const CLIENT_MISSION_EVENT = 'client_mission';

const ALWAYS_DENIED = [
  'external_email','external_message','public_publishing','grant_submission','portal_acceptance','money_movement','legal_attestation','production_deploy','dns_change','production_database_migration','production_mutation','destructive_deletion','cross_tenant_access','unrestricted_execution'
];

const ROUTES = [
  { domain: 'grants', pattern: /\b(grant|grants|funding|funder|funders|foundation|foundations|rfp|proposal)\b/i, capabilities: ['context_read','grant_discovery','grant_eligibility','grant_fit','grant_draft_prepare'], gate: 'Grant recommendations require source provenance and eligibility checks before they can be marked ready.', label: 'funding' },
  { domain: 'content', pattern: /\b(content|post|posts|reel|reels|caption|captions|social|campaign|calendar|story|stories)\b/i, capabilities: ['context_read','content_plan','content_draft_prepare'], gate: 'Public-facing facts and claims must remain tied to approved organizational context before publishing.', label: 'content' },
  { domain: 'crm', pattern: /\b(follow[- ]?up|contact|contacts|family|families|mentor|mentors|volunteer|volunteers|sponsor|sponsors|partner|partners|donor|donors|relationship|relationships)\b/i, capabilities: ['context_read','crm_followup_analysis','crm_draft_prepare'], gate: 'Consent and relationship context must be checked before any future outreach can be approved.', label: 'follow-up' },
  { domain: 'seo', pattern: /\b(seo|search|google|schema|visibility|ranking|rankings|discoverability)\b/i, capabilities: ['context_read','seo_audit','seo_recommend'], gate: 'Visibility recommendations must distinguish observed evidence from proposed changes.', label: 'search visibility' },
  { domain: 'analytics', pattern: /\b(analytics|metric|metrics|results|performance|conversion|conversions|report|reporting|outcome|outcomes)\b/i, capabilities: ['context_read','analytics_read','analytics_summarize'], gate: 'Results must be reported from available evidence without inventing missing measurements.', label: 'results' },
  { domain: 'engineering', pattern: /\b(website|web site|app|application|code|bug|bugs|technical|engineering|api|integration)\b/i, capabilities: ['context_read','engineering_inspect','engineering_plan'], gate: 'Engineering work remains inspect/plan only until a separately governed implementation mission is authorized.', label: 'technical planning' }
];

const CONSEQUENTIAL_PATTERNS = [
  /\b(submit|publish|schedule|deploy|pay|purchase|charge|transfer|refund|delete|destroy|purge|erase|attest|upload|launch|approve|authorize|invite|distribute|archive|disconnect)\b/i,
  /\b(dm|direct message)\b/i,
  /\bsend\s+(?!me\b)/i,
  /\b(contact|reach[ -]?out|notify|invite)\b[^.]{0,120}\b(donor|donors|partner|partners|sponsor|sponsors|mentor|mentors|volunteer|volunteers|family|families|contact|contacts|them|everyone|people|him|her)\b/i,
  /\b(email|message|text|call)\b[^.]{0,120}\b(donor|donors|partner|partners|sponsor|sponsors|mentor|mentors|volunteer|volunteers|family|families|contact|contacts|them|everyone|people|him|her)\b/i,
  /\bpost\b[^.]{0,80}\b(now|today|live|public|facebook|instagram|linkedin|youtube|tiktok|social|website|site|this|it|that)\b/i,
  /\b(sign|accept|file)\b[^.]{0,100}\b(agreement|terms|legal|form|filing|application|proposal)\b/i,
  /\b(share|connect|remove)\b[^.]{0,100}\b(public|live|account|integration|donor|partner|sponsor|mentor|volunteer|family|contact|everyone|people|youtube|instagram|facebook|linkedin|tiktok|portal)\b/i,
  /\b(dns|domain)\b[^.]{0,80}\b(change|update|point|switch|move)\b/i,
  /\b(migrate|migration)\b[^.]{0,80}\b(database|production|data)\b/i
];

const SAFE_INTERNAL_PREFIX = /^(review|analyze|analyse|summarize|summarise|plan|prepare|draft|find|check|audit|research|compare|inspect|report|explain|list|show|identify|recommend|outline|score|qualify|evaluate)\b/i;
const EXTERNAL_CONTEXT = /\b(public|live|youtube|instagram|facebook|linkedin|tiktok|x|twitter|portal|donor|donors|partner|partners|sponsor|sponsors|mentor|mentors|volunteer|volunteers|family|families|contact|contacts|everyone|people|email|message|dm|domain|dns|production|payment|bank|grant portal)\b/i;
// A safe-looking verb must never turn an explicit public destination into an
// internal-only request. These phrases represent disclosure/publishing intent.
const PUBLIC_DESTINATION = /\b(show|list|display|put|add|feature|place)\b[^.]{0,160}(\bpublicly\b|\b(on|to|onto)\s+(our\s+)?(facebook|instagram|linkedin|youtube|tiktok|x|twitter|website|site|portal)\b|\b(public|live)\s+(website|site|page|portal)\b)/i;

function id(prefix) { return `${prefix}_${crypto.randomBytes(10).toString('hex')}`; }
function normalizeObjective(text) {
  const objective = String(text || '').trim();
  if (!objective) throw new Error('OBJECTIVE_REQUIRED');
  if (objective.length > 2000) throw new Error('OBJECTIVE_TOO_LONG');
  return objective;
}

export function classifyClientIntent(text) {
  const objective = normalizeObjective(text);
  return ROUTES.find((route) => route.pattern.test(objective)) || { domain: 'general', capabilities: ['context_read','planning_prepare'], gate: 'The next step must stay bounded to internal planning until a specific governed domain route is selected.', label: 'planning' };
}

export function classifyRequestedRisk(text) {
  const objective = normalizeObjective(text);
  if (CONSEQUENTIAL_PATTERNS.some((pattern) => pattern.test(objective))) return 3;
  if (PUBLIC_DESTINATION.test(objective)) return 3;
  if (EXTERNAL_CONTEXT.test(objective) && !SAFE_INTERNAL_PREFIX.test(objective)) return 3;
  return 1;
}

function approvalForRisk(riskTier) {
  return riskTier === 3
    ? { required: true, class: 'red', approval_id: null, approved_by: null, approved_at: null }
    : { required: false, class: 'green', approval_id: null, approved_by: null, approved_at: null };
}

function existingMissionForMessage({ tenantId, userId, conversationId, messageId, read = readEvents }) {
  const events = read({ tenantId, type: CLIENT_MISSION_EVENT }) || [];
  for (const event of events) {
    if (event.type && event.type !== CLIENT_MISSION_EVENT) continue;
    const mission = event.payload?.handoff;
    if (!mission) continue;
    if (mission.tenant_id !== tenantId || mission.user_id !== userId || mission.conversation_id !== conversationId || mission.originating_message_id !== messageId) continue;
    return { mission, eventId: event.id };
  }
  return null;
}

export function routeFirstMateMission({ tenantId, userId, conversationId, sourceMessage, read = readEvents, append = emitEvent }) {
  if (!tenantId) throw new Error('TENANT_REQUIRED');
  if (!userId) throw new Error('USER_REQUIRED');
  if (!conversationId) throw new Error('CONVERSATION_REQUIRED');
  if (!sourceMessage?.messageId) throw new Error('ORIGINATING_MESSAGE_REQUIRED');
  if (!sourceMessage?.eventId) throw new Error('ORIGINATING_MESSAGE_EVIDENCE_REQUIRED');
  if (sourceMessage.role !== 'user') throw new Error('ORIGINATING_MESSAGE_MUST_BE_USER');

  const objective = normalizeObjective(sourceMessage.text);
  const previous = existingMissionForMessage({ tenantId, userId, conversationId, messageId: sourceMessage.messageId, read });
  if (previous) return { ...previous, reused: true, route: classifyClientIntent(objective) };

  const route = classifyClientIntent(objective);
  const riskTier = classifyRequestedRisk(objective);
  const missionId = id('msn');
  const handoff = {
    version: '1.0.0', mission_id: missionId, tenant_id: tenantId, user_id: userId, conversation_id: conversationId,
    originating_message_id: sourceMessage.messageId, objective, domain: route.domain, risk_tier: riskTier,
    allowed_capabilities: [...route.capabilities], denied_capabilities: [...ALWAYS_DENIED],
    acceptance_gates: ['Use only approved tenant-scoped ICM context and source evidence.', route.gate, 'No external or consequential action may execute in Slice 04.'],
    evidence_requirements: [`event:${sourceMessage.eventId}`, `icm/tenants/${tenantId}`, 'client_mission routing event receipt'],
    approval: approvalForRisk(riskTier), status: riskTier === 3 ? 'needs_you' : 'working', created_at: new Date().toISOString(),
    rollback_note: 'Slice 04 creates an internal route only; no consequential external action is executed.',
    icm_context_refs: [`icm/tenants/${tenantId}`], artifact_refs: []
  };

  const event = append({ tenantId, type: CLIENT_MISSION_EVENT, version: '1', actor: 'firstmate', subject: missionId,
    payload: { handoff, source_message_event_ref: `event:${sourceMessage.eventId}`, execution_mode: 'route-only', execution_state: 'routed' } });
  return { mission: handoff, eventId: event.id, reused: false, route };
}

export function missionAcknowledgement({ mission, route }) {
  if (!mission || !route) throw new Error('MISSION_ROUTE_REQUIRED');
  if (mission.status === 'needs_you') return `Needs you — I can prepare the ${route.label} work, but the final action you asked for requires approval. Nothing has been sent, submitted, published, paid, deployed, migrated, deleted, or changed externally.`;
  return `Working — your request is saved and routed into ${route.label}. Execution has not started yet; nothing has been sent, submitted, published, or changed externally.`;
}
