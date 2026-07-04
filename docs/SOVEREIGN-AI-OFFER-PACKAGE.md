# Sovereign AI Offer Package — Mission OS

**Audience:** Operators, Architect, sales staff  
**Purpose:** Master index for the Asc3nd Mission OS™ sovereign AI offer package  
**Status:** Gate 5A complete — docs ready for Architect review before client use

---

## Package purpose

This package defines how Asc3nd sells and delivers Mission OS as a client-owned, sovereign AI operating system for nonprofits, social-purpose organizations, and mission-driven teams.

It exists because Mission OS is not a SaaS subscription and should not be sold as one. The client owns the stack. Asc3nd does the setup. The offer, pricing, legal framing, and sales script must all reflect that ownership model consistently.

---

## Who this is for

- Northwest nonprofits and social-purpose organizations needing AI-assisted operations
- Organizations that have been burned by overbuilt automation or lost control of their tools
- Founders and executive directors who want human oversight of all AI outputs
- Organizations that need one-time setup, not a perpetual software subscription

---

## What the client owns (summary)

After deployment the client owns and controls:

| Asset | Owner after deployment |
|---|---|
| VPS or server | Client |
| Source code (MIT license) | Client |
| Database and all backups | Client |
| API keys and credentials | Client |
| Hermes agent runtime config | Client |
| ICM workspace and all tenant data | Client |
| Domain and DNS | Client |

Asc3nd has no access to the client's server after handoff unless the client purchases optional ongoing support.

---

## What Asc3nd provides

Asc3nd is the implementation partner, not the software licensor:

- Discovery and tenant configuration
- VPS provisioning and deployment assistance
- Agent configuration and ICM workspace setup
- Hermes runtime setup and configuration
- Data ingestion and knowledge base loading
- Staff training and onboarding
- Optional maintenance (security updates, dependency updates, backup checks)
- Optional managed-agent support (agent monitoring, skill updates, workflow tuning)

---

## What is included in a standard deployment

- Mission OS control plane (ops dashboard, approval queue, event journal, artifact registry)
- Managed Hermes agent bundle (agent runtime config, skills, ICM workspace)
- LiteLLM model gateway configuration
- Langfuse observability configuration
- Open WebUI staff-facing workspace configuration
- Tenant agent pack (roles, skills, approval policies)
- missionctl CLI for operator administration
- Backup and restore setup
- Security gate suite (secret audit, CI, test coverage)
- Staff training and operator manual

---

## What is optional

- Ongoing maintenance (security updates, dependency patches, backup verification drills, monthly reports)
- Managed-agent support (agent monitoring, prompt and skill updates, ICM workflow tuning, artifact review, quarterly improvement cycles)
- Staff training beyond initial onboarding
- Custom skill development
- Multi-tenant expansion (additional organizations on the same VPS)

---

## What is not included

- Grant funding (we help draft applications; funding decisions are made by funders)
- Legal compliance certification for HIPAA, FERPA, COPPA, or other regulations
- AI model API costs (billed directly to client's account with the model provider)
- VPS hosting costs (billed directly to client via Hostinger or other provider)
- Third-party integration costs (Postiz, Twilio, Composio — billed directly to client)
- Emergency incident response outside normal support hours

---

## How the deployment process works

1. **Discovery** — Operator reviews organization workflows, programs, and staff roles
2. **Tenant configuration** — `missionctl tenant create` and `missionctl pack generate`
3. **VPS provisioning** — Client provisions a VPS; operator configures it following `docs/VPS-BOOTSTRAP-RUNBOOK.md`
4. **Go-live gates** — Gates A–N from `docs/PHASE-9-GO-LIVE-GATES.md` must pass before any live command runs
5. **Staff onboarding** — 14-day structured onboarding per `docs/ONBOARDING-14-DAY-LAUNCH.md`
6. **Handoff** — Client receives all credentials, documentation, and operator access

---

## What is dry-run vs. live

| State | Meaning |
|---|---|
| Dry-run | All Mission OS control plane commands run locally without touching live infrastructure. Agent configuration is generated. No live Docker, VPS, or external API calls. |
| Live (Phase 9B) | VPS is provisioned, DNS is configured, Docker services are running, and real agent execution is enabled. Go-live gates A–N must pass before live commands run. |

Current Phase 9 build is dry-run. Phase 9B live deployment requires a human-provided VPS IP, SSH access, staging domain, and explicit Architect approval.

---

## Where to read the detailed docs

| Document | Purpose |
|---|---|
| `docs/SOVEREIGN-AI-OFFER.md` | Client-facing plain-English offer sheet |
| `docs/ONE-TIME-SETUP-FEE-OFFER.md` | One-time setup fee structure and payment plan |
| `docs/MAINTENANCE-PACKAGE.md` | Optional ongoing maintenance definition |
| `docs/MANAGED-AGENT-SUPPORT-PACKAGE.md` | Optional managed-agent support definition |
| `docs/CLIENT-OWNED-STACK-AGREEMENT-NOTES.md` | Ownership model notes for attorney review |
| `docs/SOVEREIGN-AI-FAQ.md` | Frequently asked questions |
| `docs/SOVEREIGN-AI-SALES-CALL-SCRIPT.md` | Sales call script with discovery questions |
| `docs/IMPLEMENTATION-SOW-OUTLINE.md` | Statement of work outline (not a contract) |
| `docs/PRICING.md` | Draft pricing tiers (DRAFT — requires human approval) |
| `docs/SOVEREIGN-AI-CLIENT-STACK.md` | Technical architecture and ownership model |
| `docs/PNW-NONPROFIT-OFFER.md` | Northwest nonprofit-specific offer detail |
| `docs/MANAGED-AGENTS-AS-A-SERVICE.md` | Managed agent runtime technical detail |
| `docs/LEGAL-SAFETY-NOTES.md` | Safety boundaries and what Mission OS will not do |
| `docs/ONBOARDING-14-DAY-LAUNCH.md` | 14-day structured onboarding plan |
| `docs/PHASE-9-GO-LIVE-GATES.md` | Go-live gate checklist (Gates A–N) |

---

## Required language

All client-facing documents in this package use this language consistently:

**Say:**
- Owned-stack deployment
- Human-reviewed agent workflows
- Approval-gated automation
- Dry-run until go-live gates pass
- Optional managed support
- No forced SaaS subscription
- Client-owned stack

**Do not say:**
- Fully autonomous production AI
- Live client deployment complete
- Guaranteed funding
- Guaranteed donations or grant wins
- SaaS subscription required
- Shared multi-tenant backend (unless explicitly configured)
