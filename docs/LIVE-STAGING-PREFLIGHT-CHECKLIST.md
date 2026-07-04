# Live Staging Preflight Checklist — Mission OS Gate 6A

**Type:** Operator checklist — hard go/no-go gates before any live VPS command  
**Status:** Gate 6A — review and mark only. No live deployment occurs here.  
**Branch:** `phase9/live-staging-preparation-pack`

> **Gate 6B cannot begin until every hard gate in this checklist is marked PASS by the designated operator and reviewed by the Architect.**

---

## How to use this checklist

For each gate:

1. Collect the evidence listed in the "Evidence required" column
2. Verify the pass condition
3. Mark the gate PASS or FAIL
4. If FAIL — take the specified fail action before proceeding

**Hard gate** — a gate marked HARD cannot be bypassed. If a hard gate fails, Gate 6B does not start.

**Soft gate** — a gate marked SOFT must be addressed before go-live but may be documented as "accepted with mitigation" by the Architect.

---

## Gate 1 — Repository state

**Type:** HARD  
**Owner:** Operator  

**Evidence required:**
- `git status` output showing clean working tree
- `git log --oneline -1` showing expected main commit hash

**Pass condition:**
- Working tree is clean (no uncommitted changes)
- HEAD matches the expected main commit reviewed by Architect
- No untracked sensitive files (`.env`, `*.pem`, `*.key`, `id_rsa`, `id_ed25519`)

**Fail action:**
- Commit or stash any uncommitted changes
- Remove sensitive files and run `git rm --cached` if they were ever staged
- Do not proceed until `git status` is clean and HEAD is confirmed

**Status:** [ ] PASS — [ ] FAIL — [ ] NOT YET CHECKED

---

## Gate 2 — CI green

**Type:** HARD  
**Owner:** Operator  

**Evidence required:**
- Link to most recent passing CI run on the deploy commit
- All test suites passing (including `phase9-live-staging-preparation.test.js`)

**Pass condition:**
- CI pipeline passes on the exact commit being deployed
- No skipped or known-failing test suites

**Fail action:**
- Identify failing tests
- Fix failures before proceeding
- Do not deploy a commit with failing CI

**Status:** [ ] PASS — [ ] FAIL — [ ] NOT YET CHECKED

---

## Gate 3 — Secret audit clean

**Type:** HARD  
**Owner:** Operator  

**Evidence required:**
- Output of `node scripts/phase9-live-staging-readiness.mjs` showing no committed secrets
- Confirmation that `.env` files are listed in `.gitignore`
- Confirmation that no `.env*` file appears in `git ls-files`

**Pass condition:**
- No `.env` file tracked by git
- No private SSH keys tracked by git
- No API key values or tokens appear in tracked files
- `phase9-live-staging-readiness.mjs` reports all secret-absence checks PASS

**Fail action:**
- If a secret was ever committed: rotate it immediately, then remove from git history
- Do not proceed until secret audit is clean
- Document the rotation with timestamp

**Status:** [ ] PASS — [ ] FAIL — [ ] NOT YET CHECKED

---

## Gate 4 — Generated-file audit clean

**Type:** HARD  
**Owner:** Operator  

**Evidence required:**
- Confirmation that no generated secrets or tokens appear in managed placeholder files
- Intake form (`docs/VPS-DOMAIN-INTAKE-FORM.md`) contains only placeholders — no real IP, no real key fingerprint if not yet populated, consistent with current engagement state

**Pass condition:**
- All managed placeholder files contain only `[PLACEHOLDER]`-style values or confirmed operator-filled values
- No auto-generated secrets appear in any committed file
- `phase9-live-staging-readiness.mjs` reports placeholder checks PASS

**Fail action:**
- Replace any committed real values with placeholders and rotate the underlying credential
- Document the change

**Status:** [ ] PASS — [ ] FAIL — [ ] NOT YET CHECKED

---

## Gate 5 — VPS ownership confirmed

**Type:** HARD  
**Owner:** Client or designated operator with billing access  

**Evidence required:**
- VPS provider and plan confirmed in `docs/VPS-DOMAIN-INTAKE-FORM.md`
- VPS public IP recorded in secure credential manager (not in this doc)
- VPS region confirmed
- Ubuntu version confirmed (22.04 LTS or 24.04 LTS required)
- Operator can SSH to the VPS (confirmed without recording the private key here)

**Pass condition:**
- All VPS fields in intake form filled by a human
- Operator has confirmed SSH access (test login successful, noted here as "SSH confirmed on [DATE]")
- VPS meets minimum spec: 4 vCPU / 8 GB RAM / 80 GB SSD

**Fail action:**
- If VPS not yet provisioned: block Gate 6B until provisioned
- If SSH access not working: resolve before Gate 6B
- If spec below minimum: upgrade before deployment

**SSH confirmation (operator to fill):**  
`[SSH_CONFIRMED_DATE]` — confirmed by `[OPERATOR_NAME]`

**Status:** [ ] PASS — [ ] FAIL — [ ] NOT YET CHECKED

---

