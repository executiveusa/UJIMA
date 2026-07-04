# Mission OS Implementation Proposal

**Type:** Reusable proposal template — fill all `[PLACEHOLDERS]` before sending  
**Status:** Gate 5B — template only. Requires Architect approval before client delivery.  
**Pricing:** DRAFT — all pricing marked `[DRAFT_PRICE_RANGE_REQUIRES_APPROVAL]`. Final pricing requires human approval.  
**Legal:** This document does not constitute a contract. Attorney/client review required before execution.

---

> **Operator instruction:** Replace every `[PLACEHOLDER]` with content from your discovery notes. Do not invent facts. Do not use fake client names. Do not include final dollar amounts — use `[DRAFT_PRICE_RANGE_REQUIRES_APPROVAL]`. Remove this instruction block before sending.

---

## Proposal cover

**Prepared for:** [CLIENT_NAME]  
**Organization:** [CLIENT_ORG_LEGAL_NAME]  
**Website:** [CLIENT_DOMAIN]  
**Prepared by:** Asc3nd  
**Date:** [PROPOSAL_DATE]  
**Proposal reference:** [PROPOSAL_REF_NUMBER]  
**Valid for:** 30 days from date of delivery

---

## Client context

**Organization type:** [e.g., 501(c)(3) nonprofit / social-purpose LLC / youth sports organization]  
**Staff size:** [CLIENT_STAFF_COUNT]  
**Primary programs:** [CLIENT_PROGRAMS]  
**Designated operator:** [CLIENT_OPERATOR] — [CLIENT_OPERATOR_TITLE]  
**Discovery call date:** [DISCOVERY_CALL_DATE]

**Discovery summary:**  
[DISCOVERY_NOTES — summarize what was learned in discovery: key workflows, pain points, current tools, data sensitivity flags, budget readiness, operator readiness. 2–5 sentences. From actual discovery notes only.]

---

## Executive summary

[CLIENT_NAME] is a [CLIENT_ORG_TYPE] serving [CLIENT_PROGRAMS_SHORT] in [CLIENT_GEOGRAPHY]. Based on our discovery conversation, [CLIENT_NAME] is a strong candidate for Mission OS deployment at the [RECOMMENDED_TIER] tier.

Mission OS will provide [CLIENT_NAME] with a privately deployed AI operating system that the organization owns and controls. Asc3nd will configure and deploy the system. After handoff, [CLIENT_NAME] owns the server, the source code, all data, and all credentials — with no forced subscription to Asc3nd.

This proposal describes the implementation scope, timeline, deliverables, pricing, and optional ongoing support available after handoff.

---

## Problem statement

[From discovery notes — describe the specific operational challenges the client faces. Examples: staff time on grant drafting, communications backlog, volunteer coordination, lack of visible AI governance. 3–5 sentences. Use only what was shared in discovery — do not invent problems.]

---

## Recommended Mission OS setup

Based on discovery, we recommend the **[RECOMMENDED_TIER]** tier with the following configuration:

- **Agent pack:** [AGENT_PACK_NAME, e.g., northwest-nonprofit-standard]
- **Primary workflows:** [LIST 2–4 KEY WORKFLOWS from discovery, e.g., grant drafting, outreach emails, program summaries]
- **Knowledge base:** [KNOWLEDGE_BASE_DESCRIPTION, e.g., program descriptions, grant history, policy documents — estimated N documents]
- **Model provider:** [MODEL_PROVIDER, e.g., Anthropic Claude via client API key]
- **Optional maintenance:** [Yes / No / To be decided after onboarding]
- **Optional managed-agent support:** [Yes / No / To be decided after onboarding]

---

## Client-owned stack

After deployment, [CLIENT_NAME] owns and controls:

| Asset | Owner |
|---|---|
| VPS / server | [CLIENT_NAME] |
| Source code (MIT license) | [CLIENT_NAME] |
| Database and all backups | [CLIENT_NAME] |
| API keys and credentials | [CLIENT_NAME] |
| Agent runtime configuration | [CLIENT_NAME] |
| ICM workspace and all data | [CLIENT_NAME] |
| Domain and DNS | [CLIENT_NAME] |

Asc3nd has no access to [CLIENT_NAME]'s server after handoff, unless [CLIENT_NAME] purchases optional ongoing support and grants continued access.

---

## Scope of implementation

### Included in this proposal

- Discovery and tenant configuration
- VPS provisioning assistance (client provisions VPS; Asc3nd configures)
- Agent pack: [AGENT_PACK_NAME] with roles, skills, and approval policies
- Knowledge base ingestion: [DOCUMENT_COUNT_ESTIMATE] documents
- ICM stage contract configuration for [WORKFLOW_COUNT] primary workflows
- LiteLLM model gateway configuration
- Langfuse observability configuration
- Open WebUI staff workspace configuration
- Backup and restore configuration
- Security gate suite validation (verify-v06 passing)
- 14-day structured staff onboarding
- Operator training (missionctl CLI, approval queue, event journal)
- Operator manual delivery
- Full credential handoff and access transfer

### Not included in this proposal

