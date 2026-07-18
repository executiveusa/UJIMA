# 05_approval_gate — Human Approval and Release Control

Review the complete campaign package before any public publishing, external communication, spending, youth-data use, or partner claim.

## Inputs

- Layer 0: ../../AGENT.md
- Layer 1: ../../CONTEXT.md
- Layer 2: this CONTEXT.md
- Layer 3: ../../_config/creative-operating-system.md
- Layer 3: ../../_config/safety-policy.md
- Layer 4: ../04_campaign_creation/output/

## Process

1. Confirm all required campaign artifacts exist.
2. Review the GRILL report and reject unresolved safety, truth, consent, ownership, destination, or capacity gaps.
3. Verify each public claim against the claims register.
4. Verify every call-to-action destination.
5. Verify media-release requirements and identify restricted assets.
6. Review each asset for clarity, dignity, visual discipline, accessibility, and mission alignment.
7. Create one approval item per independently releasable asset or action.
8. Record the required approver role: communications, youth safeguarding, finance, legal, founder, or partner.
9. Do not treat silence, elapsed time, or a draft status as approval.
10. Only approved items may be included in the release manifest for stage 06.

## Outputs

- `output/review-report.md`
- `output/approval-register.json`
- `output/release-manifest.json`
- `output/rejected-items.json`
- `output/audit.json`

## Approval state machine

`draft -> internal_review -> client_review -> approved -> scheduled -> executed -> verified -> archived`

Only a human may move an item into `approved` when the action is public, external, financial, youth-related, legal, or reputationally material.

## Verify

- Every released item has an immutable ID, artifact path, risk level, approver role, approval timestamp, and evidence bundle.
- Rejected or blocked items are excluded from the release manifest.
- Youth-related items include consent status and redaction status.
- Public publishing remains impossible without an approved release-manifest entry.
- Rollback or cancellation instructions exist for scheduled actions.