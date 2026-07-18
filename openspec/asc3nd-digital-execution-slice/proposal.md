# ASC3ND Digital Execution Slice

## Exact objective

Deliver one verified vertical slice for ASC3ND that turns approved event facts into an execution-ready campaign package, stops at a human approval gate, and produces a release manifest suitable for a future Postiz adapter.

## Commercial value

This slice supports the active client engagement by reducing campaign planning time, protecting youth-serving operations, producing reusable documentary assets, and creating the first repeatable delivery system that can later serve additional clients.

## Scope

1. Install the ASC3ND Executive Creative Director persona in the existing tenant ICM workspace.
2. Add the Creative Operating System as stable Layer 3 reference material.
3. Upgrade campaign creation to output concrete briefs, schedules, production plans, measurement plans, claims registers, and publishing manifests.
4. Upgrade the approval gate to enforce explicit human approval and release controls.
5. Create a structured source-of-truth file for the 2026 back-to-school campaign.
6. Add validation tests or doctor checks for the required ASC3ND campaign and approval artifacts.

## Likely files affected

- `icm/tenants/asc3nd/AGENT.md`
- `icm/tenants/asc3nd/_config/creative-operating-system.md`
- `icm/tenants/asc3nd/stages/04_campaign_creation/CONTEXT.md`
- `icm/tenants/asc3nd/stages/05_approval_gate/CONTEXT.md`
- `icm/tenants/asc3nd/campaigns/back-to-school-2026/source-of-truth.md`
- ICM tests or doctor checks

## Dependencies

- Existing ICM stage runner
- Existing approval and audit concepts
- Verified event facts supplied by ASC3ND leadership
- Future Postiz credentials and adapter implementation are explicitly outside this slice

## Acceptance criteria

- The active ASC3ND agent identity contains the Executive Creative Director role, GRILL gate, documentary law, taste law, and explicit public-action restrictions.
- Campaign stage 04 produces an execution package, not generic advice.
- Approval stage 05 cannot release an item without explicit approval metadata.
- The campaign source-of-truth distinguishes confirmed facts, assumptions, blockers, and required human answers.
- No production website code is changed.
- No external post, message, payment, or client contact is executed.
- Existing `npm test`, `npm run doctor`, and relevant verification commands pass.

## Verification commands

```bash
npm test
npm run doctor
node missionctl/missionctl.mjs doctor
node missionctl/missionctl.mjs smoke asc3nd
```

## Required evidence

- Git diff of tenant ICM changes
- Passing verification output
- Generated campaign artifacts from a dry run
- Approval register showing blocked status until a human approves
- No-secret audit output

## Prohibited changes

- Do not rewrite or replace the existing ICM system.
- Do not modify the public ASC3ND website in this slice.
- Do not implement autonomous public publishing.
- Do not add a second orchestration framework.
- Do not place secrets, youth PII, consent documents, or private contact details in Git.
- Do not claim Postiz, Postgres, auth, or agent execution is production-ready unless verified.

## Rollback

All changes are isolated to `feat/asc3nd-digital-execution-slice`. Rollback is performed by closing the pull request or reverting its commits. No schema or production runtime changes are included.