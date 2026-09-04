import { getToken } from './api';

// Browser-side helper for the ops dashboard. Calls same-origin Next.js route
// handlers under /api/ops/* and forwards only the signed browser session token.
// Tenant selection and authorization remain server-side.
export async function opsApi(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  const res = await fetch(`/api/ops${path}`, { ...options, headers, cache: 'no-store' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.ok === false) {
    const error = new Error(body.error?.message || `Ops API error ${res.status}`);
    error.status = res.status;
    throw error;
  }
  return body;
}