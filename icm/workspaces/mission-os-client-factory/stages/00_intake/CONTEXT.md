# 00_intake — Client Discovery

Collect the minimum information needed to begin deployment. Do not start building yet.

## Inputs

- AGENT.md (this workspace)
- CONTEXT.md (this workspace)
- Client intake form or discovery call notes

## Process

1. Record org name, legal entity type, primary contact, and domain.
2. Record current tools: website CMS, email, CRM, grant platforms, social accounts.
3. Record mission statement (verbatim if available, paraphrased if not).
4. Record approximate staff headcount and volunteer count.
5. Record key programs and target population.
6. Confirm budget comfort level for monthly hosting.
7. Confirm timeline expectation.
8. Note any blockers: no domain, no tech staff, legal/compliance constraints.

## Outputs

- output/intake-form.md — completed discovery summary
- output/audit.json — intake metadata (date, operator, source)

## Human review gate

Operator reviews intake-form.md and confirms:
- Org name and slug candidate are correct
- Mission statement is accurate
- No red-flag blockers exist before proceeding

Do not proceed to 01_tenant_profile until operator signs off on this output.

## Allowed tools

- Text editor (fill intake-form.md)
- Read-only web lookup to verify org name/domain ownership

## Forbidden actions

- Do not create tenant records yet
- Do not purchase domains or hosting
- Do not commit any client data to version control
- Do not contact the client on behalf of Mission OS without operator approval

## Validation

- intake-form.md exists and is not empty
- audit.json records date and operator
- Org name, domain candidate, and mission statement are all present

## Done when

Operator has reviewed and approved intake-form.md. The intake-form.md is complete with no blank required fields.
