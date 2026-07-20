# ICM Shared Creative Law Enforcement

## Objective

Make every creative ICM run load the approved shared Creative Operating System references and produce a machine-readable review-gate result before an artifact can enter human approval.

## Commercial value

This converts the reusable knowledge library from passive documentation into enforceable delivery infrastructure. It reduces inconsistent client work, review time, preventable safety failures, and dependence on individual operators.

## Exact slice

1. Add a bounded shared-context loader for `icm/shared/creative-operating-system`.
2. Load only the shared index, mandatory review gates, and law files explicitly required by the active stage.
3. Record loaded shared references and hashes in `audit.json`.
4. Generate `review-gates.json` with pass, fail, blocked, and not-applicable states.
5. Block approval-ready status when a mandatory gate fails or required evidence is missing.
6. Add tenant-isolation and path-traversal tests.
7. Wire the result into the existing ICM API response without introducing a new agent framework.

## Likely files

- `packages/core/src/icm.js`
- `packages/core/src/creative-review.js` (new only if separation is necessary)
- `packages/core/tests/icm.test.js`
- `packages/core/tests/creative-review.test.js`
- `services/mission-api/server.js`
- `docs/IMPLEMENTATION-NEXT.md`

## Dependencies

- Existing ICM runner and stage contracts.
- Existing shared Creative Operating System library.
- Existing approval and audit concepts.

## Acceptance criteria

- A creative campaign stage reports the exact shared law files loaded.
- The loader cannot access another tenant or an arbitrary repository path.
- A failed truth, consent, youth-safety, dignity, or destination-link gate blocks approval readiness.
- Review output is deterministic for the same supplied evidence.
- Existing ICM tests remain green.
- No external publishing occurs.

## Verification

```bash
npm test
npm run build
npm run doctor
node missionctl/missionctl.mjs doctor
node missionctl/missionctl.mjs smoke asc3nd
```

## Required evidence

- Passing tests.
- Example `review-gates.json` for the ASC3ND back-to-school campaign.
- Audit record listing loaded shared references.
- Diff proving no Postiz or external-send action was introduced.

## Prohibited changes

- No rewrite of the ICM architecture.
- No new orchestration framework.
- No public website redesign.
- No live Postiz action.
- No secrets or production credentials.
- No weakening of approval gates.

## Rollback

Revert the feature commit. Existing stage context and output files remain valid because the new review artifact is additive.