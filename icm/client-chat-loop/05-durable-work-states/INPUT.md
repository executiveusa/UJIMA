# Slice 05 — Durable Client Work States — INPUT

## Base

- repository: `executiveusa/ascend-social-purpose-agentic-systems-`
- base branch: `main`
- base SHA: `9444c633bdb5fb1ab224d2304e7cce67b29c8edc`
- predecessor: Slice 04 First Mate mission router

## Problem

Slice 04 can persist and route a bounded mission, but the client work projection is still primarily produced during a request/response cycle. A reload must not erase the latest work state, and client labels must remain truthful as work advances through approval, production, result readiness, failure, and delivery.

## Required invariant

Durable mission/work-state truth belongs to Social Purpose OS. Browser state is only a projection. Public ASC3ND presentation remains outside this repository and frozen.

## Client vocabulary

`Working` | `Needs you` | `Ready` | `Failed` | `Delivered`

Internal states may be more detailed, but ordinary client UI must not expose backend/provider/repository mechanics.
