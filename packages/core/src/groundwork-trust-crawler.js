import dns from 'node:dns/promises';
import net from 'node:net';
import http from 'node:http';
import https from 'node:https';

const PRIORITY_PATH = /about|mission|program|impact|give|donate|support|contact|privacy|terms|financ|990|board|team|governance|safeguard|policy|volunteer|partner|transparen/i;
const SOCIAL_HOSTS = ['facebook.com','instagram.com','linkedin.com','x.com','twitter.com','youtube.com','tiktok.com','threads.net','bsky.app','github.com'];

function cleanText(value = '') {
  return String(value).replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/\s+/g, ' ').trim();
}

function attr(tag, name) {
  const match = String(tag).match(new RegExp('\\b' + name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i'));
  return match ? (match[1] ?? match[2] ?? match[3] ?? '') : '';
}

function firstMatch(html, pattern) {
  const match = String(html).match(pattern);
  return match ? cleanText(match[1] || '') : '';
}

function tags(html, name) {
  return [...String(html).matchAll(new RegExp('<' + name + '\\b[^>]*>', 'gi'))].map((m) => m[0]);
}

function paired(html, name) {
  return [...String(html).matchAll(new RegExp('<' + name + '\\b[^>]*>([\\s\\S]*?)<\\/' + name + '>', 'gi'))].map((m) => cleanText(m[1]));
}

export function normalizeGroundworkWebsite(profile = {}) {
  let value = String(profile.website || profile.domain || profile.url || '').trim();
  if (!value) return '';
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) value = 'https://' + value;
  try {
    const url = new URL(value);
    url.hash = '';
    return url.toString();
  } catch {
    return '';
  }
}

export function isPrivateAddress(address = '') {
  const raw = String(address).replace(/^\[|\]$/g, '').toLowerCase();
  const version = net.isIP(raw);
  if (version === 4) {
    const [a,b] = raw.split('.').map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
  }
  if (version === 6) {
    if (raw === '::1' || raw === '::') return true;
    if (raw.startsWith('fe8') || raw.startsWith('fe9') || raw.startsWith('fea') || raw.startsWith('feb')) return true;
    if (raw.startsWith('fc') || raw.startsWith('fd')) return true;
    if (raw.startsWith('ff')) return true;
    if (raw.startsWith('::ffff:')) {
      const mapped = raw.slice('::ffff:'.length);
      return net.isIP(mapped) === 4 ? isPrivateAddress(mapped) : false;
    }
  }
  return version === 0;
}

async function resolvePublicHttpTarget(raw, { lookupFn = dns.lookup } = {}) {
  let url;
  try { url = new URL(raw); } catch { throw new Error('GROUNDWORK_TRUST_URL_INVALID'); }
  if (!['http:','https:'].includes(url.protocol)) throw new Error('GROUNDWORK_TRUST_PROTOCOL_BLOCKED');
  if (url.username || url.password) throw new Error('GROUNDWORK_TRUST_CREDENTIAL_URL_BLOCKED');
  if (url.port && !['80','443'].includes(url.port)) throw new Error('GROUNDWORK_TRUST_PORT_BLOCKED');

  const host = url.hostname.toLowerCase();
  if (!host || host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) throw new Error('GROUNDWORK_TRUST_PRIVATE_HOST_BLOCKED');
  if (net.isIP(host)) {
    if (isPrivateAddress(host)) throw new Error('GROUNDWORK_TRUST_PRIVATE_HOST_BLOCKED');
    return { url, records: [{ address: host, family: net.isIP(host) }] };
  }

  const records = await lookupFn(host, { all: true, verbatim: true });
  if (!Array.isArray(records) || records.length === 0) throw new Error('GROUNDWORK_TRUST_DNS_EMPTY');
  if (records.some((record) => isPrivateAddress(record.address))) throw new Error('GROUNDWORK_TRUST_PRIVATE_DNS_BLOCKED');
  return { url, records };
}

export async function assertPublicHttpUrl(raw, options = {}) {
  return (await resolvePublicHttpTarget(raw, options)).url;
}

function nodeHeaders(headers = {}) {
  return {
    get(name) {
      const value = headers[String(name).toLowerCase()];
      return Array.isArray(value) ? value.join(', ') : value === undefined ? null : String(value);
    }
  };
}

async function requestPinnedPublicText(raw, { lookupFn = dns.lookup, timeoutMs = 15000, maxBytes = 2_000_000 } = {}) {
  const { url, records } = await resolvePublicHttpTarget(raw, { lookupFn });
  const chosen = records[0];
  const transport = url.protocol === 'https:' ? https : http;

  return await new Promise((resolve, reject) => {
    const req = transport.request({
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || undefined,
      path: url.pathname + url.search,
      method: 'GET',
      headers: { 'user-agent': 'UJIMA-Groundwork/1.0 public-site-trust-check' },
      servername: net.isIP(url.hostname) ? undefined : url.hostname,
      lookup(_hostname, _options, callback) {
        callback(null, chosen.address, chosen.family);
      }
    }, (res) => {
      const headers = nodeHeaders(res.headers);
      const length = Number(headers.get('content-length') || 0);
      if (length > maxBytes) {
        res.destroy();
        reject(new Error('GROUNDWORK_TRUST_BODY_TOO_LARGE'));
        return;
      }

      const chunks = [];
      let bytes = 0;
      res.on('data', (chunk) => {
        bytes += chunk.length;
        if (bytes > maxBytes) {
          res.destroy(new Error('GROUNDWORK_TRUST_BODY_TOO_LARGE'));
          return;
        }
        chunks.push(Buffer.from(chunk));
      });
      res.on('error', reject);
      res.on('end', () => resolve({
        url: url.toString(),
        status: res.statusCode || 0,
        headers,
        body: Buffer.concat(chunks).toString('utf8')
      }));
    });

    req.setTimeout(timeoutMs, () => req.destroy(new Error('GROUNDWORK_TRUST_TIMEOUT')));
    req.on('error', reject);
    req.end();
  });
}

async function readBoundedBody(response, maxBytes) {
  const length = Number(response.headers?.get?.('content-length') || 0);
  if (length > maxBytes) throw new Error('GROUNDWORK_TRUST_BODY_TOO_LARGE');
  if (!response.body?.getReader) {
    const text = await response.text();
    if (Buffer.byteLength(text) > maxBytes) throw new Error('GROUNDWORK_TRUST_BODY_TOO_LARGE');
    return text;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let text = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > maxBytes) {
      try { await reader.cancel(); } catch {}
      throw new Error('GROUNDWORK_TRUST_BODY_TOO_LARGE');
    }
    text += decoder.decode(value, { stream: true });
  }
  text += decoder.decode();
  return text;
}

