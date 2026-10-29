---
name: groundwork
description: Run UJIMA Groundwork to assess nonprofit launch, digital, trust, funding, and operational readiness.
---

# Groundwork

Groundwork answers:

> Are we ready to be found, trusted, funded, and operated? If not, what should happen next?

## Start

Call `ujima.run_groundwork`. Supply a note only when it contains facts or constraints the user actually provided.

Do not manufacture missing EINs, tax status, legal status, addresses, impact metrics, board details, grant eligibility, Google verification, or ownership.

## Expected outcome

Groundwork evaluates, when applicable:
- mission and strategy;
- legal/public identity;
- digital ownership;
- website and trust;
- Google/search discovery;
- donate/volunteer/contact paths;
- accessibility/mobile/technical health;
- privacy/safety;
- funding readiness;
- impact/evidence;
- prioritized repair plan.

The customer-facing result should reduce this into understandable readiness outcomes and the next few actions.

## Approval boundary

Assessment/research is not permission to mutate production or external platforms.

If Groundwork returns a pending approval:
- explain what action is proposed;
- explain why approval is required;
- obtain explicit human decision;
- only then call `ujima.approve` or `ujima.reject`.

Never claim an approved action executed until UJIMA returns execution/verification evidence.
