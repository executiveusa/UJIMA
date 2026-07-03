# 02_knowledge_ingestion — Reference Material Upload

Populate the tenant ICM workspace with stable reference material the agent will use on every task.

## Inputs

- stages/01_tenant_profile/output/tenant-profile-summary.md
- Client-provided documents: annual report, strategic plan, grant history, program descriptions, brand guide
- icm/tenants/<slug>/_config/ (already initialized in stage 01)

## Process

1. Read all client-provided documents (operator uploads or pastes content).
2. Distill key facts into icm/tenants/<slug>/_config/:
   - mission.md: mission statement, vision, values, theory of change
   - brand.md: voice, tone, prohibited language, accessibility notes
   - grant-criteria.md: past funders, typical grant size, eligibility patterns
   - safety-policy.md: red/orange categories specific to this org (youth records, sensitive populations)
   - seattle-resources.md: known local funders, partners, city/county programs relevant to this org
3. Write a knowledge-summary.md listing all documents ingested and key facts extracted.
4. Note any gaps: missing info that would normally appear in a config file.

## Outputs

- output/knowledge-summary.md — list of ingested documents, key facts, gaps
- output/audit.json — ingestion metadata, source list, operator

## Human review gate

Operator reviews knowledge-summary.md and confirms:
- All key config files reflect accurate client information
- No placeholder text remains ("Replace this with..." is removed or intentional)
- Gaps are documented and acceptable before proceeding
- No sensitive data (SSNs, financial account numbers, youth records) was written into config files

Do not proceed to 03_policy_and_approvals until operator signs off.

## Allowed tools

- File write to icm/tenants/<slug>/_config/
- File read of client-provided documents
- Web lookup (read-only) to verify public org info

## Forbidden actions

- Do not write youth records, SSNs, medical info, or financial account numbers into any config file
- Do not commit raw client documents to git
- Do not infer facts not present in provided material without marking them as inferred

## Validation

- All five _config files (mission, brand, grant-criteria, safety-policy, model-routing) are non-empty
- knowledge-summary.md documents at least one source per config file
- No config file contains the phrase "Replace this with"

## Done when

Operator has approved knowledge-summary.md. All _config files contain real client content, not template placeholders.
