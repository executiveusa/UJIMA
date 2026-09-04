# Slice 06 Acceptance Ledger

Status: **working**

## Binary acceptance gates

- [ ] Conversation reload returns only artifacts explicitly linked to the active mission and owned by the authenticated tenant.
- [ ] Client artifact cards expose safe metadata and a controlled preview/download path without leaking arbitrary filesystem paths.
- [ ] Consequential approval state is read from the durable shared approval store used by `/ops`.
- [ ] Client cannot approve/reject an approval for another mission, conversation, user, or tenant.
- [ ] Client approval records actor, mission, artifact/proof context where available, status, and timestamp through the existing approval lifecycle.
- [ ] Rejection remains recoverable and does not claim delivery/completion.
- [ ] `Ready` never triggers publish/send/pay/submit/deploy or any external execution.
- [ ] Portable export includes the relevant mission artifact and approval references.
- [ ] Mobile UI renders artifact/approval cards without overflow and remains keyboard reachable.
- [ ] Focused Slice 06 tests pass.
- [ ] Slice 01–05 predecessor regressions and full CI pass.
- [ ] Repository boundary guard passes; public frontend remains untouched.
- [ ] Fresh independent review finds no unresolved correctness/security/isolation issue.
- [ ] Rollback is one PR revert; no schema migration or external side effect is required.

## Required proof
Exact-head SHA, workflow runs, independent review result, changed-file scope, merge SHA.
