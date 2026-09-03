# Client Chat Slice 02 — Chat shell v1

## Acceptance ledger

- [x] `/app` is the default client chat surface.
- [x] `/app/chat/[conversationId]` reopens a conversation route.
- [x] login redirects to `/app`.
- [x] conversation sidebar, new chat, message stream and composer exist.
- [x] mobile sidebar behavior is implemented.
- [x] `/ops` remains linked as the separate staff control room.
- [x] preview responses explicitly say mission execution is not wired yet.
- [x] no new package or service was added.
- [x] public ASC3ND brand site is untouched.

## Ponytail minimum check

Reused the existing Next.js app and authentication. Added only one client component, one CSS module and two routes. No UI framework, chat SDK, database, Docker runtime or second frontend app was added.

## Emil / Krug review

- one primary action: type into chat;
- technical backend terminology hidden;
- conversation history is secondary but always reachable;
- staff controls are visually separate;
- mobile uses a drawer rather than squeezing a permanent sidebar;
- preview state is explicit so no fake capability is implied.

## Gauntlet question

Can a nontechnical operator understand within five seconds that this is where they ask ASC3ND for help, start a new conversation, reopen prior work, and distinguish client chat from staff controls?

PASS when build and verifier are green.

## Rollback

Revert Slice 02 merge. No production data, external action or public brand-site change is included.
