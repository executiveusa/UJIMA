# Implementation Statement of Work — Outline

**Type:** Internal operator reference / attorney review aid  
**Status:** Gate 5A — ready for Architect review before client use  
**Important:** This is an outline, not a contract. Attorney/client contract review required before use as a binding agreement. This document does not create any legal obligations.

---

## Purpose

This outline describes the intended scope of a Mission OS implementation engagement. It is designed to be used as the starting point for a formal statement of work drafted by an attorney familiar with technology services agreements.

Operators use this outline to structure scoping conversations and proposals. The final SOW is a legal document drafted and reviewed by qualified counsel — this outline is not that document.

---

## Parties (to be completed per engagement)

- **Implementation Partner:** Asc3nd (entity name, address, contact to be confirmed per engagement)
- **Client:** [Client organization name, legal entity type, address]
- **Client Operator Contact:** [Name, title, email — the person who will administer the system after handoff]
- **Engagement Start Date:** [To be determined]
- **Engagement End Date:** [To be determined — typically 6–10 weeks from start]

---

## Scope of work

### Phase 1 — Discovery and scoping (Week 1)

Deliverables:
- Discovery session(s) with client staff
- Organization workflow review document
- Tenant configuration plan (programs, roles, agent pack selection, knowledge base inventory)
- Confirmation of VPS requirements and hosting provider selection

Client responsibilities:
- Provide access to relevant staff for discovery sessions
- Provide organization documents for knowledge base ingestion (program descriptions, policies, FAQs)
- Select and provision VPS with specifications provided by Asc3nd

Not included:
- IT infrastructure assessment beyond Mission OS requirements
- Security auditing of existing client systems

### Phase 2 — Tenant configuration and agent pack (Week 2)

Deliverables:
- Tenant record created via `missionctl tenant create`
- Agent pack generated via `missionctl pack generate` with roles, skills, and approval policies
- Knowledge base documents ingested
- ICM stage contract configuration

Client responsibilities:
- Review and approve agent pack configuration before deployment
- Provide final versions of knowledge base documents

### Phase 3 — VPS deployment (Week 3)

Deliverables:
- Server hardened and configured per `docs/VPS-BOOTSTRAP-RUNBOOK.md`
- Caddy reverse proxy, TLS, and DNS configured
- All services deployed:
  - Mission OS control plane
  - Hermes agent runtime
  - LiteLLM model gateway
  - Langfuse observability service
  - Open WebUI staff workspace
- Backup configuration complete
- Go-live gates A–N passing per `docs/PHASE-9-GO-LIVE-GATES.md`

Client responsibilities:
- Provide VPS IP address, SSH access for deployment
- Provide domain name and DNS access for configuration
- Provide model provider API keys (OpenAI, Anthropic, or other)
- Review and sign off on go-live gate results before live operations begin

Gate N (final human signoff) requires explicit written client approval before live agent operations commence.

### Phase 4 — Staff onboarding (Week 4)

Deliverables:
- 14-day structured onboarding per `docs/ONBOARDING-14-DAY-LAUNCH.md`
- Operator training: missionctl CLI, approval queue, event journal, artifact review
- Staff training: ops dashboard usage, how to review and approve agent outputs
- Incident response walkthrough: how to handle unexpected outputs, how to pause agents

Client responsibilities:
- Designate an operator contact to attend all operator training sessions
- Make relevant staff available for onboarding sessions
- Complete Day 1–14 onboarding checklist

### Phase 5 — Handoff (Week 5–6)

Deliverables:
- All credentials transferred to client (VPS root, database, API keys, SSH keys)
- Asc3nd SSH access revoked (or, if ongoing support contracted, limited access documented)
- Operator manual delivered: `docs/OPERATOR-MANUAL.md`
- All VPS runbooks and deployment documentation delivered
- Final acceptance checklist completed and signed

Acceptance criteria:
- Client operator can log in to the ops dashboard
- Client operator can run `missionctl` commands independently
- Backup restore drill completed successfully
- Client confirms receipt of all credentials and documentation
- Client signs handoff acceptance

---

## Deliverables summary

| Deliverable | Phase | Owner |
|---|---|---|
| Workflow review document | 1 | Asc3nd |
| Tenant configuration plan | 1 | Asc3nd |
| Agent pack (approved) | 2 | Asc3nd |
| Knowledge base ingested | 2 | Asc3nd |
| VPS deployment complete | 3 | Asc3nd |
| Go-live gates passing | 3 | Asc3nd |
| Operator training complete | 4 | Asc3nd |
| Staff onboarding complete | 4 | Asc3nd |
| Operator manual | 5 | Asc3nd |
| Credentials transferred | 5 | Asc3nd |
| Handoff acceptance | 5 | Client + Asc3nd |

---

## Pricing and payment (to be finalized per engagement)

Pricing is scoped per engagement. Reference: `docs/PRICING.md` (DRAFT — requires human approval before quoting).

Suggested payment milestones (for attorney review — not binding):
- 25% at contract signing
- 25% at tenant configuration complete
- 25% at go-live gates passing
- 25% at handoff acceptance

Payment terms, late fees, and cancellation terms to be specified in the formal SOW.

---

## What is not in scope

The following items are explicitly out of scope unless added by written amendment:

- Grant writing services (agents draft; staff review and submit — Asc3nd does not write grants)
- Legal compliance certification (HIPAA, FERPA, COPPA, or any other regulatory framework)
- Emergency incident response outside normal business hours (unless separately contracted)
- Custom skill development beyond the agent pack included in the selected tier
- Multi-tenant expansion (additional organizations on the same VPS)
- Data migration from existing CRM or database
- Third-party integrations beyond standard Mission OS stack (Postiz, Twilio, Composio — available at additional scope)
- Guaranteed outcomes of any kind (funding, donor response, AI output quality)

---

## Change control

Changes to scope require written agreement from both parties. Oral changes are not binding.

---

## Acceptance

Client acceptance of Phase 5 deliverables constitutes successful completion of the implementation engagement. Post-handoff work (maintenance, managed-agent support, custom development) is governed by separate agreements.

---

## Areas requiring attorney drafting

The following must be specified in the formal SOW by qualified legal counsel:

1. Entity identification and authorized signatories
2. Exact payment amounts, due dates, and invoicing terms
3. Late payment and dispute resolution procedures
4. Warranty disclaimer (services provided as-is; no guarantee of fitness for particular purpose)
5. Liability limitation (cap on damages, exclusion of consequential damages)
6. Data handling and confidentiality terms during engagement
7. Governing law and jurisdiction
8. Termination and cancellation procedures
9. Intellectual property terms (client owns all data; MIT license governs code)
10. Insurance requirements (if applicable)

---

*This outline is for internal planning and attorney review only. It is not a contract, a quote, or a binding commitment. No legal obligations are created by this document. All formal agreements require attorney drafting and signature by authorized representatives of both parties.*
