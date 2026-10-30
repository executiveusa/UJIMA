const PROPUBLICA_BASE = 'https://projects.propublica.org/nonprofits/api/v2';

export function normalizeEin(value = '') {
  return String(value).replace(/[^0-9]/g, '');
}

export function formatEin(value = '') {
  const digits = normalizeEin(value);
  if (digits.length !== 9) return '';
  return digits.slice(0, 2) + '-' + digits.slice(2);
}

function cleanString(value) {
  return value === null || value === undefined ? '' : String(value).trim();
}

function nullableNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function compareGroundworkOrganizationNames(claimed = '', record = '') {
  const normalize = (value) => cleanString(value)
    .toLowerCase()
    .replace(/\b(inc|incorporated|the|of|and|foundation|corp|corporation|llc)\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  const a = normalize(claimed);
  const b = normalize(record);
  if (!a || !b) return 'unknown';
  if (a === b) return 'match';
  if (a.includes(b) || b.includes(a)) return 'partial';

  const words = new Set(a.split(' ').filter(Boolean));
  const recordWords = b.split(' ').filter(Boolean);
  const shared = recordWords.filter((word) => words.has(word)).length;
  return shared >= Math.max(1, Math.floor(recordWords.length / 2)) ? 'partial' : 'mismatch';
}

export function parseProPublicaIdentityResponse(json, { claimedName = '', retrievedAt = new Date().toISOString() } = {}) {
  const org = json?.organization;
  if (!org || org.ein === undefined || org.ein === null) throw new Error('PROPUBLICA_IDENTITY_RESPONSE_INVALID');

  const ein = formatEin(String(org.ein).padStart(9, '0'));
  const recordName = cleanString(org.name);
  const filings = Array.isArray(json?.filings_with_data) ? json.filings_with_data : [];
  const nameMatch = compareGroundworkOrganizationNames(claimedName, recordName);
  const completionEligible = nameMatch === 'match' || nameMatch === 'partial';

  return {
    schemaVersion: '1.0.0',
    stage: 'identity',
    completionEligible,
    completionReason: completionEligible
      ? 'Exact EIN lookup returned a public IRS-derived organization record and the claimed organization name is compatible with the record.'
      : 'Exact EIN lookup returned a record, but the claimed organization name is missing or conflicts with the record and requires human review.',
    retrievedAt,
    source: {
      type: 'propublica_nonprofit_explorer_api_v2',
      evidenceClass: 'record_derived_fact',
      independentlyVerified: false,
      upstream: 'IRS Exempt Organizations and Form 990 data',
      sourceUrl: 'https://projects.propublica.org/nonprofits/organizations/' + normalizeEin(ein)
    },
    input: {
      ein,
      claimedName: cleanString(claimedName)
    },
    record: {
      ein,
      name: recordName,
      city: cleanString(org.city),
      state: cleanString(org.state),
      ntee: cleanString(org.ntee_code),
      subsection: nullableNumber(org.subseccd),
      recentFilings: filings.slice(0, 6).map((filing) => ({
        year: nullableNumber(filing?.tax_prd_yr),
        revenue: nullableNumber(filing?.totrevenue),
        expenses: nullableNumber(filing?.totfuncexpns),
        pdf: cleanString(filing?.pdf_url) || null
      }))
    },
    reconciliation: {
      nameMatch
    },
    limitations: [
      'This is a public record-derived fact from ProPublica Nonprofit Explorer using IRS datasets; it is not legal or tax advice.',
      'A returned record does not by itself prove current good standing, charitable solicitation registration, fiscal sponsorship, or eligibility for a specific grant.',
      'Organization name differences are reported for review; the EIN is the lookup key and Groundwork does not auto-resolve legal-name discrepancies.'
    ]
  };
}

export async function lookupGroundworkIdentityByEin({
  ein,
  claimedName = '',
  fetchFn = globalThis.fetch,
  retrievedAt = new Date().toISOString()
} = {}) {
  const normalized = normalizeEin(ein);
  if (normalized.length !== 9) throw new Error('GROUNDWORK_EIN_INVALID');
  if (typeof fetchFn !== 'function') throw new Error('FETCH_UNAVAILABLE');

  const response = await fetchFn(
    PROPUBLICA_BASE + '/organizations/' + normalized + '.json',
    {
      method: 'GET',
      headers: { 'user-agent': 'UJIMA-Groundwork/1.0 public-record-check' },
      signal: AbortSignal.timeout(15000)
    }
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('PROPUBLICA_HTTP_' + response.status);
  return parseProPublicaIdentityResponse(await response.json(), { claimedName, retrievedAt });
}
