id: bead-0011
timestamp: 2026-09-05T09:30:00-06:00
actor: agent
phase: nonprofit operating system skill consolidation
repo: ascend-social-purpose-agentic-systems-
branch: feat/nonprofit-master-operating-system
files_changed:
  - .agents/skills/nonprofit-operating-system/SKILL.md
  - .agents/skills/nonprofit-website/SKILL.md
  - .agents/skills/nonprofit-social/SKILL.md
  - .agents/skills/nonprofit-video/SKILL.md
  - .agents/skills/nonprofit-google-discovery/SKILL.md
  - .agents/skills/nonprofit-crm/SKILL.md
  - .agents/skills/nonprofit-email-followup/SKILL.md
  - .agents/skills/nonprofit-reporting/SKILL.md
  - icm/shared/MASTER-PROJECT-WORKFLOW.md
  - icm/workspaces/mission-os-client-factory/stages/01_tenant_profile/REFERENCE.md
  - icm/workspaces/mission-os-client-factory/stages/04_agent_pack/REFERENCE.md
  - packages/agenix-master-agent-pack/agenix-master-agent-pack.json
decision: Promote the supplied nonprofit operating prompt into the governing nonprofit skill and route seven narrow execution skills beneath it while preserving existing nonprofit-strategy and specialist skills.
reason: Reuse the existing UJIMA skill architecture, reduce future client operating burden, and standardize nonprofit delivery without flattening tenant-specific truth.
rollback_command: git revert <merge-commit-for-nonprofit-master-operating-system>
risks:
  - Shared rules can become generic if tenant truth is not loaded first.
  - Narrow execution skills must not be loaded indiscriminately; stage 04 routing remains case-by-case.
  - This is an operating-system/skill change, not proof that any individual client workflow is live.
next_action: Review the branch diff, validate the portable pack JSON, merge after checks, then apply the master skill to ASC3ND planning without mixing it into the public frontend repo.
human_needed: false
