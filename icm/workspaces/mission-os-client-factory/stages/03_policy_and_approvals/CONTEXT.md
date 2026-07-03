# 03_policy_and_approvals — Approval Policy Setup

Define who approves what for this tenant. Write the approval policy into the tenant safety config.

## Inputs

- stages/02_knowledge_ingestion/output/knowledge-summary.md
- icm/tenants/<slug>/_config/safety-policy.md
- docs/MANAGED-AGENTS-AS-A-SERVICE.md (approval tier reference)

## Process

1. Read the tenant's org type, programs, and safety constraints from the knowledge summary.
2. Define approvers by role (Executive Director, Program Director, Board Chair, etc.).
3. Map each action class to an approver:
   - Green: automatic (no approval required)
   - Yellow: operator review recommended; approver = program staff
   - Orange: required approval before any external action; approver = Executive Director
   - Red: required approval + documented rationale; approver = Board Chair or legal counsel
4. List org-specific red actions:
   - Any action involving youth under 18
   - Any public statement on behalf of the org
   - Any grant submission or financial commitment
   - Any donor or sponsor outreach
5. Write updated icm/tenants/<slug>/_config/safety-policy.md with this specific policy.
6. Write output/approval-policy.md summarizing the policy for operator and client review.

## Outputs

- output/approval-policy.md — named approvers, action class map, org-specific red/orange list
- output/audit.json — metadata

## Human review gate

Operator reviews approval-policy.md and confirms:
- Named approvers are real people at the client org who have agreed to the role
- The red action list is complete for this org's risk profile
- The policy has been shared with and acknowledged by the client org's authorized representative

Do not proceed to 04_agent_pack until operator and client rep have both reviewed.

## Allowed tools

- File write to icm/tenants/<slug>/_config/safety-policy.md
- File write to output/

## Forbidden actions

- Do not assign approval roles without explicit client confirmation
- Do not create approval records in Mission OS mission-data/ before the policy is approved
- Do not reduce the scope of red/orange actions below what the org type requires

## Validation

- approval-policy.md names at least one approver per risk class
- safety-policy.md is updated with org-specific red action list
- No action class is left unmapped

## Done when

Operator and client representative have both reviewed and confirmed approval-policy.md.
