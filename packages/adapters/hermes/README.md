# Agenix Hermes Remote MCP Gateway

Bead: `A3OS-7`

Purpose: let an approved remote MCP client (including ChatGPT once connected) call the user's existing Hermes Agent without ever receiving the downstream provider secrets that Hermes already holds.

## Architecture

```text
ChatGPT / MCP client
  -> Agenix Hermes MCP gateway (`/mcp`)
  -> Hermes OpenAI-compatible API / Runs API
  -> Hermes tools + configured provider secrets
```

Hermes remains an execution runtime. Agenix remains the policy, approval, evidence, and capability-contract layer. This package does not make Hermes canonical project truth.

## Official Hermes surfaces used

The adapter is built against the documented Hermes API server:

- `GET /health`
- `GET /health/detailed`
- `GET /v1/capabilities`
- `GET /v1/models`
- `POST /v1/runs`
- `GET /v1/runs/{run_id}`
- `POST /v1/runs/{run_id}/stop`
- `POST /v1/runs/{run_id}/approval`

Hermes documentation:
- https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/features/api-server.md
- https://github.com/nousresearch/hermes-agent/blob/main/website/docs/developer-guide/programmatic-integration.md

## Required environment

Run this gateway on the same machine/network as Hermes whenever possible.

```text
HERMES_API_BASE_URL=http://127.0.0.1:8642
HERMES_API_SERVER_KEY=<secret already configured for Hermes API server>
AGENIX_MCP_BEARER_TOKEN=<separate strong token for MCP clients>
AGENIX_HERMES_MCP_HOST=127.0.0.1
AGENIX_HERMES_MCP_PORT=8787
```

Do not reuse the OpusClip key as the MCP token. Do not commit any of these values.

Optional:

```text
AGENIX_MCP_ALLOWED_ORIGINS=https://trusted.example
HERMES_API_TIMEOUT_MS=120000
```

## Start Hermes API server

Hermes itself must have its API server enabled. Per Hermes documentation this is normally done by enabling `API_SERVER_ENABLED=true` and starting `hermes gateway`. The Hermes API server should remain bound to loopback unless a separate secure network design explicitly requires otherwise.

## Start Agenix MCP gateway

```bash
node packages/adapters/hermes/mcp-server.mjs
```

Local health endpoint:

```text
GET http://127.0.0.1:8787/health
```

MCP endpoint:

```text
http://127.0.0.1:8787/mcp
```

The `/mcp` endpoint requires:

```text
Authorization: Bearer <AGENIX_MCP_BEARER_TOKEN>
```

## Exposed MCP tools

Read-only:

- `hermes.health`
- `hermes.health_detailed`
- `hermes.capabilities`
- `hermes.models`
- `hermes.run_status`

Execution / control:

- `hermes.run` — requires `approved=true` and an explicit `approvalReason`
- `hermes.stop_run` — cancellation/safety action
- `hermes.resolve_approval` — requires `humanConfirmed=true` and the explicit human decision

`hermes.run` injects Agenix safety instructions telling Hermes not to expose secrets, publish, schedule, purchase/top-up credits, deploy production, merge main, or perform destructive actions without an explicit approval gate.

## Smoke test

```bash
node packages/adapters/hermes/smoke-test.mjs
```

The test never starts a run. It checks only Hermes health, capabilities, and model discovery.

## Remote ChatGPT connection

Hermes and this MCP gateway should remain private by default. A remote ChatGPT MCP connection needs a reachable HTTPS endpoint. Put a secure tunnel or authenticated reverse proxy in front of `127.0.0.1:8787`; do not bind Hermes itself publicly just to make MCP reachable.

The remote endpoint should terminate TLS and forward only `/mcp` (and optionally `/health`). Keep the separate `AGENIX_MCP_BEARER_TOKEN` at the gateway boundary.

## Security laws

- No downstream provider secret is ever returned by an MCP tool.
- Hermes' own provider keys stay inside Hermes.
- MCP authentication uses a separate credential.
- Missing credentials fail closed.
- Run creation is approval-gated.
- Approval resolution is explicitly human-gated.
- No social publishing tool is exposed by this slice.
- No merge/deploy/destructive tool is exposed by this slice.
