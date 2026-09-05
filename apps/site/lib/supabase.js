const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cyxdevcjycmffhmwxojh.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const SESSION_KEY = 'ujima_supabase_session';

export function getSupabaseConfig() {
  return { url: SUPABASE_URL, key: SUPABASE_KEY };
}

export function getSession() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
  catch { return null; }
}

export function setSession(session) {
  if (typeof window === 'undefined') return;
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

export function clearSession() {
  if (typeof window !== 'undefined') localStorage.removeItem(SESSION_KEY);
}

function baseHeaders(accessToken) {
  return {
    apikey: SUPABASE_KEY,
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

export async function signInWithPassword(email, password) {
  if (!SUPABASE_KEY) throw new Error('Supabase is not configured for this deployment.');
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error_description || data.msg || data.message || 'Sign in failed.');
  const session = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
    user: data.user,
  };
  setSession(session);
  return session;
}

export async function getCurrentUser() {
  const session = getSession();
  if (!session?.access_token) return null;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: baseHeaders(session.access_token), cache: 'no-store' });
  if (!response.ok) {
    clearSession();
    return null;
  }
  return response.json();
}

export async function supabaseRest(path, options = {}) {
  const session = getSession();
  if (!session?.access_token) throw new Error('AUTH_REQUIRED');
  const headers = {
    ...baseHeaders(session.access_token),
    Prefer: options.prefer || 'return=representation',
    ...(options.headers || {}),
  };
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers,
    cache: 'no-store',
  });
  if (response.status === 401) {
    clearSession();
    throw new Error('AUTH_REQUIRED');
  }
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.message || data?.details || `Supabase request failed (${response.status}).`);
  return data;
}
