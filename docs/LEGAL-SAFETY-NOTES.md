# Legal and Safety Notes — Mission OS v0.6

**Audience:** Staff, operators, Architect, clients  
**Purpose:** State clearly what Mission OS will and will not do automatically, and what human actions are always required  
**What is not here:** Legal advice, compliance guarantees, or representations about specific regulatory requirements  
**Gate 5A:** Attorney review notes at `docs/CLIENT-OWNED-STACK-AGREEMENT-NOTES.md`. SOW outline at `docs/IMPLEMENTATION-SOW-OUTLINE.md`.

---

## This document is not legal advice

Mission OS is a software system. Nothing in this document or in the system constitutes legal advice, compliance certification, or a guarantee of regulatory compliance. Organizations using Mission OS for activities involving youth data, donor data, financial submissions, or legal filings are responsible for their own legal and compliance review.

---

## Human approval gates (non-negotiable)

The following actions are permanently blocked by the Mission OS approval policy until a human operator creates an `APPROVED` approval record:

### Red actions (always require human approval)

- Grant submission to any external portal or funding body
- Legal or compliance filing of any kind
- Financial transactions, invoices, or payment authorizations
- Access to or communication involving youth records or minor data
- Access to sensitive personal data (health, family status, immigration)
- Any action that creates a legally binding obligation

### Orange actions (always require human approval)

- Outbound messages to donors, volunteers, community members, or families
- Public publishing to social media, email lists, or web properties
- Outbound contact with youth, minors, coaches, or parents
- Browser automation on any external portal (grants, government, banking)
- API calls to external services on behalf of a real person or organization

### What "human approval required" means

1. A staff member with operator-level access reviews the proposed action
2. The staff member creates an approval record in `APPROVED` state
3. The approval record is stored in `mission-data/<tenant>/approvals/`
4. Only after this can the action be dispatched

The system does not bypass this gate under any circumstances. Agents and automation tools route through the approval policy layer before any orange or red action.

---

## What the system does NOT do automatically

| Action | Status |
|---|---|
| Submit grants or funding applications | Never automatic |
| File legal or compliance documents | Never automatic |
| Send emails, SMS, or calls to donors | Never automatic |
| Send emails, SMS, or calls to youth or families | Never automatic |
| Make financial payments or authorizations | Never automatic |
| Post to social media | Never automatic |
| Contact community members on behalf of the org | Never automatic |
| Execute browser automation without a task plan | Never automatic |

These restrictions are enforced at the `packages/core/src/worker-contracts.js` level and cannot be overridden by agent configuration.

---

## Youth data protection

Organizations serving minors (youth sports, arts programs, after-school programs) must observe these constraints:

- Youth records (names, contact info, participation history, health notes) are stored in `mission-data/<tenant>/` which is gitignored and never committed to version control
- No automated outbound communication to youth or their families
- Any agent action involving youth records is classified red and requires human approval
- Staff must not store sensitive youth data in artifact titles, event payloads, or any field that appears in the ops dashboard display layer

Mission OS does not implement COPPA, FERPA, or state-specific youth privacy law compliance. Organizations are responsible for their own legal compliance review.

---

## Donor data protection

- Donor records are tenant-isolated (one tenant cannot read another's data)
- No automated outbound communication to donors without explicit orange/red approval
- Donor data should not be stored in plaintext in tracked files
- Operator keys and session tokens are hashed at rest; raw keys are never stored

---

## Security boundaries

| Boundary | Enforcement |
|---|---|
| Tenant isolation | Path validation: `DATA_DIR/<tenantId>/` is the only writable path |
| Cross-tenant read | Blocked at core module level; operator key is scoped to one tenant |
| Path traversal | Backup/restore rejects `../` and absolute paths in IDs |
| Secret hygiene | `scripts/secret-audit.mjs` blocks raw keys in tracked files |
| Generated file hygiene | `scripts/generated-file-audit.mjs` blocks runtime artifacts in git |

---

## Historical key note (Phase 6 hotfix)

Commits at or before `500c13b` in this repository tracked demo-only generated env files containing key-like values. These keys are non-production and have been treated as invalid. They were never used in a live system.

No history rewrite was performed. If you are reviewing historical commits, do not use, rotate, or reference any key values from `500c13b` or earlier handoff env file history. See `docs/AGENT-PROVENANCE.md` Session 4b for the authoritative record.

---

## Live deployment credential rotation

Before a live VPS deployment:

1. All placeholder values in `.env.managed` must be replaced with real, freshly generated credentials
2. The `JWT_SECRET` and `NEXTAUTH_SECRET` used in production must not match any value that appeared in a development or test environment
3. The `POSTGRES_PASSWORD` must be generated fresh at deploy time
4. All LiteLLM, Langfuse, and Open WebUI keys must be generated fresh
5. Old demo keys must be revoked and not reused

`missionctl bundle up <slug>` generates fresh credentials for managed env files. Generated files go to `handoff/<slug>/managed/` which is gitignored.

---

## What Mission OS cannot guarantee

Mission OS is software. It does not guarantee:

- Grant funding outcomes
- Legal compliance with any specific regulation
- Regulatory acceptance of any submission
- Outcome of any communication to donors, funders, or community members
- Accuracy of any AI-generated draft (all drafts require human review)
- Data protection equivalence to enterprise-grade managed security (that requires a full security audit by a qualified firm)

---

## Known dry-run limitations in current build

Phase 8 is a demo-ready, production-hardened control plane. It is not a live production system. Known limitations:

- All deployment commands run in dry-run mode (no live Docker, VPS, or external calls)
- Approval workflow is file-backed (not Postgres-backed; no email notifications to approvers)
- Agent execution is configuration-only (real Hermes execution requires live VPS + credentials)
- Model usage ledger is file-backed (no live billing data from real providers)
- Backup storage is local-only (no remote offsite storage)

These limitations are acceptable for a demo and handoff. Production deployment (Phase 9) closes them.
