import { describe, expect, it } from 'vitest';
import { buildGroundworkReadinessEvidence, sanitizeGroundworkProfile } from '../src/groundwork-readiness.js';

describe('Groundwork readiness evidence', () => {
  it('allowlists organization profile fields and drops unrelated or secret values', () => {
    const clean = sanitizeGroundworkProfile({
      orgName: 'Example Youth Org',
      legalStatus: '501(c)(3) claimed',
      region: 'Washington',
      mission: 'Support youth through mentorship.',
      programs: ['Mentorship', 'Sports'],
      audience: 'Youth and families',
      priorities: 'Funding and volunteers',
      founderName: 'Founder',
      apiKey: 'secret-value',
      password: 'do-not-copy',
      nested: { token: 'hidden' }
    });

    expect(clean).toEqual({
      orgName: 'Example Youth Org',
      legalStatus: '501(c)(3) claimed',
      region: 'Washington',
      mission: 'Support youth through mentorship.',
      programs: ['Mentorship', 'Sports'],
      audience: 'Youth and families',
      priorities: 'Funding and volunteers',
      founderName: 'Founder'
    });
    expect(JSON.stringify(clean)).not.toMatch(/secret-value|do-not-copy|hidden/);
  });

  it('labels tenant profile data as self-reported and never as independently verified eligibility', () => {
    const evidence = buildGroundworkReadinessEvidence({
      tenantId: 'example-org',
      missionId: 'msn_example',
      profile: {
        orgName: 'Example Youth Organization',
        legalStatus: '501(c)(3)',
        region: 'Washington State',
        mission: 'Support youth through mentoring and sports.',
        programs: 'Mentoring, sports, leadership.',
        audience: 'Youth, families, volunteers.',
        priorities: 'Funding, volunteers, partnerships.',
        founderName: 'Example Founder'
      },
      collectedAt: '2026-10-30T00:00:00.000Z'
    });

    expect(evidence.stage).toBe('readiness');
    expect(evidence.source).toEqual({
      type: 'tenant_profile_repository',
      evidenceClass: 'profile_assertion',
      independentlyVerified: false
    });
    expect(evidence.readiness.length).toBeGreaterThan(3);
    expect(evidence.limitations.join(' ')).toMatch(/does not independently verify/i);
    expect(evidence.limitations.join(' ')).toMatch(/not proof of tax-exempt status/i);
    expect(evidence.limitations.join(' ')).toMatch(/primary sources/i);
  });

  it('returns missing-proof signals rather than inventing defaults when no canonical profile exists', () => {
    const evidence = buildGroundworkReadinessEvidence({
      tenantId: 'empty-org',
      missionId: 'msn_empty',
      profile: {}
    });

    expect(evidence.profilePresent).toBe(false);
    expect(evidence.summary.ready).toBe(0);
    expect(evidence.summary.notReady).toBeGreaterThan(0);
    expect(evidence.summary.missingProof).toEqual(expect.arrayContaining(['legalStatus', 'orgName', 'region']));
  });
});
