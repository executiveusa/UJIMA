-- Agenix Hive foundation verification.
-- Expected on a clean v0 installation after all three foundation migrations:
-- 22 tables, 22 RLS-enabled tables, 22 read policies, 5 seeded providers,
-- 17 seeded capabilities, 6 canonical state domains and one app-registry row.

select
  (select count(*) from information_schema.tables where table_schema='agenix_hive') as table_count,
  (select count(*) from pg_tables where schemaname='agenix_hive' and rowsecurity) as rls_enabled_count,
  (select count(*) from pg_policies where schemaname='agenix_hive') as policy_count,
  (select count(*) from agenix_hive.providers) as provider_count,
  (select count(*) from agenix_hive.capabilities) as capability_count,
  (select count(*) from agenix_hive.state_domains) as state_domain_count,
  (select count(*) from platform.app_registry where app_slug='agenix-hive' and schema_name='agenix_hive') as app_registry_count;

select d.domain_key, p.provider_key as owner_provider
from agenix_hive.state_domains d
join agenix_hive.providers p on p.id = d.owner_provider_id
order by d.domain_key;

select provider_key, role, status
from agenix_hive.providers
order by provider_key;
