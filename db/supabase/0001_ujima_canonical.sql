-- UJIMA canonical Supabase bootstrap v1
-- Fresh-project bootstrap for the dedicated UJIMA Supabase project.
-- This intentionally standardizes on text tenant IDs (for example: asc3nd)
-- because that is what the current UJIMA repository layer uses.
--
-- Security baseline:
-- - public tables are RLS-enabled;
-- - anon/authenticated receive no direct table mutation privileges;
-- - service_role is the only Data API role granted full table access;
-- - client-facing reads/writes go through UJIMA's mission API until explicit
--   per-table policies are added later;
-- - secrets are never stored in sync_sources or source_mirrors.

create schema if not exists ujima_private;

revoke all on schema ujima_private from public, anon, authenticated;
grant usage on schema ujima_private to service_role;

-- Prevent accidental exposure of future objects in public.
alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke usage, select on sequences from anon, authenticated;
alter default privileges for role postgres
  revoke execute on functions from public;
alter default privileges for role postgres in schema public
  revoke execute on functions from anon, authenticated;

create table if not exists public.tenants (
  id text primary key,
  org_name text not null,
  profile jsonb not null default '{}'::jsonb,
  status text not null default 'active'
    check (status in ('active','paused','archived')),
  source_system text,
  source_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.users (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  email text not null,
  role text not null check (role in (
    'owner','operator','programs','comms','grants',
    'executive_director','program_director','volunteer_manager','finance',
    'board_member','reviewer','readonly',
    'director','staff','board','volunteer','read_only'
  )),
  display_name text,
  created_at timestamptz not null default now(),
  unique (tenant_id, email)
);
create unique index if not exists users_tenant_email_lower_uidx
  on public.users (tenant_id, lower(email));

create table if not exists public.memberships (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  user_id text not null references public.users(id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);
create index if not exists memberships_tenant_idx on public.memberships(tenant_id);
create index if not exists memberships_user_idx on public.memberships(user_id);

create table if not exists public.invites (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  email text not null,
  role text not null,
  token_hash text not null unique,
  invited_by text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists invites_tenant_idx on public.invites(tenant_id);
create index if not exists invites_token_idx on public.invites(token_hash);

create table if not exists public.sessions (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  tenant_id text not null references public.tenants(id) on delete cascade,
  session_token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists sessions_tenant_idx on public.sessions(tenant_id);
create index if not exists sessions_token_idx on public.sessions(session_token_hash);

create table if not exists public.operator_keys (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  label text not null,
  scopes text[] not null default '{}',
  key_hash text not null unique,
  created_by text not null,
  created_at timestamptz not null default now()
);
create index if not exists operator_keys_tenant_idx on public.operator_keys(tenant_id);
create index if not exists operator_keys_hash_idx on public.operator_keys(key_hash);

create table if not exists public.tenant_keys (
  tenant_id text primary key references public.tenants(id) on delete cascade,
  public_key text not null,
  secret_key_hash text not null,
  allowed_origins text[] not null default '{}',
  api_base_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  display_name text not null,
  email text,
  phone text,
  role text not null default 'community',
  organization text,
  tags text[] not null default '{}',
  consent jsonb not null default '{}'::jsonb,
  source text,
  notes text,
  source_system text,
  source_ref text,
  source_updated_at timestamptz,
  authoritative boolean not null default false,
  sensitivity text not null default 'internal'
    check (sensitivity in ('public','internal','restricted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists contacts_tenant_idx on public.contacts(tenant_id);
create index if not exists contacts_tenant_email_idx on public.contacts(tenant_id, email);
create unique index if not exists contacts_source_ref_uidx
  on public.contacts(tenant_id, source_system, source_ref)
  where source_system is not null and source_ref is not null;

create table if not exists public.organizations (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  name text not null,
  kind text not null default 'community',
  website text,
  source_system text,
  source_ref text,
  authoritative boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists organizations_tenant_idx on public.organizations(tenant_id);
create unique index if not exists organizations_source_ref_uidx
  on public.organizations(tenant_id, source_system, source_ref)
  where source_system is not null and source_ref is not null;

create table if not exists public.interactions (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  contact_id text references public.contacts(id) on delete set null,
  channel text not null default 'web',
  direction text not null default 'inbound',
  subject text,
  body text,
  source text,
  metadata jsonb not null default '{}'::jsonb,
  at timestamptz not null default now()
);
create index if not exists interactions_tenant_idx
  on public.interactions(tenant_id, at desc);

create table if not exists public.pipeline_items (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  pipeline text not null,
  stage text not null,
  title text not null,
  contact_id text references public.contacts(id) on delete set null,
  organization_id text references public.organizations(id) on delete set null,
  value numeric,
  source text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists pipeline_tenant_idx
  on public.pipeline_items(tenant_id, pipeline, created_at desc);

create table if not exists public.tasks (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  title text not null,
  type text not null,
  contact_id text references public.contacts(id) on delete set null,
  pipeline_item_id text references public.pipeline_items(id) on delete set null,
  due_at timestamptz,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tasks_tenant_idx
  on public.tasks(tenant_id, status, created_at desc);

create table if not exists public.approvals (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  status text not null default 'pending',
  risk text not null check (risk in ('green','yellow','orange','red')),
  title text not null,
  summary text,
  payload jsonb not null default '{}'::jsonb,
  execution_policy jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by text
);
create index if not exists approvals_tenant_status_idx
  on public.approvals(tenant_id, status);

create table if not exists public.outbox_events (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  type text not null,
  adapter text,
  approval_id text references public.approvals(id) on delete set null,
  risk text not null default 'yellow',
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending_approval',
  attempts integer not null default 0,
  result jsonb not null default '{}'::jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists outbox_tenant_status_idx
  on public.outbox_events(tenant_id, status, created_at);

create table if not exists public.audit_events (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  actor_id text,
  event text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_events_tenant_time_idx
  on public.audit_events(tenant_id, created_at desc);

create table if not exists public.typed_event_journal (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  type text not null,
  version text not null default '1',
  correlation_id text not null,
  trace_id text,
  actor text not null,
  subject text,
  payload jsonb not null default '{}'::jsonb,
  redacted_keys text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists typed_event_journal_tenant_type_idx
  on public.typed_event_journal(tenant_id, type, created_at desc);

create table if not exists public.approval_requests (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  action_type text not null,
  action_payload jsonb not null default '{}'::jsonb,
  approval_class text not null check (approval_class in ('green','yellow','orange','red')),
  status text not null default 'draft'
    check (status in ('draft','review','approved','rejected','executing','executed','verified','failed','logged')),
  requester text not null,
  approver text,
  comments text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists approval_requests_tenant_status_idx
  on public.approval_requests(tenant_id, status);

create table if not exists public.artifacts (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  run_id text,
  approval_id text references public.approval_requests(id) on delete set null,
  kind text not null,
  title text not null,
  mime_type text not null default 'application/json',
  storage_backend text not null default 'file',
  storage_path text not null,
  checksum_sha256 text not null,
  approval_class text not null default 'green',
  approval_status text not null default 'approved',
  source_refs jsonb not null default '[]'::jsonb,
  trace_id text,
  model_route text,
  created_by text not null,
  created_at timestamptz not null default now()
);
create index if not exists artifacts_tenant_kind_idx
  on public.artifacts(tenant_id, kind, created_at desc);

create table if not exists public.managed_agents (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  agent_slug text not null,
  agent_type text not null,
  status text not null default 'active',
  runtime text not null default 'node',
  profile jsonb not null default '{}'::jsonb,
  pack_version text not null default '1.0.0',
  health_status text not null default 'ok',
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, agent_slug)
);
create index if not exists managed_agents_tenant_idx
  on public.managed_agents(tenant_id, status);

create table if not exists public.managed_agent_runs (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  agent_id text not null references public.managed_agents(id) on delete cascade,
  status text not null default 'running',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  error text
);
create index if not exists managed_agent_runs_tenant_idx
  on public.managed_agent_runs(tenant_id, started_at desc);

create table if not exists public.managed_agent_health (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  agent_slug text not null,
  health_status text not null,
  check_output text,
  timestamp timestamptz not null default now()
);
create index if not exists managed_agent_health_tenant_idx
  on public.managed_agent_health(tenant_id, timestamp desc);

-- Authenticated Lab compatibility bridge.
-- These tables preserve the current private UJIMA Lab while the client-facing
-- chat migrates fully behind the canonical mission API. They are intentionally
-- user-scoped and must not become a tenant truth store.

create table if not exists public.ujima_workspaces (
  id text primary key,
  name text not null,
  summary text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ujima_conversations (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null references public.ujima_workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ujima_conversations_user_updated_idx
  on public.ujima_conversations(user_id, updated_at desc);

create table if not exists public.ujima_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ujima_conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant','system','tool')),
  content text not null,
  route text,
  created_at timestamptz not null default now()
);
create index if not exists ujima_messages_conversation_created_idx
  on public.ujima_messages(conversation_id, created_at);

create table if not exists public.ujima_model_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null references public.ujima_conversations(id) on delete cascade,
  route text,
  provider text,
  model text,
  status text not null default 'completed',
  created_at timestamptz not null default now()
);
create index if not exists ujima_model_runs_user_created_idx
  on public.ujima_model_runs(user_id, created_at desc);

insert into public.ujima_workspaces (id, name, summary, status)
values (
  'ujima-lab',
  'UJIMA Lab',
  'Private test workspace for chat, goals, workflows, and model routing.',
  'active'
)
on conflict (id) do update
set name = excluded.name,
    summary = excluded.summary,
    status = excluded.status,
    updated_at = now();

-- Compatibility/product tables retained from the earlier UJIMA schema.
create table if not exists public.workflows (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  stage text not null,
  status text not null default 'queued',
  risk text not null default 'yellow',
  input jsonb not null default '{}'::jsonb,
  output_path text,
  approval_id text references public.approvals(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunities (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  source_id text not null,
  score numeric not null default 0,
  status text not null default 'watching',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  status text not null default 'draft',
  topic text not null,
  payload jsonb not null default '{}'::jsonb,
  approval_id text references public.approvals(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.calls (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  source text not null default 'voice-webhook',
  caller text,
  transcript text,
  followup_status text not null default 'logged',
  created_at timestamptz not null default now()
);

create table if not exists public.vault_notes (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  title text not null,
  path text not null,
  body text,
  tags text[] not null default '{}',
  source text not null default 'manual',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (tenant_id, path)
);

create table if not exists public.outcomes (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  lane text not null,
  value numeric not null default 0,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists workflows_tenant_stage_idx on public.workflows(tenant_id, stage);
create index if not exists opportunities_tenant_status_idx on public.opportunities(tenant_id, status);
create index if not exists campaigns_tenant_status_idx on public.campaigns(tenant_id, status);
create index if not exists calls_tenant_created_idx on public.calls(tenant_id, created_at desc);
create index if not exists outcomes_tenant_lane_idx on public.outcomes(tenant_id, lane);

-- Cross-system synchronization. These are mirrors/receipts, never tenant truth.
create table if not exists public.sync_sources (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  source_system text not null,
  project_ref text,
  schema_name text,
  status text not null default 'active' check (status in ('active','paused','retired')),
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, source_system)
);

create table if not exists public.sync_receipts (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  source_system text not null,
  idempotency_key text not null,
  event_type text not null,
  source_table text,
  source_record_id text,
  source_updated_at timestamptz,
  status text not null default 'received'
    check (status in ('received','projected','ignored','failed')),
  checksum_sha256 text,
  metadata jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (tenant_id, source_system, idempotency_key)
);
create index if not exists sync_receipts_tenant_status_idx
  on public.sync_receipts(tenant_id, status, received_at);

create table if not exists public.source_mirrors (
  id text primary key,
  tenant_id text not null references public.tenants(id) on delete cascade,
  source_system text not null,
  source_schema text,
  source_table text not null,
  source_record_id text not null,
  entity_type text not null,
  projection jsonb not null default '{}'::jsonb,
  sensitivity text not null default 'internal'
    check (sensitivity in ('public','internal','restricted')),
  source_updated_at timestamptz,
  mirrored_at timestamptz not null default now(),
  authoritative boolean not null default false,
  unique (tenant_id, source_system, source_table, source_record_id)
);
create index if not exists source_mirrors_tenant_entity_idx
  on public.source_mirrors(tenant_id, entity_type, mirrored_at desc);

-- RLS everywhere, including compatibility and sync tables.
do $$
declare
  t text;
begin
  foreach t in array array[
    'tenants','users','memberships','invites','sessions','operator_keys','tenant_keys',
    'contacts','organizations','interactions','pipeline_items','tasks','approvals',
    'outbox_events','audit_events','typed_event_journal','approval_requests','artifacts',
    'managed_agents','managed_agent_runs','managed_agent_health',
    'workflows','opportunities','campaigns','calls','vault_notes','outcomes',
    'sync_sources','sync_receipts','source_mirrors',
    'ujima_workspaces','ujima_conversations','ujima_messages','ujima_model_runs'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('alter table public.%I force row level security', t);
    execute format('revoke all on table public.%I from public, anon, authenticated', t);
    execute format('grant select, insert, update, delete on table public.%I to service_role', t);
  end loop;
end $$;

-- The Lab is an authenticated user-owned compatibility surface only.
grant select on table public.ujima_workspaces to authenticated;
grant select, insert, update, delete on table public.ujima_conversations to authenticated;
grant select, insert, update, delete on table public.ujima_messages to authenticated;
grant select, insert, update, delete on table public.ujima_model_runs to authenticated;

drop policy if exists ujima_workspaces_authenticated_read on public.ujima_workspaces;
create policy ujima_workspaces_authenticated_read
  on public.ujima_workspaces
  for select
  to authenticated
  using ((select auth.uid()) is not null);

drop policy if exists ujima_conversations_owner_all on public.ujima_conversations;
create policy ujima_conversations_owner_all
  on public.ujima_conversations
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists ujima_messages_owner_all on public.ujima_messages;
create policy ujima_messages_owner_all
  on public.ujima_messages
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.ujima_conversations c
      where c.id = ujima_messages.conversation_id
        and c.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.ujima_conversations c
      where c.id = ujima_messages.conversation_id
        and c.user_id = (select auth.uid())
    )
  );

drop policy if exists ujima_model_runs_owner_all on public.ujima_model_runs;
create policy ujima_model_runs_owner_all
  on public.ujima_model_runs
  for all
  to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.ujima_conversations c
      where c.id = ujima_model_runs.conversation_id
        and c.user_id = (select auth.uid())
    )
  )
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.ujima_conversations c
      where c.id = ujima_model_runs.conversation_id
        and c.user_id = (select auth.uid())
    )
  );

-- Future browser-facing access can use these helpers in narrow policies.
create or replace function ujima_private.is_tenant_member(p_tenant_id text)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.memberships m
    join public.users u on u.id = m.user_id
    where m.tenant_id = p_tenant_id
      and u.auth_user_id = (select auth.uid())
  );
$$;

create or replace function ujima_private.has_tenant_role(p_tenant_id text, p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.memberships m
    join public.users u on u.id = m.user_id
    where m.tenant_id = p_tenant_id
      and u.auth_user_id = (select auth.uid())
      and m.role = any(p_roles)
  );
$$;

revoke all on function ujima_private.is_tenant_member(text) from public, anon, authenticated;
revoke all on function ujima_private.has_tenant_role(text,text[]) from public, anon, authenticated;
grant execute on function ujima_private.is_tenant_member(text) to service_role;
grant execute on function ujima_private.has_tenant_role(text,text[]) to service_role;

-- Seed Client 01 without importing private client rows.
insert into public.tenants (
  id, org_name, profile, status, source_system, source_ref
) values (
  'asc3nd',
  'ASC3ND Collective',
  jsonb_build_object(
    'client_number','01',
    'relationship','client',
    'canonical_identity_system','asc3nd-supabase',
    'canonical_public_site','executiveusa/asc3nd-brand-site'
  ),
  'active',
  'asc3nd-supabase',
  'cyxdevcjycmffhmwxojh:asc3nd'
)
on conflict (id) do update
set org_name = excluded.org_name,
    profile = public.tenants.profile || excluded.profile,
    status = excluded.status,
    source_system = excluded.source_system,
    source_ref = excluded.source_ref,
    updated_at = now();

insert into public.sync_sources (
  id, tenant_id, source_system, project_ref, schema_name, status, config
) values (
  'asc3nd-primary',
  'asc3nd',
  'asc3nd-supabase',
  'cyxdevcjycmffhmwxojh',
  'asc3nd',
  'active',
  jsonb_build_object(
    'authority','canonical-client-record',
    'mode','outbox-projection',
    'copy_full_rows',false
  )
)
on conflict (tenant_id, source_system) do update
set project_ref=excluded.project_ref,
    schema_name=excluded.schema_name,
    status=excluded.status,
    config=excluded.config,
    updated_at=now();
