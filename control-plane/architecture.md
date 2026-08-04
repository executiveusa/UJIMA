# ASC3ND Contract Closeout Architecture

## System graph

```mermaid
flowchart TD
    H[Human: source access + approvals] --> O[GLM 5.2 Orchestrator]
    C[ChatGPT: architecture + connected tools + QA] <--> O
    O --> CP[Agentic Systems Control Plane]
    CP --> TL[Task Ledger]
    CP --> RR[Repository Registry]
    CP --> CL[Contract Ledger]
    CP --> ICM[Numbered ICM Stages]

    WB[Interactive Workbook Repo] --> S[Approved Strategy Manifest]
    V[Raw Interview Footage] --> D[Descript Project]
    D --> TR[Corrected Transcript + Story Map]
    TR --> S

    S --> CAL[12-Week Calendar]
    S --> CAP[30-Caption Bank]
    S --> SHOT[Month 1 Shot List]
    S --> BIOS[3 Platform Bios]
    TR --> CAL
    TR --> CAP
    TR --> SHOT

    CAL --> P[Postiz Draft Queue]
    CAP --> P
    SHOT --> BK[Brand Kit Repo]
    BIOS --> FB[Facebook / Meta Setup]
    BK --> P
    D --> OC[Opus Clip Candidate Discovery]
    OC --> D
    P --> A{Human Approval}
    A -->|approved| PUB[Facebook / Instagram Publish]
    A -->|changes| O

    WEB[Frontend Repo] --> PROD[ASC3ND Public Experience]
    DB[(Verified Client Supabase)] --> WEB
    DB --> WB

    CAL --> HANDOFF[Client Delivery + Flipbook]
    CAP --> HANDOFF
    SHOT --> HANDOFF
    BIOS --> HANDOFF
    WB --> HANDOFF
```

## Repository collision barriers

```mermaid
flowchart LR
    CP[Agentic Systems\ncontrol + reusable workflows]
    WB[Interactive Document\nclient truth]
    FE[Frontend\npublic runtime]
    BK[Brand Kit\nmaster assets]
    DEMO[Demonstration\npreview only]

    CP -- JSON contract only --> WB
    WB -- approved manifest only --> CP
    CP -- API/schema contract only --> FE
    BK -- versioned asset manifest only --> FE
    CP -- creative brief only --> BK
    DEMO -. no production promotion .-> FE

    X1[No raw footage] -. blocked .-> CP
    X2[No client records] -. blocked .-> BK
    X3[No platform implementation] -. blocked .-> FE
    X4[No duplicate RSVP store] -. blocked .-> WB
```

## ICM execution stages

```mermaid
flowchart LR
    S00[00 Intake + Evidence] --> G0{Human Gate 0}
    G0 --> S01[01 Canonical Strategy]
    S01 --> S02[02 Media Ingest + Transcript]
    S02 --> G1{Transcript Approval}
    G1 --> S03[03 Calendar]
    G1 --> S04[04 Caption Bank]
    G1 --> S05[05 Shot List]
    S01 --> S06[06 Platform Bios]
    S03 --> S07[07 Facebook Package]
    S04 --> S07
    S06 --> S07
    S07 --> G2{Publish Approval}
    G2 --> S08[08 Client Handoff]
```

## Parallel work law

Parallel work is permitted only when outputs do not overlap:

- Calendar, transcript QA, shot-list formatting, and platform-bio drafting may run in parallel after the strategy manifest is frozen.
- One writer owns one file path.
- Every worker writes a result manifest before the orchestrator merges conclusions.
- No worker directly changes production, sends external messages, or publishes.

## Media tool split

- **Descript:** canonical transcript, speaker labels, editorial timeline, caption correction, master compositions, final exports.
- **Opus Clip:** candidate discovery and hook ranking only unless its output is manually verified. It must not become the source of truth for quotes, captions, names, or story meaning.
- **Postiz:** approved draft scheduling and publishing after human approval.

## Data truth

The currently connected Supabase account exposes only `botanic-creations`. It is not verified as the ASC3ND client database. Agents must not write ASC3ND data there. The correct client project must be connected and inventoried before any migration or operational query.