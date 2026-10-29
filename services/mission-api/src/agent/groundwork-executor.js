import dns from 'node:dns/promises';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { registerArtifact, getArtifacts } from '@asc3nd/core/artifacts';
import { transitionClientMissionState } from './client-work-state.js';

const MAX_BYTES = 2000000;
const MAX_REDIRECTS = 4;
const getDataDir = () => process.env.DATA_DIR || path.resolve(process.cwd(), 'mission-data');

function normalizeWebsite(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : 'https://' + raw;
  const url = new URL(withScheme);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('GROUNDWORK_WEBSITE_PROTOCOL_UNSAFE');
  if (url.username || url.password) throw new Error('GROUNDWORK_WEBSITE_CREDENTIALS_FORBIDDEN');
  url.hash = '';
  return url;
}

function privateIpv4(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) return false;
  return parts[0] === 10 || parts[0] === 127 ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) || parts[0] === 0;
}

function privateIp(ip) {
  if (net.isIP(ip) === 4) return privateIpv4(ip);
  const value = String(ip || '').toLowerCase();
  return value === '::1' || value === '::' || value.startsWith('fc') || value.startsWith('fd') ||
    value.startsWith('fe8') || value.startsWith('fe9') || value.startsWith('fea') || value.startsWith('feb');
}

export async function assertPublicUrl(url, lookup = dns.lookup) {
  const host = String(url.hostname || '').toLowerCase();
  if (!host || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) {
    throw new Error('GROUNDWORK_PRIVATE_HOST_FORBIDDEN');
  }
  if (net.isIP(host)) {
    if (privateIp(host)) throw new Error('GROUNDWORK_PRIVATE_IP_FORBIDDEN');
    return;
  }
  const rows = await lookup(host, { all: true, verbatim: true });
  if (!Array.isArray(rows) || !rows.length) throw new Error('GROUNDWORK_DNS_UNRESOLVED');
  if (rows.some((row) => privateIp(row.address))) throw new Error('GROUNDWORK_PRIVATE_DNS_TARGET_FORBIDDEN');
}

async function publicFetch(startUrl, options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const lookup = options.lookup || dns.lookup;
  let current = startUrl;
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    await assertPublicUrl(current, lookup);
    const response = await fetchImpl(current, {
      redirect: 'manual',
      headers: {
        'User-Agent': 'UJIMA-Groundwork/1.0 (+public-readiness-audit)',
        Accept: 'text/html,application/xhtml+xml'
      }
    });
    if ([301,302,303,307,308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location) throw new Error('GROUNDWORK_REDIRECT_WITHOUT_LOCATION');
      current = new URL(location, current);
      if (!['http:','https:'].includes(current.protocol)) throw new Error('GROUNDWORK_REDIRECT_PROTOCOL_UNSAFE');
      continue;
    }
    const type = String(response.headers.get('content-type') || '');
    const length = Number(response.headers.get('content-length') || 0);
    if (length > MAX_BYTES) throw new Error('GROUNDWORK_PAGE_TOO_LARGE');
    if (!type.includes('text/html') && !type.includes('application/xhtml+xml')) throw new Error('GROUNDWORK_NOT_HTML');
    const html = await response.text();
    if (Buffer.byteLength(html, 'utf8') > MAX_BYTES) throw new Error('GROUNDWORK_PAGE_TOO_LARGE');
    return { response, html, url: current.toString() };
  }
  throw new Error('GROUNDWORK_TOO_MANY_REDIRECTS');
}

function decode(value) {
  return String(value || '').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;/gi,"'")
    .replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/\s+/g,' ').trim();
}

function firstMatch(html, regex) {
  const match = regex.exec(html);
  return match ? decode(match[1] || '') : '';
}

function metaContent(html, name) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const hasName = new RegExp('(name|property)=[\"\']' + name + '[\"\']', 'i').test(tag);
    if (!hasName) continue;
    const content = /content=[\"']([^\"']*)[\"']/i.exec(tag);
    if (content) return decode(content[1]);
  }
  return '';
}

