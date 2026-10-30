import { describe, expect, it, vi } from 'vitest';
import {
  normalizeGroundworkWebsite,
  isPrivateAddress,
  assertPublicHttpUrl,
  fetchPublicText,
  parseGroundworkTrustPage,
  groundworkTrustChecks,
  crawlGroundworkTrustSite
} from '../src/groundwork-trust-crawler.js';

const publicLookup = async () => [{ address: '93.184.216.34', family: 4 }];

function htmlResponse(body, { status = 200, headers = {} } = {}) {
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8', ...headers }
  });
}

describe('Groundwork Trust crawler security', () => {
  it('normalizes only stored website/domain/url values', () => {
    expect(normalizeGroundworkWebsite({ website: 'example.org' })).toBe('https://example.org/');
    expect(normalizeGroundworkWebsite({ domain: 'https://example.org/about#team' })).toBe('https://example.org/about');
    expect(normalizeGroundworkWebsite({})).toBe('');
    expect(normalizeGroundworkWebsite({ website: 'not a url' })).toBe('');
  });

  it('rejects private, loopback, link-local and non-IP host values', () => {
    for (const address of ['127.0.0.1','10.0.0.1','172.16.0.1','192.168.1.5','169.254.1.1','0.0.0.0','::1','fc00::1','fe80::1']) {
      expect(isPrivateAddress(address)).toBe(true);
    }
    expect(isPrivateAddress('93.184.216.34')).toBe(false);
  });

  it('rejects localhost, private literal IPs, private DNS answers, credentials, and custom ports', async () => {
    await expect(assertPublicHttpUrl('http://127.0.0.1')).rejects.toThrow('GROUNDWORK_TRUST_PRIVATE_HOST_BLOCKED');
    await expect(assertPublicHttpUrl('http://localhost')).rejects.toThrow('GROUNDWORK_TRUST_PRIVATE_HOST_BLOCKED');
    await expect(assertPublicHttpUrl('https://user:pass@example.org', { lookupFn: publicLookup })).rejects.toThrow('GROUNDWORK_TRUST_CREDENTIAL_URL_BLOCKED');
    await expect(assertPublicHttpUrl('https://example.org:8443', { lookupFn: publicLookup })).rejects.toThrow('GROUNDWORK_TRUST_PORT_BLOCKED');
    await expect(assertPublicHttpUrl('https://example.org', {
      lookupFn: async () => [{ address: '10.10.10.10', family: 4 }]
    })).rejects.toThrow('GROUNDWORK_TRUST_PRIVATE_DNS_BLOCKED');
  });

  it('validates every redirect before following and refuses redirect-to-private', async () => {
    const fetchFn = vi.fn(async (url) => {
      if (String(url) === 'https://example.org/') {
        return new Response('', { status: 302, headers: { location: 'http://127.0.0.1/admin' } });
      }
      throw new Error('private redirect must never be fetched');
    });

    await expect(fetchPublicText('https://example.org/', { fetchFn, lookupFn: publicLookup }))
      .rejects.toThrow('GROUNDWORK_TRUST_PRIVATE_HOST_BLOCKED');
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('refuses cross-origin redirects when a crawl origin is locked', async () => {
    const fetchFn = vi.fn(async () => new Response('', {
      status: 302,
      headers: { location: 'https://other.example.net/page' }
    }));
    const lookupFn = async () => [{ address: '93.184.216.34', family: 4 }];

    await expect(fetchPublicText('https://example.org/page', {
      fetchFn,
      lookupFn,
      allowedOrigin: 'https://example.org'
    })).rejects.toThrow('GROUNDWORK_TRUST_CROSS_ORIGIN_BLOCKED');
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('rejects oversized bodies instead of silently ingesting them', async () => {
    const fetchFn = async () => new Response('x'.repeat(100), {
      status: 200,
      headers: { 'content-type': 'text/html', 'content-length': '100' }
    });
    await expect(fetchPublicText('https://example.org/', {
      fetchFn,
      lookupFn: publicLookup,
      maxBytes: 50
    })).rejects.toThrow('GROUNDWORK_TRUST_BODY_TOO_LARGE');
  });
});

describe('Groundwork Trust parser and bounded crawl', () => {
  it('extracts deterministic trust, accessibility, form and contact signals without executing scripts', () => {
    const page = parseGroundworkTrustPage('https://example.org/', 200, `
      <!doctype html><html lang="en"><head>
        <title>Example Youth Organization</title>
        <meta name="description" content="A community nonprofit serving youth and families through mentoring, sports, and leadership programs.">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="canonical" href="/">
        <script type="application/ld+json">{"@type":"NGO","name":"Example Youth Organization"}</script>
        <script>throw new Error('must never execute')</script>
      </head><body>
        <h1>Example Youth Organization</h1>
        <h2>Programs</h2>
        <img src="/hero.jpg" alt="Youth volunteers">
        <img src="/team.jpg">
        <a href="/privacy">Privacy</a>
        <a href="/donate">Donate</a>
        <a href="mailto:hello@example.org">Email us</a>
        <a href="https://instagram.com/example">Instagram</a>
        <form method="get"><input name="email"><button>Join</button></form>
      </body></html>
    `);

    expect(page.title).toBe('Example Youth Organization');
    expect(page.lang).toBe('en');
    expect(page.h1).toEqual(['Example Youth Organization']);
    expect(page.imagesMissingAlt).toBe(1);
    expect(page.jsonLdTypes).toContain('NGO');
    expect(page.mailtos).toEqual(['hello@example.org']);
    expect(page.socials).toEqual(['https://instagram.com/example']);

    const checks = groundworkTrustChecks({
      origin: 'https://example.org',
      robotsTxt: 'User-agent: *\nAllow: /',
      sitemapUrls: ['https://example.org/'],
      pages: [page],
      errors: []
    });
    expect(checks.find((check) => check.id === 'form-get:https://example.org/')).toMatchObject({ ok: false, severity: 'high' });
    expect(checks.find((check) => check.id === 'privacy-link').ok).toBe(true);
    expect(checks.find((check) => check.id === 'donate-link').ok).toBe(true);
  });

  it('crawls only the canonical same origin, prioritizes internal pages, and respects maxPages', async () => {
    const requested = [];
    const pages = new Map([
      ['https://example.org/', htmlResponse(`
        <html lang="en"><head><title>Example Organization Home</title>
        <meta name="description" content="Example organization public site with programs, impact, donation, and contact information for the community.">
        <meta name="viewport" content="width=device-width"><link rel="canonical" href="/">
        </head><body><h1>Home</h1>
        <a href="/about">About</a><a href="/donate">Donate</a><a href="/news">News</a>
        <a href="https://external.example.net/about">External</a></body></html>
      `)],
      ['https://example.org/robots.txt', new Response('User-agent: *\nAllow: /', { status: 200, headers: { 'content-type': 'text/plain' } })],
      ['https://example.org/sitemap.xml', new Response('<urlset><url><loc>https://example.org/about</loc></url><url><loc>https://external.example.net/nope</loc></url></urlset>', { status: 200, headers: { 'content-type': 'application/xml' } })],
      ['https://example.org/about', htmlResponse('<html lang="en"><head><title>About Example Organization</title><meta name="description" content="Learn about our mission, board, programs, and public-service history in the community."><meta name="viewport" content="width=device-width"><link rel="canonical" href="/about"></head><body><h1>About</h1><a href="/contact">Contact</a></body></html>')],
      ['https://example.org/donate', htmlResponse('<html lang="en"><head><title>Donate to Example Organization</title><meta name="description" content="Support our community programs and youth services with a secure donation to the organization."><meta name="viewport" content="width=device-width"><link rel="canonical" href="/donate"></head><body><h1>Donate</h1></body></html>')],
      ['https://example.org/news', htmlResponse('<html><head><title>News from Example Organization</title></head><body><h1>News</h1></body></html>')]
    ]);

    const fetchFn = vi.fn(async (url) => {
      const key = String(url);
      requested.push(key);
      const response = pages.get(key);
      if (!response) throw new Error('unexpected fetch ' + key);
      return response;
    });

    const crawl = await crawlGroundworkTrustSite('https://example.org/', {
      maxPages: 2,
      fetchFn,
      lookupFn: publicLookup
    });

    expect(crawl.origin).toBe('https://example.org');
    expect(crawl.pages).toHaveLength(2);
    expect(crawl.pages.map((page) => new URL(page.url).pathname)).toEqual(['/', '/about']);
    expect(requested.some((url) => url.startsWith('https://external.example.net'))).toBe(false);
    expect(crawl.sitemapUrls).toEqual(['https://example.org/about']);
    expect(crawl.limits).toMatchObject({ maxPages: 2, sameOriginOnly: true, scriptsExecuted: false });
  });
});
