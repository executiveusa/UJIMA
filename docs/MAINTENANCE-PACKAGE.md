# Optional Maintenance Package — Asc3nd Mission OS™

**Type:** Operator/sales reference  
**Status:** Gate 5A — ready for Architect review before client use  
**Pricing:** DRAFT — requires human approval before quoting

---

## Summary

The maintenance package is an optional, ongoing service that keeps the client's Mission OS installation current, secure, and verified. It is not required to use Mission OS. The client owns the system regardless of whether they purchase this package.

---

## What this package is

After deployment, the client's system runs independently on their VPS. Software dependencies, security patches, and infrastructure components will need periodic updates. The maintenance package provides a defined schedule of operator-performed upkeep on behalf of the client.

This is not a SaaS subscription. The client owns the system. Asc3nd provides maintenance as a contracted service on the client's infrastructure.

---

## What is included

### Security updates (monthly)
- Review of upstream dependency changelogs for CVEs and critical fixes
- Application of non-breaking security patches to:
  - Mission OS core packages
  - Hermes agent runtime
  - LiteLLM model gateway
  - Langfuse observability service
  - Open WebUI staff workspace
  - Caddy reverse proxy
  - System OS packages (Ubuntu/Debian)
- Verification that security gate suite passes after each update (`npm run verify`)
- Written record of changes applied

### Dependency updates (quarterly)
- Review and apply minor and patch-level dependency updates
- Run full test suite after updates
- Rollback if any test fails
- Change log delivered to client

### Backup verification drills (quarterly)
- Execute backup restore drill per `docs/VPS-BOOTSTRAP-RUNBOOK.md`
- Confirm backup integrity and restore success
- Document drill results and any issues found
- Update restore runbook if procedures have changed

### Monthly status report
- Summary of: updates applied, backup drill results (if applicable), any issues found, agent health status, model usage summary
- Delivered as a written report (not a call unless issues require discussion)

### Incident triage (business hours)
- If the client reports a system issue, operator reviews within one business day
- Diagnosis and response plan provided
- Resolution is best-effort; complex issues may require a separate engagement

---

## What is not included

- Custom skill development
- Agent prompt updates or workflow tuning (see Managed-Agent Support Package)
- Emergency incident response outside business hours
- Compliance audits or certifications
- New feature deployment
- Migration to a new VPS (available as a separate engagement)
- Third-party API issues (model provider outages, Postiz, Twilio)

---

## Pricing (DRAFT — requires human approval before quoting)

| Tier | Monthly rate |
|---|---|
| Starter | $150–$300/month |
| Managed | $300–$600/month |
| Partner | $600–$1,200/month |
| Custom | Scoped per engagement |

Rate is based on system complexity, number of agents, and scope agreed at onboarding. No long-term contract required. Monthly billing. 30-day cancellation notice.

---

## How it works operationally

1. Asc3nd operator connects to client VPS using SSH key pair established at deployment (client grants continued access; revocable at any time)
2. Operator performs scheduled work per the maintenance calendar
3. Operator runs verification suite and confirms all checks pass
4. Monthly report delivered via agreed channel (email, shared doc, or Notion)

The client retains full root access to their VPS at all times. Asc3nd's access is a privilege granted by the client, not a condition of system operation.

---

## Access and control

- Client retains root/admin access to VPS at all times
- Client can revoke Asc3nd SSH access at any time
- Access log is maintained on the VPS (standard SSH audit trail)
- Client can request a log of all sessions at any time
- Cancellation of the maintenance package does not affect system ownership or operation

---

## What happens if the package is cancelled

The system continues to operate exactly as before. The client is responsible for applying security updates and running verification drills independently. The operator manual (`docs/OPERATOR-MANUAL.md`) includes instructions for all maintenance tasks.

---

*This document describes available services. It does not constitute a contract. Final terms, scope, and pricing are negotiated individually. No legal compliance certification is provided.*
