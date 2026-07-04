# 14-Day Onboarding and Launch Plan — Mission OS v0.6

**Audience:** Operator and client staff  
**Purpose:** Structured plan for onboarding a new organization onto Mission OS  
**Prerequisite:** Phase 9 live VPS deployment must be complete before Day 1 of this plan  
**What is not here:** Guarantees of outcomes; timelines are targets, not contractual commitments  
**Gate 5A:** SOW outline at `docs/IMPLEMENTATION-SOW-OUTLINE.md`. Offer package at `docs/SOVEREIGN-AI-OFFER-PACKAGE.md`.

---

## Pre-onboarding (Operator only, before Day 1)

Complete before the client's Day 1:

- [ ] VPS provisioned and accessible via SSH
- [ ] DNS records configured (A records for root, api, www)
- [ ] TLS certificates issued via Caddy
- [ ] `missionctl bundle up <slug> --dry-run` passed locally
- [ ] Live deployment executed: `missionctl bundle up <slug>` on VPS
- [ ] `missionctl bundle smoke <slug>` passes on VPS
- [ ] `missionctl doctor` passes on VPS
- [ ] Initial backup taken: `missionctl backup create <slug>`
- [ ] Staff login credentials shared securely with primary contact
- [ ] Ops dashboard accessible at client domain

---

## Day 1–2: Discovery and tenant configuration

**Goal:** Understand the organization's workflows, configure the tenant accurately

**Operator tasks:**
- [ ] Review organization's existing website, programs, and staff roles
- [ ] Create tenant: `missionctl tenant create <slug> --org "<org name>" --domain "<domain>"`
- [ ] Generate initial pack: `missionctl pack generate <slug>`
- [ ] Configure approval policies for standard action types (outreach, publishing, grants)
- [ ] Create operator keys for each staff user: `missionctl operator-key create --tenant <slug>`

**Client tasks:**
- [ ] Provide staff roster and role definitions
- [ ] Identify primary workflow categories (volunteer coord, donor outreach, grant research, program reporting)
- [ ] Confirm which actions require approval before execution

**Deliverable:** Tenant record created, pack generated, staff keys issued

---

## Day 3–4: Content and public site alignment

**Goal:** Align public site content with organization's actual mission and programs

**Operator tasks:**
- [ ] Review public site structure at `apps/site`
- [ ] Update mission copy, program descriptions, contact information
- [ ] Confirm AI-readability of public site (structured content, no broken links)
- [ ] Deploy updated public site to Vercel (or confirm deployment pipeline)

**Client tasks:**
- [ ] Review and approve public site content
- [ ] Provide program descriptions, staff photos/bios, social links
- [ ] Confirm public contact form routing (should route through approval queue)

**Deliverable:** Public site deployed with accurate content; contact form routing verified

---

## Day 5–6: Ops dashboard setup

**Goal:** Staff can navigate and use the ops dashboard confidently

**Operator tasks:**
- [ ] Confirm `/ops` routes are accessible with staff credentials
- [ ] Verify event feed, artifact list, agent status, budget display
- [ ] Walk through approval queue mechanics with primary staff contact

**Client tasks:**
- [ ] Primary staff contact logs in to ops dashboard
- [ ] Reviews overview, events, artifacts pages
- [ ] Confirms they can read and understand the approval queue

**Deliverable:** At least one staff member can navigate ops dashboard without assistance

---

## Day 7: Approval policies and workflows

**Goal:** Staff understand what actions require approval and how to approve them

**Operator tasks:**
- [ ] Demonstrate the approval lifecycle (create → pending → approved/rejected)
- [ ] Walk through risk classification (green/yellow/orange/red)
- [ ] Confirm approval policies match organization's compliance requirements

**Client tasks:**
- [ ] Review and sign off on approval policy definitions
- [ ] Identify backup approver (who approves if primary is unavailable)
- [ ] Test one simulated approval cycle in the dashboard

**Deliverable:** Approval policy documented and understood by at least two staff members

---

## Day 8: Agent packs

**Goal:** Agent packs configured to match the organization's actual workflows

**Operator tasks:**
- [ ] Review default tenant-agent-pack manifest
- [ ] Adjust agent role definitions for the organization's programs
- [ ] Configure skill assignments (which agent handles which workflow type)

