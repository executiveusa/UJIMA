# Client Demo Script — Mission OS v0.6

**Audience:** Operator running a 30-minute demo for a prospective client  
**Purpose:** Verbatim prompts and demo commands for a structured client demo  
**What is not here:** Claims beyond what the system can demonstrate in the current build

---

## Setup (5 minutes before demo)

```bash
# Confirm baseline
npm test 2>&1 | tail -4
node scripts/verify-v06.mjs 2>&1 | tail -5
node missionctl/missionctl.mjs bundle up demo-pnw --dry-run 2>&1 | tail -5
node missionctl/missionctl.mjs bundle smoke demo-pnw --dry-run 2>&1 | tail -5

# Start dev server
npm run dev:web
```

Navigate to `http://localhost:3000` and `http://localhost:3000/ops` in your browser. Confirm both load.

---

## Opening (2 minutes)

**Say:**

"Thank you for your time. I am going to show you Mission OS in about 25 minutes. I want to be direct about two things up front.

First, what I'm showing you today is a fully tested, security-audited control plane running in dry-run mode. It is not a live production system connected to your data or external services. I will be clear at each step about what is live and what is dry-run.

Second, Mission OS is designed so that nothing happens automatically without your staff approving it. Every AI action that touches the outside world goes through a human review step. That is the central design principle, not an afterthought."

---

## Section 1: Public site (3 minutes)

**Say:**  
"Let me start with what your community sees."

**Show:** `http://localhost:3000`

**Say:**  
"This is the public-facing site. It is structured so that AI agents — grant databases, opportunity matching tools — can read your mission, programs, and contact information in machine-readable form. That is different from a typical website. It is not just a brochure.

The public contact form here does not auto-respond. It creates an item in your approval queue. A staff member reviews it and decides what to do."

---

## Section 2: Ops dashboard overview (4 minutes)

**Say:**  
"Now let me show you what your staff sees."

**Show:** `http://localhost:3000/ops`

**Say:**  
"This is the internal operations dashboard. It is separate from the public site. Your staff log in here.

The overview shows your system health, recent agent actions, and any pending approvals. Everything the AI system does is visible here."

**Show:** `/ops/events`

**Say:**  
"This is the event feed. Every action — every AI model call, every approval created or resolved, every agent run — creates an event here. Nothing happens that you cannot see and trace back."

---

## Section 3: Agents and artifacts (4 minutes)

**Show:** `/ops/agents`

**Say:**  
"These are your provisioned managed agents. Each agent has a defined role — research, drafting, coordination. They are not autonomous. They work on tasks your staff assigns through the agent room.

Each agent output becomes an artifact."

**Show:** `/ops/artifacts`

**Say:**  
"Artifacts are outputs. A grant research summary, a draft outreach letter, a program report — each is registered here with a timestamp, the model that produced it, and the approval status. Your staff can review and approve or reject any artifact before it is used."

---

## Section 4: Model budgets (3 minutes)

**Show:** `/ops/budgets`

**Say:**  
"AI model costs are real. This shows exactly what the system has spent on AI model calls, broken down by workflow type. The bar shows spending against the monthly budget cap.

When spend reaches 80% of the cap, the system warns you. At 100%, it hard-blocks further model calls until the budget is reviewed.

You decide the monthly budget. The system enforces it."

**Run:**  
```bash
node missionctl/missionctl.mjs billing export demo-pnw
```

**Say:**  
"The billing export gives you the same data in JSON or CSV for your records."

---

## Section 5: Deployment lifecycle (4 minutes)

**Say:**  
"Now let me show you how the system updates."

**Run:**  
```bash
node missionctl/missionctl.mjs bundle smoke demo-pnw --dry-run 2>&1 | tail -15
```

**Say:**  
"Before any update is applied, the system runs 70 static checks. These verify that the configuration, security gates, documentation, and CI pipeline are all in the expected state. No update goes through if these fail.

After smoke passes, the upgrade lifecycle runs in dry-run first. If anything is wrong, the system rolls back."

**Show:** `/ops/deployments`

**Say:**  
"Your staff can see the release history here — what version is running, when it was deployed, and whether there is a backup available to restore from."

---

## Section 6: Security gates (3 minutes)

**Run:**  
```bash
node scripts/verify-v06.mjs 2>&1 | grep -E '"label"|"ok"'
```

**Say:**  
"These are the eight security gates that run before any merge or deployment. Secret scan, generated-file audit, test discovery, task audit, build, doctor, smoke, and test suite. All eight pass.

The CI pipeline runs these automatically on every push to the repository. No external secrets are required to run CI — the gates work on the codebase itself."

---

## Section 7: What happens next (3 minutes)

**Say:**  
"What you have seen is the complete control plane. To go from this to live production for your organization, we need five things:

One: A Hostinger VPS. You provision it, we configure it.  
Two: DNS records. A records for your domain pointing to the VPS.  
Three: Fresh credentials. Postgres, LiteLLM, Langfuse — generated fresh at deployment, never stored in the repository.  
Four: A live deployment drill. We run the upgrade and backup-restore sequence on real infrastructure before you go live.  
Five: Staff training. Two days with your team on the ops dashboard and approval queue.

That is the Phase 9 engagement. What I've shown you today is the fully tested, audited foundation that makes Phase 9 a matter of configuration, not construction."

---

## Closing

**Say:**  
"Questions? I want to be direct about anything that seems unclear or over-promised. If there is something the system cannot do, I will say so."

**Do NOT say:**
- "The AI will handle it automatically"
- "This will get you grants"
- "This guarantees ROI"
- "This is fully production-ready for your live data right now" (if not deployed to VPS)
- "The agents make decisions" (they do not — they assist, humans decide)
