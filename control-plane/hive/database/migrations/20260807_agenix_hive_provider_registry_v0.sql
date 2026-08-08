-- Bind the first Hive providers to the capability vocabulary without claiming runtime health.

insert into agenix_hive.provider_capabilities (provider_id, capability_id, interface_order, config)
select p.id, c.id, v.interface_order::jsonb, v.config::jsonb
from (values
  ('agenix-governor','project.context.load','["api"]','{"registration":"central"}'),
  ('paperclip-hq','work.assign','["api","cli"]','{"registration":"repo_manifest"}'),
  ('darya-openhands','software.inspect','["api","cli"]','{"registration":"central_pending_repo_bootstrap"}'),
  ('darya-openhands','software.implement','["api","cli"]','{"registration":"central_pending_repo_bootstrap"}'),
  ('darya-openhands','software.test','["api","cli"]','{"registration":"central_pending_repo_bootstrap"}'),
  ('darya-openhands','software.pull_request','["api","cli"]','{"registration":"central_pending_repo_bootstrap"}'),
  ('montage','video.ingest','["api","cli"]','{"registration":"repo_manifest","mcp":"probe_required"}'),
  ('montage','video.transcribe','["api","cli"]','{"registration":"repo_manifest","mcp":"probe_required"}'),
  ('montage','video.edit.propose','["api","cli"]','{"registration":"repo_manifest","mcp":"probe_required"}'),
  ('montage','video.edit.apply','["api","cli"]','{"registration":"repo_manifest","mcp":"probe_required"}'),
  ('montage','video.render','["api","cli"]','{"registration":"repo_manifest","mcp":"probe_required"}'),
  ('montage','video.verify','["api","cli"]','{"registration":"repo_manifest","mcp":"probe_required"}'),
  ('open-interpreter','computer.shell.execute','["cli","browser","gui"]','{"registration":"repo_manifest","mcp":"probe_required"}'),
  ('open-interpreter','computer.browser.control','["cli","browser","gui"]','{"registration":"repo_manifest","mcp":"probe_required"}'),
  ('open-interpreter','computer.desktop.control','["cli","gui"]','{"registration":"repo_manifest","mcp":"probe_required"}'),
  ('open-interpreter','computer.files.write','["cli","gui"]','{"registration":"repo_manifest","mcp":"probe_required"}')
) as v(provider_key, capability_key, interface_order, config)
join agenix_hive.providers p on p.provider_key=v.provider_key
join agenix_hive.capabilities c on c.capability_key=v.capability_key
on conflict (provider_id, capability_id) do update set
  enabled=true,
  interface_order=excluded.interface_order,
  config=excluded.config,
  updated_at=now();

insert into agenix_hive.provider_health (provider_id, status, version, details)
select id, 'unknown', version,
       jsonb_build_object('reason','runtime probe not yet completed','registration_phase','provider-registry-v0')
from agenix_hive.providers
on conflict (provider_id) do update set
  version=excluded.version,
  details=excluded.details,
  updated_at=now();

update agenix_hive.providers
set manifest = manifest || jsonb_build_object(
      'hive_manifest_contract','control-plane/hive/contracts/capability-manifest.schema.json',
      'registry_phase','provider-registry-v0'
    ),
    updated_at=now()
where provider_key in ('agenix-governor','paperclip-hq','darya-openhands','montage','open-interpreter');