**Client tasks:**
- [ ] Review agent pack manifest
- [ ] Identify which workflows are highest priority for AI assistance
- [ ] Confirm which workflows are out of scope (e.g., youth records — do not automate)

**Deliverable:** Agent pack updated, at least one workflow tested in dry-run

---

## Day 9: Budget and trace setup

**Goal:** Model spending is visible, capped, and understood

**Operator tasks:**
- [ ] Set initial monthly budget: `missionctl model budget set <slug> --monthly-usd <amount>`
- [ ] Confirm Langfuse configuration for trace capture
- [ ] Run billing export: `missionctl billing export <slug>` — confirm output format

**Client tasks:**
- [ ] Review `/ops/budgets` dashboard
- [ ] Confirm acceptable monthly AI budget range
- [ ] Understand how to read the spend bar and per-surface breakdown

**Deliverable:** Budget set, spend visibility confirmed in dashboard

---

## Day 10: Deployment rehearsal

**Goal:** Operator and staff understand the upgrade/rollback cycle

**Operator tasks:**
- [ ] Run upgrade rehearsal: `missionctl bundle upgrade <slug> --dry-run`
- [ ] Run rollback rehearsal: `missionctl bundle rollback <slug> --dry-run`
- [ ] Confirm release lifecycle visible in `/ops/deployments`

**Client tasks:**
- [ ] Observe upgrade rehearsal
- [ ] Confirm understanding: updates are rehearsed before going live, and rollback is available

**Deliverable:** Upgrade/rollback cycle demonstrated and documented

---

## Day 11: Backup and restore drill

**Goal:** Staff know that data can be recovered; drill is verified

**Operator tasks:**
- [ ] Create backup: `missionctl backup create <slug>`
- [ ] List backups: `missionctl backup list <slug>`
- [ ] Restore to test environment: `missionctl backup restore <slug> <backup-id>`
- [ ] Confirm restored data matches original

**Client tasks:**
- [ ] Observe backup and restore
- [ ] Confirm backup schedule and offsite storage plan (if applicable)

**Deliverable:** Backup and restore verified on live tenant data

---

## Day 12: Staff training

**Goal:** All relevant staff can operate Mission OS without operator assistance for day-to-day tasks

**Operator tasks:**
- [ ] Run 60-minute training session with all staff users
- [ ] Demonstrate: login, ops dashboard navigation, approval queue, artifact review
- [ ] Provide `docs/OPERATOR-MANUAL.md` as reference

**Client tasks:**
- [ ] All staff users attend training
- [ ] Each staff user successfully logs in and navigates the approval queue
- [ ] Staff nominate questions for the Q&A session

**Deliverable:** Staff training complete; operator manual distributed

---

## Day 13: Security review

**Goal:** Confirm security gates are clean and staff understand security responsibilities

**Operator tasks:**
- [ ] Run: `node scripts/verify-v06.mjs` — confirm all 8 gates pass
- [ ] Run: `node scripts/secret-audit.mjs` — confirm 0 findings
- [ ] Review `docs/SECURITY-CHECKLIST.md` with client
- [ ] Confirm staff understand: no credentials in email, no raw keys in documents

**Client tasks:**
- [ ] Review security checklist
- [ ] Confirm staff know who to contact if they suspect a security issue
- [ ] Confirm credential rotation plan is documented

**Deliverable:** Security review complete and documented

---

## Day 14: Launch readiness review

**Goal:** Confirm the system is ready for live operation and client is prepared to use it

**Operator tasks:**
- [ ] Run full validation: `npm test`, `npm run verify:v06`, `missionctl bundle smoke <slug> --dry-run`
- [ ] Confirm all Day 1–13 deliverables are complete
- [ ] Review any open issues from training or security review
- [ ] Provide `docs/V0.7-FINAL-HANDOFF.md` as reference

**Client tasks:**
- [ ] Sign off on launch readiness
- [ ] Confirm support contact and escalation path
- [ ] Confirm monthly support schedule (first check-in date)

**Deliverable:** Launch readiness sign-off; client in production use

---

## Post-launch (monthly support)

Monthly support includes:

- Approval queue review for blocked items
- Model budget consumption review
- Security gate re-run after any update
- Backup verification drill
- Workflow adjustment based on staff feedback
- Mission OS updates (new phases when available)
