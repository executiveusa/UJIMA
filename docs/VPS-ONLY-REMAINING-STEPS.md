# VPS-Only Remaining Steps — After Gate 6B0

**Status:** These steps cannot be performed locally. They require human VPS access
and Architect approval of Gate 6B.

**Do not attempt any item on this list until Gate 6B is Architect-approved.**

---

## What Is NOT Local

All items below require physical VPS access (SSH), confirmed DNS ownership,
or live service credentials. None can be performed by the AI agent.

| Step | Owner | Gate |
|---|---|---|
| Provision Hostinger VPS (4 vCPU / 8 GB / 80 GB SSD) | Human | Pre-6B |
| Confirm VPS SSH access | Human | Pre-6B |
| Point asc3nd.org DNS A record to VPS IP | Human | Pre-6B |
| Point api.asc3nd.org DNS A record to VPS IP | Human | Pre-6B |
| Install Docker + Docker Compose on VPS | Human | Gate 6B |
| Install Caddy on VPS | Human | Gate 6B |
| Upload `.env.managed` with real production secrets | Human | Gate 6B |
| Set `GATE_6B_LIVE_APPROVED=true` on VPS (Architect only) | Architect | Gate 6B |
| Run `docker compose -f docker-compose.managed.yml up -d --build` on VPS | Human | Gate 6B |
| Verify TLS certificate issued by Caddy | Human | Gate 6B |
| Run smoke-test.managed.sh on VPS | Human | Gate 6B |
| Connect Postgres and run migrations | Human | Gate 6B |
| Verify `/ops/health` shows live status | Human | Gate 6B |
| First live client safety review | Human | Gate N |

---

## Credentials That Cannot Be Generated Locally

These must be provided by the human operator:

- VPS root/sudo SSH key (do not paste private key anywhere in git)
- Anthropic API key (production)
- OpenAI API key (production, if used)
- Twilio Account SID + Auth Token + From Number
- Vapi API key
- Retell API key
- Postiz API URL + API key
- Postgres DATABASE_URL (production connection string)
- LiteLLM master key (production)
- Langfuse public key + secret key (production)
- Open WebUI secret key (production)
- NextAuth secret (production)

All credential fields in `.env.example` files are labeled `[NOT_YET_PROVIDED]`
or `<PLACEHOLDER>` — these placeholders must remain until human provides real values.

---

## VPS Minimum Specification

| Resource | Minimum | Recommended |
|---|---|---|
| vCPU | 4 | 4+ |
| RAM | 8 GB | 16 GB |
| SSD | 80 GB | 160 GB |
| OS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| Network | 1 Gbps | 1 Gbps |

Provider: Hostinger (planned, not confirmed ownership).

---

## DNS Records Required

| Record | Type | Target |
|---|---|---|
| asc3nd.org | A | [VPS IP — NOT_YET_PROVIDED] |
| api.asc3nd.org | A | [VPS IP — NOT_YET_PROVIDED] |

DNS propagation may take up to 48 hours. Verify with `dig asc3nd.org` before proceeding.

---

## References

- `docs/DEPLOYMENT-DAY-RUNBOOK.md` — full 15-step live deployment procedure
- `docs/STAGING-ROLLBACK-RUNBOOK.md` — rollback procedures
- `docs/VPS-DOMAIN-INTAKE-FORM.md` — intake form to fill before Gate 6B
- `docs/GATE-6B-HUMAN-INTAKE-PACKET.md` — confirmation checklist
- `docs/LIVE-STAGING-PREFLIGHT-CHECKLIST.md` — 15 gate pre-flight checklist
