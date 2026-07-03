# 05_asset_generation — Managed Bundle Generation

Generate all managed service config files. Provision Hermes. Verify the bundle smoke passes.

## Inputs

- stages/04_agent_pack/output/agent-pack-review.md
- docs/V0.6-MANAGED-HERMES-BUNDLE.md

## Process

1. Run: missionctl hermes provision <slug>
2. Run: missionctl bundle up <slug> --dry-run
3. Run: missionctl bundle smoke <slug> --dry-run
4. Review handoff/<slug>/managed/ for generated files:
   - docker-compose.managed.yml
   - Caddyfile.managed (domain must match client domain, not demo-pnw.org)
   - litellm/config.yaml (model routing matches stage 04 decisions)
   - hermes/SOUL.md (agent identity matches client org)
5. Confirm all smoke checks pass (81/81 or higher).
6. Note any generated files that need manual customization (domain, email, org name).
7. Write output/asset-generation-report.md with smoke result and customization checklist.

## Outputs

- output/asset-generation-report.md — smoke result, generated file checklist, customization notes
- output/audit.json — commands run, smoke check count, pass/fail

## Human review gate

Operator reviews asset-generation-report.md and confirms:
- bundle smoke passes with 0 failures
- Caddyfile.managed uses the correct client domain (not a placeholder or demo domain)
- Hermes SOUL.md reflects the client org identity
- LiteLLM config uses the agreed model tier
- No real API keys or passwords appear in generated files (env files are gitignored)

Do not proceed to 06_ops_dashboard_setup until smoke passes and operator signs off.

## Allowed tools

- missionctl hermes provision <slug>
- missionctl bundle up <slug> --dry-run
- missionctl bundle smoke <slug> --dry-run
- File read of generated handoff/ files

## Forbidden actions

- Do not run bundle up without --dry-run flag
- Do not commit env files (hermes/env, open-webui/env, langfuse/env)
- Do not populate real API keys into any file at this stage
- Do not push generated config to a live VPS

## Validation

- missionctl hermes provision completed without error
- missionctl bundle smoke passes (0 gated failures)
- handoff/<slug>/managed/docker-compose.managed.yml exists
- Caddyfile.managed domain matches client domain from stage 01

## Done when

bundle smoke passes with 0 failures. Operator has reviewed and signed off on asset-generation-report.md.
