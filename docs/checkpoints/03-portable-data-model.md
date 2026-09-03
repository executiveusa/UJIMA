# Checkpoint 03 — portable data model

State: `MERGE_READY`. Public frontend touched: `NO`.

Unlazy gates: schema parses; all critical domains registered; provenance required; restricted data excluded from public Git.

Ponytail: one generic record envelope is reused across domains instead of eleven unrelated file formats. No dependency or service added.

Gauntlet bar: JSON Schema 2020-12 plus the repo's one-boss-per-truth law. Binary question: can exported domain records carry identity, provenance and sensitivity without depending on Supabase-specific storage?

Rollback: Git revert only. No production mutation.

Next: Slice 04 — Supabase schema as code.
