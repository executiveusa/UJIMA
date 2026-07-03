# 08_training_and_handoff — Staff Training and Operator Handoff

Prepare training materials for client staff and hand off operator credentials and runbooks.

## Inputs

- stages/06_ops_dashboard_setup/output/dashboard-review.md
- stages/07_vps_deployment_plan/output/vps-deployment-plan.md
- docs/OPERATOR-MANUAL.md
- docs/ONBOARDING-14-DAY-LAUNCH.md

## Process

1. Create a client-specific training guide:
   - How staff log in to /ops
   - How to read the approval queue and approve/reject items
   - How to read the event journal
   - How to check agent health
   - Who to contact for support (operator name, escalation path)
   - What NOT to do (do not change env files, do not delete mission-data/)
2. Create a staff quick-reference card (one page, printable):
   - Login URL
   - Approval queue URL
   - How to submit an approval decision
   - Emergency: how to pause an agent run (contact operator)
3. Create an operator handoff checklist:
   - All credentials stored in secure location (not git)
   - SSH key delivered to operator
   - Operator key delivered to ops staff
   - VPS backup configured and tested
   - Client has signed off on privacy policy and data handling
4. Schedule first review call (30 days post-launch).

## Outputs

- output/client-training-guide.md — staff-facing training doc
- output/staff-quick-reference.md — one-page quick reference
- output/operator-handoff-checklist.md — operator delivery checklist
- output/audit.json — docs created, handoff date, operator

## Human review gate

Operator reviews all three output documents and confirms:
- Training guide is accurate for this client's specific setup (correct URLs, correct contact)
- Quick reference card is accurate and printable
- Handoff checklist is fully checked off before proceeding
- All credentials have been delivered through a secure channel (not email, not Slack plaintext)

Do not proceed to 09_go_live_readiness until all checklist items are checked off.

## Allowed tools

- File write (output documents)
- Read docs/OPERATOR-MANUAL.md, docs/ONBOARDING-14-DAY-LAUNCH.md

## Forbidden actions

- Do not email credentials in plaintext
- Do not share operator keys with client staff (staff get separate ops-level access, not operator-level)
- Do not publish training materials publicly

## Validation

- client-training-guide.md covers login, approval queue, event journal, health check, and escalation
- staff-quick-reference.md is one page or less
- operator-handoff-checklist.md has no unchecked items

## Done when

All output documents created and reviewed. Operator handoff checklist is fully completed. Credentials delivered securely.
