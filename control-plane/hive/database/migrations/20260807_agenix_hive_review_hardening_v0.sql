-- Code-review hardening for federation history and event idempotency.

-- Federation proof/history is immutable. Runs are retired by status, not physically removed
-- while evidence, approvals, events or context snapshots reference them.
alter table agenix_hive.events drop constraint events_run_id_fkey;
alter table agenix_hive.events
  add constraint events_run_id_fkey foreign key (run_id)
  references agenix_hive.runs(id) on delete restrict;

alter table agenix_hive.evidence_receipts drop constraint evidence_receipts_run_id_fkey;
alter table agenix_hive.evidence_receipts
  add constraint evidence_receipts_run_id_fkey foreign key (run_id)
  references agenix_hive.runs(id) on delete restrict;

alter table agenix_hive.approvals drop constraint approvals_run_id_fkey;
alter table agenix_hive.approvals
  add constraint approvals_run_id_fkey foreign key (run_id)
  references agenix_hive.runs(id) on delete restrict;

alter table agenix_hive.context_snapshots drop constraint context_snapshots_run_id_fkey;
alter table agenix_hive.context_snapshots
  add constraint context_snapshots_run_id_fkey foreign key (run_id)
  references agenix_hive.runs(id) on delete restrict;

-- Store the event-envelope provider key immutably. The UUID link is navigational and may
-- become null if a provider registration is removed; idempotency never depends on it.
alter table agenix_hive.events add column source_provider_key text;
update agenix_hive.events e
set source_provider_key = p.provider_key
from agenix_hive.providers p
where p.id = e.source_provider_id;
alter table agenix_hive.events alter column source_provider_key set not null;
alter table agenix_hive.events drop constraint events_source_provider_id_idempotency_key_key;
alter table agenix_hive.events
  add constraint events_source_provider_key_idempotency_key_key
  unique (source_provider_key, idempotency_key);
alter table agenix_hive.events alter column source_provider_id drop not null;
comment on column agenix_hive.events.source_provider_key is
  'Immutable provider key from the event envelope; retained even if the provider registry row is later removed.';

-- This cleanup converges the already-applied Botanic registration. Reusable migrations must
-- not persist environment-specific project references.
update platform.app_registry
set metadata = metadata - 'project_ref', updated_at = now()
where app_slug = 'agenix-hive';
