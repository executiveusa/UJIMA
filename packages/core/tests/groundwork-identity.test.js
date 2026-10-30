import { describe, expect, it } from 'vitest';
import {
  normalizeEin,
  formatEin,
  compareGroundworkOrganizationNames,
  parseProPublicaIdentityResponse,
  lookupGroundworkIdentityByEin
} from '../src/groundwork-identity.js';

const sample = {
  organization: {
    ein: 142007220,
    name: 'Pro Publica Inc',
    city: 'New York',
    state: 'NY',
    ntee_code: 'A20',
    subseccd: 3
  },
  filings_with_data: [
    { tax_prd_yr: 2025, totrevenue: 1000000, totfuncexpns: 900000, pdf_url: 'https://example.test/990.pdf' }
  ]
};

describe('Groundwork identity evidence', () => {
  it('normalizes and formats EIN values without accepting other identifiers', () => {
    expect(normalizeEin('14-2007220')).toBe('142007220');
    expect(formatEin('142007220')).toBe('14-2007220');
    expect(formatEin('123')).toBe('');
  });

  it('compares legal/brand names loosely but never upgrades the comparison into identity proof', () => {
    expect(compareGroundworkOrganizationNames('Pro Publica', 'Pro Publica Inc')).toBe('match');
    expect(compareGroundworkOrganizationNames('New World Kids', 'New World Kids Foundation')).toBe('match');
    expect(compareGroundworkOrganizationNames('Alpha Youth', 'Beta Arts')).toBe('mismatch');
  });

  it('parses an exact EIN record into record-derived evidence with explicit limitations', () => {
    const evidence = parseProPublicaIdentityResponse(sample, {
      claimedName: 'Pro Publica',
      retrievedAt: '2026-10-30T00:00:00.000Z'
    });

    expect(evidence.stage).toBe('identity');
    expect(evidence.completionEligible).toBe(true);
    expect(evidence.record).toMatchObject({
      ein: '14-2007220',
      name: 'Pro Publica Inc',
      city: 'New York',
      state: 'NY',
      subsection: 3
    });
    expect(evidence.reconciliation.nameMatch).toBe('match');
    expect(evidence.source.evidenceClass).toBe('record_derived_fact');
    expect(evidence.source.independentlyVerified).toBe(false);
    expect(evidence.limitations.join(' ')).toMatch(/does not by itself prove current good standing/i);
  });

  it('marks an exact EIN record with an incompatible claimed name as human-review only', () => {
    const evidence = parseProPublicaIdentityResponse(sample, {
      claimedName: 'Completely Different Organization',
      retrievedAt: '2026-10-30T00:00:00.000Z'
    });

    expect(evidence.reconciliation.nameMatch).toBe('mismatch');
    expect(evidence.completionEligible).toBe(false);
    expect(evidence.completionReason).toMatch(/requires human review/i);
  });

  it('uses only the fixed ProPublica organization endpoint and returns null on 404', async () => {
    let calledUrl = '';
    const missing = await lookupGroundworkIdentityByEin({
      ein: '14-2007220',
      claimedName: 'Pro Publica',
      fetchFn: async (url) => {
        calledUrl = String(url);
        return { status: 404, ok: false, json: async () => ({}) };
      }
    });
    expect(missing).toBeNull();
    expect(calledUrl).toBe('https://projects.propublica.org/nonprofits/api/v2/organizations/142007220.json');
  });

  it('rejects malformed EIN input before making a network request', async () => {
    let called = false;
    await expect(lookupGroundworkIdentityByEin({
      ein: '123',
      fetchFn: async () => {
        called = true;
        return { status: 200, ok: true, json: async () => sample };
      }
    })).rejects.toThrow('GROUNDWORK_EIN_INVALID');
    expect(called).toBe(false);
  });
});
