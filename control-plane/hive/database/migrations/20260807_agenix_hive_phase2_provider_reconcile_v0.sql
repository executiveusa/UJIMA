-- Reconcile Phase 2 provider registry to merged owner-repo manifests.

update agenix_hive.providers
set interfaces='{"api":"http://127.0.0.1:4788","mcp":false,"cli":false,"browser":false,"gui":false}'::jsonb,
    manifest=manifest || '{"repo_manifest_path":".agenix/hive-provider.json","merged_sha":"3ae561888599a759aef98caf3b80c15222e2c3fc","director_status":"video.edit.propose excluded until implemented"}'::jsonb,
    updated_at=now()
where provider_key='montage';

update agenix_hive.provider_capabilities pc
set enabled=false,
    config=pc.config || '{"status":"planned","reason":"Director proposal engine not implemented yet"}'::jsonb,
    updated_at=now()
from agenix_hive.providers p, agenix_hive.capabilities c
where pc.provider_id=p.id and pc.capability_id=c.id
  and p.provider_key='montage' and c.capability_key='video.edit.propose';

update agenix_hive.provider_capabilities pc
set interface_order='["api"]'::jsonb,
    config=(pc.config - 'mcp') || '{"registration":"repo_manifest","manifest_path":".agenix/hive-provider.json"}'::jsonb,
    updated_at=now()
from agenix_hive.providers p, agenix_hive.capabilities c
where pc.provider_id=p.id and pc.capability_id=c.id
  and p.provider_key='montage'
  and c.capability_key in ('video.ingest','video.transcribe','video.edit.apply','video.render','video.verify');

update agenix_hive.provider_health h
set status='unknown',
    details=h.details || '{"manifest_merged":true,"manifest_sha":"3ae561888599a759aef98caf3b80c15222e2c3fc","health_target":"http://127.0.0.1:4788/health","runtime_probe":"pending_on_owner_machine"}'::jsonb,
    updated_at=now()
from agenix_hive.providers p
where h.provider_id=p.id and p.provider_key='montage';

update agenix_hive.providers
set interfaces='{"api":false,"mcp":false,"cli":true,"browser":false,"gui":false}'::jsonb,
    manifest=manifest || '{"repo_manifest_path":".agenix/capabilities.json","merged_sha":"b22311637cf11888f2cc0975617867483dc25ed1","browser_status":"disabled_until_bounded_worker","gui_status":"disabled_until_bounded_worker"}'::jsonb,
    updated_at=now()
where provider_key='open-interpreter';

update agenix_hive.provider_capabilities pc
set interface_order='["cli"]'::jsonb,
    config=(pc.config - 'mcp') || '{"registration":"repo_manifest","manifest_path":".agenix/capabilities.json","runtime_probe":"pending"}'::jsonb,
    updated_at=now()
from agenix_hive.providers p
where pc.provider_id=p.id and p.provider_key='open-interpreter';

update agenix_hive.provider_health h
set status='unknown',
    details=h.details || '{"manifest_merged":true,"manifest_sha":"b22311637cf11888f2cc0975617867483dc25ed1","runtime_probe":"pending_on_owner_machine","vercel_status":"deferred_unrelated_legacy_config"}'::jsonb,
    updated_at=now()
from agenix_hive.providers p
where h.provider_id=p.id and p.provider_key='open-interpreter';

-- Darya/OpenHands remains centrally registered but disabled for routing until a compliant
-- runtime satisfies its repo-local AGENTS precondition before mutation.
update agenix_hive.provider_capabilities pc
set enabled=false,
    config=pc.config || '{"status":"deferred","reason":"repo AGENTS requires make install-pre-commit-hooks before mutation","target_phase":"phase6-openhands-worker"}'::jsonb,
    updated_at=now()
from agenix_hive.providers p
where pc.provider_id=p.id and p.provider_key='darya-openhands';

update agenix_hive.providers
set manifest=manifest || '{"repo_local_manifest_status":"deferred","target_phase":"phase6-openhands-worker","routing_enabled":false}'::jsonb,
    updated_at=now()
where provider_key='darya-openhands';

update agenix_hive.provider_health h
set status='unknown',
    details=h.details || '{"routing_enabled":false,"bootstrap":"deferred_to_compliant_openhands_runtime"}'::jsonb,
    updated_at=now()
from agenix_hive.providers p
where h.provider_id=p.id and p.provider_key='darya-openhands';
