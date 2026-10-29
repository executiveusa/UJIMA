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
    ...(accessToken ? { Authorization: 'Bearer ' + accessToken } : {}),
  };
}

function callbackUrl(mode = '') {
  if (typeof window === 'undefined') return '';
  const url = new URL('/auth/callback', window.location.origin);
  if (mode) url.searchParams.set('mode', mode);
  return url.toString();
}

function assertConfigured() {
  if (!SUPABASE_KEY) throw new Error('Supabase is not configured for this deployment.');
}

function normalizeSession(data) {
  if (!data?.access_token) return null;
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + (Number(data.expires_in) || 3600),
    user: data.user || null,
  };
}

export async function signInWithPassword(email, password) {
  assertConfigured();
  const response = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error_description || data.msg || data.message || 'Sign in failed.');
  const session = normalizeSession(data);
  setSession(session);
  return session;
}

export async function signUpWithPassword(email, password) {
  assertConfigured();
  const response = await fetch(SUPABASE_URL + '/auth/v1/signup', {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify({ email, password, options: { emailRedirectTo: callbackUrl('signup') } }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.msg || data.message || 'Could not create the account.');
  const session = normalizeSession(data);
  if (session) setSession(session);
  return { session, user: data.user || null };
}

export async function sendMagicLink(email) {
  assertConfigured();
  const response = await fetch(SUPABASE_URL + '/auth/v1/otp', {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify({ email, create_user: true, options: { emailRedirectTo: callbackUrl('magic') } }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.msg || data.message || 'Could not send the sign-in link.');
  return data;
}

export function signInWithGoogle() {
  assertConfigured();
  if (typeof window === 'undefined') return;
  const target = new URL(SUPABASE_URL + '/auth/v1/authorize');
  target.searchParams.set('provider', 'google');
  target.searchParams.set('redirect_to', callbackUrl('oauth'));
  window.location.assign(target.toString());
}

export async function sendPasswordRecovery(email) {
  assertConfigured();
  const response = await fetch(SUPABASE_URL + '/auth/v1/recover', {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify({ email, redirect_to: callbackUrl('recovery') }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.msg || data.message || 'Could not send recovery email.');
  return data;
}

export async function updatePassword(password) {
  const session = getSession();
  if (!session?.access_token) throw new Error('Recovery session is missing.');
  const response = await fetch(SUPABASE_URL + '/auth/v1/user', {
    method: 'PUT',
    headers: baseHeaders(session.access_token),
    body: JSON.stringify({ password }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.msg || data.message || 'Could not update password.');
  return data;
}

export function captureSessionFromLocation() {
  if (typeof window === 'undefined') return null;
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const error = hash.get('error_description') || query.get('error_description') || hash.get('error') || query.get('error');
  if (error) throw new Error(error);
  const accessToken = hash.get('access_token') || query.get('access_token');
  if (!accessToken) return null;
  const expiresIn = Number(hash.get('expires_in') || query.get('expires_in') || 3600);
  const session = {
    access_token: accessToken,
    refresh_token: hash.get('refresh_token') || query.get('refresh_token') || '',
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
    user: null,
  };
  setSession(session);
  return session;
}

export async function getCurrentUser() {
  const session = getSession();
  if (!session?.access_token) return null;
  const response = await fetch(SUPABASE_URL + '/auth/v1/user', { headers: baseHeaders(session.access_token), cache: 'no-store' });
  if (!response.ok) {
    clearSession();
    return null;
  }
  const user = await response.json();
  setSession({ ...session, user });
  return user;
}

export async function supabaseRest(path, options = {}) {
  const session = getSession();
  if (!session?.access_token) throw new Error('AUTH_REQUIRED');
  const headers = {
    ...baseHeaders(session.access_token),
    Prefer: options.prefer || 'return=representation',
    ...(options.headers || {}),
  };
  const response = await fetch(SUPABASE_URL + '/rest/v1/' + path, {
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
  if (!response.ok) throw new Error(data?.message || data?.details || 'Supabase request failed (' + response.status + ').');
  return data;
}
