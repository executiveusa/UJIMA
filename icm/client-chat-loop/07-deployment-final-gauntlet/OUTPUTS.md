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
4. Existing Netlify project deploy completes successfully and returns a reachable deployment URL.
5. `/app` authentication boundary is verified; unauthenticated users cannot use protected client APIs.
6. New conversation creation, persisted conversation reload, and tenant/user scoping are verified.
7. First Mate mission routing is verified.
8. Durable work states are verified: Working, Needs you, Ready, Failed, Delivered, with route-only work never mislabeled as execution.
9. Artifact listing plus authenticated preview/download are verified, including tenant-root containment.
10. Consequential mission approval is durable, mission-scoped, actor-attributed, RBAC-gated, visible to both client and `/ops`, and does not execute the consequential action.
11. Portable export preserves conversation, mission, work-state, proof, artifact, and approval references across multiple missions.
12. Desktop and mobile client shell have no critical overflow or inaccessible primary controls; keyboard focus and reduced-motion behavior remain acceptable.
13. Repository boundary guard, full CI, Slice 02–06 regressions, and dedicated Slice 07 release gate pass on the exact head.
14. Independent final review covers customer value, usability, creative/taste, accessibility, technical integrity, and sovereignty/security.
15. Release thresholds: overall >= 8.5; usability >= 8.5; visual >= 8.5; originality >= 8.5; accessibility >= 8.5; primary conversion/task completion >= 9.0; zero critical failures, broken primary controls, mobile overflow, cross-tenant leakage, or unverified release claims.
16. Rollback procedure is documented and points to the pre-Slice-07 verified `main` SHA and prior Netlify deploy.
17. PR merges only after exact-head CI, deployment proof, scope inspection, independent review, and rollback evidence are clean.

## Proof to capture
- Pre-release `main`: `65be5b2aa11199e6d5bfbe8b6075057036f36394`
- Slice 07 exact-head workflow run IDs and conclusions
- Netlify project/site ID, deployment ID, and URL
- Protected-route/auth smoke evidence
- Client loop regression output
- Independent review findings and repairs
- Final merge SHA
- Rollback target and procedure

## Definition of done
The existing Netlify site serves the verified client operating surface, the complete 7-slice client loop is merged to `main`, all release gates are green, rollback is documented, and no public-brand/DNS/external consequential action was changed as part of this slice.