- Grant writing services (agents draft; [CLIENT_NAME] staff review and submit)
- Legal compliance certification (HIPAA, FERPA, COPPA, or other)
- Emergency incident response outside business hours
- Custom skill development beyond the [AGENT_PACK_NAME] pack
- Multi-tenant expansion
- Data migration from existing CRM or database
- Third-party integration setup beyond standard Mission OS stack
- Guaranteed outcomes of any kind

---

## Implementation phases

### Phase 1 — Discovery and configuration (Week 1)

- Discovery session(s) with [CLIENT_OPERATOR] and key staff
- Tenant configuration plan finalized
- Agent pack reviewed and approved by [CLIENT_NAME]
- VPS requirements confirmed

**[CLIENT_NAME] responsibilities:**
- Provide access to [CLIENT_OPERATOR] for discovery sessions
- Deliver knowledge base documents (program descriptions, policies, FAQs)
- Select and provision VPS per Asc3nd specification

### Phase 2 — Tenant setup and agent configuration (Week 2)

- Tenant record created
- Agent pack generated and approved by [CLIENT_NAME]
- Knowledge base ingested
- ICM stage contract configuration

**[CLIENT_NAME] responsibilities:**
- Review and approve agent pack before deployment
- Provide final document versions for knowledge base

### Phase 3 — VPS deployment (Week 3)

- Server configured per VPS bootstrap runbook
- All services deployed (Mission OS, Hermes, LiteLLM, Langfuse, Open WebUI)
- Backup configuration complete
- Go-live gates A–N passing
- Gate N (final human signoff) completed by [CLIENT_OPERATOR]

**[CLIENT_NAME] responsibilities:**
- Provide VPS IP, SSH access, domain name, DNS access
- Provide model provider API keys
- Review and approve go-live gate results
- Sign off on Gate N before live operations begin

### Phase 4 — Staff onboarding (Week 4)

- 14-day structured onboarding per `docs/ONBOARDING-14-DAY-LAUNCH.md`
- Operator training: missionctl CLI, approval queue, event journal
- Staff training: ops dashboard, how to review and approve agent outputs
- Incident response walkthrough

**[CLIENT_NAME] responsibilities:**
- [CLIENT_OPERATOR] attends all operator training sessions
- Relevant staff available for onboarding sessions
- Day 1–14 onboarding checklist completed

### Phase 5 — Handoff (Week 5–6)

- All credentials transferred to [CLIENT_NAME]
- Asc3nd SSH access revoked (or, if ongoing support contracted, limited access documented)
- Operator manual delivered
- Final acceptance sign-off

---

## Timeline

| Week | Phase | Key milestone |
|---|---|---|
| 1 | Discovery and configuration | Agent pack approved by [CLIENT_NAME] |
| 2 | Tenant setup | Knowledge base ingested, agent pack deployed to staging |
| 3 | VPS deployment | Go-live gates passing, Gate N sign-off |
| 4 | Staff onboarding | 14-day onboarding complete |
| 5–6 | Handoff | Credentials transferred, acceptance signed |

Timeline assumes [CLIENT_NAME] provides VPS, domain, API keys, and document access on schedule. Delays in client-side dependencies will extend the timeline accordingly.

---

## Deliverables

By the end of implementation, [CLIENT_NAME] will receive:

1. Working Mission OS control plane (ops dashboard, approval queue, event journal, artifact registry)
2. Configured Hermes agent bundle with [AGENT_PACK_NAME] agent pack
3. LiteLLM model gateway configured for [MODEL_PROVIDER]
4. Langfuse observability instance
5. Open WebUI staff workspace
6. Knowledge base loaded with [DOCUMENT_COUNT_ESTIMATE] documents
7. Backup and restore working and tested
8. Security gate suite passing (verify-v06 green)
9. Trained operator: [CLIENT_OPERATOR]
10. Trained staff for approval queue and ops dashboard
11. Operator manual (`docs/OPERATOR-MANUAL.md`)
12. Full credential handoff (VPS, database, API keys, domain)

---

## Client responsibilities

[CLIENT_NAME] is responsible for:

- Designating [CLIENT_OPERATOR] as the system operator (required for successful deployment)
- Provisioning and paying for VPS hosting directly ([VPS_PROVIDER_ESTIMATE] per month — not through Asc3nd)
- Registering and managing the domain
- Creating and paying for model provider API accounts directly (not through Asc3nd)
- Providing staff availability for discovery, training, and onboarding
- Delivering knowledge base documents on the agreed schedule
- Completing the 14-day onboarding checklist
- Signing off on go-live gates before live operations begin

---

## Asc3nd responsibilities

Asc3nd is responsible for:

- Configuring the tenant, agent pack, and ICM stage contracts
- Deploying all services on [CLIENT_NAME]'s VPS
- Running go-live gate validation
- Delivering all training sessions
- Providing the operator manual
- Transferring all credentials and revoking Asc3nd access at handoff
- Responding to questions during the onboarding period

---

## Approval and safety model

Mission OS enforces hard blocks on the following actions — these cannot be executed without explicit human approval by a designated staff member:

