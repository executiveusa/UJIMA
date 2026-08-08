# Agenix Hive Phase 2 Receipt — Provider Registry

**Status:** PENDING — provider work is reconciled; final control-plane review/merge remains

**Correlation ID:** `9ade7a51-e287-42cc-b999-898c95d8c679`

**Hive run:** `91ccba61-cb77-4ad8-97b2-1980b4a33a9b`

## Live registry proof

| Check | Observed |
| --- | ---: |
| enabled provider-capability bindings | 11 |
| provider health rows | 5 |
| health rows still `unknown` | 5 |
| active Phase 2 write leases | 1 (this control-plane reconciliation branch) |
| completed provider steps | 3 |
| explicitly deferred provider steps | 1 |
| Phase 2 evidence receipts | 4 |

`unknown` health is intentional. Registration is not runtime health.

## Provider bootstrap state

| Provider | Owner-repo result | Routing state |
| --- | --- | --- |
| Agenix Governor | central manifest on control repo | registered |
| Paperclip HQ | PR #2 merged at `300c54c3a0e09f4def2441f753e87461d4bb2651` | registered; health unknown |
| Montage | local footage PR #26 merged at `c88d44e04393b5d2e2a0f096ebb8a92840d6a31f`; truthful provider PR #28 merged at `3ae561888599a759aef98caf3b80c15222e2c3fc` | 5 current media capabilities enabled; health unknown |
| Open Interpreter | PR #1 merged at `b22311637cf11888f2cc0975617867483dc25ed1` | CLI interface registered; browser/GUI disabled until bounded worker; health unknown |
| Darya / OpenHands | no repo mutation | capability bindings disabled and explicitly deferred to Phase 6 compliant OpenHands worker |

## Important corrections made during Phase 2

### Montage

The first provider PR was closed rather than merged because its file name/semantics collided with Montage's existing internal `CapabilityRegistry` and it advertised unsupported/future routing paths. After PR #26 landed, PR #28 registered `.agenix/hive-provider.json` as an **external Hive manifest**, not a second runtime registry.

Current Montage Hive claims are limited to real `main` capabilities:

- local ingest through `/assets`
- local transcription when Faster-Whisper is installed
- deterministic edit application
- local media outputs
- ffprobe verification

`video.edit.propose` is disabled until the Director proposal engine exists. MCP/CLI/GUI are not claimed for these local media operations yet.

### Open Interpreter

CodeRabbit flagged that a fallback policy was documented without an enforcing dispatcher. Instead of inventing a generic dispatcher during registration, browser and GUI Hive interfaces were disabled. The bounded outbound worker in Phase 7 will re-enable them only after it enforces routing and approval policy.

The PR's Vercel failure comes from pre-existing legacy project configuration and affects only the fork's old web deployment. It was documented and deferred because the Hive computer provider is a local/outbound worker; changing unrelated deployment configuration would be scope creep.

### Darya/OpenHands

The repository's `AGENTS.md` requires `make install-pre-commit-hooks` before mutation. A GitHub-content-only path cannot satisfy that requirement. The Hive therefore did not acquire a Darya write lease or bypass the guardrail. Its routing bindings are disabled until Phase 6 runs a compliant OpenHands engineering environment.

## Lease/evidence proof

- Paperclip write lease: released after merge; PASS receipt emitted; `work.completed` event emitted.
- Montage PR #26 prerequisite lease: released after CI/review/production verification; PASS receipt emitted; `work.completed` event emitted.
- Montage provider lease: released after PR #28 merge; PASS receipt emitted; `work.completed` event emitted.
- Open Interpreter lease: released after PR #1 merge; PASS receipt emitted; `work.completed` event emitted.
- Darya: no write lease acquired; PARTIAL/deferred receipt plus `work.blocked` event emitted.
- Control repo: one lease remains until this reconciliation PR merges.

## Runtime truth

Provider health remains `unknown` until actual services/workers respond from their execution environments. The command router must never infer `healthy` from a merged manifest.

## Remaining Phase 2 gate

This reconciliation PR must pass repository CI, independent review/CodeRabbit and merge to `main`. Then release the final control-repo lease, close the Phase 2 run, record its PASS receipt, and proceed to Phase 3: Agenix Command.