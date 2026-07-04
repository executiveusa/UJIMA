# Sales Demo Flow — Mission OS v0.6

**Audience:** Operator demonstrating Mission OS to a prospective client  
**Purpose:** Step-by-step demo script showing the full control plane in a single session  
**What is not here:** Claims of live production capability; all steps are dry-run/local unless a live VPS is configured

---

## Before the demo

Run the full validation suite to confirm everything is clean:

```bash
npm test
node scripts/verify-v06.mjs
node missionctl/missionctl.mjs bundle smoke demo-pnw --dry-run
```

Expected: 319/319 tests, 8/8 verify-v06 gates, 70/70 smoke checks.

Have the ops dashboard available at `http://localhost:3000/ops` (run `npm run dev:web` if local).

---

## Step 1: Show the public site boundary

**What to show:** `http://localhost:3000` (or the live Vercel URL if deployed)

**What to say:**  
"This is the public-facing site your community sees. It is AI-readable — search engines and AI agents can extract your mission, programs, and contact information from it in structured form. It is not just a brochure. The public bridge underneath it connects to the ops system."

**What NOT to claim:**  
Do not say the public site is live unless it is deployed to Vercel and DNS is configured.

---

## Step 2: Show the ops dashboard

**What to show:** `http://localhost:3000/ops`

**What to say:**  
"This is the internal operations dashboard. Your staff log in here. Everything the AI system does — agent actions, model calls, approvals, outputs — is visible here. Nothing happens that you cannot see."

**Demonstrate:**  
- Overview page (health summary, recent events, agent status)
- Navigate to `/ops/events` — show event feed
- Navigate to `/ops/agents` — show provisioned agent status
- Navigate to `/ops/artifacts` — show registered artifacts

---

## Step 3: Show the agent room

**What to say:**  
"The agent room is where AI-assisted work is initiated. You give the agent a task — draft a grant summary, prepare a volunteer outreach draft, summarize a program report. The agent produces a draft and creates an approval request. Nothing goes out until a human approves it."

**Demonstrate (dry-run):**  
Show the approval queue concept in the ops dashboard or in `mission-data/demo-pnw/approvals/`.  
Run: `node missionctl/missionctl.mjs doctor` to show system health.

**What NOT to claim:**  
Do not say the agent is executing live model calls unless a real LiteLLM instance with API keys is connected.

---

## Step 4: Show events, artifacts, and approvals

**What to show:** `/ops/events`, `/ops/artifacts`

**What to say:**  
"Every action the system takes creates an event. Every AI output is registered as an artifact with a timestamp and the model that produced it. Every approval decision — who approved it, when, and for what — is logged. You have a complete audit trail."

**Demonstrate:**  
- Event feed showing typed events (MODEL.CALL, APPROVAL.CREATED, AGENT.RUN, etc.)
- Artifact list showing registered outputs
- Approval record structure (if approvals exist in demo-pnw)

---

## Step 5: Show model budgets and traces

**What to show:** `/ops/budgets`

**What to say:**  
"AI model costs are real. This dashboard shows exactly how much the system has spent on AI model calls, broken down by workflow surface. You can set a monthly budget cap — the system will warn you at 80% and hard-block at 100%. No surprise bills."

**Demonstrate:**  
- Budget bar (spend vs. limit)
- Per-surface breakdown
- Run: `node missionctl/missionctl.mjs billing export demo-pnw` — show JSON output

---

## Step 6: Show the deployment lifecycle

**What to show:** `/ops/deployments`

**What to say:**  
"Every update to the system goes through a lifecycle — bundle, smoke-test, upgrade, rollback if needed, backup. Nothing is deployed directly. We rehearse updates before they go live."

**Demonstrate:**  
```bash
node missionctl/missionctl.mjs bundle up demo-pnw --dry-run
node missionctl/missionctl.mjs bundle smoke demo-pnw --dry-run
```

Show the 70/70 smoke check output. Point out Phase 7 checks (security gates, CI workflow, docs).

---

## Step 7: Show backup and restore

**What to say:**  
"Every tenant's data is backed up on a schedule. If something goes wrong — a failed update, a data issue — we restore from backup. This has been tested. We know it works."