export async function fetchPublicText(raw, {
  fetchFn = null,
  lookupFn = dns.lookup,
  timeoutMs = 15000,
  maxBytes = 2_000_000,
  maxRedirects = 5,
  allowedOrigin = null
} = {}) {
  if (typeof fetchFn !== 'function') throw new Error('FETCH_UNAVAILABLE');
  let current = String(raw);
  for (let redirect = 0; redirect <= maxRedirects; redirect += 1) {
    const url = await assertPublicHttpUrl(current, { lookupFn });
    if (allowedOrigin && url.origin !== allowedOrigin) throw new Error('GROUNDWORK_TRUST_CROSS_ORIGIN_BLOCKED');
    const response = fetchFn
      ? await fetchFn(url.toString(), {
          method: 'GET',
          redirect: 'manual',
          signal: AbortSignal.timeout(timeoutMs),
          headers: { 'user-agent': 'UJIMA-Groundwork/1.0 public-site-trust-check' }
        })
      : await requestPinnedPublicText(url.toString(), { lookupFn, timeoutMs, maxBytes });

    if ([301,302,303,307,308].includes(response.status)) {
      const location = response.headers?.get?.('location');
      if (!location) throw new Error('GROUNDWORK_TRUST_REDIRECT_MISSING_LOCATION');
      current = new URL(location, url).toString();
      if (redirect === maxRedirects) throw new Error('GROUNDWORK_TRUST_TOO_MANY_REDIRECTS');
      continue;
    }

    const body = fetchFn ? await readBoundedBody(response, maxBytes) : response.body;
    return {
      url: url.toString(),
      status: response.status,
      contentType: String(response.headers?.get?.('content-type') || '').toLowerCase(),
      headers: response.headers,
      body
    };
  }
  throw new Error('GROUNDWORK_TRUST_TOO_MANY_REDIRECTS');
}

