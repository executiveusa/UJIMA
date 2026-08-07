# Krug Design Review

## Purpose

Apply common-sense usability review to websites, apps, dashboards, forms, flyers, decks, landing pages, posters, and other digital/visual outputs.

This is an original review checklist derived from usability principles. It does not reproduce the source book.

## Core law

**Do not make the user spend unnecessary thought figuring out what something is, where to go, what matters, or what happens next.**

## Review order

`PURPOSE -> SCAN -> HIERARCHY -> CHOICE -> NAVIGATION -> COPY -> ACTION -> FEEDBACK -> MOBILE -> ACCESSIBILITY -> TEST`

## 1. Purpose

Within seconds, can the intended user tell:

- what this is;
- who it is for;
- why it matters;
- what they should do next?

If not, fail the review.

## 2. Scan, do not assume reading

People commonly scan before reading closely.

Check:

- obvious headings;
- meaningful grouping;
- short blocks;
- strong visual hierarchy;
- recognizable labels;
- clear emphasis;
- no decorative competition with the primary message.

For flyers/posters, perform the 3-second test from normal viewing distance.

## 3. Visual hierarchy

The relative importance of elements must be visible without explanation.

Ask:

- Is the primary message visually primary?
- Are related things grouped?
- Are unrelated things separated?
- Are conventions used where they reduce learning?
- Is there enough whitespace to show structure?

## 4. Choices

Reduce decision friction. More clicks are acceptable when each choice is obvious and low-effort. Fewer clicks are not a virtue if each step becomes confusing.

Remove:

- ambiguous labels;
- duplicate actions;
- equally weighted competing CTAs;
- unnecessary mode switches;
- hidden dependencies.

## 5. Navigation / orientation

A user should know:

- where they are;
- what major sections exist;
- how to go back/home;
- what the current selection/state is.

Do not rely on memory between screens when persistent context can be shown.

## 6. Copy

Omit words that do not earn their space.

Prefer:

- concrete labels;
- short instructions at the point of need;
- verbs for actions;
- plain language over internal terminology;
- meaningful error messages;
- content that answers the user's likely question.

Do not expose implementation jargon such as internal model names, branch SHAs, queue IDs, or architecture terms unless the audience actually needs them.

## 7. Action clarity

Every interactive surface must make the next useful action obvious.

For forms:

- labels remain visible;
- required fields are clear;
- validation explains how to recover;
- destructive actions are distinguished;
- submit state/processing state is visible.

For static artifacts:

- CTA is easy to find;
- date/time/location/eligibility are unambiguous when applicable;
- information is ordered by user need, not organizational pride.

## 8. Feedback and recovery

After an action, users need evidence that something happened.

Provide:

- loading/progress;
- success/failure;
- saved state;
- undo/recovery when feasible;
- confirmation for consequential actions.

## 9. Mobile/context

Test the actual environment, not only the design canvas.

Check:

- responsive hierarchy;
- thumb reach where relevant;
- crop/safe zones;
- text size;
- overflow;
- keyboard/focus behavior;
- slow/loading states;
- glare/distance for event signage.

## 10. Accessibility

Accessibility is part of usability.

At minimum verify:

- semantic structure where applicable;
- keyboard path;
- focus visibility;
- contrast;
- text alternatives;
- labels/instructions;
- scalable text;
- no critical meaning conveyed only by color.

## 11. Lightweight usability testing

Do not settle subjective arguments with more opinions when a small test can answer them.

For important work, test representative users with real tasks. Observe where they hesitate, misunderstand, backtrack, or ask questions. Fix the highest-impact problems first.

## Scoring rubric

Score each 0-2:

- purpose clarity;
- scanability;
- hierarchy;
- choice clarity;
- navigation/orientation;
- copy clarity;
- action clarity;
- feedback/recovery;
- mobile/context fit;
- accessibility.

20 = exceptional clarity
16-19 = strong
12-15 = needs revision
<12 = do not ship

A high visual-aesthetic score cannot compensate for a usability failure.

## Review output

Return only actionable findings:

- `BLOCKER` — user cannot reliably complete/understand the job;
- `MAJOR` — significant friction or ambiguity;
- `MINOR` — polish with measurable benefit;
- `PASS` — no change needed.

Each finding must state: observation, user impact, recommended correction, and verification method.