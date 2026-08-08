-- Explicitly assign the federation record to Agenix Governor.
-- The Hive database stores cross-provider coordination state only; it must not shadow provider-private state.

insert into agenix_hive.state_domains (domain_key, owner_provider_id, description, write_policy)
select
  'federation_record',
  p.id,
  'Cross-provider commands, correlations, leases, events, receipts, artifacts and approvals',
  '{"cross_provider_write":"service_contract_only","private_state_copy":"deny"}'::jsonb
from agenix_hive.providers p
where p.provider_key = 'agenix-governor'
on conflict (domain_key) do update set
  owner_provider_id = excluded.owner_provider_id,
  description = excluded.description,
  write_policy = excluded.write_policy,
  updated_at = now();
