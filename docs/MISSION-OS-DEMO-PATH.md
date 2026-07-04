# Mission OS Demo Path — Asc3nd Mission OS™

**Type:** Operator reference — sales demo walkthrough  
**Status:** Gate 5B — ready for Architect review before use  
**Rules:** Use demo tenant data only. Do not claim live deployment unless go-live evidence exists. Do not show real client data without permission. Do not make compliance promises. Do not quote final pricing.

---

## Before the demo

**Setup required:**

- [ ] Demo tenant running locally or on a designated demo VPS — never production
- [ ] Demo tenant populated with sample data: fictional org name, fictional programs, sample grant drafts, sample outreach emails, sample documents in knowledge base
- [ ] Approval queue contains at least 2–3 pending items for live demonstration
- [ ] Event journal contains at least 10 sample entries from prior demo runs
- [ ] Artifact registry contains 3–5 sample outputs (grant draft, outreach email, program summary)
- [ ] Langfuse trace visible with sample agent runs
- [ ] Browser open to the ops dashboard at `/ops`
- [ ] Screen share ready — do not show terminal unless intentional
- [ ] Confirm: no real client data loaded. No real credentials visible. No live production system shared.

**What you are not showing:**

- Do not show a live production deployment unless go-live gates have passed and you have explicit authorization
- Do not show real client names, real donor data, real grant submissions, or real organizational documents without written permission from the data owner
- Do not show internal Asc3nd tooling, pricing spreadsheets, or operator-only config files
- Do not share screen beyond the demo tenant and the relevant pages

---

## Demo structure — 45 minutes

| Segment | Time | What you show |
|---|---|---|
| 1. Opening frame | 5 min | What Mission OS is and is not |
| 2. The ops dashboard | 8 min | `/ops` — daily operations view |
| 3. The approval queue | 8 min | How human review works |
| 4. Agents producing drafts | 7 min | Grant draft and outreach email examples |
| 5. The artifact registry | 4 min | Audit trail of all AI outputs |
| 6. The event journal | 4 min | Complete activity log |
| 7. The knowledge base | 4 min | What agents know |
| 8. Demo close | 5 min | Ownership, next steps, honest limits |

---

## Segment 1 — Opening frame (5 min)

**What to say:**

"Before I show you the system, I want to set expectations clearly so you can evaluate whether this is the right fit for you.

Mission OS is not a SaaS subscription you log into and pay for monthly. It is a system we build, configure, and deploy on your own server. After we hand it off, you own it. We have no access to it unless you choose ongoing support.

The agents in the system draft things for your team to review. They do not send emails, submit grants, or post to social media on their own. Every sensitive action goes through a human approval step — that is a hard block in the system, not an optional setting.

What I'm going to show you today runs on a demo server with fictional data. I'll tell you clearly what is built and working, and I'll be honest about what is still being built for production. I'd rather tell you the real status than oversell."

**What not to say:**
- Do not say "this is live" unless go-live gates A–N have passed and you have documented evidence
- Do not say "this works with your data" — it runs on demo tenant data
- Do not say "we guarantee this will save you time / get you more grants"

---

## Segment 2 — The ops dashboard (8 min)

**Navigate to: `/ops`**

**What to show:**
- The main status panel: tenant name (demo), active agents, pending approvals count
- The navigation: dashboard, approvals, agents, artifacts, events, knowledge base, settings
- The "pending approvals" counter — explain this is the heartbeat of the system

**What to say:**

"This is the ops dashboard — the main view your staff would use every day. The most important thing on this screen is the approvals counter. That tells you how many AI-generated outputs are waiting for a human to review before anything happens.

Your designated operator — the person who administers the system — lives here. They review what agents draft, approve or reject it, and see everything the system has done.

Notice there's no 'send all' button. There's no 'auto-approve' toggle. Every output goes through individual review."

**If asked about mobile:**
"The dashboard is browser-based and responsive. Staff can review and approve from any device. We don't have a native mobile app — it's a web interface."

---

