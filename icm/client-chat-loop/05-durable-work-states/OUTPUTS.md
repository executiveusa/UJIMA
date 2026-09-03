# Slice 05 — Durable Client Work States — OUTPUTS / ACCEPTANCE LEDGER

PASS requires every gate below. This ledger is written before implementation.

## State contract

- [ ] client-visible work state is durable and reconstructable after reload;
- [ ] supported client states are exactly `Working`, `Needs you`, `Ready`, `Failed`, and `Delivered`;
- [ ] internal execution details remain hidden from ordinary client UI;
- [ ] state transitions are explicit, validated, and fail closed when invalid;
- [ ] mission state remains the durable source for work status rather than transient browser memory.

## Truthfulness

- [ ] `Working` is used only when execution has actually started, not for route-only handoffs;
- [ ] a route-only mission has a truthful pre-execution projection and cannot be mislabeled as active execution;
- [ ] `Ready` requires a verifiable artifact/result reference or equivalent proof marker;
- [ ] `Delivered` requires verified delivery proof and cannot be asserted by the builder without evidence;
- [ ] `Failed` preserves the last known durable mission truth and exposes a client-safe recovery need;
- [ ] `Needs you` is used for approval or missing-input gates and does not imply external execution occurred.

## Transition safety

- [ ] invalid backward/skip transitions fail closed unless an explicit recovery transition is allowed;
- [ ] consequential actions cannot advance past `Needs you` without a recorded approval reference;
- [ ] a mission cannot transition directly from routed/pre-execution to `Delivered`;
- [ ] another tenant or user cannot mutate or observe the mission state;
- [ ] repeated transition requests are idempotent.

## Persistence + recovery

- [ ] work-state events are durably recorded in the existing tenant event journal or existing mission truth mechanism;
- [ ] conversation reload reconstructs the latest client-safe work state from durable records;
- [ ] portable session export includes mission/work-state references without duplicating organization truth;
- [ ] runtime/provider loss does not erase the latest mission state;
- [ ] no second organization-truth store is introduced.

## Product surface

- [ ] `/app` renders the latest durable work state after reload;
- [ ] client language follows the existing action-first delivery law;
- [ ] obvious next action is shown when state is `Needs you` or `Failed`;
- [ ] existing Saved/Saving/Offline conversation behavior does not regress;
- [ ] public ASC3ND frontend remains unchanged.

## Proof

- [ ] targeted Slice 05 state-machine tests pass;
- [ ] Slice 04 mission-router regressions pass;
- [ ] Slice 03 persistence/auth regressions pass;
- [ ] repository boundary guard passes;
- [ ] full required CI passes;
- [ ] fresh independent critic has no unresolved correctness/security/isolation/recovery finding;
- [ ] PR diff is mergeable and scope-clean;
- [ ] rollback is the single Slice 05 merge revert.

## Completion claim

Do not mark Slice 05 `done`, `ready`, or `delivered` merely because code exists. Completion requires checked gates plus concrete CI/review evidence.
