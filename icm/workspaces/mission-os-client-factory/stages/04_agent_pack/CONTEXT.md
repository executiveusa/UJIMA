# 04_agent_pack — Agent Pack Generation and Validation

Generate and validate the tenant agent pack. This is the configuration that drives Hermes and all managed agents.

## Inputs

- stages/03_policy_and_approvals/output/approval-policy.md
- icm/tenants/<slug>/_config/*
- docs/TENANT-AGENT-PACK.md

## Process

1. Run: missionctl pack generate <slug>
2. Run: missionctl pack validate <slug>
3. Review mission-data/<slug>/tenant-agent-pack/manifest.yaml for correctness:
   - Agent roles match org's actual staff structure
   - Skill assignments reflect what the org actually needs (grants, campaigns, comms, etc.)
   - LiteLLM model routing matches budget and use case
   - Approval policy in manifest matches approval-policy.md from stage 03
4. Review each skill file in mission-data/<slug>/tenant-agent-pack/hermes/skills/
5. Note any skills that need customization for this client.
6. Write output/agent-pack-review.md with a skill-by-skill assessment.

## Outputs

- output/agent-pack-review.md — manifest review, skill assessment, customization notes
- output/audit.json — commands run, validation result

## Human review gate

Operator reviews agent-pack-review.md and confirms:
- pack validate passed with no errors
- All skill definitions are appropriate for this org (no skills for workflows they don't have)
- Model routing is set to the correct budget tier for this client
- Any customized skills are noted for next steps

Do not proceed to 05_asset_generation until pack validate passes and operator signs off.

## Allowed tools

- missionctl pack generate <slug>
- missionctl pack validate <slug>
- File read of generated pack files

## Forbidden actions

- Do not add skills for workflows the client has not approved
- Do not lower approval thresholds from what was set in stage 03
- Do not modify manifest.yaml directly — use missionctl commands

## Validation

- missionctl pack generate ran without error
- missionctl pack validate passed
- manifest.yaml exists at mission-data/<slug>/tenant-agent-pack/manifest.yaml
- agent-pack-review.md covers all skills in the pack

## Done when

missionctl pack validate passes. Operator has reviewed and approved agent-pack-review.md.