## Gate 6 — DNS ownership and access confirmed

**Type:** HARD  
**Owner:** Client or designated DNS admin  

**Evidence required:**
- DNS provider confirmed in intake form
- DNS management access confirmed (login tested by operator or client)
- Staging subdomain defined (e.g., `staging.example.org` or `os.example.org`)
- API staging subdomain defined (e.g., `api.example.org`)
- Confirmation that A records can be created pointing to the VPS IP

**Pass condition:**
- DNS provider login works
- Operator or client can create/update A records
- Staging and API subdomains are defined and not conflicting with existing DNS entries

**Fail action:**
- If DNS is managed by a third party: escalate to that party before Gate 6B
- If domain registrar and DNS provider differ: confirm both are accessible
- Do not begin deployment if DNS cannot be updated

**Status:** [ ] PASS — [ ] FAIL — [ ] NOT YET CHECKED

---

## Gate 7 — SSH key fingerprint recorded

**Type:** HARD  
**Owner:** Operator  

**Evidence required:**
- SSH key fingerprint (SHA256 hash of the public key — not the private key) recorded in `docs/VPS-DOMAIN-INTAKE-FORM.md` Section 4 or in the operator's secure credential manager
- Confirmation that the private key is stored only in the operator's password manager or key manager (not in any document, email, or chat)
- Confirmation that root SSH login is disabled or will be disabled per `docs/VPS-BOOTSTRAP-RUNBOOK.md`

**Pass condition:**
- Key fingerprint recorded (format: `SHA256:abc123...`)
- Private key NOT in any document or chat log
- Key stored in approved location

**Fail action:**
- If private key was shared via insecure channel: rotate the key pair immediately
- If root SSH is not disabled: add to deployment-day Step 3 as a blocking action

**Status:** [ ] PASS — [ ] FAIL — [ ] NOT YET CHECKED

---

## Gate 8 — Backup plan selected

**Type:** HARD  
**Owner:** Operator + client  

**Evidence required:**
- Backup destination confirmed in `docs/VPS-DOMAIN-INTAKE-FORM.md` Section 7
- Backup frequency agreed
- Offsite backup provider identified (or risk of local-only backup documented and accepted by client)

**Pass condition:**
- Backup destination is not "not yet decided"
- Frequency is documented
- If no offsite backup: client has acknowledged the risk in writing

**Fail action:**
- Select a backup destination and frequency before Gate 6B
- If client declines offsite backup: document the risk acknowledgment with client signature or email confirmation

**Status:** [ ] PASS — [ ] FAIL — [ ] NOT YET CHECKED

---

## Gate 9 — Client operator named

**Type:** HARD  
**Owner:** Client stakeholder  

**Evidence required:**
- Designated Mission OS operator named in `docs/VPS-DOMAIN-INTAKE-FORM.md` Section 6
- Operator email confirmed
- Operator technical comfort level noted

**Pass condition:**
- A specific named person is designated as the day-to-day Mission OS operator
- That person has been briefed on their responsibilities
- Technical comfort level documented

**Fail action:**
- Engage client stakeholder to designate an operator before Gate 6B
- Do not proceed without a named human accountable for day-to-day operation

**Status:** [ ] PASS — [ ] FAIL — [ ] NOT YET CHECKED

---

## Gate 10 — Go-live approver named

**Type:** HARD  
**Owner:** Client stakeholder  

**Evidence required:**
- Go-live approver named in `docs/VPS-DOMAIN-INTAKE-FORM.md` Section 6
- Approver email confirmed
- Approver has been sent `docs/PHASE-9-GO-LIVE-GATES.md` (Gate N section)

**Pass condition:**
- A specific named client stakeholder is designated as the go-live approver
- That person has the authority to sign off on Gate N (final human signoff)
- That person has read or been sent the Gate N section of `docs/PHASE-9-GO-LIVE-GATES.md`

**Fail action:**
- Do not begin live staging without a named go-live approver
- The go-live approver is separate from the operator — confirm they are different people or document if the same person holds both roles

**Status:** [ ] PASS — [ ] FAIL — [ ] NOT YET CHECKED

---

## Gate 11 — Legal and compliance flags reviewed

**Type:** HARD  
**Owner:** Operator + client + attorney (if regulated data present)  

**Evidence required:**
- `docs/VPS-DOMAIN-INTAKE-FORM.md` Section 8 complete
- `docs/DISCOVERY-INTAKE-FORM.md` Section 8 complete
- All HIPAA / FERPA / COPPA / immigration flags resolved (legal counsel memo or "all clear — no regulated data")

**Pass condition:**
- No unresolved compliance flags
- If regulated data is present: legal counsel has reviewed and documented the scope
- "All clear" or legal review memo is attached or referenced

**Fail action:**
- If unresolved flags exist: Gate 6B is blocked until resolved
- Do not deploy a system that handles regulated data without legal review
- Escalate to Architect immediately if HIPAA, FERPA, or immigration data is involved

**Status:** [ ] PASS — [ ] FAIL — [ ] NOT YET CHECKED