function links(html, base) {
  const values = [];
  const regex = /<a\b[^>]*href=[\"']([^\"']+)[\"'][^>]*>/gi;
  let match;
  while ((match = regex.exec(html)) && values.length < 500) {
    try {
      const url = new URL(match[1], base);
      if (['http:','https:','mailto:','tel:'].includes(url.protocol)) values.push(url.toString());
    } catch {}
  }
  return [...new Set(values)];
}

function hasPath(urls, words) {
  return urls.some((value) => words.some((word) => value.toLowerCase().includes(word)));
}

function textHas(html, words) {
  const text = html.replace(/<script\b[\s\S]*?<\/script>/gi,' ').replace(/<style\b[\s\S]*?<\/style>/gi,' ')
    .replace(/<[^>]+>/g,' ').toLowerCase();
  return words.some((word) => text.includes(word));
}

function outcome(key, label, status, note) { return { key, label, status, note }; }

function finding(id, title, severity, outcomes, evidenceClass, why, nextAction, evidenceRefs) {
  return { id, title, severity, outcomes, evidenceClass, why, nextAction, evidenceRefs: evidenceRefs || [] };
}

export function analyzeGroundworkPage(input) {
  const html = input.html;
  const url = input.url;
  const status = input.status || 200;
  const fetchedAt = input.fetchedAt || new Date().toISOString();
  const title = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const h1 = firstMatch(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  const description = metaContent(html, 'description');
  const viewport = metaContent(html, 'viewport');
  const canonical = firstMatch(html, /<link[^>]+rel=[\"'][^\"']*canonical[^\"']*[\"'][^>]+href=[\"']([^\"']+)[\"']/i) ||
    firstMatch(html, /<link[^>]+href=[\"']([^\"']+)[\"'][^>]+rel=[\"'][^\"']*canonical[^\"']*[\"']/i);
  const lang = firstMatch(html, /<html[^>]+lang=[\"']([^\"']+)[\"']/i);
  const urls = links(html, url);
  const hasContact = hasPath(urls, ['contact','mailto:','tel:']);
  const hasDonate = hasPath(urls, ['donate','donation','give','giving']);
  const hasVolunteer = hasPath(urls, ['volunteer','mentor','get-involved','get_involved']);
  const hasPrivacy = hasPath(urls, ['privacy']);
  const hasAbout = hasPath(urls, ['about','team','leadership','board','who-we-are']);
  const hasGovernance = hasPath(urls, ['annual-report','annual_report','990','financial','transparency','governance']) ||
    textHas(html,['form 990','annual report','board of directors']);
  const hasOrgSchema = /[\"']@type[\"']\s*:\s*[\"'](?:Organization|NGO|NonprofitOrganization)[\"']/i.test(html);
  const hasAnalytics = /googletagmanager|google-analytics|gtag\(|plausible\.io|umami/i.test(html);

  const evidence = {
    fetchedAt, url, httpStatus: status, title, h1, description, viewport: Boolean(viewport),
    lang: lang || null, canonical: canonical || null, linksObserved: urls.length, contactPath: hasContact,
    donationPath: hasDonate, volunteerPath: hasVolunteer, privacyPath: hasPrivacy, aboutLeadershipPath: hasAbout,
    governanceProofSignal: hasGovernance, organizationSchema: hasOrgSchema, analyticsSignal: hasAnalytics
  };

  const findings = [];
  if (!title) findings.push(finding('web-title','Homepage title is missing','P1',['Trust','Findability'],'OBSERVED_EVIDENCE','Search and browser context lose a basic identity signal.','Add a specific factual page title.',['homepage:title']));
  if (!h1) findings.push(finding('web-h1','Homepage has no clear H1','P1',['Mission & Strategy','Trust'],'OBSERVED_EVIDENCE','A visitor may have to infer what the organization is about.','Add one clear primary heading supported by real organization facts.',['homepage:h1']));
  if (!viewport) findings.push(finding('web-viewport','Mobile viewport metadata is missing','P1',['Action Paths','Operations & Measurement'],'OBSERVED_EVIDENCE','The public experience may render incorrectly on phones.','Add and verify responsive viewport behavior.',['homepage:viewport']));
  if (!hasContact) findings.push(finding('web-contact','No clear public contact path was observed','P1',['Trust','Action Paths'],'OBSERVED_EVIDENCE','Donors, volunteers, partners and families need an obvious way to reach the organization.','Add and test an organization-controlled contact path.',['homepage:links']));
  if (!hasPrivacy) findings.push(finding('web-privacy','No privacy link was observed','P2',['Trust','Operations & Measurement'],'OBSERVED_EVIDENCE','Public forms and analytics need a clear data-use explanation appropriate to the organization.','Review data collection and publish an approved privacy notice when applicable.',['homepage:links']));
  if (!canonical) findings.push(finding('web-canonical','Canonical URL was not observed','P2',['Findability'],'OBSERVED_EVIDENCE','Search engines have less explicit guidance about the preferred public URL.','Add and verify canonical metadata.',['homepage:canonical']));
  if (!hasAbout) findings.push(finding('web-leadership','Leadership/about proof is hard to discover from the homepage','P2',['Trust','Funding Readiness'],'OBSERVED_EVIDENCE','Institutional reviewers often need to understand who is responsible for the organization.','Make verified organization and leadership information easy to find.',['homepage:links']));
  if (!hasGovernance) findings.push(finding('web-funder-proof','Governance or accountability proof was not readily observable','P2',['Funding Readiness'],'OBSERVED_EVIDENCE','A funder may need additional due-diligence information before advancing.','As appropriate to organizational maturity, make verified governance/accountability information discoverable.',['homepage:links']));
  if (!hasOrgSchema) findings.push(finding('web-schema','Organization structured data was not observed','P3',['Findability'],'OBSERVED_EVIDENCE','Structured identity can improve machine-readable consistency.','Add Organization or NonprofitOrganization structured data only from verified facts.',['homepage:html']));

  const outcomes = [
    outcome('mission','Mission & Strategy',title && h1 ? 'READY' : 'NEEDS_ATTENTION',title && h1 ? 'The homepage exposes a primary identity/message signal.' : 'The primary public message needs clearer structure.'),
    outcome('identity','Legal / Public Identity','UNKNOWN','Website claims are not authoritative legal or tax verification.'),
    outcome('ownership','Digital Ownership','UNKNOWN','Public HTML cannot prove who controls domain, DNS, analytics, payments, social accounts or source code.'),
    outcome('trust','Trust',hasContact && hasAbout && hasPrivacy ? 'READY' : 'NEEDS_ATTENTION','Based on observable contact, leadership/about and privacy signals.'),
    outcome('findability','Findability',title && description && canonical ? 'READY' : 'NEEDS_ATTENTION','Based on homepage search metadata only. Google Business ownership remains unverified.'),
    outcome('actions','Action Paths',hasContact && (hasDonate || hasVolunteer) ? 'READY' : 'NEEDS_ATTENTION','Based on discoverable contact plus donation or volunteer paths. No form or transaction was submitted.'),
    outcome('funding','Funding Readiness',hasAbout && hasGovernance ? 'READY' : 'NEEDS_ATTENTION','Public evidence signal only; not a grant-eligibility determination.'),
    outcome('operations','Operations & Measurement',hasAnalytics ? 'UNKNOWN' : 'NEEDS_ATTENTION',hasAnalytics ? 'Analytics code appears present, but ownership and conversion tracking are unverified.' : 'No common analytics signal was observed on the homepage.')
  ];

  const strengths = [];
  if (title) strengths.push('Homepage title is present.');
  if (h1) strengths.push('Homepage has a primary H1.');
  if (hasContact) strengths.push('A public contact path is discoverable.');
  if (hasDonate) strengths.push('A donation path is discoverable.');
  if (hasVolunteer) strengths.push('A volunteer or get-involved path is discoverable.');
  if (hasPrivacy) strengths.push('A privacy path is discoverable.');
  if (hasOrgSchema) strengths.push('Organization structured data is present.');

  return {
    version:'1.0.0', assessmentType:'groundwork_public_readiness', generatedAt:fetchedAt,
    sourceScope:'public_homepage_safe_scan', evidenceClass:'OBSERVED_EVIDENCE', evidence, outcomes, findings, strengths,
    humanActionQueue:[
      { item:'Verify legal/tax/public-record identity through authoritative sources.', reason:'Website claims alone are not sufficient.' },
      { item:'Confirm digital ownership of domain, DNS, email, analytics, payments and critical accounts.', reason:'Control cannot be proven from public HTML.' },
      { item:'Determine Google Business Profile relevance and verified ownership/status.', reason:'Search/map ownership requires current platform/public evidence.' }
    ],
    limitations:[
      'This first safe executor inspects the public homepage only.',
      'It does not submit forms, transactions, grants, profile changes or external messages.',
      'It does not make legal, tax, grant-eligibility or Google verification claims.',
      'Full Groundwork continues with authoritative records, deeper crawl, browser testing, organization-owned account evidence and human review where required.'
    ],
    nextAction: findings.length ? 'Address the highest-severity findings, then continue the deeper Groundwork stages.' : 'Continue authoritative identity, ownership, Google, accessibility and funding-readiness verification.'
  };
}

function limitedAssessment(input) {
  return {
    version:'1.0.0', assessmentType:'groundwork_public_readiness', generatedAt:new Date().toISOString(),
    sourceScope:'limited_no_public_homepage_evidence', evidenceClass:'UNKNOWN',
    evidence:{ organization:input.orgName || null, website:input.website || null, fetchStatus:'not_available', reason:input.reason },
    outcomes:[
      outcome('mission','Mission & Strategy','UNKNOWN','Public website evidence was not available.'),
      outcome('identity','Legal / Public Identity','UNKNOWN','Authoritative verification has not run yet.'),
      outcome('ownership','Digital Ownership','UNKNOWN','Organization-controlled account evidence is required.'),
      outcome('trust','Trust','UNKNOWN','Public website evidence was not available.'),
      outcome('findability','Findability','UNKNOWN','Search and Google evidence have not run yet.'),
      outcome('actions','Action Paths','UNKNOWN','Public action paths were not available to test.'),
      outcome('funding','Funding Readiness','UNKNOWN','Funder-readiness evidence has not run yet.'),
      outcome('operations','Operations & Measurement','UNKNOWN','Operations evidence has not run yet.')
    ],
    findings:[finding('groundwork-input','Groundwork needs a reachable public website for the first automated evidence pass','P1',['Trust','Findability','Action Paths'],'UNKNOWN','The system cannot responsibly grade public digital readiness without a public source.','Add or correct the organization website, then rerun Groundwork.',[])],
    strengths:[],
    humanActionQueue:[{item:'Provide or correct the official public website.',reason:'Needed for public-site evidence collection.'}],
    limitations:['No readiness claims were inferred without source evidence.'],
    nextAction:'Provide or correct the official public website, then rerun Groundwork.'
  };
}

function artifactForMission(tenantId, missionId) {
  return (getArtifacts({ tenantId }) || []).find((artifact) =>
    artifact.kind === 'groundwork-assessment' && (artifact.sourceRefs || []).includes('mission:' + missionId)
  ) || null;
}

export async function executeGroundworkAssessment(input) {
  const tenantId = input.tenantId;
  const userId = input.userId;
  const conversationId = input.conversationId;
  const missionId = input.missionId;
  const existing = artifactForMission(tenantId, missionId);
  if (existing) return { artifact:existing, reused:true, assessment:null };

  transitionClientMissionState({
    tenantId,userId,conversationId,missionId,to:'working',actor:'groundwork-executor',
    idempotencyKey:'groundwork-working:' + missionId
  });

  let assessment;
  let normalized = null;
  try { normalized = normalizeWebsite(input.website); } catch {}
  if (!normalized) {
    assessment = limitedAssessment({ orgName:input.orgName, website:input.website, reason:'WEBSITE_MISSING_OR_INVALID' });
  } else {
    try {
      const fetched = await publicFetch(normalized, { fetchImpl:input.fetchImpl, lookup:input.lookup });
      assessment = analyzeGroundworkPage({
        html:fetched.html, url:fetched.url, status:fetched.response.status, fetchedAt:new Date().toISOString()
      });
      assessment.organization = { name:input.orgName || null, website:normalized.toString() };
    } catch (error) {
      assessment = limitedAssessment({ orgName:input.orgName, website:normalized.toString(), reason:error.message || 'GROUNDWORK_FETCH_FAILED' });
    }
  }

  const relative = path.join('groundwork', missionId, 'assessment.json');
  const absolute = path.join(getDataDir(), tenantId, relative);
  fs.mkdirSync(path.dirname(absolute), { recursive:true });
  fs.writeFileSync(absolute, JSON.stringify(assessment,null,2), 'utf8');

  const artifact = registerArtifact({
    tenantId, kind:'groundwork-assessment', title:'Groundwork readiness assessment',
    mimeType:'application/json', storagePath:relative, approvalClass:'green', approvalStatus:'approved',
    sourceRefs:[missionId,'mission:' + missionId], createdBy:'groundwork-executor'
  });

  const ready = transitionClientMissionState({
    tenantId,userId,conversationId,missionId,to:'ready',actor:'groundwork-verifier',
    proofRefs:['artifact:' + artifact.id], idempotencyKey:'groundwork-ready:' + missionId,
    nextAction:assessment.nextAction
  });
  return { artifact, reused:false, assessment, work:ready.projection };
}

export function summarizeGroundworkAssessment(assessment) {
  if (!assessment) return 'Groundwork assessment is ready. Open the evidence artifact for the verified result.';
  const ready = assessment.outcomes.filter((row) => row.status === 'READY').length;
  const attention = assessment.outcomes.filter((row) => row.status === 'NEEDS_ATTENTION').length;
  const unknown = assessment.outcomes.filter((row) => row.status === 'UNKNOWN').length;
  const top = assessment.findings.slice(0,3).map((row) => row.title);
  const detail = top.length ? ' Highest-priority findings: ' + top.join('; ') + '.' : '';
  return 'Groundwork initial assessment is ready: ' + ready + ' areas ready, ' + attention + ' need attention, and ' + unknown +
    ' remain unknown pending deeper verification.' + detail + ' I saved the evidence as an inspectable artifact; no external changes were made.';
}
