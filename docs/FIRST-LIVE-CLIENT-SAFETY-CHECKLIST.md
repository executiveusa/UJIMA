# First Live Client Safety Checklist — Mission OS

**Type:** Operator and client checklist — constraints for first live client deployment  
**Status:** Gate 6A — reviewed before go-live. Enforced at Gate N (final human signoff).  
**Branch:** `phase9/live-staging-preparation-pack`

> **This checklist defines what operators and agents may NOT do on the first day a real client is live on Mission OS. These constraints exist to protect vulnerable populations, protect client data, and prevent irreversible actions before the system is proven stable.**

> **All items in this checklist are hard blocks unless marked otherwise. Hard blocks cannot be overridden by the operator, the client, or an agent.**

---

## Section 1 — Outbound communications

### 1.1 — No youth, donor, or family outbound messaging on day one

**Block:** Do not send any outbound message (email, SMS, social post, newsletter, push notification) on behalf of the client during the first 24 hours of live operation.

**Rationale:** The approval workflow, sender configuration, and message templates must be verified in a controlled test before real recipients receive messages.

**Required before lifting:** A staff member has manually reviewed and approved a test message through the Mission OS approval queue. The approval flow is demonstrated to work end-to-end.

**Status:** [ ] Confirmed — no outbound messaging on day one

---

### 1.2 — No grant submission on day one

**Block:** Agents must not submit any grant application, LOI (letter of intent), or funding request on behalf of the client during the first live period.

**Rationale:** Grant submission is a GRANT_SUBMISSION hard block — non-negotiable, not configurable. An incorrect or premature submission can disqualify the client from a funding cycle.

**Required before lifting:** Human stakeholder explicitly reviews and approves the submission. Hermes dry-run is complete. The grant deadline is confirmed. Architect is notified before any grant submission.

**Status:** [ ] Confirmed — no grant submission on day one

---

### 1.3 — No legal or financial filing on day one

**Block:** Agents must not submit any legal document, IRS filing, financial report, or compliance document on behalf of the client during the first live period.

**Rationale:** LEGAL_FINANCIAL_FILING is a hard block — non-negotiable. Filing errors can have legal consequences.

**Required before lifting:** Human review and explicit approval from the client's authorized signatory. Architect notified before any legal/financial filing.

**Status:** [ ] Confirmed — no legal or financial filing on day one

---

### 1.4 — No public publishing on day one

**Block:** Agents must not publish any content to the client's public website, social media accounts, press release distribution, or public-facing channels during the first live period.

**Rationale:** PUBLIC_PUBLISHING is a hard block. Content errors on a live public channel are visible to all audiences and can damage the client's reputation before any correction can be made.

**Required before lifting:** Staff approval workflow is tested and confirmed working. At least one staff member has approved a test post through Mission OS and confirmed the result.

**Status:** [ ] Confirmed — no public publishing on day one

---

## Section 2 — Data handling

### 2.1 — No sensitive data ingestion until data policy is reviewed

**Block:** Do not ingest real client data that includes: donor PII, beneficiary records, financial records, health information, immigration status, or records of individuals under 18 until the data policy is reviewed with the client.

**Rationale:** The client must understand what data Mission OS stores, where it is stored, and who can access it before real sensitive data is loaded.

**Required before lifting:**
- Client has read the data handling section of the go-live scope document
- Operator has confirmed VPS data encryption at rest (if applicable)
- If HIPAA / FERPA / COPPA flags were raised in Discovery: legal counsel has reviewed and confirmed scope

**Status:** [ ] Confirmed — no sensitive data ingested until data policy reviewed

---

### 2.2 — No cross-tenant data access

**Block:** No agent, operator, or integration may access data from one client tenant while operating as another.

**Rationale:** CROSS_TENANT_ACCESS is a hard block — non-negotiable. Tenant isolation is a core safety property of Mission OS.

**Status:** [ ] Confirmed — cross-tenant access is not permitted

---

## Section 3 — External integrations

### 3.1 — No external integrations beyond the approved list

**Block:** Do not connect Mission OS to any external service, API, database, or third-party tool that is not on the approved integration list agreed with the Architect and client before go-live.

**Rationale:** Each external integration expands the data surface and must be reviewed individually before it handles real client data.

**Approved integrations for day one (operator to fill):**  
`[APPROVED_INTEGRATIONS_LIST]`

Any integration not on this list requires Architect approval before it is connected.

**Status:** [ ] Confirmed — no unapproved integrations

---

### 3.2 — No unrestricted external API calls

