# Sovereign AI FAQ — Asc3nd Mission OS™

**Type:** Client-facing and operator reference  
**Status:** Gate 5A — ready for Architect review before client use

---

## About Mission OS

### Q1: What is Mission OS?

Mission OS is a privately deployed AI operating system for nonprofits and social-purpose organizations. It runs on a server you own and control. Your AI agents help your staff draft content, answer questions, summarize documents, and support workflows — all with human review before any output goes outside your organization.

It is not a cloud service. It is not a subscription you rent from Asc3nd. You own the system after setup.

### Q2: How is this different from ChatGPT or other AI tools?

Most AI tools run on shared cloud infrastructure. Your prompts and data pass through the vendor's servers. You have no control over what happens to them.

Mission OS is installed on your server. Your data stays in your database. The AI is configured specifically for your organization's programs and workflows. And unlike general-purpose AI tools, Mission OS has hard blocks on sensitive actions — agents cannot submit grants, send messages, or post to social media without explicit human approval.

### Q3: Is Mission OS a SaaS subscription?

No. Mission OS is a one-time setup engagement. You pay a setup fee for Asc3nd to configure and deploy the system. After handoff, you own it. There is no forced monthly subscription to Asc3nd.

You do pay directly for your VPS hosting and AI model API usage — but those costs go to your hosting provider and model provider, not through Asc3nd.

### Q4: What do I actually own after setup?

After handoff you own and control: your VPS (server), the source code (MIT license), your database and all backups, all your API keys and credentials, your agent configuration, your workspace and all data, and your domain. Asc3nd has zero access to your server after handoff unless you purchase optional ongoing support and grant us continued access.

### Q5: Can I hire someone else to maintain the system after Asc3nd sets it up?

Yes. The source code is MIT licensed. Any developer can work on it. The operator manual documents all maintenance procedures. You are not locked into Asc3nd for any future work.

---

## About AI Agents

### Q6: What can the AI agents do?

Agents can help your staff: draft grant proposals, outreach emails, program summaries, and social media content — for human review before anything is sent. Agents can answer internal questions about your programs and documents. They can summarize reports, assist with volunteer and donor outreach planning, and support event coordination. Every output is a draft for staff review.

### Q7: What can agents NOT do without human approval?

Agents cannot submit grant applications, send any message to a donor or funder, post to social media, make any legal or financial filing, or access another organization's data — without explicit human approval. These are hard blocks in the system, not configuration options. They are built in and cannot be switched off.

### Q8: Are the agents autonomous? Do they act on their own?

No. Mission OS agents are configured AI tools, not autonomous systems. They respond to tasks, generate drafts, and run within defined workflows. Any action that could affect something outside your organization — sending a message, submitting a form, posting content — requires a human to review and approve it first. The system records every action and approval in an event journal.

### Q9: What AI models does Mission OS use?

Mission OS routes requests through LiteLLM, a model gateway that supports OpenAI, Anthropic (Claude), Google (Gemini), and local models (Ollama). You choose which models to enable. You pay the model provider directly using your own API key. Asc3nd does not resell model capacity or mark up API costs.

### Q10: Can agents help us write grants?

Agents can draft grant proposal text, summarize program descriptions, and help structure applications — for staff review and editing before submission. Agents do not submit grant applications. Submission requires a human to review, approve, and send. Asc3nd does not guarantee any funding outcomes.

---

## About Data and Security

### Q11: Where is our data stored?

All your data — programs, documents, event logs, agent outputs, approval records — is stored in your database on your VPS. It does not leave your server except when: (a) an agent makes an AI model API call, which goes directly from your server to the model provider under your API key; or (b) you explicitly configure an integration (like social media or email) that sends data externally. You control what integrations are enabled.

### Q12: Is Mission OS HIPAA/FERPA/COPPA compliant?

Asc3nd does not certify Mission OS for any regulated compliance framework. If your organization handles protected health information, student education records, or data about children, you must consult qualified legal counsel before deployment. Mission OS is a software system — compliance depends on how it is configured, operated, and what data is in it. We cannot make compliance guarantees.

### Q13: What happens to our data if we stop working with Asc3nd?

Nothing changes. Your data stays on your VPS. You own all of it. Asc3nd does not hold a copy of your data. You can continue operating the system, migrate to a new server, or shut it down — your choice, your timeline.

---

## About Pricing and Support

### Q14: Is there an ongoing cost after setup?

The only ongoing costs are: (a) your VPS hosting, paid directly to your provider, and (b) your AI model API usage, paid directly to the model provider. Both are variable and usage-based. They are not Asc3nd fees.

Optional ongoing support from Asc3nd is available (maintenance and managed-agent support packages) but not required. You can operate the system entirely on your own.

### Q15: What if something breaks and we don't have a support package?

The operator manual documents common issues and their resolution. The system logs are available via the ops dashboard and the missionctl CLI. If you need Asc3nd help outside a support package, contact us — we can scope a one-time support engagement. Nothing is locked away from you; you have full access to every part of the system.

---

*Answers in this FAQ are informational. They do not constitute legal advice, financial advice, or contractual commitments. For compliance questions, consult qualified legal counsel.*