| Action | Approval required |
|---|---|
| Grant submission | Human approval (owner level) |
| Legal or financial filing | Human approval (owner level) |
| Outbound message to any external party | Human approval (staff level minimum) |
| Public publishing (social media, website) | Human approval (staff level minimum) |
| Cross-tenant data access | Blocked — not configurable |

No change to the approval policy is included in this proposal. Approval policies may be adjusted after deployment with Architect review.

---

## Optional maintenance (post-handoff)

After handoff, [CLIENT_NAME] may purchase optional ongoing maintenance from Asc3nd:

- Monthly security updates, dependency patches
- Quarterly backup verification drills
- Monthly status report
- Incident triage within one business day

Rate: [DRAFT_PRICE_RANGE_REQUIRES_APPROVAL]/month

This is optional. [CLIENT_NAME] can operate the system independently using the operator manual.

---

## Optional managed-agent support (post-handoff)

After handoff, [CLIENT_NAME] may purchase optional managed-agent support:

- Monthly agent health monitoring
- Prompt and skill updates (up to 4 per month, with [CLIENT_NAME] approval)
- Quarterly ICM workflow tuning
- Quarterly artifact quality review
- Quarterly improvement cycle

Rate: [DRAFT_PRICE_RANGE_REQUIRES_APPROVAL]/month

All agent changes require [CLIENT_NAME] review and approval before deployment. Managed-agent support does not remove hard blocks or approval requirements.

---

## Draft pricing

**Setup fee ([RECOMMENDED_TIER] tier):** [DRAFT_PRICE_RANGE_REQUIRES_APPROVAL]

**Payment schedule (suggested):**
| Milestone | Payment |
|---|---|
| Contract signing | 25% |
| Tenant configuration complete | 25% |
| VPS deployment and go-live gates passing | 25% |
| Handoff acceptance | 25% |

**Optional ongoing support (if selected):**  
Maintenance: [DRAFT_PRICE_RANGE_REQUIRES_APPROVAL]/month  
Managed-agent support: [DRAFT_PRICE_RANGE_REQUIRES_APPROVAL]/month

**Third-party costs paid directly by [CLIENT_NAME]:**
- VPS hosting: [VPS_COST_ESTIMATE]/month (to hosting provider)
- AI model API usage: variable (to model provider)
- Domain: [DOMAIN_COST_ESTIMATE]/year (to registrar)

*All pricing is DRAFT. Final pricing requires Architect approval and is formalized in a signed statement of work.*

---

## Out-of-scope items

The following are explicitly out of scope for this proposal:

- Grant writing services — agents draft content for staff review; Asc3nd does not write grants
- Legal compliance certification (HIPAA, FERPA, COPPA) — consult qualified legal counsel
- Emergency incident response outside business hours (unless separately contracted)
- Custom skill development beyond the [AGENT_PACK_NAME] pack
- Multi-tenant configuration (additional organizations on the same VPS)
- Data migration from [CLIENT_CURRENT_TOOLS] or other existing systems
- Guaranteed outcomes of any kind (funding, donor response, AI output quality, uptime SLA)
- [ANY_ADDITIONAL_OUT-OF-SCOPE_ITEMS_FROM_DISCOVERY]

---

## Assumptions

This proposal assumes:

- [CLIENT_NAME] will provision a VPS meeting the minimum specification (4 vCPU, 8GB RAM, 80GB SSD, Ubuntu 22.04 LTS)
- [CLIENT_OPERATOR] is available for operator training and will serve as the long-term system operator
- [CLIENT_NAME] will create API accounts with [MODEL_PROVIDER] and provide API keys before deployment
- Discovery notes accurately reflect [CLIENT_NAME]'s current workflows and data
- [CLIENT_NAME] has no HIPAA, FERPA, or COPPA compliance requirements that would prevent deployment without legal review
- [CLIENT_NAME] will register and control a domain before VPS deployment begins

---

## Risks and dependencies

| Risk | Likelihood | Mitigation |
|---|---|---|
| VPS provisioning delay | Medium | Start VPS selection in Phase 1; Asc3nd provides specification |
| Knowledge base documents not available on schedule | Medium | Collect document list in Phase 1; prioritize top 20 for initial ingestion |
| Operator availability during training | Medium | Schedule training sessions in advance; record sessions if possible |
| Model provider API rate limits during onboarding | Low | Start with conservative budget caps; expand after first month |
| [DISCOVERY-SPECIFIC RISK from intake notes] | [LIKELIHOOD] | [MITIGATION] |

---

## Next step

If [CLIENT_NAME] would like to proceed, the next step is a signed statement of work formalizing this scope. The SOW will be prepared by [LEGAL_COUNSEL_REFERENCE] and requires review by both parties before work begins.

To move forward: [SPECIFIC_NEXT_ACTION, e.g., reply to confirm interest, schedule a follow-up call, connect with your attorney]

---

*This proposal is informational and does not constitute a contract. Pricing is DRAFT and requires final approval before commitment. No legal compliance certification is provided or implied. Timeline estimates are targets, not contractual commitments. Attorney/client contract review required before execution of any formal agreement.*

*Prepared by Asc3nd | [ACSEND_CONTACT_EMAIL] | [ACSEND_CONTACT_PHONE]*