**Demonstrate:**  
```bash
node missionctl/missionctl.mjs backup create demo-pnw
node missionctl/missionctl.mjs backup list demo-pnw
```

Show the backup file created in `backups/`. Note that restore validates the path and rejects traversal attempts.

**What NOT to claim:**  
Do not say backups are stored offsite unless remote backup storage is configured.

---

## Step 8: Show security gates and verify-v06

**What to say:**  
"Before any update is merged or deployed, the system runs a full security gate: secret scan, generated-file audit, test discovery, task audit, build, and bundle smoke. This is not a manual checklist — it runs automatically in CI on every push."

**Demonstrate:**  
```bash
node scripts/verify-v06.mjs
```

Show the 8/8 gate output. Point out what each gate checks.

Show `.github/workflows/ci.yml` — note: no external secrets required, runs on every push.

---

## Step 9: Explain what happens before live deployment

**What to say:**  
"What we've shown is the control plane — the system that manages, audits, and governs the AI layer. This runs locally and in dry-run mode. To go live, we need:

1. A Hostinger VPS (you provision, we configure)
2. DNS records pointing to the VPS IP
3. Fresh credentials for Postgres, LiteLLM, Langfuse, and Open WebUI
4. A live deployment drill (upgrade, rollback, backup restore on real data)
5. Staff training on the ops dashboard and approval queue

That is the Phase 9 engagement. The Phase 8 deliverable — what you are seeing today — is the complete, tested, audited control plane ready for live deployment."

---

## Demo environment reset

After a demo, reset the demo tenant if needed:

```bash
rm -rf mission-data/demo-pnw
node missionctl/missionctl.mjs tenant create demo-pnw --org "Demo PNW Nonprofit"
node missionctl/missionctl.mjs pack generate demo-pnw
node missionctl/missionctl.mjs bundle up demo-pnw --dry-run
```

Generated files in `handoff/demo-pnw/managed/` are gitignored and will not be committed.

---

## Gate 5B — Sovereign AI Sales Asset Package

The following documents support the full client proposal and sales workflow. Use these alongside this demo flow for real prospect engagements.

| Document | Use |
|---|---|
| `docs/MISSION-OS-DEMO-PATH.md` | Detailed route-by-route demo walkthrough for a 45-minute client sales call. Includes setup checklist, segment scripts, objection handling, and what not to claim. Use this for live prospect demos. |
| `docs/DISCOVERY-INTAKE-FORM.md` | Complete during or immediately after discovery call. 15 sections covering org basics, programs, staff/operator readiness, tools, documents, grant workflows, compliance flags, AI comfort, budget, and red flags. Required before writing a proposal. |
| `docs/CLIENT-READINESS-SCORING-RUBRIC.md` | Score prospects on 8 dimensions (1–5 each): mission fit, operator readiness, document readiness, workflow clarity, data sensitivity, budget readiness, timeline readiness, technical ownership readiness. Green (4.0+), yellow, or red recommendation. Required before Architect approval. |
| `docs/ONE-PAGE-PITCH-TEMPLATE.md` | One-page client-facing pitch. Fill from discovery notes. Requires Architect approval before delivery. No final pricing — placeholder only. |
| `docs/CLIENT-PROPOSAL-TEMPLATE.md` | Full proposal skeleton. All placeholders — no fake client names, no final pricing, no guaranteed outcomes. Requires Architect approval before delivery. |
| `docs/PROPOSAL-BUILDER-RUNBOOK.md` | 10-step operator workflow: inputs, fit check, risk/compliance check, tier selection, drafting rules, internal review, Architect approval, client delivery, follow-up schedule. |
| `docs/FOLLOW-UP-EMAIL-TEMPLATES.md` | 8 email templates for the full prospect lifecycle: post-discovery (fit / needs info / not a fit), proposal delivery, 3-day follow-up, 10-day follow-up, demo invite, go-live readiness reminder. |
| `docs/CLIENT-PROPOSAL-PACKAGE.md` | Master index for the proposal package: asset list, approval checklist, 8-step workflow summary. |
