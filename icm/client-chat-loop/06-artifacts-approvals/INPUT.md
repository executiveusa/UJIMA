# Slice 06 — Artifacts + approvals in chat

Base main: `36ef92d6209183e61b0e8f208bc29fd789ab0093`
Branch: `client-chat-loop/06-artifacts-approvals`

## Goal
Make client work inspectable and govern consequential actions without exposing internal agent complexity. A conversation must show mission-linked artifacts and the approval state that governs that mission. Client approval/rejection must write to the same durable approval record observed by `/ops`.

## Boundaries
- Public ASC3ND frontend remains frozen.
- No production deployment in this slice.
- No automatic publishing, sending, payment, grant submission, DNS, destructive action, or production migration.
- Client actions are limited to reviewing artifacts and approving/rejecting an already-created approval request.
- Tenant/user/conversation/mission isolation is mandatory.