function absoluteHref(href, pageUrl) {
  if (!href) return '';
  try { return new URL(href, pageUrl).toString(); } catch { return ''; }
}

export function parseGroundworkTrustPage(url, status, html) {
  const title = firstMatch(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const descriptionTag = tags(html, 'meta').find((tag) => attr(tag, 'name').toLowerCase() === 'description') || '';
  const viewportTag = tags(html, 'meta').find((tag) => attr(tag, 'name').toLowerCase() === 'viewport') || '';
  const robotsTag = tags(html, 'meta').find((tag) => attr(tag, 'name').toLowerCase() === 'robots') || '';
  const canonicalTag = tags(html, 'link').find((tag) => attr(tag, 'rel').toLowerCase() === 'canonical') || '';
  const htmlTag = String(html).match(/<html\b[^>]*>/i)?.[0] || '';

  const anchors = [...String(html).matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((match) => {
    const href = absoluteHref(attr(match[0], 'href'), url);
    return { href, text: cleanText(match[2]).slice(0, 120) };
  }).filter((link) => link.href);

  const images = tags(html, 'img');
  const forms = [...String(html).matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi)].map((match) => {
    const form = match[0];
    const fields = [...form.matchAll(/<(input|select|textarea)\b[^>]*>/gi)]
      .map((field) => attr(field[0], 'name') || attr(field[0], 'type'))
      .filter(Boolean);
    return {
      action: attr(form, 'action'),
      method: (attr(form, 'method') || 'get').toLowerCase(),
      fields,
      hasConsentText: /privacy|consent|agree|unsubscribe|terms/i.test(cleanText(match[2]))
    };
  });

  const jsonLdTypes = [];
  for (const match of String(html).matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const value = JSON.parse(match[1]);
      const walk = (node) => {
        if (Array.isArray(node)) return node.forEach(walk);
        if (!node || typeof node !== 'object') return;
        const type = node['@type'];
        if (typeof type === 'string') jsonLdTypes.push(type);
        else if (Array.isArray(type)) jsonLdTypes.push(...type.map(String));
        if (node['@graph']) walk(node['@graph']);
      };
      walk(value);
    } catch {}
  }

  const bodyText = cleanText(String(html)
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' '));

  const social = [...new Set(anchors.filter((link) => {
    try {
      const host = new URL(link.href).hostname.replace(/^www\./,'').toLowerCase();
      return SOCIAL_HOSTS.some((candidate) => host === candidate || host.endsWith('.' + candidate));
    } catch { return false; }
  }).map((link) => link.href))];

  return {
    url,
    status,
    title,
    description: attr(descriptionTag, 'content'),
    canonical: absoluteHref(attr(canonicalTag, 'href'), url),
    lang: attr(htmlTag, 'lang'),
    viewport: Boolean(viewportTag),
    h1: paired(html, 'h1'),
    headings: ['h1','h2','h3','h4','h5','h6'].reduce((sum, name) => sum + paired(html, name).length, 0),
    imagesTotal: images.length,
    imagesMissingAlt: images.filter((tag) => !/\balt\s*=/i.test(tag)).length,
    forms,
    jsonLdTypes,
    links: anchors,
    mailtos: anchors.filter((link) => link.href.startsWith('mailto:')).map((link) => link.href.slice(7)),
    tels: anchors.filter((link) => link.href.startsWith('tel:')).map((link) => link.href.slice(4)),
    socials: social,
    words: bodyText ? bodyText.split(/\s+/).length : 0,
    text: bodyText.slice(0, 6000),
    noindex: /noindex/i.test(attr(robotsTag, 'content'))
  };
}

