-- Agenix Hive foundation v0 performance indexes and RLS init-plan optimization.

create index agenix_hive_memberships_user_idx on agenix_hive.memberships(user_id);
create index agenix_hive_provider_capabilities_capability_idx on agenix_hive.provider_capabilities(capability_id);
create index agenix_hive_state_domains_owner_idx on agenix_hive.state_domains(owner_provider_id);
create index agenix_hive_command_sessions_org_idx on agenix_hive.command_sessions(organization_id);
create index agenix_hive_command_sessions_project_idx on agenix_hive.command_sessions(project_id);
create index agenix_hive_command_sessions_user_idx on agenix_hive.command_sessions(user_id);
create index agenix_hive_commands_session_idx on agenix_hive.commands(session_id);
create index agenix_hive_commands_org_idx on agenix_hive.commands(organization_id);
create index agenix_hive_commands_project_idx on agenix_hive.commands(project_id);
create index agenix_hive_commands_correlation_idx on agenix_hive.commands(correlation_id);
create index agenix_hive_runs_org_idx on agenix_hive.runs(organization_id);
create index agenix_hive_runs_project_idx on agenix_hive.runs(project_id);
create index agenix_hive_runs_command_idx on agenix_hive.runs(command_id);
create index agenix_hive_runs_correlation_idx on agenix_hive.runs(correlation_id);
create index agenix_hive_run_steps_provider_idx on agenix_hive.run_steps(provider_id);
create index agenix_hive_resource_leases_run_idx on agenix_hive.resource_leases(run_id);
create index agenix_hive_resource_leases_provider_idx on agenix_hive.resource_leases(provider_id);
create index agenix_hive_events_org_idx on agenix_hive.events(organization_id);
create index agenix_hive_events_project_idx on agenix_hive.events(project_id);
create index agenix_hive_event_deliveries_consumer_idx on agenix_hive.event_deliveries(consumer_provider_id);
create index agenix_hive_artifacts_org_idx on agenix_hive.artifacts(organization_id);
create index agenix_hive_artifacts_project_idx on agenix_hive.artifacts(project_id);
create index agenix_hive_artifacts_run_idx on agenix_hive.artifacts(run_id);
create index agenix_hive_artifacts_step_idx on agenix_hive.artifacts(step_id);
create index agenix_hive_evidence_org_idx on agenix_hive.evidence_receipts(organization_id);
create index agenix_hive_evidence_project_idx on agenix_hive.evidence_receipts(project_id);
create index agenix_hive_evidence_run_idx on agenix_hive.evidence_receipts(run_id);
create index agenix_hive_evidence_step_idx on agenix_hive.evidence_receipts(step_id);
create index agenix_hive_evidence_provider_idx on agenix_hive.evidence_receipts(provider_id);
create index agenix_hive_approvals_org_idx on agenix_hive.approvals(organization_id);
create index agenix_hive_approvals_project_idx on agenix_hive.approvals(project_id);
create index agenix_hive_approvals_provider_idx on agenix_hive.approvals(requested_by_provider);
create index agenix_hive_approvals_decision_by_idx on agenix_hive.approvals(decision_by);
create index agenix_hive_context_org_idx on agenix_hive.context_snapshots(organization_id);
create index agenix_hive_context_project_idx on agenix_hive.context_snapshots(project_id);
create index agenix_hive_context_run_idx on agenix_hive.context_snapshots(run_id);
create index agenix_hive_policy_project_idx on agenix_hive.policy_versions(project_id);
create index agenix_hive_policy_created_by_idx on agenix_hive.policy_versions(created_by);
create index agenix_hive_external_refs_org_idx on agenix_hive.external_refs(organization_id);
create index agenix_hive_external_refs_project_idx on agenix_hive.external_refs(project_id);
create index agenix_hive_audit_org_idx on agenix_hive.audit_log(organization_id);
create index agenix_hive_audit_project_idx on agenix_hive.audit_log(project_id);
create index agenix_hive_audit_run_idx on agenix_hive.audit_log(run_id);

create or replace function agenix_hive_private.is_org_member(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, agenix_hive
as $$
  select exists (
    select 1
    from agenix_hive.memberships m
    where m.organization_id = p_org_id
      and m.user_id = (select auth.uid())
      and m.status = 'active'
  );
$$;

create or replace function agenix_hive_private.is_any_member()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, agenix_hive
as $$
  select exists (
    select 1
    from agenix_hive.memberships m
    where m.user_id = (select auth.uid())
      and m.status = 'active'
  );
$$;

alter policy memberships_member_read on agenix_hive.memberships
using (user_id = (select auth.uid()) or agenix_hive_private.is_org_member(organization_id));
