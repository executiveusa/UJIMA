# Agenix Hive Phase 2 Receipt — Provider Registry

**Status:** PENDING — central registry is applied; provider PRs and runtime probes are not all complete

**Correlation ID:** `9ade7a51-e287-42cc-b999-898c95d8c679`

**Hive run:** `91ccba61-cb77-4ad8-97b2-1980b4a33a9b`

## Central registry proof

Live Botanic Creations Hive state currently reports:

| Check | Observed |
| --- | ---: |
| enabled provider-capability bindings | 16 |
| provider health rows | 5 |
| health rows still `unknown` | 5 |
| active owner-repo write leases | 3 |
| intentionally blocked provider bootstrap steps | 1 |

Runtime health remains `unknown` by design until a real probe runs. Registration is not health.

## Provider bootstrap state

| Provider | Central manifest | Owner-repo manifest | Current gate |
| --- | --- | --- | --- |
| Agenix Governor | present | n/a (same repo) | control PR review/merge |
| Paperclip HQ | present | PR #2 opened | review/merge/runtime heartbeat |
| Montage | present | PR #27 opened | review/merge/runtime heartbeat |
| Open Interpreter | present | PR #1 opened | review/merge/runtime heartbeat |
| Darya / OpenHands | present | not mutated | repo `AGENTS.md` requires pre-commit hook installation before changes; use compliant engineering runtime |

## Lease proof

Write leases were acquired before mutations for:

- `repo:executiveusa/paperclip-pauli-clip`
- `repo:executiveusa/pauli-montage-video-agent`
- `repo:executiveusa/open-interpreter-fork`

No Darya write lease was acquired because the repo-local mutation was blocked before write by its own agent contract.

## Truthfulness rule

- The registry records only interfaces we have repository evidence for.
- Montage MCP remains unavailable in the manifest until a runtime probe proves it, even though Montage policy requires MCP parity.
- The legacy Open Interpreter fork is not advertised as MCP-capable until a runtime probe proves it.
- Provider health remains `unknown` until the corresponding service/worker emits a successful heartbeat or verified health response.

## Remaining gate

Phase 2 may become PASS only after:

1. control-plane provider-registry PR passes CI/review and merges;
2. each non-blocked provider manifest PR passes valid review and merges;
3. write leases are released with evidence;
4. provider registry references are reconciled to merged SHAs;
5. runtime health remains truthfully `unknown` or is promoted only by an actual probe;
6. the Darya bootstrap blocker is either cleared by a compliant OpenHands runtime or recorded as an explicit deferred dependency rather than silently bypassed.