---

## Gate 12 — Pricing and scope approved (if client-facing)

**Type:** HARD  
**Owner:** Architect  

**Evidence required:**
- If this is a client-facing deployment: Architect has approved the scope and pricing
- If internal/pilot: scope documented and Architect has acknowledged

**Pass condition:**
- Architect has reviewed and approved the engagement scope
- No DRAFT pricing is being used in any client-facing document without approval
- All pricing has been converted from `DRAFT_PRICE_RANGE_REQUIRES_APPROVAL` to approved figures by a human stakeholder

**Fail action:**
- Do not proceed with a client-facing deployment without Architect pricing approval
- If scope has changed since last Architect review: re-submit for Architect review before Gate 6B

**Status:** [ ] PASS — [ ] FAIL — [ ] NOT YET CHECKED

---

## Gate 13 — Domain routing plan selected

**Type:** SOFT  
**Owner:** Operator  

**Evidence required:**
- Staging domain and API domain defined and documented
- Caddyfile placeholder domains replaced with actual staging domains in the deployment configuration (to be done at deployment day, not committed here)
- Caddy route map matches `docs/CADDY-DOMAIN-MAP.md`

**Pass condition:**
- Staging and API subdomains confirmed and non-conflicting
- Operator has reviewed `docs/CADDY-DOMAIN-MAP.md` and `docs/DEPLOYMENT-DAY-RUNBOOK.md` Step related to Caddy config

**Fail action:**
- Define staging domain before Gate 6B
- Verify no existing DNS entries conflict with the planned subdomains

**Status:** [ ] PASS — [ ] FAIL — [ ] NOT YET CHECKED

---

## Gate 14 — Rollback plan reviewed

**Type:** HARD  
**Owner:** Operator  

**Evidence required:**
- Operator confirms they have read `docs/STAGING-ROLLBACK-RUNBOOK.md`
- Client has been briefed on rollback triggers
- Rollback decision authority documented (who can call a rollback)

**Pass condition:**
- Operator has read the rollback runbook
- At least one stakeholder (operator or client) can call a rollback without Architect intervention
- Rollback steps are understood before deployment begins

**Fail action:**
- Read `docs/STAGING-ROLLBACK-RUNBOOK.md` before Gate 6B
- Do not begin deployment if the rollback path is not understood

**Rollback drill completed?** [ ] Yes — date: `[ROLLBACK_DRILL_DATE]` — [ ] Not yet (required by Gate K)

**Status:** [ ] PASS — [ ] FAIL — [ ] NOT YET CHECKED

---

## Gate 15 — Human approval recorded

**Type:** HARD  
**Owner:** Architect + go-live approver  

**Evidence required:**
- Architect written approval to begin Gate 6B (email, message, or signed document)
- Client go-live approver written acceptance of scope, timeline, and responsibilities
- Both approvals dated within 30 days of the planned deployment date

**Pass condition:**
- Both approvals are in writing
- Both are dated and attributed to named individuals
- No approval is implicit or assumed

**Fail action:**
- Do not start Gate 6B without both written approvals
- If approval was given more than 30 days ago: re-confirm before proceeding

**Architect approval:** Recorded by `[OPERATOR_NAME]` on `[APPROVAL_DATE]`  
**Client approval:** Recorded by `[GO_LIVE_APPROVER_NAME]` on `[CLIENT_APPROVAL_DATE]`

**Status:** [ ] PASS — [ ] FAIL — [ ] NOT YET CHECKED

---

## Preflight summary

| Gate | Type | Description | Status |
|------|------|-------------|--------|
| 1 | HARD | Repository clean | [ ] |
| 2 | HARD | CI green | [ ] |
| 3 | HARD | Secret audit clean | [ ] |
| 4 | HARD | Generated-file audit clean | [ ] |
| 5 | HARD | VPS ownership confirmed | [ ] |
| 6 | HARD | DNS ownership and access confirmed | [ ] |
| 7 | HARD | SSH key fingerprint recorded | [ ] |
| 8 | HARD | Backup plan selected | [ ] |
| 9 | HARD | Client operator named | [ ] |
| 10 | HARD | Go-live approver named | [ ] |
| 11 | HARD | Legal and compliance flags reviewed | [ ] |
| 12 | HARD | Pricing and scope approved | [ ] |
| 13 | SOFT | Domain routing plan selected | [ ] |
| 14 | HARD | Rollback plan reviewed | [ ] |
| 15 | HARD | Human approval recorded | [ ] |

**All HARD gates must be PASS before Gate 6B begins.**

---

## Operator sign-off

I confirm that all HARD gates above are marked PASS and all supporting evidence is recorded in the locations noted above. No private keys, passwords, API key values, or tokens appear in this checklist.

Operator name: `[OPERATOR_NAME]`  
Date: `[PREFLIGHT_DATE]`

This checklist must be reviewed by the Architect before Gate 6B begins.

---

*Gate 6A is preparation only. This checklist records readiness — it does not authorize deployment. Deployment authorization requires explicit Architect approval for Gate 6B.*
