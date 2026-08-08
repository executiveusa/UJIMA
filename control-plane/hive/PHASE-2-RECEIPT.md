# Agenix Hive Phase 2 Receipt — Provider Registry

**Status:** PASS

**Correlation ID:** `9ade7a51-e287-42cc-b999-898c95d8c679`

**Primary Phase 2 run:** `91ccba61-cb77-4ad8-97b2-1980b4a33a9b`

**Control-plane reconciliation merge:** `5791bd2c0bf75c4aaf259f499ee11a3d30aade51`

## Live registry proof

| Check | Verified |
| --- | --- |
| Provider registry exists | yes |
| Provider health rows | 5 |
| Health promoted without runtime probe | no |
| Paperclip owner-repo manifest merged | yes |
| Montage owner-repo manifest merged | yes |
| Open Interpreter owner-repo manifest merged | yes |
| Darya guardrail bypassed | no |
| Cross-repo provider writes used leases | yes |
| Evidence/events emitted | yes |

Runtime health remains `unknown` until a real service/worker probe succeeds. Registration is not health.

## Provider results

| Provider | Owner-repo result | Routing state |
| --- | --- | --- |
| Agenix Governor | central provider manifest merged | registered |
| Paperclip HQ | PR #2 → `300c54c3a0e09f4def2441f753e87461d4bb2651` | registered; health unknown |
| Montage | local footage PR #26 → `c88d44e04393b5d2e2a0f096ebb8a92840d6a31f`; provider PR #28 → `3ae561888599a759aef98caf3b80c15222e2c3fc` | current local-media capabilities enabled; health unknown |
| Open Interpreter | PR #1 → `b22311637cf11888f2cc0975617867483dc25ed1` | CLI registered; browser/GUI disabled until bounded worker; health unknown |
| Darya / OpenHands | no repo mutation | capability routing disabled; bootstrap deferred to Phase 6 compliant OpenHands worker |

## Material corrections made during Phase 2

### Montage

The initial provider PR was closed rather than merged because it risked becoming a second capability registry and advertised future/disabled interfaces. After the real local-footage engine landed, the replacement manifest was named `.agenix/hive-provider.json` and explicitly scoped as an external Hive provider contract.

Current Hive claims are limited to implemented `main` capabilities:

- local source ingest
- conditional local Faster-Whisper transcription
- deterministic edit application
- local media output/rendering
- ffprobe verification

`video.edit.propose` stays disabled until the Director proposal engine exists. MCP/CLI/GUI are not claimed for the local-media execution path yet.

### Open Interpreter

CodeRabbit identified that GUI fallback policy was documented before an enforcing Hive worker existed. Browser and GUI interfaces were therefore disabled rather than pretending the policy was implemented. Phase 7 owns the bounded outbound worker and may re-enable them only after routing, approval and evidence enforcement are proven.

The fork's legacy Vercel project-configuration failure was documented and deferred because this provider is a local/outbound worker and the manifest PR did not alter web deployment code.

### Darya / OpenHands

Its `AGENTS.md` requires `make install-pre-commit-hooks` before repository mutation. The GitHub-only bootstrap path could not satisfy that precondition, so no write lease or direct mutation occurred. Darya is registered centrally but disabled for routing until Phase 6 runs a compliant engineering environment.

## Evidence chain

- Paperclip: write lease released after merge; PASS receipt + `work.completed` event.
- Montage local footage prerequisite: CI/review/production verified; PASS receipt + `work.completed` event.
- Montage provider: replacement manifest merged; PASS receipt + `work.completed` event.
- Open Interpreter: bounded manifest merged; PASS receipt + `work.completed` event.
- Darya: PARTIAL/deferred receipt + `work.blocked` event; no guardrail bypass.
- Control reconciliation PR #40: CI, Repository Boundary Guard, CodeRabbit and Vercel preview passed before merge.
- Primary Phase 2 Hive run was closed as `completed` with a PASS evidence receipt.

## Phase gate

Phase 2 is complete. Phase 3 may build **Agenix Command**: one text/push-to-talk input contract that persists commands, loads policy/context, resolves only eligible provider capabilities, and hands organizational execution to Paperclip.