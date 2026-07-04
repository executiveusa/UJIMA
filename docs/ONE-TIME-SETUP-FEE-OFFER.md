# One-Time Setup Fee — Asc3nd Mission OS™

**Type:** Operator/sales reference  
**Status:** Gate 5A — ready for Architect review before client use  
**Pricing:** DRAFT — requires human approval before quoting

---

## Summary

Mission OS is delivered as a one-time setup engagement. The client pays a setup fee for implementation. After handoff, the client owns the system and has no forced subscription obligation to Asc3nd.

---

## What the setup fee covers

The one-time setup fee covers everything required to deliver a working, client-owned Mission OS installation:

### Discovery and scoping
- Initial discovery call and workflow review
- Organization intake (programs, staff roles, data sources)
- Tenant configuration scoping
- Agent pack selection and customization planning

### Tenant configuration and agent pack
- `missionctl tenant create` — tenant record and configuration
- `missionctl pack generate` — agent pack with roles, skills, and approval policies
- Knowledge base ingestion (documents, policies, program descriptions)
- ICM stage contract configuration

### VPS provisioning and deployment
- VPS specification and provisioning guidance
- Server hardening and service deployment
- Caddy reverse proxy, TLS, DNS configuration assistance
- Mission OS control plane deployment
- Hermes agent runtime deployment and configuration
- LiteLLM model gateway configuration
- Langfuse observability configuration
- Open WebUI staff workspace setup
- Backup and restore configuration
- Security gate suite validation

### Onboarding and handoff
- Staff onboarding (Day 1–14 structured plan per `docs/ONBOARDING-14-DAY-LAUNCH.md`)
- Operator training (missionctl CLI, approval queue, event journal)
- Full handoff: all credentials, documentation, operator access
- Operator manual delivery

---

## Pricing tiers (DRAFT — requires human approval before quoting)

These are planning-phase ranges. Final pricing is scoped per engagement after discovery.

### Starter — $1,500–$3,000 setup

Best for: Small nonprofits with 1–3 programs, 1–5 staff, basic workflows.

Includes:
- Discovery call and tenant configuration
- Single-agent pack (standard nonprofit template)
- VPS provisioning assistance (client provisions VPS)
- Knowledge base ingestion (up to 20 documents)
- Basic staff onboarding (one half-day session)
- Operator manual and handoff documentation

Not included:
- Custom skill development
- Multi-program agent packs
- Extended onboarding

---

### Managed — $3,000–$6,000 setup

Best for: Established nonprofits with 3–8 programs, 5–20 staff, active grant and communications workflows.

Includes everything in Starter, plus:
- Multi-program agent pack configuration
- Extended knowledge base ingestion (up to 100 documents)
- Full 14-day structured onboarding
- Custom approval policy configuration
- Agent workflow tuning (one revision cycle)
- Monthly status call during onboarding period

Not included:
- Custom skill development
- Multi-tenant expansion
- Long-term managed support (available as separate optional package)

---

### Partner — $6,000–$12,000 setup

Best for: Larger nonprofits, coalitions, or social-purpose organizations with complex workflows, multiple programs, or multi-department operations.

Includes everything in Managed, plus:
- Deep workflow discovery (up to 3 discovery sessions)
- Custom agent skill development (up to 2 custom skills)
- Extended knowledge base ingestion (up to 500 documents)
- Multi-department agent configuration
- Multi-tenant expansion planning (if applicable)
- Quarterly improvement cycle (first quarter included)
- Priority support during deployment and onboarding

---

### Custom — scoped per engagement

For organizations with unusual requirements, large scale, multi-tenant configurations, or specialized integrations.

Scoped after a discovery session. Contact Asc3nd to discuss.

---

## Payment structure

Payment plans are available for all tiers. Typical structure:

| Milestone | Payment |
|---|---|
| Discovery and contract signing | 25% |
| Tenant configuration complete | 25% |
| VPS deployment and go-live gates pass | 25% |
| Staff onboarding and handoff complete | 25% |

Payment terms are negotiable. Asc3nd does not require full payment before work begins.

---

## What is not covered by the setup fee

The following costs are paid directly by the client to the relevant providers — not through Asc3nd:

| Cost | Provider | Typical range |
|---|---|---|
| VPS hosting | Hostinger, DigitalOcean, or other | $20–$80/month |
| AI model API usage | OpenAI, Anthropic, Google, or other | Varies by usage |
| Domain registration | Client's registrar | $10–$50/year |
| Optional: Postiz (social scheduling) | Postiz | Per provider pricing |
| Optional: Twilio (SMS/voice) | Twilio | Per provider pricing |

Asc3nd does not mark up third-party API costs.

---

## After the setup fee: what happens next

After handoff, the client owns the system and can operate it independently. Asc3nd has no access to the client's server unless the client purchases optional ongoing support.

Optional packages available separately:
- **Maintenance package** — Security updates, dependency patches, backup verification drills, monthly reports. See `docs/MAINTENANCE-PACKAGE.md`.
- **Managed-agent support package** — Agent monitoring, prompt refinement, workflow tuning, quarterly improvement cycles. See `docs/MANAGED-AGENT-SUPPORT-PACKAGE.md`.

Both are optional. Neither is required to use Mission OS. Neither constitutes a forced SaaS subscription.

---

## What Asc3nd does not provide

- Grant funding (we help draft applications; funding decisions are made by funders)
- Legal compliance certification (HIPAA, FERPA, COPPA, or other regulations)
- Guaranteed outcomes of any kind
- Emergency incident response outside normal support hours (unless covered by a support package)

---

*Pricing is DRAFT and subject to change. Final pricing is scoped per engagement after discovery. This document does not constitute a contract. Payment terms are negotiated individually.*
