# Grant Agent federation contract

## Decision

`executiveusa/grant-agent` is the canonical grant-domain engine. It is federated into the Social Purpose OS; it is not a second client system of record.

## Reads from Social Purpose OS / ICM

Grant Agent may receive approved, tenant-scoped references to:

- organization identity and legal facts;
- programs and populations served;
- approved financial/budget facts;
- evidence and outcomes;
- leadership/board facts where authorized;
- approved brand/message language;
- grant history and prior approved answers;
- user/role/approval context.

Unknown values remain unknown. Grant Agent must not infer missing legal, financial, demographic, youth, or organizational facts.

## Writes back

Grant Agent returns versioned artifacts, not a competing organization profile:

- `grant.opportunity`
- `grant.fit_report`
- `grant.requirements`
- `grant.application_draft`
- `grant.evidence_gap`
- `grant.review_packet`
- `grant.submission_packet`
- `grant.obligation`
- `grant.outcome`
- `grant.learning`

Each artifact must include tenant, source/provenance, created_by, created_at, risk tier, approval state, and stable upstream/source identifiers when available.

## Lifecycle

`understand -> discover -> qualify -> prepare -> review -> submit -> track -> report -> learn`

Submission, legal attestation, external email, portal acceptance, or money-related action requires explicit human approval unless the owner has pre-authorized the exact action class in policy. Proactivity may expand breadth, not authority.

## Discovery precedence

`official API -> structured public feed -> deterministic adapter -> normal web research -> browser automation -> visual computer use`

Computer use is a last-mile executor, not a substitute for deterministic interfaces.

## Quality gates

Before an opportunity can be marked `ready_for_human_review`:

1. official/source URL captured;
2. deadline verified or explicitly unknown;
3. hard eligibility evaluated with reasons;
4. organization claims trace to ICM provenance;
5. missing facts are surfaced, not invented;
6. requirements/attachments extracted;
7. independent critic runs in fresh context;
8. consequential next action is approval-gated.

## Failure behavior

Fail closed on identity conflict, missing required evidence, inaccessible source, CAPTCHA/MFA/legal attestation, ambiguous portal state, or permission mismatch.
