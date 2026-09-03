# Client Chat Slice 01 — PopeBot extraction + architecture contracts

## Acceptance ledger

- [x] Exact PopeBot reference commit pinned.
- [x] Reuse and reject boundaries documented.
- [x] Client route `/app/*` and staff route `/ops/*` separated.
- [x] Public ASC3ND brand site remains frozen.
- [x] ICM remains canonical organization truth.
- [x] Chat session schema defined.
- [x] Chat-to-mission handoff schema defined.
- [x] Tier 3 mission handoff requires approval.
- [x] Client-visible status vocabulary locked.
- [x] No new dependency or service added.

## Ponytail minimum check

The existing Next.js `apps/site` app, existing auth, existing Social Purpose OS mission contracts and existing `/ops` cockpit are retained. PopeBot is inspected as a reference; no fork, package dependency, database, Docker runtime or second application is added in this slice.

## Scope review

Changed only documentation, control-plane contracts, verifier, CI and ICM checkpoint for the client-chat architecture. No `/app` product implementation yet. No public brand-site repository change.

## Specialist routing

- Humanizer: N/A — architecture contract, not public prose.
- Claude SEO: N/A — no visibility work.
- Emil: architecture implications reviewed; UI implementation begins Slice 02.
- Ralphy/OpenHands: N/A — no autonomous worker needed.

## Gauntlet bar

Named bar: PopeBot chat architecture at commit `33f032ddedee93ee139fba0464d5a765dc10e99f` plus Social Purpose OS governance.

Binary release question: can a fresh builder implement a chat-first client without making PopeBot or the UI a second source of truth, without exposing backend mechanics, and without touching the frozen public site?

Expected answer: PASS when CI verifier and full repository CI are green.

## Rollback

Revert this slice commit. No production data, deployment, DNS, public frontend or external communication changed.
