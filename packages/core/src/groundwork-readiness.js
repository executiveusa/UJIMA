import { buildReadiness } from './readiness.js';

const PROFILE_FIELDS = Object.freeze([
  'orgName',
  'legalStatus',
  'region',
  'mission',
  'programs',
  'audience',
  'priorities',
  'founderName'
]);

function cleanValue(value) {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

export function sanitizeGroundworkProfile(profile = {}) {
  return Object.fromEntries(PROFILE_FIELDS.map((field) => [field, cleanValue(profile[field])]));
}

export function buildGroundworkReadinessEvidence({
  tenantId,
  missionId,
  profile = {},
  collectedAt = new Date().toISOString()
} = {}) {
  if (!tenantId) throw new Error('tenantId is required');
  if (!missionId) throw new Error('missionId is required');

  const snapshot = sanitizeGroundworkProfile(profile);
  const readiness = buildReadiness(snapshot).map((area) => ({
    id: area.id,
    title: area.title,
    plainTitle: area.plainTitle,
    score: area.score,
    status: area.status,
    missingFields: area.missingFields,
    tasks: area.tasks,
    opportunityIds: area.opportunityIds
  }));
  const missingProof = [...new Set(readiness.flatMap((area) => area.missingFields || []))];

  return {
    schemaVersion: '1.0.0',
    stage: 'readiness',
    tenantId,
    missionId,
    collectedAt,
    source: {
      type: 'tenant_profile_repository',
      evidenceClass: 'profile_assertion',
      independentlyVerified: false
    },
    profilePresent: PROFILE_FIELDS.some((field) => Boolean(snapshot[field])),
    profileSnapshot: snapshot,
    readiness,
    summary: {
      areas: readiness.length,
      ready: readiness.filter((area) => area.status === 'ready').length,
      needsProof: readiness.filter((area) => area.status === 'needs-proof').length,
      notReady: readiness.filter((area) => area.status === 'not-ready').length,
      missingProof
    },
    limitations: [
      'This artifact scores completeness of the tenant profile. It does not independently verify the truth of profile claims.',
      'A populated legalStatus field is not proof of tax-exempt status, fiscal sponsorship, registration, eligibility, or compliance.',
      'Funding opportunities and eligibility must be verified against current primary sources before any claim or submission.',
      'Legal, fundraising, safeguarding, privacy, financial, and external actions remain human-gated.'
    ]
  };
}
