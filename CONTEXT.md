# UJIMA Context Map

## Read this first

UJIMA is a sovereign, installable agentic operating system for mission-driven organizations.

**Product:** UJIMA  
**Client 01:** ASC3ND  
**First specialist vertical:** `executiveusa/grant-agent`

## Route by task

- Product identity / architecture / runtime → this repository root + `docs/UJIMA-ARCHITECTURE.md`
- Tenant truth → `icm/tenants/<tenant>/`
- ASC3ND-specific work → `icm/tenants/asc3nd/` and routed client repositories
- Grants → UJIMA contract here, domain implementation in `executiveusa/grant-agent`
- Engineering execution → workflow contract here; fleet supervisor is a replaceable runtime adapter
- Browser/computer use → bounded operator contract; never canonical orchestration
- Quality / engineering process → `AGENTS.md` + project skills + evidence gates
- Deployment → `deployment-lock.json`, `netlify.toml`, release evidence

## Canonical abstractions

1. **Goal** — desired outcome.
2. **ICM** — organizational truth, policy, evidence and memory.
3. **Workflow** — reusable execution composition.
4. **Trigger** — manual, goal, cron, event, webhook or watch.
5. **Capability** — bounded worker/tool/agent.
6. **Approval** — human authority gate.
7. **Evidence** — proof of what happened.
8. **Receipt** — durable completion/rollback record.

## Human-facing law

The user should not need to understand agents, frameworks or infrastructure to get work done.

**Tell UJIMA what you need → UJIMA works → UJIMA asks when judgment matters → UJIMA returns proof.**
