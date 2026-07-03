# Ops Cockpit Usability Audit — Phase 9 Gate 4A

**Audience:** Architect, design/frontend builder for Gate 4B
**Purpose:** Route-by-route usability audit of the interior Mission OS dashboard, using Steve Krug-style "don't make me think" principles
**Method:** Source read of every audited route, component, and shared layout, plus a live browser preview (Chromium via Playwright) against `npm run dev:web` on the `demo-pnw` tenant, at desktop (1440×900) and mobile (390×844) viewports. Screenshots referenced below are not committed to the repository (binary artifacts, no images tracked per repo convention) — see the Gate 4A PR description / session transcript for the captured images.
**Scope:** `/login`, `/ops`, `/ops/agents`, `/ops/agents/[id]`, `/ops/artifacts`, `/ops/events`, `/ops/budgets`, `/ops/health`, `/ops/deployments`, `/ops/openwebui`, `/ops/icm`. This is the exact route list assigned for Gate 4A. The codebase has additional `/ops/*` routes (`approvals`, `bridge`, `campaigns`, `crm`, `flywheel`, `imports`, `onboarding`, `opportunities`, `reports`, `second-brain`, `settings`, `voice`) that predate Phase 5–9 and are out of scope for this audit — they are not touched or assessed here.

---

## Cross-cutting findings (apply to every route)

These are structural issues in `OpsShell.jsx` and `globals.css`, inherited by all 11 audited routes. They are listed once here instead of repeated in every route section, and referenced by name below.

### Finding X1 — Mobile: full navigation renders above all page content

**Severity: Blocker**

`globals.css` line 107-109:

```css
@media (max-width: 980px) {
  .hero-grid, .grid.cols-3, .grid.cols-4, .split, .ops-layout { grid-template-columns:1fr; }
  .sidebar { position:relative; height:auto; }
```

`.ops-layout` is a CSS grid with the sidebar as the first child and main content second. Collapsing to `grid-template-columns:1fr` keeps DOM order, so on any viewport ≤980px the entire 19-link sidebar nav (with `Plain staff mode` banner) renders as a full-height block **above** the page's actual content, before the page title even appears. Confirmed in a live mobile-viewport (390×844) screenshot of `/ops`: the visible viewport after page load shows only the "Mission OS" brand, "Plain staff mode" badge, and the top of the nav list — the "Today" page title and readiness score are roughly 1200px below the fold, reachable only after scrolling past all 19 nav links.

