# PNW Nonprofit Offer — Mission OS v0.6

**Audience:** Northwest nonprofits, youth programs, sports organizations, social-purpose companies  
**Purpose:** Define what Mission OS delivers, to whom, and what is included vs. deferred  
**What is not here:** Guarantees of outcomes, live integrations, grant approvals, legal filings

---

## What this is

Mission OS is a managed agentic operating system for Northwest social-purpose organizations.

It is not a website builder. It is not a chatbot. It is not an automation platform that executes on your behalf without approval.

It is a system that gives your organization:

1. A public website that humans and AI agents can both read
2. A private internal operations dashboard for staff
3. A structured approval queue that intercepts every external action before it runs
4. An agent room where AI-assisted work is initiated and supervised
5. A model budget ledger so spending on AI tools is visible and capped
6. Trace links so every AI output is auditable
7. A deployment lifecycle so updates can be rehearsed before going live
8. Backup and restore so mission data can be recovered
9. Security gates and CI so the codebase passes automated quality checks before deployment

---

## Who this is for

- **Northwest nonprofits** running youth programs, sports leagues, arts organizations, community centers
- **Social-purpose companies** that work with youth data, donor data, or community members
- Organizations that cannot staff a developer but need operational AI discipline
- Organizations that have been burned by over-promised automation tools and want human control first

---

## What is included

### Public-facing layer

- Custom AI-readable public website (Next.js, deployed to Vercel)
- Staff can update content without coding
- Website is readable by search engines and AI agents
- Public contact form routes through the approval queue (no auto-response)

### Internal operations dashboard

- `/ops` — overview: tenant health, recent events, agent status
- `/ops/agents` — provisioned managed agents, health status
- `/ops/artifacts` — output artifacts registered by agents
- `/ops/events` — typed audit event feed
- `/ops/budgets` — model usage and spend per AI surface
- `/ops/deployments` — release, upgrade, rollback, backup lifecycle
- `/ops/health` — system health check

### Operator control plane

- `missionctl` CLI for tenant administration
- Operator key management with scope-based access control
- Tenant-isolated data: one tenant cannot read another's files
- Billing export: JSON/CSV of model usage and artifact counts

### Agent and approval layer

- Approval queue for every external action before it executes
- Risk classification: green (read), yellow (draft), orange (external), red (money/legal/youth)
- Agent room for supervised AI-assisted workflow execution
- Human staff must explicitly approve orange and red actions

### Managed Hermes bundle

- Hermes agent runtime configuration (dry-run; live execution requires VPS + credentials)
- LiteLLM model gateway configuration
- Langfuse observability configuration
- Open WebUI workspace configuration
- All generated env files are gitignored; never tracked in version control

### Security and CI gates

- Secret scan: blocks raw API keys, auth tokens from tracked files
- Generated-file audit: blocks runtime artifacts from git
- Test discovery audit: ensures all test files run
- CI pipeline: runs on every push, requires no external secrets
- Full Phase 7 security gate suite

### Backup and restore

- Tenant backup: archives mission-data to timestamped bundle
- Restore: validates path traversal guard, extracts to tenant directory
- Dry-run tested; live restore on VPS requires real deployment (Phase 8)

---

## What is not included in the current build

These require live infrastructure and are deferred to a production deployment phase:

| Capability | Status |
|---|---|
| Live VPS deployment (Hostinger) | Deferred — requires VPS IP, DNS, TLS |
| Live Postgres database | Deferred — currently file-backed state |
| Live Hermes agent execution | Deferred — requires running Hermes container |
| Live LiteLLM model routing | Deferred — requires API keys and running LiteLLM |
| Live Langfuse trace sync | Deferred — requires running Langfuse instance |
| Live Open WebUI workspace | Deferred — requires running Open WebUI |
| Postiz scheduling | Deferred — adapter seam exists; live key and approval needed |
| SMS/voice (Twilio) | Deferred — webhook logging exists; live Twilio needs key + approval gate |
| Grant portal browser automation | Deferred — requires explicit human-approved task plan and live credentials |

---

## What the system does NOT do (non-negotiable)

These actions are permanently blocked by the approval policy:

- No automatic grant submission
- No automatic legal or compliance filing
- No automatic outbound messages to donors, youth, families, or community members
- No automatic public publishing (social media, email lists)
- No browser automation on external portals without explicit human approval
- No cross-tenant file access
- No unrestricted shell or browser execution

---

## Target organizations

| Type | Example use cases |
|---|---|
| Youth sports leagues | Volunteer coordination, event scheduling, coach communications (with approval) |
| Youth arts programs | Grant research drafts, community outreach drafts, artifact registry |
| Community health nonprofits | Service coordination drafts, donor outreach drafts (with approval) |
| Workforce development orgs | Program tracking, application drafts, partner communications |
| Faith-based community orgs | Event coordination, volunteer management, communications drafts |

---

## Geographic scope

Currently designed for Northwest organizations (Washington, Oregon, Idaho). The system architecture supports multi-tenant deployment for multiple organizations on a single VPS. No geographic restrictions in the codebase.

---

## Relationship to Phase 8

This document reflects the Phase 8 deliverable state: the full control plane, security gates, audit layer, approval system, and documentation package are complete. Live VPS deployment with real credentials is the next step (Phase 8 handoff to production).
