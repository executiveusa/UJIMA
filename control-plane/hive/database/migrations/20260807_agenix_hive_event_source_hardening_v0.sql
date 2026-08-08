-- Cross-provider events must always identify a registered source provider.
-- Human input enters through command records; it does not create anonymous provider events.

alter table agenix_hive.events
  alter column source_provider_id set not null;

comment on column agenix_hive.events.source_provider_id is
  'Registered Hive provider that emitted the event. Human input enters through commands; cross-provider events must always have a provider source.';
