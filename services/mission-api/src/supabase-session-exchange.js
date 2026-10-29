import crypto from 'node:crypto';
import { cleanTenantSlug } from '@asc3nd/core/tenant';

function config(overrides = {}) {
  const supabaseUrl = String(overrides.supabaseUrl || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
  const serviceRoleKey = String(overrides.serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!supabaseUrl || !serviceRoleKey) {
    const error = new Error('SUPABASE_SERVER_AUTH_NOT_CONFIGURED');
    error.status = 503;
    throw error;
  }
  return { supabaseUrl, serviceRoleKey };
}

async function jsonFetch(url, options, fetchImpl) {
  const response = await fetchImpl(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.message || data?.msg || data?.error_description || data?.error || 'SUPABASE_REQUEST_FAILED');
    error.status = response.status;
    error.details = data;
    throw error;
  }
  return data;
}

function serviceHeaders(serviceRoleKey, extra = {}) {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json',
    ...extra
  };
}

export async function verifySupabaseUser(accessToken, options = {}) {
  if (!accessToken) {
    const error = new Error('SUPABASE_ACCESS_TOKEN_REQUIRED');
    error.status = 401;
    throw error;
  }
  const { supabaseUrl, serviceRoleKey } = config(options);
  return jsonFetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${accessToken}`
    },
    cache: 'no-store'
  }, options.fetchImpl || fetch);
}

async function restSelect(path, options = {}) {
  const { supabaseUrl, serviceRoleKey } = config(options);
  return jsonFetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: serviceHeaders(serviceRoleKey),
    cache: 'no-store'
  }, options.fetchImpl || fetch);
}

async function restInsert(table, body, options = {}) {
  const { supabaseUrl, serviceRoleKey } = config(options);
  return jsonFetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: serviceHeaders(serviceRoleKey, { Prefer: 'return=representation' }),
    body: JSON.stringify(body)
  }, options.fetchImpl || fetch);
}

export async function resolveUjimaMembership(accessToken, options = {}) {
  const authUser = await verifySupabaseUser(accessToken, options);
  const authUserId = encodeURIComponent(authUser.id);
  const users = await restSelect(`users?auth_user_id=eq.${authUserId}&select=id,tenant_id,email,role,display_name&limit=2`, options);
  if (!Array.isArray(users) || users.length === 0) {
    return { authUser, membership: null, tenant: null, needsOnboarding: true };
  }
  if (users.length > 1) {
    const error = new Error('AMBIGUOUS_UJIMA_IDENTITY');
    error.status = 409;
    throw error;
  }
  const user = users[0];
  const tenantId = encodeURIComponent(user.tenant_id);
  const memberships = await restSelect(`memberships?tenant_id=eq.${tenantId}&user_id=eq.${encodeURIComponent(user.id)}&select=id,tenant_id,user_id,role&limit=2`, options);
  if (!Array.isArray(memberships) || memberships.length !== 1) {
    const error = new Error('UJIMA_MEMBERSHIP_NOT_FOUND');
    error.status = 403;
    throw error;
  }
  const tenants = await restSelect(`tenants?id=eq.${tenantId}&select=id,org_name,status,profile&limit=1`, options);
  const tenant = Array.isArray(tenants) ? tenants[0] : null;
  if (!tenant || tenant.status !== 'active') {
    const error = new Error('UJIMA_TENANT_NOT_ACTIVE');
    error.status = 403;
    throw error;
  }
  return {
    authUser,
    membership: {
      ...memberships[0],
      role: memberships[0].role || user.role,
      user
    },
    tenant,
    needsOnboarding: false
  };
}

function newId(prefix) {
  return `${prefix}_${crypto.randomBytes(12).toString('hex')}`;
}

async function uniqueTenantId(orgName, authUserId, options = {}) {
  const base = cleanTenantSlug(orgName || 'new-nonprofit');
  const existing = await restSelect(`tenants?id=eq.${encodeURIComponent(base)}&select=id&limit=1`, options);
  if (!Array.isArray(existing) || existing.length === 0) return base;
  const suffix = String(authUserId || '').replace(/[^a-z0-9]/gi, '').slice(-6).toLowerCase() || crypto.randomBytes(3).toString('hex');
  return cleanTenantSlug(`${base}-${suffix}`);
}

export async function onboardSupabaseUser(accessToken, input = {}, options = {}) {
  const existing = await resolveUjimaMembership(accessToken, options);
  if (!existing.needsOnboarding) return { ...existing, created: false };

  const authUser = existing.authUser;
  const orgName = String(input.orgName || '').trim().slice(0, 160);
  const website = String(input.website || '').trim().slice(0, 500) || null;
  if (!orgName) {
    const error = new Error('ORGANIZATION_NAME_REQUIRED');
    error.status = 400;
    throw error;
  }

  const tenantId = await uniqueTenantId(orgName, authUser.id, options);
  const userId = newId('usr');
  const membershipId = newId('mbr');
  const email = String(authUser.email || '').trim().toLowerCase();
  if (!email) {
    const error = new Error('SUPABASE_EMAIL_REQUIRED');
    error.status = 400;
    throw error;
  }

  const tenantRows = await restInsert('tenants', [{
    id: tenantId,
    org_name: orgName,
    status: 'active',
    profile: { website, onboarding_source: 'supabase_self_service', created_by_auth_user: authUser.id }
  }], options);
  try {
    const userRows = await restInsert('users', [{
      id: userId,
      tenant_id: tenantId,
      auth_user_id: authUser.id,
      email,
      role: 'owner',
      display_name: String(input.displayName || authUser.user_metadata?.full_name || '').trim().slice(0, 160) || null
    }], options);
    const membershipRows = await restInsert('memberships', [{
      id: membershipId,
      tenant_id: tenantId,
      user_id: userId,
      role: 'owner'
    }], options);
    return {
      authUser,
      tenant: Array.isArray(tenantRows) ? tenantRows[0] : { id: tenantId, org_name: orgName, status: 'active' },
      membership: {
        ...(Array.isArray(membershipRows) ? membershipRows[0] : { id: membershipId, tenant_id: tenantId, user_id: userId, role: 'owner' }),
        user: Array.isArray(userRows) ? userRows[0] : { id: userId, tenant_id: tenantId, email, role: 'owner' }
      },
      needsOnboarding: false,
      created: true
    };
  } catch (error) {
    // Do not pretend a partial tenant bootstrap completed. A cleanup/migration
    // process may reconcile an orphan tenant; this endpoint returns failure.
    error.message = `UJIMA_ONBOARDING_PARTIAL_FAILURE:${error.message}`;
    throw error;
  }
}
