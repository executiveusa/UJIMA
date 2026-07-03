# 06_ops_dashboard_setup — Ops Dashboard Verification

Create the operator key, verify the ops dashboard reads the tenant's state correctly, and confirm the staff-facing UI is functional.

## Inputs

- stages/05_asset_generation/output/asset-generation-report.md
- docs/OPS-DASHBOARD.md

## Process

1. Run: missionctl operator-key create --tenant <slug> --label "primary-operator"
2. Set OPS_TENANT_ID=<slug> in the local .env or environment.
3. Start Mission OS dev server: npm run dev
4. Navigate to http://localhost:3000/ops
5. Verify each dashboard section loads without errors:
   - /ops — overview panel, no blank sections
   - /ops/agents — shows provisioned Hermes agent
   - /ops/events — shows events from tenant create, pack generate, hermes provision
   - /ops/budgets — shows budget (may be $0 at this point, expected)
   - /ops/health — shows system health status
   - /ops/artifacts — may be empty at this stage (expected)
   - /ops/icm — shows ICM workspace tree for this tenant
   - /ops/deployments — shows deployment state
6. Screenshot or note any UI errors.
7. Write output/dashboard-review.md with pass/fail per section and any issues found.

## Outputs

- output/dashboard-review.md — per-route pass/fail, issues, operator notes
- output/audit.json — commands run, OPS_TENANT_ID used, timestamp

## Human review gate

Operator reviews dashboard-review.md and confirms:
- All required dashboard sections load without errors
- ICM workspace tree is visible in /ops/icm
- Agent list in /ops/agents shows the provisioned Hermes agent
- No operator key is exposed in browser JS (open DevTools → Network → confirm no ok_* tokens)

Do not proceed to 07_vps_deployment_plan until dashboard review passes.

## Allowed tools

- missionctl operator-key create
- npm run dev (local only)
- Browser at localhost:3000

## Forbidden actions

- Do not expose the operator key in any client-side file or browser console
- Do not run on a publicly accessible server at this stage
- Do not share the operator key with client staff until deployment is complete

## Validation

- missionctl operator-key create ran without error
- All /ops/* routes return data without JS errors
- /ops/icm shows the tenant workspace tree
- operator key is not present in browser JS bundles

## Done when

All dashboard sections pass. Operator has reviewed and signed off on dashboard-review.md.