**Block:** Agents must not make unrestricted external API calls (calls to external endpoints not reviewed in the go-live scope). UNRESTRICTED_EXECUTION is a hard block.

**Status:** [ ] Confirmed — all external API calls are within the approved scope

---

## Section 4 — Operational readiness

### 4.1 — Dry-run demo before first real client session

**Required:** Before the client's first real session on Mission OS, the operator must conduct a dry-run demo using demo tenant data only, confirming:

- The approval queue works end-to-end
- At least one agent action was reviewed and approved by a staff member
- Hard blocks are visible and working (attempt a blocked action in demo mode; confirm it is blocked)
- The operator can pause or stop agents using the Mission OS control interface

**Status:** [ ] Dry-run demo completed — date: `[DEMO_DATE]`

---

### 4.2 — Staff approval workflow tested

**Required:** At least one designated staff member has:
1. Logged into Mission OS with their own credentials
2. Reviewed a pending agent action in the approval queue
3. Approved or rejected the action and confirmed the outcome

**Tested by:** `[STAFF_MEMBER_NAME]` on `[TEST_DATE]`

**Status:** [ ] Staff approval workflow confirmed working

---

### 4.3 — Operator can pause agents

**Required:** The operator can pause all agent activity using the Mission OS control interface or CLI without needing Architect assistance.

Confirm by running (in demo mode):

```bash
node missionctl/missionctl.mjs agent pause --all --dry-run
```

**Status:** [ ] Operator pause capability confirmed

---

### 4.4 — Backup and restore drill completed

**Required:** Before go-live, a backup is created and a restore is tested (restoring to a test environment, not overwriting live data).

Reference: `docs/BACKUP-RESTORE.md`

**Backup drill completed:** [ ] Yes — date: `[BACKUP_DRILL_DATE]`  
**Restore drill completed:** [ ] Yes — date: `[RESTORE_DRILL_DATE]`  
**Data confirmed intact after restore:** [ ] Yes

This is required by Gate K in `docs/PHASE-9-GO-LIVE-GATES.md`.

---

## Section 5 — Credentials and access

### 5.1 — Client owns all credentials

**Required:** Before the first live client session:

- Client holds their own VPS credentials (SSH key or password in their password manager)
- Client holds their own AI model API key (in their password manager)
- Client holds their own DNS credentials
- Asc3nd does not hold the only copy of any client credential

**Status:** [ ] Confirmed — client holds all credentials independently of Asc3nd

---

### 5.2 — Asc3nd access boundaries documented

**Required:** The client understands what Asc3nd can and cannot access on their system:

- Asc3nd has no standing access to the client's VPS unless explicitly granted by the client for a support session
- Asc3nd does not have access to the client's AI model API key
- Asc3nd does not have access to the client's database unless the client grants it for a specific support reason
- The client can revoke Asc3nd's access at any time by rotating SSH keys or revoking access credentials

**Status:** [ ] Client briefed on Asc3nd access boundaries

---

## Section 6 — Hermes agent runtime

### 6.1 — Hermes is in dry-run mode until explicitly activated

**Block:** Hermes agent runtime remains in dry-run mode during the first live staging period. Hermes is not activated for real client workflow execution until Architect authorizes Gate N (final human signoff).

**Status:** [ ] Confirmed — Hermes is in dry-run mode

---

### 6.2 — No agent action affects real external recipients until activation

**Block:** No agent action that would contact a real person, submit a real form, or produce a real external artifact is permitted until Hermes is explicitly activated at Gate N.

**Status:** [ ] Confirmed — no real external agent actions before Gate N

---

## Checklist sign-off

All items above must be confirmed before the client's first live session on Mission OS.

**Operator confirmation:**  
I confirm that all items in this checklist are checked and all hard blocks are in effect. No grant submission, legal/financial filing, outbound messaging, public publishing, cross-tenant access, or unrestricted external execution will occur during the first live period.

Operator name: `[OPERATOR_NAME]`  
Date: `[SIGNOFF_DATE]`

**Client confirmation:**  
I understand the constraints described in this checklist and agree that they apply to our first live deployment of Mission OS.

Client representative: `[CLIENT_REPRESENTATIVE_NAME]` — Title: `[CLIENT_REPRESENTATIVE_TITLE]`  
Date: `[CLIENT_SIGNOFF_DATE]`

---

*This checklist is required by Gate 6A. It must be reviewed by the Architect and confirmed by the client operator before any real client operates on Mission OS. Hard blocks cannot be lifted without Architect authorization.*