export function groundworkTrustChecks(crawl) {
  const checks = [];
  const add = (id, ok, detail, severity = ok ? 'info' : 'warning') => checks.push({ id, ok, detail, severity });
  const home = crawl.pages[0];
  add('https', crawl.origin.startsWith('https://'), crawl.origin);
  add('robots.txt', crawl.robotsTxt !== null, crawl.robotsTxt ? 'present' : 'missing');
  add('sitemap.xml', crawl.sitemapUrls.length > 0, crawl.sitemapUrls.length + ' URLs');
  if (crawl.robotsTxt && /Disallow:\s*\/\s*$/mi.test(crawl.robotsTxt)) add('robots-blocks-all', false, 'robots.txt disallows all crawling', 'high');
  if (!home) {
    add('homepage', false, 'No HTML homepage was collected', 'high');
    return checks;
  }

  for (const page of crawl.pages) {
    const where = new URL(page.url).pathname || '/';
    add('title:' + where, page.title.length >= 10 && page.title.length <= 70, '"' + page.title + '" (' + page.title.length + ')');
    add('description:' + where, page.description.length >= 50 && page.description.length <= 170, page.description.length + ' chars');
    add('h1:' + where, page.h1.length === 1, page.h1.length + ' h1');
    add('viewport:' + where, page.viewport, page.viewport ? 'present' : 'missing');
    add('alt:' + where, page.imagesMissingAlt === 0, page.imagesMissingAlt + '/' + page.imagesTotal + ' images lack alt');
    add('canonical:' + where, Boolean(page.canonical), page.canonical || 'missing');
    add('lang:' + where, Boolean(page.lang), page.lang || 'missing');
    if (page.noindex) add('noindex:' + where, false, 'page is noindex', 'high');
    if (page.status >= 400) add('status:' + where, false, 'HTTP ' + page.status, 'high');
  }

  const allLinks = crawl.pages.flatMap((page) => page.links);
  add('org-schema', home.jsonLdTypes.some((type) => /Organization|NGO|NonprofitOrganization/i.test(type)), home.jsonLdTypes.join(', ') || 'no organization JSON-LD');
  add('privacy-link', allLinks.some((link) => /privacy/i.test(link.href + ' ' + link.text)), 'privacy link');
  add('donate-link', allLinks.some((link) => /donate|give|support/i.test(link.href + ' ' + link.text)), 'donate/give/support link');
  add('contact-path', crawl.pages.some((page) => page.mailtos.length || page.tels.length || page.forms.length), 'email, phone, or form');

  for (const page of crawl.pages) {
    for (const form of page.forms) {
      if (form.method === 'get' && form.fields.some((field) => /email|name|phone/i.test(field))) {
        add('form-get:' + page.url, false, 'form collecting personal data submits with GET', 'high');
      }
      if (!form.hasConsentText && form.fields.some((field) => /email|phone/i.test(field))) {
        add('form-consent:' + page.url, false, 'form collects email/phone with no privacy or consent text nearby', 'warning');
      }
    }
  }
  add('crawl-errors', crawl.errors.length === 0, crawl.errors.length + ' fetch errors', crawl.errors.length ? 'warning' : 'info');
  return checks;
}