This affects **every** route in scope, since all of them render through `OpsShell`. For a non-technical nonprofit operator opening this on a phone (a stated persona in this audit's 10 questions), the first screen they see is a wall of navigation links with no page content — directly violating "make pages scannable" and "the next action should be obvious."

**Recommended fix:** On mobile, either (a) collapse the sidebar into a top app-bar with a hamburger/drawer pattern, or (b) reorder the grid so `.ops-main` comes first in visual order (`order: -1` on `.ops-main` inside the media query) while keeping the sidebar accessible via a "Menu" toggle. Design polish spec covers this in detail (see `docs/OPS-COCKPIT-DESIGN-POLISH-SPEC.md`).

### Finding X2 — No error/timeout affordance on stalled data loads

**Severity: High**

Every data-driven route (`/ops`, `/ops/agents`, `/ops/agents/[id]`, `/ops/artifacts`, `/ops/events`, `/ops/budgets`, `/ops/health`, `/ops/deployments`) follows the same pattern:

```jsx
const [data, setData] = useState(null);
useEffect(() => { opsApi('/x').then(setData).catch((e) => setError(e.message)); }, []);
if (!data) return <div className="card"><p>Loading …</p></div>;
```

If the fetch promise never settles (network stall, a hung server-side handler, a client-side hydration issue that delays effect execution) there is no timeout, no retry button, and no visible indication that anything is wrong — the "Loading …" text is permanent from the operator's point of view. This was observed directly in this audit's own browser preview session: on first load, `/ops/deployments`, `/ops/artifacts`, and `/ops/icm` all stayed on their loading/blank state indefinitely in one browser session even though a direct `curl` to the same same-origin API endpoint returned in well under 100ms — see `docs/OPS-COCKPIT-BUILD-TRIAGE.md`-adjacent investigation notes below. Whatever the root cause in that specific session (most likely a dev-server/HMR-WebSocket interaction specific to this sandboxed preview environment, not a production defect — see note at the end of this document), the *product* gap it exposes is real: none of these pages have a fallback state for "the request is taking too long" or "the request failed and I don't know why."

**Recommended fix:** Add a client-side timeout (e.g., 8–10s) that swaps the loading state for a "This is taking longer than expected — retry" affordance with a manual refetch button, distinct from the `catch` error state.

### Finding X3 — Error notices are not screen-reader announced

**Severity: Medium**

Every `<div className="notice">{error}</div>` (used for both real errors and empty-state guidance) has no `role="alert"` or `aria-live` region. A screen-reader user who submits an action or whose data fails to load will not be told anything changed unless they manually re-scan the page.

**Recommended fix:** Add `role="alert"` (or wrap in a shared `aria-live="polite"` region) to the `.notice` component pattern.

### Finding X4 — "Switch tenant" label is misleading

**Severity: Low**

`OpsShell.jsx` line 53: `<a href="/login" className="cta ghost">Switch tenant</a>`. This link goes to the login page, which (per `docs/OPS-DASHBOARD.md`'s documented "Known limitation: tenant resolution") does not support switching tenants at all — the ops dashboard tenant is fixed via `OPS_TENANT_ID` env var, and login only authenticates the legacy session-JWT API for a single hardcoded tenant. An operator clicking "Switch tenant" expecting a tenant picker will just see the login form again.

**Recommended fix:** Rename to "Log out" or "Switch account" until multi-tenant browser login exists, or hide the control entirely for single-tenant deployments (which is the default per `docs/SOVEREIGN-AI-CLIENT-STACK.md`).

### Note on the browser-preview stalled-fetch observation

During this audit's live preview, `npm run dev:web` (Next.js 16.2.9, Turbopack, dev mode) logged repeated `WebSocket connection … failed: Error during WebSocket handshake: net::ERR_INVALID_HTTP_RESPONSE` for the Turbopack HMR client. This is consistent with the sandboxed preview environment's networking layer interfering with the dev-server's hot-reload WebSocket, which is a plausible explanation for the stalled client-side fetches observed only in this preview session (server-rendered shell and static pages like `/ops/openwebui`, which has no data fetch, rendered correctly and immediately; every page with a `useEffect`-driven fetch stalled). This is documented here as an honest observation, not asserted as a production bug — Finding X2 above (no timeout/retry UX) is the real, code-level gap this observation exposes, independent of its root cause in this specific sandbox.

---

## Route-by-route audit

### `/login`

| Field | Assessment |
|---|---|
| Current state | Single-card centered form. Email/password pre-filled with demo credentials (`admin@asc3nd.local` / `change-this-password`). "Enter cockpit" submit button. |
| Operator confusion risk | Low. The page is self-explanatory: one form, one action, plain sentence explaining demo credentials are prefilled. |
| Live/dry-run clarity | N/A — this page performs a real login against the session-JWT API; there is no dry-run ambiguity here. |
| Next-action clarity | High. Only one button, clearly labeled. |
| Blocked | Nothing — no policy/approval gating happens on this screen. |
| Mobile risk | Low. `.login-page` is a simple centered flex layout, not part of `.ops-layout`, so it is unaffected by Finding X1. Confirmed clean in mobile screenshot. |
| Accessibility notes | Inputs are wrapped in `<label>` elements (good — implicit label association). No `autoComplete` attributes set for email/password (browser autofill may not trigger as expected). No visible "forgot password" or account-recovery path — acceptable for a single-operator demo tenant, worth revisiting before multi-staff production use. |
| Severity | Low |
| Recommended fix | Add `autoComplete="username"` / `autoComplete="current-password"`. Consider removing hardcoded demo credentials from the prefilled fields once a real tenant is provisioned (currently every operator sees another operator's password in plaintext by default). |

### `/ops` (Today cockpit + Mission OS operator overview)

| Field | Assessment |
|---|---|
| Current state | Two stacked systems on one page: the pre-existing "Today" outcomes cockpit (readiness score ring, next-best-actions, outcome buttons, opportunities/lanes) followed by the Phase 5 `MissionOsOverview` block (KPIs, Agent Room preview, health, recent artifacts/events, next actions, integration placeholders). |
| Operator confusion risk | Medium. Two different visual systems are concatenated on one page with no visual separator explaining why. A first-time operator has no way to know "Today" and "Mission OS operator overview" are two different subsystems (legacy session API vs. Phase 3+ Operator API state) built at different times — see `docs/OPS-DASHBOARD.md` "Why `/ops` was extended instead of replaced." That reasoning is sound engineering but invisible to the operator. |
| Live/dry-run clarity | Mixed. `MissionOsOverview` explicitly says "Dry-run managed agent, model gateway, and observability state. No live execution." directly under its heading — good. The "Today" cockpit above it has no such label; its outcome buttons dispatch `POST /api/actions/start`, which is a real approval-creating action, not obviously distinguished from the dry-run section below it. |
| Next-action clarity | Good within the "Today" cockpit itself (explicit "Next best actions" section with reasons). Weaker across the seam between the two sections — nothing tells the operator which section to act on first. |
| Blocked | Outcome buttons that map to orange/red actions correctly show a `StatusBadge` for risk on the button itself (`<StatusBadge value={action.risk} />`), which is good practice used inconsistently elsewhere (see Finding on `/ops/deployments` below). |
| Mobile risk | Finding X1 (full nav above content) plus this page has the most content of any audited route, so the scroll-past-nav cost is highest here. |
| Accessibility notes | `readiness-ring` conveys the score via `background: conic-gradient(...)` with an `aria-label` on the ring div — good, this is one of the few places ARIA is used deliberately. Finding X3 applies to the `message` notice shown after starting an action. |
| Severity | High (confusing dual-system layout is the single biggest "what is this page?" risk in the whole audit) |
| Recommended fix | Add a visible section divider/heading transition (e.g., "Mission OS operator overview" section could open with a horizontal rule + short one-line explainer of why it's here, or ideally the two systems converge into one design language in a later phase — out of scope for 4B, but should be named as a known seam in the design spec). |

### `/ops/agents`

| Field | Assessment |
|---|---|
| Current state | Table of managed agents: slug (linked), type, runtime, health badge, provisioned date. Three states handled: loading, empty ("No managed agents provisioned yet. Run `missionctl hermes provision`."), populated table. |
| Operator confusion risk | Low-medium. The empty state correctly tells the operator the exact CLI command to run — good "make it self-evident" practice. However see the health-badge semantic issue below. |
| Live/dry-run clarity | Good — subtitle explicitly says "Dry-run state only — no live execution." |
| Next-action clarity | Medium. Agent rows link to detail pages, which is discoverable, but there is no visible CTA for "provision a new agent" from the UI itself (operator must know to go to a terminal), which is reasonable for this build's phase but worth flagging. |
| Blocked | N/A — this is a read-only view. |
| Mobile risk | Finding X1. Additionally the 5-column table (`Agent / Type / Runtime / Health / Provisioned`) will need horizontal scroll or column-dropping on a 390px viewport — not verified visually (no populated agent data in the preview tenant) but the `.table` CSS has no responsive column-hiding rules, so this is a code-level risk on any tenant with real agent rows. |
| Accessibility notes | Table uses proper `<thead>`/`<tbody>`/`<th>` — good semantic baseline. |
| Severity | Medium — the health-badge issue below is the standout defect |
| Recommended fix | See "Finding on health badge semantics" immediately below, which is the dominant issue for this route. |

**Finding: health status reuses approval-risk vocabulary (Severity: High).** `StatusBadge` (`components/StatusBadge.jsx`) was designed for the four Mission OS approval-risk classes (`green`/`yellow`/`orange`/`red` → "Internal only" / "Review draft" / "Review before external use" / "Signer review"). `/ops/agents` and `/ops/agents/[id]` both call it with `value={a.healthStatus === 'ok' ? 'green' : 'orange'}` — i.e., they repurpose the approval-risk badge to show agent *health*. A healthy agent shows a green "Internal only" badge; an unhealthy one shows an orange "Review before external use" badge. Neither label has anything to do with health. An operator seeing "Review before external use" on a broken agent will reasonably wonder what needs reviewing and for what external use — the actual answer ("this agent's heartbeat is stale, someone should check on it") is not represented anywhere in the label. **Recommended fix:** introduce a second badge variant (or a dedicated `HealthBadge` component) with health-appropriate labels ("Healthy" / "Needs attention"), and reserve `StatusBadge`'s current green/yellow/orange/red → approval-language mapping strictly for actual approval-class values (artifacts, outcome-button risk, approval records).

### `/ops/agents/[id]`

| Field | Assessment |
|---|---|
| Current state | Agent detail: status card (health badge, runtime, provisioned date), configuration card (raw JSON dump via `<pre>`), related events list. |
| Operator confusion risk | Medium. The "Configuration" card renders `JSON.stringify(agent.config, null, 2)` directly — this is a developer-facing raw JSON blob on a page whose sibling pages use plain-language, non-technical framing ("Plain staff mode" in the sidebar). This is the single most technical, least "non-technical operator"-friendly surface in the whole audited set. |
| Live/dry-run clarity | Good — subtitle states "dry-run state only." |
| Next-action clarity | Low. There is no action available on this page at all (no pause/resume/reprovision control), which is consistent with Phase 5/6 scope (read-only), but nothing on the page tells the operator that — a "why can't I do anything here" question is left unanswered. |
| Blocked | Nothing is exposed as blocked because nothing is actionable. |
| Mobile risk | Finding X1, plus the `split` two-card layout (Status / Configuration) stacks to one column per the same media query, which is fine, but the raw JSON `<pre className="code">` block will force horizontal scroll on narrow viewports for any non-trivial config object (no `word-break` or `white-space: pre-wrap` in `.code`'s CSS rule). |
| Accessibility notes | Same as `/ops/agents` — no table this time, but the JSON `<pre>` block has no accessible summary/label for what it represents beyond the "Configuration" heading. |
| Severity | Medium |
| Recommended fix | Replace the raw JSON dump with a small set of human-labeled key/value rows for the fields operators actually care about (model, allowed tools, budget ceiling), and move the raw JSON behind a collapsed "Advanced / raw config" disclosure for technical users. |

### `/ops/artifacts`

| Field | Assessment |
|---|---|
| Current state | Table: title, kind, approval-class badge, created date. Loading/empty/populated states handled. |
| Operator confusion risk | Low. This is the cleanest, most consistent route in the audit — `StatusBadge` is used correctly here (`art.approvalClass` is genuinely an approval class), so the badge vocabulary matches its actual meaning. |
| Live/dry-run clarity | Good — subtitle: "Outputs registered by managed agents and pipelines. No live execution." |
| Next-action clarity | Medium. No link from an artifact row to the approval queue (`/ops/approvals`, out of scope but exists) even when `approvalClass` is orange/red and presumably pending — a natural next action ("go approve this") is implied by the badge but not offered as a click target. |
| Blocked | Represented correctly via the approval-class badge. |
| Mobile risk | Finding X1; 4-column table, same unverified-but-likely column-overflow risk as `/ops/agents`. |
| Accessibility notes | Standard semantic table, consistent with other routes. |
| Severity | Low |
| Recommended fix | Make orange/red artifact rows link to (or open) the relevant approval record once that flow exists in a later gate. |

### `/ops/events`

| Field | Assessment |
|---|---|
| Current state | Flat table: type, actor, subject, timestamp. Loading/empty/populated states handled. |
| Operator confusion risk | Medium. This is a raw event-journal dump (`AGENT.CONTEXT_LOADED`, `SMOKE.PASSED`, etc. per `docs/HERMES-AGENT-SERVICE-API.md`) with no filtering, grouping, or plain-language translation. For a "non-technical nonprofit operator" persona, a table of typed system event codes is closer to a developer log viewer than an operations screen. |
| Live/dry-run clarity | Good — "Dry-run state only" in the subtitle. |
| Next-action clarity | Low. There is no action associated with any event row — this is a pure audit log, which is appropriate for its purpose, but nothing signals "this is a log, you don't need to act on most of these" to a first-time viewer. |
| Blocked | N/A. |
| Mobile risk | Finding X1; 4-column table risk as above. |
| Accessibility notes | Standard semantic table. |
| Severity | Medium |
| Recommended fix | Add a one-line framing sentence ("Read-only history — most entries need no action") and consider basic type-based filtering/grouping in a later design pass. Not required for Gate 4B but worth naming in the design spec's backlog. |

### `/ops/budgets`

| Field | Assessment |
|---|---|
| Current state | 4-up KPI row (month spend, monthly budget, usage entries, status badge), a progress bar with percentage-of-budget text, and a per-surface spend table. |
| Operator confusion risk | Low. This is a well-structured page: KPIs first, then a visual budget bar, then detail. Good "make it scannable" execution. |
| Live/dry-run clarity | Good — "LiteLLM gateway budget status. Dry-run usage ledger — no live model calls." |
| Next-action clarity | Medium. The `status` badge (green/orange/red for ok/warning/hard-block) is the one correct additional use of `StatusBadge`'s approval-language mapping being repurposed — "Signer review" as a hard-block-budget label is a stretch semantically (budget hard-block ≠ needs a signer), but it is at least in the same risk-tiered spirit as the component's original design, unlike the agent-health case. Still worth flagging as a soft version of the same badge-reuse problem. |
| Blocked | The hard-block state (100%+ spend) is visually represented via the badge and progress bar, but there is no explicit copy explaining what "hard-block" means operationally (does new agent spend get refused? is this informational only in dry-run?). |
| Mobile risk | Finding X1; the 4-up KPI grid collapses to 1 column per `.grid.cols-4` media rule — acceptable, KPIs remain readable stacked. |
| Accessibility notes | Progress bar (`<div className="progress"><span style={{width}}/></div>`) has no `role="progressbar"`, `aria-valuenow`, or accessible text equivalent beyond the adjacent plain-text percentage sentence — the sentence is a reasonable accessible fallback, but the bar itself is not screen-reader-navigable as a progress element. |
| Severity | Low |
| Recommended fix | Add one sentence clarifying what "hard-block" means in dry-run vs. eventual live mode, and add `role="progressbar"` + `aria-valuenow`/`aria-valuemin`/`aria-valuemax` to the budget bar. |

### `/ops/health`

| Field | Assessment |
|---|---|
| Current state | 4-up KPI row (overall status badge, agents tracked, pending approvals, active runs) plus a per-agent health table. |
| Operator confusion risk | Medium — same health-badge-reuses-approval-language issue as `/ops/agents` (`h.healthStatus === 'ok' ? 'green' : 'orange'`), compounded here because this page's *entire purpose* is health, making the mismatched vocabulary more prominent than on the agents list. |
| Live/dry-run clarity | Good — "derived from managed-agent heartbeats. Dry-run only." |
| Next-action clarity | Low. If an agent shows unhealthy, there is no link from this page to the agent detail page or any remediation guidance. |
| Blocked | N/A — this page doesn't gate anything itself. |
| Mobile risk | Finding X1; KPI grid collapses acceptably, table has the same overflow risk pattern as other tables. |
| Accessibility notes | Standard semantic table + KPI cards, consistent with other routes. |
| Severity | High (this page is the clearest example of Finding "health badge semantics" doing real damage, since the whole page is built around that badge) |
| Recommended fix | Same as the `/ops/agents` recommendation — dedicated health-appropriate badge language. Additionally, link each unhealthy agent row to its detail page. |

### `/ops/deployments`

| Field | Assessment |
|---|---|
| Current state | Active-release KPI row (or "no active release" notice with the exact CLI commands to run), release-history table, recent-smoke-results table, backups table, and a static "Upgrade / Rollback" instructions card with `missionctl` commands. |
| Operator confusion risk | High — see the concrete bug below, which is the most serious defect found in this audit. |
| Live/dry-run clarity | Good in copy: "dry-run mode — no live deployment actions." |
| Next-action clarity | Good structurally (empty states show exact next CLI command), undermined by the status-badge bug below. |
| Blocked | N/A — page is read-only, actions happen via CLI per the instructions card, which is accurately described. |
| Mobile risk | Finding X1; three separate tables plus a KPI row will make this the longest page to scroll to on mobile after the nav (compounding Finding X1's severity specifically here). |
| Accessibility notes | Standard semantic tables. |
| Severity | **Blocker** |
| Recommended fix | See below — this is a code defect, not a design suggestion, and should be fixed regardless of whether Gate 4B proceeds with broader visual polish. |

**Finding: `StatusBadge` `variant` prop is silently ignored — all deployment/smoke/backup statuses render identically (Severity: Blocker).** `DeploymentsPage` computes a semantically correct color via its own local `statusBadgeVariant(status)` helper (mint for active, red for failed/rolled_back, gold for draft/ready) and passes it as `<StatusBadge value={r.status} variant={statusBadgeVariant(r.status)} />`. However, `StatusBadge`'s actual implementation (`components/StatusBadge.jsx`) is `export function StatusBadge({ value })` — it does not accept or use a `variant` prop at all. It independently derives both CSS class and label from `value` alone, matching only the literal strings `'red'`, `'orange'`, `'yellow'`; anything else (including every real deployment status: `'active'`, `'draft'`, `'ready'`, `'failed'`, `'rolled_back'`, `'archived'`, `'passed'`, `'yes'`, `'no'`) falls through to the default `mint`/"Internal only" branch. **The practical effect: every release, every smoke-result, and every backup-restorability badge on `/ops/deployments` renders identically — a green "Internal only" badge — regardless of whether the release is active or failed, the smoke run passed or failed, or the backup is restorable or not.** An operator scanning this page cannot visually distinguish a failed deployment from a successful one; the `statusBadgeVariant()` function's carefully mapped color logic is dead code that never executes. This is a genuine correctness bug that undermines the entire purpose of the page (surfacing deployment health at a glance) and should be treated as a blocking fix, independent of any broader Gate 4B visual redesign. **Recommended fix:** either extend `StatusBadge` to accept and apply an explicit `variant` override prop (used when provided, falling back to its own `value`-based inference otherwise), or have `DeploymentsPage` render its own badge markup using the `badge <variant>` CSS classes directly instead of going through the mismatched component contract.

### `/ops/openwebui`

| Field | Assessment |
|---|---|
| Current state | Static placeholder page — no data fetch. Clear explanatory notice plus a "Workspace launcher" card explaining what will appear once wired live. |
| Operator confusion risk | Low. This is the clearest, most honest placeholder in the audited set — it says outright "not wired live in Phase 5," names the doc where the future behavior is specified, and tells the operator exactly where to look for any locally configured URL in the meantime. |
| Live/dry-run clarity | Excellent — best example in the codebase of how to phrase a deferred-feature page. |
| Next-action clarity | Appropriately low — there is genuinely no action available yet, and the page does not pretend otherwise. |
| Blocked | Explicitly and correctly stated as not-yet-implemented, not "blocked" in the approval sense. |
| Mobile risk | Finding X1 only; page itself has minimal content so the scroll-past-nav cost, while still present, is smaller than on data-heavy pages. |
| Accessibility notes | No interactive elements beyond nav — nothing to flag. |
| Severity | Low |
| Recommended fix | None required for correctness. Worth using this page's copy pattern as the template when tightening language on other placeholder/deferred surfaces in Gate 4B. |

### `/ops/icm`

| Field | Assessment |
|---|---|
| Current state | Fetches `/api/icm/tree`; shows either an error notice, a "not initialized yet" card with the exact `missionctl icm init` command, or a monospace-rendered folder tree using 📁/📄 glyphs. |
| Operator confusion risk | Medium. The rendered tree (when populated) is a raw `<pre>` block of emoji + path strings — functional but visually flat compared to the rest of the dashboard's card/table design language; for a non-technical operator this reads as "developer file listing" rather than an operational view, even though the underlying concept (ICM stage folders) is specifically meant to be human-readable per `docs/ICM-FACTORY-DECISION.md`. |
| Live/dry-run clarity | Good — the empty state explicitly says "Live agent execution is deferred" and links to `docs/ICM-FACTORY-DECISION.md`. |
| Next-action clarity | High for the empty state (exact CLI command given). Lower for the populated state — a flat tree listing gives no indication of which stage needs attention next or what's safe to ignore. |
| Blocked | Not represented — the tree view has no concept of stage-level human-review-gate status even though `docs/HERMES-ICM-RUNTIME.md` describes mandatory human review gates per stage. |
| Mobile risk | Finding X1, plus long file paths in the `<pre>` block will overflow narrow viewports (same `.code`/`<pre>` wrapping gap noted under `/ops/agents/[id]`). |
| Accessibility notes | The 📁/📄 emoji glyphs have no text alternative beyond their own Unicode name as read by a screen reader (which will vary by OS/browser — "folder" vs. "open file folder" etc.), and are the *only* visual differentiator between a directory and a file in this view. |
| Severity | Medium |
| Recommended fix | Render the tree as a proper nested list (`<ul>`/`<li>`) with `aria-label`/visually-hidden text distinguishing folders from files instead of relying on emoji alone, and consider surfacing each stage's human-review-gate status (from the stage `CONTEXT.md` contract) inline once that data is available through the API. Out of scope for Gate 4B unless the Architect expands scope — worth naming as a backlog item in the design spec.

---

## Severity summary

| Route | Severity | Standout issue |
|---|---|---|
| `/login` | Low | Minor autocomplete/credential-hygiene polish |
| `/ops` | High | Two unlabeled subsystems concatenated on one page |
| `/ops/agents` | Medium | Health badge reuses approval-risk vocabulary |
| `/ops/agents/[id]` | Medium | Raw JSON config dump breaks "plain staff mode" framing |
| `/ops/artifacts` | Low | Cleanest route in the audit; minor next-action gap |
| `/ops/events` | Medium | Raw event log with no plain-language framing |
| `/ops/budgets` | Low | Well-structured; minor accessibility/copy gaps |
| `/ops/health` | High | Health badge issue is most damaging here (page is entirely about health) |
| `/ops/deployments` | **Blocker** | `StatusBadge` `variant` prop is silently ignored — all statuses render identically |
| `/ops/openwebui` | Low | Best-practice placeholder page; no changes required |
| `/ops/icm` | Medium | Flat emoji tree lacks stage-gate context and accessible structure |
| *(cross-cutting, all routes)* | **Blocker** | Mobile: full nav renders above all page content (Finding X1) |
| *(cross-cutting, all routes)* | High | No timeout/retry affordance on stalled data loads (Finding X2) |

Two findings are rated **Blocker**: the mobile navigation-before-content layout (X1) and the dead status-badge-variant bug on `/ops/deployments`. Both are concrete, verifiable (one via live screenshot, one via direct source read) and both should be prioritized in Gate 4B regardless of how much broader visual redesign is approved.
