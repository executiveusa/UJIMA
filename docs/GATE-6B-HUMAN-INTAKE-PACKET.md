# Gate 6B Human Intake Packet

**Purpose:** Human operator must complete this packet before Gate 6B (live VPS staging)
can proceed. All fields marked `[NOT_YET_PROVIDED]` must be filled by a human.

**Rule:** Do not paste private SSH keys, passwords, API keys, or tokens into this file.
This file is tracked by git. Write only non-secret reference values here.

**Status:** Incomplete. Awaiting human VPS/DNS/SSH intake.

---

## Section 1: VPS Confirmation

| Field | Value |
|---|---|
| VPS Provider | [NOT_YET_PROVIDED] |
| VPS Plan / Tier | [NOT_YET_PROVIDED] |
| VPS IP Address | [NOT_YET_PROVIDED] |
| VPS Region | [NOT_YET_PROVIDED] |
| OS + Version | [NOT_YET_PROVIDED] |
| VPS Username | [NOT_YET_PROVIDED] |
| SSH Key Fingerprint (not the key itself) | [NOT_YET_PROVIDED] |
| VPS provisioned date | [NOT_YET_PROVIDED] |
| Confirmation: SSH connection verified | [ ] |

---

## Section 2: Domain Confirmation

| Field | Value |
|---|---|
| Primary domain | [NOT_YET_PROVIDED] |
| API subdomain | [NOT_YET_PROVIDED] |
| DNS registrar | [NOT_YET_PROVIDED] |
| A record pointed to VPS IP | [ ] |
| API subdomain A record pointed | [ ] |
| DNS propagation verified (`dig` output attached) | [ ] |

---

## Section 3: TLS / Caddy

| Field | Value |
|---|---|
| TLS provider | Caddy automatic (Let's Encrypt) |
| Email for Let's Encrypt | [NOT_YET_PROVIDED] |
| TLS cert issued and verified | [ ] |

---

## Section 4: Docker / Compose

| Field | Value |
|---|---|
| Docker installed on VPS | [ ] |
| Docker Compose version | [NOT_YET_PROVIDED] |
| Compose file: `docker-compose.managed.yml` uploaded | [ ] |
| `.env.managed` uploaded (not tracked in git) | [ ] |

---

## Section 5: Production Secret Inventory (names only — not values)

**Do not write actual secret values here.**
Confirm each secret has been placed in `.env.managed` on the VPS:

| Secret | Confirmed in .env.managed |
|---|---|
| DATABASE_URL | [ ] |
| ANTHROPIC_API_KEY | [ ] |
| TWILIO_ACCOUNT_SID | [ ] |
| TWILIO_AUTH_TOKEN | [ ] |
| TWILIO_FROM_NUMBER | [ ] |
| VAPI_API_KEY | [ ] |
| RETELL_API_KEY | [ ] |
| POSTIZ_API_URL | [ ] |
| POSTIZ_API_KEY | [ ] |
| LITELLM_MASTER_KEY | [ ] |
| LANGFUSE_PUBLIC_KEY | [ ] |
| LANGFUSE_SECRET_KEY | [ ] |
| NEXTAUTH_SECRET | [ ] |
| AGENT_EXECUTION_MODE | [ ] (must be 'external') |
| GATE_6B_LIVE_APPROVED | [ ] (set to 'true' by Architect only) |

---

## Section 6: Postgres

| Field | Value |
|---|---|
| Postgres running on VPS | [ ] |
| Migrations applied (`0001` through latest) | [ ] |
| DATABASE_URL set in `.env.managed` | [ ] |
| `assertProductionStorage()` passes | [ ] |

---

## Section 7: Pre-flight Gate Confirmation

Before Architect approves Gate 6B, confirm all items below:

| Gate | Pass condition | Confirmed |
|---|---|---|
| SSH access | Can SSH to VPS as non-root user | [ ] |
| DNS | Both A records resolve to correct IP | [ ] |
| TLS | Both domains serve HTTPS with valid cert | [ ] |
| Docker | `docker ps` runs without error | [ ] |
| Secrets | All secrets in .env.managed, not in git | [ ] |
| Postgres | Migrations applied, connection verified | [ ] |
| Smoke | smoke-test.managed.sh exits 0 | [ ] |
| Safety | No outbound messaging, grant submission, or public publishing on day one | [ ] |

---

## Section 8: Architect Approval

**Gate 6B is blocked until this section is completed by the Architect.**

| Item | Value |
|---|---|
| Architect review date | [NOT_YET_PROVIDED] |
| Architect approval | [ ] |
| `GATE_6B_LIVE_APPROVED=true` set on VPS by Architect | [ ] |

---

## Section 9: Sign-off

Human operator name: [NOT_YET_PROVIDED]
Date of intake completion: [NOT_YET_PROVIDED]
Architect sign-off: [NOT_YET_PROVIDED]