## Segment 3 — The approval queue (8 min)

**Navigate to: `/ops` → Approvals**

**What to show:**
- A pending grant draft approval
- The full draft text visible in the approval view
- The approve / reject / request revision buttons
- What happens after approval (artifact is logged, status updates)
- What happens after rejection (draft is flagged, no output sent)

**What to say:**

"Here's how approvals work. When an agent finishes drafting something — let's say a grant application section — it doesn't go anywhere. It sits here, in this queue, until a staff member reviews it.

The reviewer sees the full text. They can approve it, reject it, or mark it for revision. Nothing leaves this queue automatically.

Let me show you a pending draft. [Open a pending item.] You can see the full text here. The agent flagged which knowledge base documents it used. You can verify the facts, edit the draft if you want to, and then approve it.

After approval, the artifact goes into the registry with a timestamp, the reviewer's name, and the original agent that produced it. That's your audit trail."

**Hard block demonstration:**
"Watch what happens if I try to trigger a grant submission directly. [Attempt the action.] The system blocks it. GRANT_SUBMISSION is a hard block — it cannot be approved by the system itself, only by a human who reviews the output and manually takes the submission step. We can't remove that block. It's not configurable."

---

## Segment 4 — Agents producing drafts (7 min)

**Navigate to: Agents section or trigger a sample agent run**

**What to show:**
- A sample grant drafting agent run (using demo org / demo grant)
- The agent pulling from the knowledge base
- The draft appearing in the approval queue (not sent anywhere)
- A sample outreach email draft

**What to say:**

"Let me show you what an agent actually does. I'll run the grant drafting agent against our demo org's fictional foundation grant. [Trigger run.] You can see it's working — it's pulling from the knowledge base to ground its draft in the organization's actual programs and history.

[Wait for draft.] Here it is in the approval queue. The agent produced a draft. It did not send it anywhere. It did not submit it anywhere. It's waiting for a human.

This is the workflow we configure for your team. The agent handles the drafting labor — structuring sections, pulling program descriptions, adapting to the funder's requirements. Your staff handles the judgment — is this accurate? Does it represent us well? Is it ready to submit?

The agent is like a very good first-draft assistant, not an autonomous grant writer."

**What not to claim:**
- Do not say "this will get you grants"
- Do not say "the agent writes better than your staff"
- Do not say "we can configure it to auto-submit after approval" — that is a hard block

---

## Segment 5 — The artifact registry (4 min)

**Navigate to: Artifacts**

**What to show:**
- List of prior artifacts (from demo runs)
- An artifact detail view: content, timestamp, status (approved/rejected/pending), agent that produced it, reviewer

**What to say:**

"Every AI output goes into the artifact registry, whether it was approved, rejected, or is still pending. This is your audit trail.

If you ever need to show a funder that a human reviewed your grant drafts, this is your evidence. If you ever have a staff change and need to understand what the AI was doing six months ago, it's all here.

The registry is on your server. Your data. We have no access to it after handoff."

---

## Segment 6 — The event journal (4 min)

**Navigate to: Events**

**What to show:**
- The full event log: agent runs, approvals, rejections, logins, config changes
- A filter by date or event type
- Sample entries showing timestamp, actor, action, outcome

**What to say:**

"The event journal records everything that happens in the system — not just AI actions, but all system activity. Who logged in, what they approved, when agents ran, what the outcome was.

This is not just for compliance. It's for operations. If something goes wrong — an agent produces an off-target draft, or a staff member approved something they shouldn't have — you have the full record to investigate.

This journal lives on your server. It's not sent to Asc3nd. It's not sent to any cloud service. It's yours."

---

## Segment 7 — The knowledge base (4 min)

**Navigate to: Knowledge base or document store**

**What to show:**
- The list of documents loaded (demo documents — program descriptions, sample grant history, sample policies)
- A sample document detail
- How the agent references documents during a draft run

**What to say:**

"The agents know about your organization through the knowledge base — a set of documents you load: program descriptions, grant history, policies, FAQs, whatever gives the agent context.

