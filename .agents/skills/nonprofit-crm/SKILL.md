# Nonprofit CRM

## Governing skill

Inherit `.agents/skills/nonprofit-operating-system/SKILL.md`.

## Mission

Make every meaningful inquiry or relationship easier to follow up without turning the client into a CRM administrator.

## Minimum relationship model

Track only fields that support service, consent, follow-up, reporting, or relationship continuity.

Typical records:
- families;
- youth;
- volunteers;
- supporters;
- donors;
- partners;
- sponsors;
- event attendees.

Typical attributes:
- contact information;
- relationship type;
- interests;
- consent;
- source;
- follow-up status;
- next action;
- last meaningful interaction.

Do not collect sensitive data merely because the system can.

## Workflow principle

The client should experience outcomes such as:
“Every family, volunteer, donor, and partner inquiry now has a follow-up path.”

Do not default to giving the client another dashboard or login.

## Follow-up state

Every actionable record should be able to answer:
- who is this;
- why are they here;
- what did they ask for;
- what did we promise;
- who owns the next step;
- when is it due;
- what consent exists.

## Data quality

Prefer deduplication, explicit source tracking, normalized contact fields, clear consent semantics, and small status vocabularies.

Unknown is a valid state. Never infer demographics, identity, eligibility, or relationship status from weak signals.

## Verification

Before calling the CRM flow complete verify create/update paths, duplicate behavior, consent handling, follow-up state, access controls where applicable, and a real test record end-to-end.