# ASC3ND Backend Integration Freeze / Frontend Handoff

## Status
Backend integration contract is frozen for this loop. This document does **not** claim the newest frontend commit is deployed to production.

## Truth owners
- Social Purpose OS / ICM: tenant truth, cross-domain workflow, approvals, evidence and governance.
- `executiveusa/asc3nd-supabase-landing`: ASC3ND database migrations, RLS, recovery and schema contract. Locked main SHA: `d2bd7447cf42d0e0bd46533e3bc8ede08454d578`.
- `executiveusa/grant-agent`: grant-domain engine only.
- `executiveusa/asc3nd-brand-site`: public frontend. Locked observed main SHA: `34e7f86fcdaef419fa5cd6cc633663af857d455b`.

## Stable frontend integration surface
Frontend work may consume the canonical interfaces recorded in `handoffs/asc3nd-backend-integration-freeze.json`. It must not duplicate canonical people, consent, routes, participation, follow-up or relationship memory into a second source of truth.

## Current deployment truth
Phase 10 code is merged in the public-site repository, but production verification remains unresolved. Do not report `asc3nd.org`, automatic Google Sheet sync, or outbound email as live until separately verified.

## Human / secret gates
Production secrets, DNS, production deployment, outbound communication and other consequential actions require authorized human handling. Secrets are never checked into this repository.

## Frontend freeze
No copy, layout, visual redesign, feature redesign or public-site code mutation is part of backend loops 00-10. A later frontend mission starts from this handoff and must run its own acceptance/quality loop.

## Rollback
All loop changes are source-controlled contracts/documentation/tests. Loops 04-10 applied no production DDL or private-row migration. Revert the relevant merge commit to roll back repository contracts; public frontend remains unchanged by this loop.
