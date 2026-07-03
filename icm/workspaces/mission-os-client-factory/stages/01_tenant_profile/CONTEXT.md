# 01_tenant_profile — Tenant Configuration

Convert intake data into a Mission OS tenant profile. Generate the tenant slug and all configuration files.

## Inputs

- stages/00_intake/output/intake-form.md
- icm/tenant-template/_config/* (template reference)

## Process

1. Derive a clean slug from the org name: lowercase, hyphens only, 3–30 chars.
2. Run: missionctl tenant create <slug> --org "Org Name" --domain "https://client.org"
3. Confirm mission-data/<slug>/profile.json was created.
4. Fill icm/tenants/<slug>/_config/mission.md from intake mission statement.
5. Fill icm/tenants/<slug>/_config/brand.md from intake notes (voice, tone, visual direction).
6. Fill icm/tenants/<slug>/_config/safety-policy.md — confirm red/orange action categories.
7. Fill icm/tenants/<slug>/_config/model-routing.md — confirm model tier preferences.
8. Record the slug, org name, domain, and config file locations in output/tenant-profile-summary.md.

## Outputs

- output/tenant-profile-summary.md — slug, org name, domain, config paths, notes
- output/audit.json — command run, timestamp, operator

## Human review gate

Operator reviews tenant-profile-summary.md and confirms:
- Slug is correct and does not conflict with existing tenants
- mission.md accurately reflects client mission
- safety-policy.md red/orange categories are appropriate for this org type
- Domain is confirmed available or already owned

Do not proceed to 02_knowledge_ingestion until operator signs off.

## Allowed tools

- missionctl tenant create (dry-run safe)
- File write to icm/tenants/<slug>/_config/
- File read to verify profile.json creation

## Forbidden actions

- Do not use a slug that contains real client PII or financial data
- Do not commit mission-data/ runtime files to git
- Do not purchase or transfer domain names

## Validation

- missionctl tenant create ran without error
- mission-data/<slug>/profile.json exists
- icm/tenants/<slug>/ directory exists with _config/ files populated
- Slug passes cleanTenantSlug() validation (no special chars, not empty)

## Done when

Operator has approved tenant-profile-summary.md. All _config files are non-empty. tenant create succeeded.
