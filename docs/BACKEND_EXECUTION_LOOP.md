# Backend execution loop

## Decision

ASC3ND backend work proceeds as ten serialized slices. The current public ASC3ND brand site is frozen until the owner explicitly unlocks frontend work.

Each slice is an isolated branch/worktree-equivalent unit. One pull request is reviewed, conflict-checked, verified, and merged before the next slice branches from refreshed `main`.

## Quality stack

The loop adapts the operating principles of these upstream skills without making them canonical sources of ASC3ND truth:

- Unlazy: https://github.com/Leonxlnx/unlazy — acceptance ledger first, runnable gates, reverify, evidence-only completion.
- Ponytail: https://github.com/DietrichGebert/ponytail — inspect first and stop at the smallest implementation rung that satisfies the requirement without removing safety.
- Humanizer: https://github.com/blader/humanizer — prose-only late pass; facts and provenance stay unchanged.
- Ralphy: https://github.com/michaelshimeles/ralphy — optional bounded coding worker using isolated branches/worktrees and PRs; dangerous permission modes are forbidden.
- Gauntlet Loop: https://github.com/robonuggets/gauntlet-loop — named/fetchable/comparable bar, builder/critic separation, binary revise-or-pass checkpoint.
- Claude SEO: https://github.com/AgriciDaniel/claude-seo — visibility specialist; recommendations must be sourced and falsifiable and never become organization truth.
- Emil Kowalski skills: https://github.com/emilkowalski/skills — interaction/product-quality specialist for client-facing surfaces; the public-site freeze overrides it.

## Slice state machine

`READY -> IN_PROGRESS -> VERIFYING -> CHECKPOINT -> MERGE_READY -> MERGED`

Failure routes to `REVISE` or `BLOCKED`. A blocked slice records the exact blocker and does not promote the next slice.

## Required checkpoint

Every slice must produce a checkpoint file with:

1. slice id and owner repository;
2. base and head SHA;
3. owned paths;
4. acceptance gates and evidence;
5. Ponytail reuse/minimum-build decision;
6. specialist checks invoked or explicitly not applicable;
7. Gauntlet bar and binary critic result;
8. CI result;
9. merge-conflict result against current `main`;
10. risks and rollback;
11. ICM state update;
12. next slice.

## Serialized merge law

Before merge:

1. refresh current `main`;
2. compare the slice base/head against current `main`;
3. inspect open PRs for overlapping paths;
4. fail closed on unresolved merge conflict or ownership collision;
5. require all configured CI checks to pass;
6. merge exactly one slice PR;
7. refresh `main` again;
8. create the next slice branch from the new merge SHA.

No direct writes to the public ASC3ND website are part of this loop.

## Completion law

A slice is complete only when the artifact exists, its acceptance gates pass, re-verification passes, the checkpoint is recorded, and the PR is merged or intentionally left at the requested final approval gate. Narrative status is not evidence.

## Ten slices

1. Reality and ownership reconciliation.
2. Canonical ASC3ND ICM brain.
3. Portable file-based data model.
4. Supabase schema-as-code contract.
5. Backup/export/restore and recovery proof.
6. Identity, CRM, consent, participation and follow-up model.
7. Federated domain-engine contracts.
8. GitHub-native automation fabric.
9. Recovery and cold-agent Gauntlet.
10. Backend integration freeze and frontend handoff contract.