function sitemapLocations(xml = '') {
  return [...String(xml).matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => cleanText(match[1])).filter(Boolean).slice(0, 200);
}

export async function crawlGroundworkTrustSite(startUrl, {
  maxPages = 12,
  fetchFn = null,
  lookupFn = dns.lookup,
  timeoutMs = 15000,
  maxBytes = 2_000_000
} = {}) {
  const first = await fetchPublicText(startUrl, { fetchFn, lookupFn, timeoutMs, maxBytes });
  const firstUrl = new URL(first.url);
  const origin = firstUrl.origin;
  const result = {
    schemaVersion: '1.0.0',
    stage: 'trust',
    source: { type: 'public_website_crawl', evidenceClass: 'observed_evidence', independentlyVerified: false },
    origin,
    fetchedAt: new Date().toISOString(),
    robotsTxt: null,
    sitemapUrls: [],
    pages: [],
    errors: [],
    limits: { maxPages, maxBytesPerResponse: maxBytes, timeoutMs, sameOriginOnly: true, scriptsExecuted: false }
  };

  try {
    const robots = await fetchPublicText(origin + '/robots.txt', { fetchFn, lookupFn, timeoutMs, maxBytes: Math.min(maxBytes, 200_000), allowedOrigin: origin });
    if (robots.status === 200) result.robotsTxt = robots.body.slice(0, 5000);
  } catch (error) {
    result.errors.push('robots.txt: ' + error.message);
  }

  try {
    const sitemap = await fetchPublicText(origin + '/sitemap.xml', { fetchFn, lookupFn, timeoutMs, maxBytes: Math.min(maxBytes, 500_000), allowedOrigin: origin });
    if (sitemap.status === 200) result.sitemapUrls = sitemapLocations(sitemap.body).filter((url) => {
      try { return new URL(url).origin === origin; } catch { return false; }
    });
  } catch (error) {
    result.errors.push('sitemap.xml: ' + error.message);
  }

  const queue = [first.url, ...result.sitemapUrls.filter((url) => PRIORITY_PATH.test(url))];
  const seen = new Set();
  while (queue.length && result.pages.length < maxPages) {
    const raw = queue.shift();
    let target;
    try {
      target = new URL(raw);
      target.hash = '';
    } catch {
      continue;
    }
    if (target.origin !== origin || seen.has(target.toString())) continue;
    seen.add(target.toString());

    try {
      const response = target.toString() === first.url
        ? first
        : await fetchPublicText(target.toString(), { fetchFn, lookupFn, timeoutMs, maxBytes, allowedOrigin: origin });
      if (!response.contentType.includes('html')) continue;
      const page = parseGroundworkTrustPage(response.url, response.status, response.body);
      result.pages.push(page);
      const next = page.links
        .map((link) => link.href)
        .filter((href) => {
          try { return new URL(href).origin === origin && !seen.has(href); } catch { return false; }
        });
      queue.push(...next.filter((href) => PRIORITY_PATH.test(href)), ...next.filter((href) => !PRIORITY_PATH.test(href)));
    } catch (error) {
      result.errors.push(target.toString() + ': ' + error.message);
    }
  }

  result.checks = groundworkTrustChecks(result);
  result.summary = {
    pagesCollected: result.pages.length,
    failedChecks: result.checks.filter((check) => !check.ok).length,
    highRiskChecks: result.checks.filter((check) => !check.ok && check.severity === 'high').length,
    crawlErrors: result.errors.length
  };
  result.limitations = [
    'This collector observes public website HTML and response metadata only; it does not execute third-party scripts or prove backend security.',
    'Accessibility and privacy findings are deterministic signals for review, not legal conclusions or a substitute for manual/browser accessibility testing.',
    'External links are recorded but never crawled; same-origin traversal is enforced after the canonical homepage origin is established.',
    'Trust stage completion should use independently verified evidence and should not imply legal, fundraising, or safeguarding compliance.'
  ];
  return result;
}
