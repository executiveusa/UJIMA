# Client Chat Architecture v1

## Decision

The ASC3ND client product is chat-first. After authentication, the default client surface is `/app`; `/ops/*` remains the separate staff/admin control room. The public ASC3ND brand site remains frozen and is not part of this build.

## Verified reference

Reference implementation: `stephengpope/thepopebot` at commit `33f032ddedee93ee139fba0464d5a765dc10e99f` (v1.2.82).

Useful patterns verified from that commit:

- browser chat is a first-class front door;
- a conversation owns a stable ID and can be reopened from history;
- the UI separates immediate chat from longer-running jobs/workspaces;
- the chat shell is composed from sidebar, chat header, message stream, composer and history components;
- the user does not need to understand internal worker mechanics to start work.

## Reuse boundary

We reuse the interaction architecture, not PopeBot's authority model or canonical state.

### Reuse

- conversation sidebar and new-chat pattern;
- stable conversation IDs;
- message streaming pattern;
- composer and attachment affordance;
- conversation history;
- visible long-running job state;
- inline results/artifacts;
- mobile-first chat layout.

### Do not inherit

- auto-merge as a default client authority;
- coding-agent/repository selectors in the client surface;
- Docker/container controls in the client surface;
- provider/model selection in the client surface;
- PopeBot database as organization truth;
- any ability for the UI to bypass Social Purpose OS approvals.

## One boss per truth

| Truth | Owner |
|---|---|
| organization identity, approved facts, relationships, consent, institutional memory | ICM / Social Purpose OS |
| chat rendering and interaction state | `/app/*` client surface |
| durable chat/session operational records | Social Purpose OS database contract, exportable to ICM evidence |
| mission definition / acceptance / risk / approval state | Social Purpose OS mission envelope |
| grants | Grant Agent domain engine |
| CRM/follow-up | CRM domain engine |
| content | content domain engine |
| SEO/visibility | SEO domain engine |
| analytics | analytics domain engine |
| staff audit/control | `/ops/*` |
| public ASC3ND presentation | `executiveusa/asc3nd-brand-site` — frozen |

## Client path

```text
login
  -> /app
  -> conversation
  -> First Mate intent classification
  -> governed mission envelope
  -> domain engine
  -> evidence/artifact
  -> Working | Needs you | Ready | Failed | Delivered
  -> human approval when required
```

The client never chooses a backend agent. The client expresses an outcome.

## Session contract

A client chat session is tenant-scoped and user-scoped. It contains durable conversation metadata, message references, mission references, artifact references and approval references. It must not become a second copy of organization truth.

Important organizational facts referenced during a conversation must retain provenance back to ICM/evidence. Sensitive records remain outside public Git.

## Mission handoff contract

A chat-to-mission handoff must declare:

- tenant and requesting user;
- conversation and originating message;
- objective;
- selected domain lane;
- risk tier;
- allowed and denied capabilities;
- acceptance gates;
- evidence requirements;
- approval requirement;
- current status;
- rollback/recovery note for consequential execution.

If any required governance field is missing, mission creation fails closed.

## Product language

Client-visible states are limited to:

- `Working`
- `Needs you`
- `Ready`
- `Failed`
- `Delivered`

Internal terms such as agent backend, MCP, Docker, worktree, RLS, Supabase, model router and repository branch do not appear in ordinary client chat.

## Route boundary

- `/app` and `/app/chat/[conversationId]`: client chat product.
- `/ops/*`: staff/admin control room.
- public website: unchanged.

## Recovery

A provider/runtime loss must not erase the organization's memory. Durable conversation/mission state is reconstructable from database exports plus ICM/evidence references. Chat transcripts are operational records; approved organizational facts remain canonical in ICM.

## Slice 01 acceptance

PASS only if:

1. PopeBot reference is pinned to an exact commit.
2. reuse and reject lists are explicit.
3. chat session schema validates as JSON Schema.
4. chat mission handoff schema validates as JSON Schema.
5. route ownership and public-site freeze are explicit.
6. verifier exits zero.
7. full repository CI is green.
8. fresh checkpoint finds no scope drift.