During setup, we work with you to collect and organize these documents. The more organized your knowledge base, the more accurate the agents are. Garbage in, garbage out — that's true here too.

The knowledge base is on your server. We don't send your documents to any external service except the AI model API you choose — and you're the direct customer of that API, not us."

---

## Segment 8 — Demo close (5 min)

**What to say:**

"That's the demo. Let me tell you a few honest things before we close.

**What I showed you is real.** The approval queue, the artifact registry, the event journal, the agent drafting workflow — all of that is built and working in this demo environment.

**What I didn't show you** is a live client deployment, because this demo runs on a test server with fictional data. A live deployment requires completing go-live gates A through N — including gate N, which is your explicit signoff before we go live.

**What you would own.** Your VPS. Your source code — MIT license, any developer can maintain it. Your database. Your documents. Your credentials. After handoff, Asc3nd has no access unless you choose ongoing support.

**What this costs.** I can share a draft price range, but I want to be clear: the final price is scoped after we understand your specific situation. What I'd quote today is a planning range, not a final number. [Share DRAFT pricing range only if prospect has explicitly asked and you have Architect approval to share a range.]

**What happens next.** If you'd like to explore this further, I'll put together a scoped proposal based on your situation. It describes what setup would look like for you specifically, what's included, and a draft price range for review. No obligation. I'll also tell you honestly if Mission OS isn't the right fit."

---

## Objection handling during demo

**"Is this actually live?"**
"What I'm showing you is a demo tenant — a test environment. Live deployment requires completing go-live gates A through N. I want to be honest about that rather than show you something and imply it's production-ready for your data."

**"Can we see real client examples?"**
"I don't share real client data without written permission from the client. What I can share is how the system works on fictional org data, which is what you're seeing. After handoff, your data is on your server — not shared with anyone."

**"Can the agent auto-approve and send?"**
"No. GRANT_SUBMISSION, OUTBOUND_MESSAGE, and other sensitive actions are hard blocks. They cannot be auto-approved. That's by design. The system requires a human to review and take the submission step manually."

**"What if we don't have technical staff?"**
"That's an honest conversation we should have before scoping. The system requires a designated operator — someone who can administer it ongoing. We train them during a 14-day structured onboarding. If no one in your org can take that role, Mission OS may not be the right fit right now."

---

## What not to show

- Do not screen-share your terminal with live credentials visible
- Do not show the Langfuse monitoring UI if it contains real traces from real client runs
- Do not show real client names, real client data, or real organizational documents
- Do not show any live production deployment unless go-live gates A–N have passed and you have authorization
- Do not show internal Asc3nd configuration files, pricing documents, or operator-only tooling
- Do not show the `missionctl` CLI unless you are prepared to explain what every visible command does

---

## What not to claim

- Do not claim Mission OS is HIPAA, FERPA, or COPPA certified
- Do not claim AI outputs are guaranteed to be accurate or high quality
- Do not claim specific grant success rates or funding outcomes
- Do not claim the system is currently live for any specific client (unless it is, and you have documented go-live evidence)
- Do not claim final pricing — share DRAFT ranges only, with Architect approval
- Do not promise timelines you cannot commit to
- Do not claim the system can replace staff — it assists them

---

## After the demo

Send the follow-up email within 24 hours. Use the appropriate template from `docs/FOLLOW-UP-EMAIL-TEMPLATES.md`:
- If fit is positive: Template 1 (after discovery call — fit looks good)
- If more information needed: Template 2 (needs more information)
- If not a fit: Template 3 (not a fit — be honest)

Complete the discovery intake form (`docs/DISCOVERY-INTAKE-FORM.md`) if not already done. Score the client using the readiness rubric (`docs/CLIENT-READINESS-SCORING-RUBRIC.md`) before writing a proposal.

---

*This demo path is for internal operator use. Use demo tenant data only. Do not claim live deployment unless go-live evidence exists. Do not show real client data without permission. Do not make compliance promises. Do not quote final pricing without Architect approval.*
