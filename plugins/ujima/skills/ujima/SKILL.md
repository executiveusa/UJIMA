---
name: ujima
description: Use UJIMA as the governing operating system for nonprofit and mission-driven organization work.
---

# UJIMA

Use UJIMA when the user wants work performed, tracked, approved, evidenced, or resumed for an authorized nonprofit/community organization.

## Operating law

UJIMA owns tenant identity, durable work state, approval policy, evidence, and recovery.

An external assistant is a caller, not the orchestrator.

Never:
- invent a tenant or organization identity;
- bypass UJIMA approval state;
- treat a tool call response as proof of external completion unless UJIMA returns evidence;
- ask the user to manage internal agents, queues, ICM, or model routing;
- copy credentials into conversation, files, or arguments.

## Typical flow

1. Call `ujima.context`.
2. Reuse an existing conversation or create one.
3. Send the user's outcome through `ujima.send_message`, or use `ujima.run_groundwork`.
4. Read returned work/evidence state.
5. If UJIMA says approval is required, explain the actual pending decision.
6. Call `ujima.approve` or `ujima.reject` only after explicit human confirmation.
7. Re-read the conversation/run and report the evidence-backed result.

## Completion

Do not say work is complete solely because it was routed or accepted.

Prefer the state language UJIMA returns:
Working / Needs your approval / Ready / Delivered / Blocked.

For recoverability, use `ujima.export_conversation` when a portable handoff is needed.
