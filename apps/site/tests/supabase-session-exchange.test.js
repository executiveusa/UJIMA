import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { onboardSupabaseUser, resolveUjimaMembership } from '../../../services/mission-api/src/supabase-session-exchange.js';

function response(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

describe('Supabase to UJIMA session identity bridge', () => {
  it('resolves tenant identity from verified Supabase user without trusting browser tenant input', async () => {
    const calls = [];
    const fetchImpl = async (url, options = {}) => {
      calls.push({ url: String(url), options });
      if (String(url).endsWith('/auth/v1/user')) return response({ id: 'auth-1', email: 'owner@example.org' });
      if (String(url).includes('/rest/v1/users?')) return response([{ id: 'usr_1', tenant_id: 'hope-center', email: 'owner@example.org', role: 'owner', display_name: 'Owner' }]);
      if (String(url).includes('/rest/v1/memberships?')) return response([{ id: 'mbr_1', tenant_id: 'hope-center', user_id: 'usr_1', role: 'owner' }]);
      if (String(url).includes('/rest/v1/tenants?')) return response([{ id: 'hope-center', org_name: 'Hope Center', status: 'active', profile: {} }]);
      throw new Error('UNEXPECTED_FETCH:' + url);
    };

    const result = await resolveUjimaMembership('supabase-access-token', {
      supabaseUrl: 'https://supabase.test',
      serviceRoleKey: 'server-only-service-key',
      fetchImpl
    });

    expect(result.needsOnboarding).toBe(false);
    expect(result.tenant).toMatchObject({ id: 'hope-center', org_name: 'Hope Center' });
    expect(result.membership).toMatchObject({ tenant_id: 'hope-center', role: 'owner' });
    expect(calls[0].options.headers.Authorization).toBe('Bearer supabase-access-token');
    expect(calls.slice(1).every((call) => call.options.headers.Authorization === 'Bearer server-only-service-key')).toBe(true);
  });

  it('returns needsOnboarding when the verified Supabase identity has no UJIMA user mapping', async () => {
    const fetchImpl = async (url) => {
      if (String(url).endsWith('/auth/v1/user')) return response({ id: 'auth-new', email: 'new@example.org' });
      if (String(url).includes('/rest/v1/users?')) return response([]);
      throw new Error('UNEXPECTED_FETCH:' + url);
    };

    const result = await resolveUjimaMembership('token', {
      supabaseUrl: 'https://supabase.test',
      serviceRoleKey: 'service',
      fetchImpl
    });

    expect(result.needsOnboarding).toBe(true);
    expect(result.authUser.email).toBe('new@example.org');
    expect(result.membership).toBeNull();
  });

  it('provisions a new nonprofit tenant, user, and owner membership from verified identity', async () => {
    const writes = [];
    let userLookupCount = 0;
    const fetchImpl = async (url, options = {}) => {
      const value = String(url);
      if (value.endsWith('/auth/v1/user')) return response({ id: 'auth-new-123456', email: 'founder@example.org', user_metadata: { full_name: 'Founder' } });
      if (value.includes('/rest/v1/users?')) {
        userLookupCount += 1;
        return response([]);
      }
      if (value.includes('/rest/v1/tenants?') && (options.method || 'GET') === 'GET') return response([]);
      if ((options.method || 'GET') === 'POST') {
        const table = value.split('/rest/v1/')[1];
        const body = JSON.parse(options.body);
        writes.push({ table, body });
        return response(body, 201);
      }
      throw new Error('UNEXPECTED_FETCH:' + url);
    };

    const result = await onboardSupabaseUser('token', {
      orgName: 'New World Learning',
      website: 'https://example.org'
    }, {
      supabaseUrl: 'https://supabase.test',
      serviceRoleKey: 'service',
      fetchImpl
    });

    expect(userLookupCount).toBe(1);
    expect(result.created).toBe(true);
    expect(result.tenant.id).toBe('new-world-learning');
    expect(result.membership.role).toBe('owner');
    expect(writes.map((write) => write.table)).toEqual(['tenants', 'users', 'memberships']);
    expect(writes[0].body[0].profile).toMatchObject({ website: 'https://example.org', onboarding_source: 'supabase_self_service' });
    expect(writes[1].body[0].auth_user_id).toBe('auth-new-123456');
  });
});

describe('canonical Supabase bootstrap guard', () => {
  it('keeps valid DO block termination and the runtime role vocabulary', () => {
    const sql = fs.readFileSync('db/supabase/0001_ujima_canonical.sql', 'utf8');
    expect(sql).not.toContain('end $;');
    expect(sql).toContain('end $$;');
    for (const role of ['executive_director','program_director','volunteer_manager','finance']) {
      expect(sql).toContain(`'${role}'`);
    }
  });
});
