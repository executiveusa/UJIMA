/**
 * OpusClip Official API Client for Agenix Studio OS
 * Base URL: https://api.opus.pro
 *
 * Implements official endpoints per https://help.opus.pro/llms.txt
 * Production client accepts environment/injected credentials ONLY.
 */

import https from 'https';

export class OpusClipClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'https://api.opus.pro';
    this.apiKey = options.apiKey || process.env.OPUS_CLIP_API || process.env.OPUS_CLIP_API_KEY || '';
  }

  _request(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      if (!this.apiKey) {
        return reject(new Error('MISSING_OPUS_CLIP_API_KEY'));
      }

      const url = new URL(path, this.baseUrl);
      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
        'x-api-key': this.apiKey,
        'Accept': 'application/json'
      };

      let bodyString = null;
      if (data) {
        bodyString = JSON.stringify(data);
        headers['Content-Type'] = 'application/json';
        headers['Content-Length'] = Buffer.byteLength(bodyString);
      }

      const req = https.request(url, { method, headers }, (res) => {
        let resData = '';
        res.on('data', chunk => resData += chunk);
        res.on('end', () => {
          let parsed;
          try { parsed = JSON.parse(resData); } catch (_) { parsed = resData; }
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ statusCode: res.statusCode, data: parsed });
          } else {
            resolve({ statusCode: res.statusCode, error: parsed });
          }
        });
      });

      req.on('error', err => reject(err));
      if (bodyString) req.write(bodyString);
      req.end();
    });
  }

  // ── Read-Only Endpoints ────────────────────────────────────────────────────

  async health() {
    try {
      const res = await this._request('/api/brand-templates');
      return { ok: res.statusCode === 200, statusCode: res.statusCode };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  async getBrandTemplates() {
    return this._request('/api/brand-templates');
  }

  async getCollections() {
    return this._request('/api/collections?q=mine');
  }

  async getSocialAccounts() {
    return this._request('/api/social-accounts?q=mine');
  }

  async getTranscript(projectId) {
    if (!projectId) throw new Error('PROJECT_ID_REQUIRED');
    return this._request(`/api/transcripts?q=findByProjectId&projectId=${encodeURIComponent(projectId)}`);
  }

  async getClips(projectId) {
    if (!projectId) throw new Error('PROJECT_ID_REQUIRED');
    return this._request(`/api/clips?q=findByProjectId&projectId=${encodeURIComponent(projectId)}`);
  }

  // ── Guarded Write Stubs (Disabled by Policy) ──────────────────────────────

  async createProject(params) {
    throw new Error('WRITE_POLICY_GUARD: Creating projects requires explicit human approval and credit spend authorization.');
  }

  async createUploadLink(params) {
    throw new Error('WRITE_POLICY_GUARD: Creating upload links requires explicit human approval.');
  }

  async shareProject(projectId, params) {
    throw new Error('WRITE_POLICY_GUARD: Sharing projects requires explicit human approval.');
  }
}
