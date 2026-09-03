# Cold-Agent Recovery Walkthrough

A new agent with no chat history should be able to recover the operating model from repository evidence alone.

## 1. Establish repository ownership
Read `REPO_SCOPE.md`, `repo-boundary.json`, then `AGENTS.md`. Stop if the requested output belongs to another repository.

## 2. Recover the truth model
Read `control-plane/domain-federation.json`. ICM owns canonical tenant truth. Grant Agent owns grant-domain artifacts only. Database migrations/RLS/recovery belong to `executiveusa/asc3nd-supabase-landing`.

## 3. Recover the execution model
Read `control-plane/automation-fabric.json`. Substantial work requires an acceptance envelope. Work occurs on an isolated branch/PR. CI and merge-conflict checks precede merge. The next slice starts from fresh `main`.

## 4. Recover authority limits
Consequential actions remain human-gated. Builders do not final-approve their own work. Ralphy and OpenHands are bounded technical executors. Firstmate is a liaison/supervisor, not canonical memory.

## 5. Recover current ASC3ND backend authority
- Supabase/database contract owner main SHA recorded in `recovery/cold-agent-manifest.json`.
- Grant federation merge proof recorded in the same manifest.
- Public ASC3ND frontend remains frozen for this backend integration loop.

## 6. Cold-agent test
Answer the questions encoded in `recovery/cold-agent-manifest.json` using repository evidence only. The verifier must pass without secrets, production row data or private chat context.

## Failure behavior
If ownership, evidence, approval or a required artifact is missing, fail closed and report the missing dependency. Do not infer production success from intended architecture.
