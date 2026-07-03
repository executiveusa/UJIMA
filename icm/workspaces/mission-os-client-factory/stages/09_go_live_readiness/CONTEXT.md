# 09_go_live_readiness — Final Gate Before Live Deployment

This is the last stop before a live VPS deployment. Every item must pass. No exceptions.

## Inputs

- All prior stage outputs (00–08)
- docs/SECURITY-CHECKLIST.md
- docs/PRODUCTION-GAPS.md

## Process

1. Run the full validation sequence:
   npm test                                           # all tests must pass
   npm run build                                      # build must succeed
   node missionctl/missionctl.mjs doctor              # all checks must pass
   node scripts/secret-audit.mjs                     # 0 findings
   node scripts/verify-v06.mjs                       # 8/8 gates
   node missionctl/missionctl.mjs bundle smoke <slug> --dry-run  # 0 failures

2. Check all items in docs/SECURITY-CHECKLIST.md against this deployment.

3. Verify tenant isolation:
   - Confirm <slug> cannot read another tenant's mission-data/
   - Confirm ICM workspace is in icm/tenants/<slug>/ only

4. Confirm all factory stage outputs are complete:
   - stages/00_intake/output/intake-form.md — exists and complete
   - stages/01_tenant_profile/output/tenant-profile-summary.md — exists
   - stages/02_knowledge_ingestion/output/knowledge-summary.md — exists
   - stages/03_policy_and_approvals/output/approval-policy.md — exists and client-approved
   - stages/04_agent_pack/output/agent-pack-review.md — exists, pack validate passed
   - stages/05_asset_generation/output/asset-generation-report.md — exists, smoke passed
   - stages/06_ops_dashboard_setup/output/dashboard-review.md — exists, all routes pass
   - stages/07_vps_deployment_plan/output/vps-deployment-plan.md — exists, client confirmed
   - stages/08_training_and_handoff/output/operator-handoff-checklist.md — fully checked

5. Write output/go-live-readiness.md with pass/fail for every item above.

## Outputs

- output/go-live-readiness.md — final readiness checklist with pass/fail per item
- output/audit.json — validation run results, timestamp, operator

## Human review gate

This gate requires sign-off from:
1. Operator (technical readiness)
2. Client authorized representative (readiness to receive live system)

Both must explicitly approve output/go-live-readiness.md before any live deployment begins.

Approval is **orange class** — requires a recorded approval decision.

## Allowed tools

- npm test, npm run build, missionctl doctor, scripts/* (validation tools only)
- File read of all prior stage outputs
- File write to output/

## Forbidden actions

- Do not proceed to live VPS deployment without both sign-offs
- Do not skip any validation step
- Do not mark any check as "passed" without running it
- Do not grant production database or API credentials before both sign-offs are recorded

## Validation

- All six validation commands pass with 0 failures
- go-live-readiness.md has no unchecked items
- Both operator and client rep have signed off

## Done when

go-live-readiness.md is complete with all items passing. Both sign-offs are recorded. Live VPS deployment may begin.

**This is a spec-only gate in Phase 9A. Live deployment is deferred until explicit Architect approval.**
