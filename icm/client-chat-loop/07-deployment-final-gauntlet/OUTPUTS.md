# Slice 07 — Deployment + Final Gauntlet Acceptance Ledger

## Goal
Deploy the completed ASC3ND Social Purpose OS client operating surface to the existing Netlify project, prove the client loop end to end, and record release/rollback evidence without modifying the frozen public ASC3ND brand website.

## Scope lock
- Reuse existing Netlify project `asc3nd-social-purpose-os` (`9ebe01e5-21cf-492d-a091-29dad057f91d`).
- Do not create a duplicate site.
- Do not modify ASC3ND public-brand redesign/copy/layout/DNS.
- Do not enable payment, outbound messaging, grant submission, DNS mutation, destructive production migrations, unrestricted external execution, or auto-publishing.
- Approval remains distinct from execution.

## Acceptance criteria
1. Slice 06 is merged to `main` and Slice 07 branches from that verified merge SHA.
2. Repository has an explicit, reviewable Netlify build contract for the client application and does not rely on undocumented local assumptions.
3. Production build succeeds on the Slice 07 exact head.
4. Existing Netlify project reports a current branch deployment and returns a unique deployment URL/reference.
5. `/app` authentication boundary is verified; unauthenticated users cannot use protected client APIs.
6. New conversation creation, persisted conversation reload, and tenant/user scoping are verified.
7. First Mate mission routing is verified.
8. Durable work states are verified: Working, Needs you, Ready, Failed, Delivered, with route-only work never mislabeled as execution.
9. Artifact listing plus authenticated preview/download are verified, including tenant-root containment.
10. Consequential mission approval is durable, mission-scoped, actor-attributed, RBAC-gated, visible to both client and `/ops`, and does not execute the consequential action.
11. Portable export preserves conversation, mission, work-state, proof, artifact, and approval references across multiple missions.
12. Desktop and mobile client shell have no critical overflow or inaccessible primary controls; keyboard focus and reduced-motion behavior remain acceptable.
13. Repository boundary guard, full CI, predecessor regressions, production dependency audit, and dedicated Slice 07 release gate pass on the exact head.
14. Independent final review covers customer value, usability, creative/taste, accessibility, technical integrity, and sovereignty/security.
15. Release thresholds: overall >= 8.5; usability >= 8.5; visual >= 8.5; originality >= 8.5; accessibility >= 8.5; primary conversion/task completion >= 9.0; zero critical failures, broken primary controls, mobile overflow, cross-tenant leakage, or unverified release claims.
16. Rollback procedure is documented and points to the pre-Slice-07 verified `main` SHA and a prior Netlify deployment reference.
17. PR merges only after exact-head CI, deployment proof, scope inspection, independent review, and rollback evidence are clean.

## Recorded deployment evidence
- Netlify project: `asc3nd-social-purpose-os`
- Netlify site ID: `9ebe01e5-21cf-492d-a091-29dad057f91d`
- Team ID: `68163afa9822eb64330b691a`
- Primary site: `http://asc3nd-social-purpose-os.netlify.app`
- Current unique branch deployment reference captured for the Slice 07 branch: `6a9a8f491d9aab40366a8bec`
- Current unique branch deployment URL captured from the connected Netlify project: `http://6a9a8f491d9aab40366a8bec--asc3nd-social-purpose-os.netlify.app`
- Netlify project state at capture: `current`
- Prior branch deployment reference retained for rollback comparison: `6a9a8d77c33e511c6ca0203d`
- Prior branch deployment URL: `http://6a9a8d77c33e511c6ca0203d--asc3nd-social-purpose-os.netlify.app`
- The connected Netlify project reader exposes the unique branch deployment reference/URL but does not expose a separate deploy API object in `currentDeploy`; direct deploy-object lookup for the unique reference returned 404. This is recorded rather than inventing a deploy ID.
- Netlify deploy write acknowledged the existing site but returned a repo-local deploy command rather than executing the upload remotely. The existing Git-connected branch deployment is therefore the platform deployment evidence for this slice.

## Verification evidence
- Pre-release verified `main`: `65be5b2aa11199e6d5bfbe8b6075057036f36394`
- First Slice 07 release-gauntlet candidate completed repository boundary guard, secret audit (807 tracked files, 0 findings), 9 regression files / 89 tests, serialized-loop verification (`CLIENT_CHAT_LOOP_OK`), and a successful Next.js production build before the final dependency-audit and review fixes were added.
- Exact-head verification must be read from GitHub Actions after every final repair; no earlier successful run may substitute for the final head.
- The dedicated release workflow now includes `npm audit --omit=dev --audit-level=high`, repository boundary guard, secret audit, final client regressions, serialized-loop verification, and the production build.
- Independent CodeRabbit review identified three release blockers on the initial candidate: root dependency changes did not trigger the gate; accessibility assertions were too generic; deployment/rollback proof was not recorded. The first two were repaired in code/tests; this ledger records the deployment/rollback proof without fabricating an unavailable deploy API object.

## Rollback procedure
1. Stop release promotion if any exact-head release, security, dependency, build, or review gate fails.
2. Restore code to verified pre-Slice-07 `main` SHA `65be5b2aa11199e6d5bfbe8b6075057036f36394` by reverting the Slice 07 merge (preferred) or redeploying that exact commit through the normal Git-connected Netlify path.
3. In Netlify, select the prior known-good deployment/branch reference in project deploy history. The prior comparison reference recorded during this slice is `6a9a8d77c33e511c6ca0203d`.
4. Do not change ASC3ND public-brand DNS or the frozen public frontend as part of rollback; this client operating surface is isolated from that site.
5. Re-run repository boundary, secret, predecessor client regressions, production dependency audit, and production build before re-promoting.
6. Record the resulting rollback deployment reference in this ledger or its post-release incident record.

## Proof still required before merge
- Final exact-head Slice 07 workflow conclusion: success.
- Final exact-head full CI and predecessor workflow conclusions: success.
- Final independent review: no unresolved release-blocking findings.
- Final Netlify project read: current deployment state and unique branch deployment reference for the exact release head.
- Final merge SHA.

## Definition of done
The existing Netlify site reports the verified client operating-surface deployment, the complete 7-slice client loop is merged to `main`, all release gates are green, rollback is documented, and no public-brand/DNS/external consequential action was changed as part of this slice.