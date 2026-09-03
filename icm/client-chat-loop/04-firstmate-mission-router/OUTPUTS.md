# Slice 04 — First Mate Mission Router — OUTPUTS / ACCEPTANCE LEDGER

PASS requires every gate below.

## Routing contract

- [ ] a persisted authenticated user message can create exactly one bounded mission handoff;
- [ ] tenant, user, conversation, and originating message are server-derived/verified, not accepted from browser mission fields;
- [ ] deterministic routing covers at minimum grants, content, and CRM;
- [ ] supported routes use the existing `chat-mission-handoff` vocabulary;
- [ ] general/unknown requests fail safe into bounded internal planning rather than unrestricted execution.

## Authority

- [ ] First Mate is represented only as liaison/router behavior, never as organization truth;
- [ ] all Slice 04 missions are preparation/routing only;
- [ ] explicit consequential requests require human approval and return `needs_you` before execution;
- [ ] denied capabilities include external messaging, public publishing, grant submission, payments, legal attestation, production deployment, DNS change, production DB migration, destructive deletion, cross-tenant access, and unrestricted execution;
- [ ] no external adapter is invoked by this slice.

## Persistence + recovery

- [ ] mission handoff is durably recorded in the existing tenant event journal;
- [ ] event evidence links the mission to its source chat message;
- [ ] the assistant acknowledgement is persisted in the same conversation;
- [ ] assistant wording is truthful: routed/preparing/needs approval, never false completion;
- [ ] no second organization truth store or mission database is added.

## Isolation + validation

- [ ] another tenant cannot route against the first tenant's conversation/message;
- [ ] another user in the same tenant cannot route against the first user's conversation/message;
- [ ] missing/unknown conversation or message fails closed;
- [ ] malformed/empty objective fails closed;
- [ ] risk/approval invariants are tested.

## Product surface

- [ ] client UI can render the persisted assistant acknowledgement without exposing backend agent/provider/model/repository terms;
- [ ] existing Saved/Saving/Offline behavior does not regress;
- [ ] no public ASC3ND frontend file changes.

## Proof

- [ ] targeted Slice 04 tests pass;
- [ ] existing Slice 03 persistence/auth tests pass;
- [ ] repository boundary guard passes;
- [ ] full required CI passes;
- [ ] fresh independent critic has no unresolved correctness/security/isolation/recovery finding;
- [ ] PR diff is mergeable and scope-clean;
- [ ] rollback is the single Slice 04 merge revert.

## Completion claim

Do not mark Slice 04 `done` or `ready` merely because code exists. Completion requires all checked gates plus concrete CI/review evidence.