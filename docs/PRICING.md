# Pricing — Mission OS v0.6

**Audience:** Prospective clients, staff, operators  
**Purpose:** Draft pricing tiers for the managed agentic operating system service  
**Status: DRAFT — These are planning-phase figures. Final pricing requires a sales conversation and is not guaranteed by this document.**  
**Gate 5A:** Full offer package at `docs/SOVEREIGN-AI-OFFER-PACKAGE.md`. Setup fee detail at `docs/ONE-TIME-SETUP-FEE-OFFER.md`.

---

## Pricing model

Mission OS is a managed service with a setup fee and a monthly recurring fee. Pricing covers:

- Deployment of the Mission OS control plane (tenant, ops dashboard, agent layer)
- Monthly operator support (approval queue review, updates, backup verification)
- One tenant (organization) per deployment

Additional tenants on a shared VPS may be added at a reduced rate after the first tenant is operational.

---

## Tiers (DRAFT)

All prices are in USD. These are draft figures for planning conversations only.

### Starter

**Who it's for:** Small nonprofits and community orgs with limited staff and budget  
**Includes:**
- Public website (Next.js, Vercel deployment)
- Ops dashboard (read-only for one staff user)
- Approval queue (manual review by operator)
- One agent pack (mission-os-standard)
- 3 months of monthly operator support
- Backup/restore setup and one verified drill

**Does not include:** Custom agent skill development, live Hermes execution, LiteLLM API budget, advanced integrations

**Draft setup fee:** $1,500–$3,000  
**Draft monthly fee:** $150–$300

---

### Managed

**Who it's for:** Nonprofits with active programs, multiple staff users, and recurring AI-assisted workflows  
**Includes:**
- Everything in Starter
- Custom tenant agent pack
- Ops dashboard with full staff access
- Approval workflow configuration for standard action types
- LiteLLM model gateway configuration (API keys provided by client)
- Langfuse observability configuration
- Monthly model budget review and reporting
- 6 months of monthly operator support
- Quarterly backup/restore drill

**Does not include:** Live Hermes execution at scale, Postiz scheduling, Twilio voice integration, Postgres live migration

**Draft setup fee:** $3,000–$6,000  
**Draft monthly fee:** $300–$600

---

### Partner

**Who it's for:** Organizations that want a deeper integration with Mission OS across multiple programs or departments  
**Includes:**
- Everything in Managed
- Multiple tenant packs (one per program or department)
- Custom skill development (up to 3 skills per quarter)
- Postiz social media scheduling setup (pending live key and approval gate)
- Deployment lifecycle rehearsal (upgrade/rollback drills)
- Priority support response

**Does not include:** Staff training on AI tools (quoted separately), grant writing services, legal compliance review

**Draft setup fee:** $6,000–$12,000  
**Draft monthly fee:** $600–$1,200

---

### Custom

**Who it's for:** Organizations with specific technical requirements, multi-org deployments, or Phase 9 live VPS work  
**Includes:**
- All Partner capabilities
- Live VPS deployment (Hostinger or client-provided VPS)
- DNS and TLS setup
- Postgres migration and live tenant isolation
- Real Hermes agent execution
- Live LiteLLM and Langfuse integrations
- Staff onboarding training

**Pricing:** Scoped per engagement  
**Contact:** executiveusa@gmail.com

---

## What pricing does NOT cover

- Grant funding (we help draft applications; funding decisions are made by funders, not us)
- Legal compliance certification
- AI model API costs (OpenAI, Anthropic — billed directly to client's account)
- Hostinger VPS hosting (billed directly to client)
- Third-party integration costs (Postiz, Twilio, Composio — billed directly to client)
- Emergency incident response outside normal support hours (quoted separately)

---

## Notes on AI model costs

Mission OS includes a model budget ledger that caps AI spending per tenant. Actual AI model API costs (for OpenAI, Anthropic, or other providers) are paid directly by the client to the model provider. Mission OS does not resell API access.

Typical small nonprofit AI usage cost: $5–$50/month at current API prices, depending on volume and models used. This is highly variable and not guaranteed.

---

## Refund and cancellation

No refund policy is defined in this document. Refund terms are negotiated per engagement in a written agreement. This pricing document is a planning reference, not a contract.
