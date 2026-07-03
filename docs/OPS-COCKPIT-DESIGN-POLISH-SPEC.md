# Ops Cockpit Design Polish Spec — Phase 9 Gate 4B (proposed)

**Audience:** Architect (approval), Gate 4B implementer
**Purpose:** Translate the findings in `docs/OPS-COCKPIT-USABILITY-AUDIT.md` into an implementable design/engineering plan
**Status:** Specification only. Nothing in this document has been implemented. Implementation requires separate Architect approval for Gate 4B.

---

## Design goal

Make the Mission OS ops cockpit self-evident to a non-technical nonprofit operator on both desktop and mobile, without weakening any dry-run/live or approval-risk signal, and without touching the public frontend, auth, or Vercel configuration. Every screen should answer, within five seconds: *what is this page, what (if anything) needs my attention, and is it safe to ignore the rest.*

This is a polish pass on an existing, working information architecture — not a rebuild. The route map, data sources, and API boundary documented in `docs/OPS-DASHBOARD.md` are correct and stay as-is.

---

## Information architecture

No route additions or removals. Two structural changes proposed:

1. **Split `/ops` into a single coherent narrative instead of two concatenated subsystems.** The existing "Today" cockpit and the Phase 5 `MissionOsOverview` block stay on the same route (moving `MissionOsOverview` to its own route is out of scope — it would change the documented route map), but get a visible section boundary: a heading transition with one sentence explaining the shift ("Below: dry-run Mission OS operator state — agents, budgets, and events."). This directly addresses Finding "two unlabeled subsystems" from the audit without restructuring routes.
2. **Sidebar nav reorders on mobile only, not desktop.** Desktop nav order is unchanged. Mobile gets a collapsed top bar (see "Mobile behavior" below) instead of the current full-list-above-content layout — this is a rendering/CSS change, not an IA change; every route keeps its existing URL and position in the nav list.

No changes to `apps/site/app/ops/**` route folder structure. No changes to `apps/site/app/api/ops/**` route handlers or their response shapes — this is presentation-layer only.

---

## Route-by-route improvements

| Route | Change | Priority | Source finding |
|---|---|---|---|
| `/ops` | Add section-boundary heading + one-sentence transition between "Today" and "Mission OS operator overview" | High | Audit: "two unlabeled subsystems" |
| `/ops/agents` | Replace approval-risk `StatusBadge` reuse with a dedicated health badge (Healthy / Needs attention) | High | Audit: "health badge semantics" |
| `/ops/agents/[id]` | Replace raw `JSON.stringify` config dump with labeled key/value rows; move raw JSON behind a collapsed "Advanced" disclosure | Medium | Audit: raw JSON breaks plain-staff framing |
| `/ops/artifacts` | Link orange/red artifact rows toward the approval queue (`/ops/approvals`) once wired | Low | Audit: missing next-action link |
| `/ops/events` | Add one-line framing sentence; no other structural change in this gate | Low | Audit: raw log reads as dev tool |
| `/ops/budgets` | Add one sentence clarifying what "hard-block" means in dry-run mode; add `role="progressbar"` + ARIA value attributes to the spend bar | Low | Audit: accessibility + clarity gap |
| `/ops/health` | Same health-badge fix as `/ops/agents`; link unhealthy rows to agent detail | High | Audit: health badge is most damaging here |
| `/ops/deployments` | **Fix the `StatusBadge` `variant`-prop bug** — see Component improvements | **Blocker** | Audit: dead status-variant bug |
| `/ops/openwebui` | No change — audit found this page is already best-practice | — | Audit: exemplar page |
| `/ops/icm` | Render tree as semantic `<ul>/<li>` with accessible folder/file distinction instead of emoji-only `<pre>` block | Medium | Audit: accessibility + visual flatness |
| All routes | Add stalled-load timeout + retry affordance (Finding X2); fix mobile nav-before-content layout (Finding X1); add `role="alert"` to `.notice` (Finding X3); rename "Switch tenant" (Finding X4) | Blocker/High | Audit cross-cutting findings |

---

## Component improvements

### `StatusBadge` (Blocker fix, not optional polish)

Current signature: `StatusBadge({ value })`. Callers on `/ops/deployments` pass an unused `variant` prop, meaning the component silently ignores the correct color mapping computed by `statusBadgeVariant()` and defaults every non-`red`/`orange`/`yellow` value to a green "Internal only" badge. Two ways to fix, either is acceptable:

- **Option A (preferred):** Extend `StatusBadge` to accept an explicit `variant` + `label` override, used when provided:
  ```jsx
  export function StatusBadge({ value, variant, label }) {
    if (variant) return <span className={`badge ${variant}`} title={String(value || '').toUpperCase()}>{label || value}</span>;
    // existing approval-risk inference stays as the default path
  }
  ```
  This keeps `StatusBadge` as the single badge component but makes it correct for both "approval risk" and "arbitrary named status" use cases.
- **Option B:** Introduce a second, small `NamedStatusBadge({ value, variant, label })` component for non-approval-risk statuses (deployments, smoke results, backups, agent/health), and reserve `StatusBadge` strictly for the four approval-risk classes (artifacts, outcome-button risk).

Recommendation: **Option A**, since it requires touching only one component and its four call sites (`/ops/deployments` three tables), rather than introducing a parallel component. Whichever option is chosen, existing correct call sites (`/ops/artifacts`, `/ops` outcome buttons) must not change behavior — this must be a strictly additive, backward-compatible signature change, and needs a regression test (`StatusBadge` with no `variant` prop still renders the current approval-risk mapping unchanged).

### `HealthBadge` (new, small)

A minimal new component, not a `StatusBadge` variant, since health has exactly two states and should never share vocabulary with the four-tier approval-risk system (per audit finding on `/ops/agents` and `/ops/health`):

```jsx
export function HealthBadge({ status }) {
  const ok = status === 'ok';
  return <span className={`badge ${ok ? 'mint' : 'orange'}`}>{ok ? 'Healthy' : 'Needs attention'}</span>;
}
```

Replaces the `<StatusBadge value={healthStatus === 'ok' ? 'green' : 'orange'} />` pattern in `/ops/agents`, `/ops/agents/[id]`, `/ops/health`, and `MissionOsOverview`'s Agent Room preview.

### `.notice` → accessible alert region

Add `role="alert"` to every existing `<div className="notice">` usage (a find-and-replace across the affected page files, no new component needed, since `.notice` is a plain CSS class, not a shared component). If a shared `<Notice>` component is introduced instead, it should wrap this in one place — implementer's choice, but must not change the visual class name or styling.

### `LoadingState` (new, small)

Replace the repeated inline `<div className="card"><p>Loading …</p></div>` pattern with a shared component that adds a timeout:

```jsx
export function LoadingState({ label = 'Loading…', timeoutMs = 9000, onRetry }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setSlow(true), timeoutMs); return () => clearTimeout(t); }, [timeoutMs]);
  return (
    <div className="card">
      <p>{label}</p>
      {slow && (
        <div className="notice" role="alert">
          This is taking longer than expected.
          {onRetry && <button className="cta ghost" onClick={onRetry}>Retry</button>}
        </div>
      )}
    </div>
  );
}
```

Every audited page's `useEffect` fetch call needs a small refactor to expose a `refetch` function it can pass as `onRetry` — mechanical, low-risk, same pattern repeated per page.

### ICM tree rendering

Replace the `<pre>{renderedTree}</pre>` emoji string join in `/ops/icm/page.jsx` with a semantic nested list:

```jsx
<ul className="icm-tree">
  {tree.map((x) => (
    <li key={x.path} className={x.type}>
      <span className="visually-hidden">{x.type === 'dir' ? 'Folder: ' : 'File: '}</span>
      {x.path}
    </li>
  ))}
</ul>
```

with a `.visually-hidden` utility class added to `globals.css` (standard clip-based hidden-but-announced pattern) if one does not already exist — confirmed it does not exist in the current `globals.css`.

---

## Copy improvements

- `OpsShell.jsx`: "Switch tenant" → "Log out" (Finding X4). If a real multi-tenant switcher is added in a future gate, restore a "Switch tenant" label only once it actually switches tenants.
- `/ops` `MissionOsOverview` section: prepend one sentence bridging from the "Today" cockpit above it (see Route-by-route table).
- `/ops/events`: prepend "Read-only history — most entries need no action." above the table.
- `/ops/budgets`: add one sentence after the status KPI explaining what "hard-block" means in the current dry-run build (no live spend is actually blocked yet; this is a projection).
- `/ops/icm`: no copy change — the existing empty-state copy ("ICM workspace not initialized yet" + exact command) is already a good pattern and is used as the model for other empty states above.

No changes to any doc file's dry-run/live legal or safety language (`docs/LEGAL-SAFETY-NOTES.md`, `docs/HERMES-AGENT-SERVICE-API.md`, etc.) — this spec is UI copy only, scoped to `apps/site`.

---

## Empty states

Current empty-state pattern (used well on `/ops/agents`, `/ops/artifacts`, `/ops/events`, `/ops/deployments`, `/ops/icm`) is: a `.card` with one sentence stating there's nothing yet, plus — where applicable — the exact CLI command to create the first record. This pattern is correct and should be preserved, not redesigned. The only gap: `/ops/agents/[id]` and `/ops/health` don't have a meaningfully distinct empty state beyond "loading" vs. populated (health with zero agents just shows an empty table, no explanatory sentence). Add the same one-sentence-plus-command pattern there for consistency.

---

## Loading states

Replace all inline `Loading …` text blocks with the shared `LoadingState` component described above (adds the 9-second timeout + retry affordance). No change to the visual appearance of the *first* few seconds of loading — this is additive only, appearing after the timeout elapses.

---

## Error states

- Add `role="alert"` to all `.notice` error renders (see Component improvements).
- Distinguish "the request failed" (existing `catch` → `error` state, red/orange notice) from "the request is slow" (new `LoadingState` timeout, neutral/gold notice) — these are currently visually identical (`.notice` class) but semantically different; use the existing `.notice` gold styling for the slow-load case and consider a `.notice.error` red-tinted variant for actual failures if time allows in 4B (not a blocker — current gold notice for both is acceptable if time-constrained, but distinguishing them is a "should" not a "must").

---

## Dry-run labels

Every audited route already states its dry-run/live status in the page subtitle (`OpsShell title=… subtitle=…`). Audit found this pattern is good but inconsistently worded ("Dry-run state only", "dry-run only", "No live execution", "not live"). **Standardize on one sentence template** for Gate 4B:

> "`<Capability>`. Dry-run only — no live `<system>` call."

Applied consistently:
- `/ops/agents`: "Managed agents provisioned for this tenant. Dry-run only — no live agent execution."
- `/ops/agents/[id]`: "`<type> · <runtime>`. Dry-run only — no live agent execution."
- `/ops/artifacts`: "Outputs registered by managed agents and pipelines. Dry-run only — no live execution."
- `/ops/events`: "Mission OS operator activity log. Dry-run only — read-only, no action needed for most entries."
- `/ops/budgets`: "LiteLLM gateway budget status. Dry-run only — no live model calls."
- `/ops/health`: "Mission OS operator health, derived from managed-agent heartbeats. Dry-run only."
- `/ops/deployments`: "Release history, health, and backup state. Dry-run only — no live deployment actions."
- `/ops/openwebui`: unchanged — already the best example in the codebase.
- `/ops/icm`: unchanged structurally, but align wording to the same template in the populated-tree state (currently only the empty state mentions "Live agent execution is deferred").

This is copy-only, does not change any component logic, and directly serves the "what is live vs. dry-run" audit question across every route.

---

## Human approval labels

No change to the underlying approval-class vocabulary (`green`/`yellow`/`orange`/`red` → "Internal only"/"Review draft"/"Review before external use"/"Signer review") for its **correct** use cases: `/ops/artifacts` (`approvalClass`) and the `/ops` outcome-button risk badges. These are accurate today and must not be touched. The fix scope is strictly: stop using this vocabulary for non-approval concepts (health, deployment status) — see Component improvements above.

---

## Agent safety labels

No agent safety/hard-block language exists in the UI beyond the dry-run subtitles above and the approval-risk badges. This is consistent with `docs/HERMES-AGENT-SERVICE-API.md` and `docs/LEGAL-SAFETY-NOTES.md` — hard blocks (`GRANT_SUBMISSION`, `OUTBOUND_MESSAGE`, etc.) are enforced server-side and are not currently surfaced as a labeled list anywhere in `apps/site`. Out of scope for Gate 4B to add a new "safety policy" UI surface — flagged here only as a backlog note for a future gate, not a required change.

---

## Mobile behavior

Replace the current CSS-only collapse (`.ops-layout { grid-template-columns:1fr; }`, sidebar renders first in DOM/visual order) with:

1. On viewports ≤980px, `.sidebar` becomes a collapsed top bar: brand + a "Menu" toggle button (no JS framework change needed — a `'use client'` boolean state toggle in `OpsShell.jsx`, consistent with its existing client-component nature).
2. `.ops-main` content renders immediately after the collapsed top bar — no more scrolling past 19 links to reach page content.
3. Tapping "Menu" expands the nav list as an overlay or inline-expand (implementer's choice; overlay is likely simpler given existing CSS `backdrop-filter` usage already present on `.sidebar`).
4. The existing desktop layout (sticky 300px sidebar) is completely unchanged — this is a `@media (max-width: 980px)` scoped change only.
5. Tables that risk horizontal overflow on narrow viewports (`/ops/agents`, `/ops/artifacts`, `/ops/events`, `/ops/health`, `/ops/deployments`'s three tables) should get `overflow-x: auto` on their wrapping `.card` at the same breakpoint, so a table that doesn't fit scrolls horizontally within its card rather than breaking the page layout. This is a minimal, low-risk CSS addition — no column-hiding logic required for Gate 4B.

This directly resolves Finding X1 (Blocker) without touching desktop layout, route structure, or any data-fetching code.

---

## Implementation slices

Ordered so each slice is independently shippable and testable, blocker fixes first:

1. **Slice 1 (Blocker fixes, no visual redesign):** `StatusBadge` variant-prop fix on `/ops/deployments`; mobile nav-before-content fix (`OpsShell.jsx` + `globals.css` media query). These two alone resolve both Blocker findings and can ship independently of everything else.
2. **Slice 2 (Health badge):** New `HealthBadge` component; swap into `/ops/agents`, `/ops/agents/[id]`, `/ops/health`, `MissionOsOverview`.
3. **Slice 3 (Loading/error resilience):** `LoadingState` component with timeout+retry; `role="alert"` on `.notice`; wire `refetch` into each page's existing `useEffect`.
4. **Slice 4 (Copy pass):** Dry-run label standardization across all 9 data-driven routes; "Switch tenant" rename; `/ops` section-boundary copy; `/ops/events` and `/ops/budgets` one-liners.
5. **Slice 5 (ICM tree + agent config):** Semantic `<ul>` tree rendering with accessible folder/file text; collapsed "Advanced" disclosure for raw agent config JSON.
6. **Slice 6 (Table overflow + budget bar ARIA):** `overflow-x: auto` on table-containing cards at the mobile breakpoint; `role="progressbar"` + ARIA value attributes on the budget spend bar.

Slices 1 and 2 are the minimum viable Gate 4B scope if time is constrained; 3–6 are polish that can be deferred to a Gate 4C without leaving any Blocker or High finding unresolved (3 and 4 are High; deferring them past 4B should be an explicit Architect decision, not a silent drop).

---

## Tests needed

- `apps/site/tests/status-badge-variant.test.js` (new): renders `StatusBadge` with an explicit `variant`/`label` pair and asserts the override renders instead of the value-inferred default; renders `StatusBadge` with no `variant` and asserts existing approval-risk behavior (green/yellow/orange/red → correct class + label) is unchanged — this is the regression guard for the Blocker fix.
- `apps/site/tests/health-badge.test.js` (new): renders `HealthBadge` for `status: 'ok'` and any non-`'ok'` value, asserts "Healthy"/"Needs attention" text and `mint`/`orange` class.
- `apps/site/tests/ops-mobile-nav-order.test.js` (new, or extend an existing ops test): a targeted check — likely a CSS/DOM-order assertion rather than a full visual-regression test given this repo's existing test tooling is Vitest, not a browser-diffing tool — verifying `.ops-main` is not rendered after the full nav list in a way that blocks content (exact assertion mechanism to be decided by the Gate 4B implementer based on whether a DOM-order check or a rendered-CSS check is more reliable in this stack).
- Update `apps/site/tests/ops-routes-exist.test.js` if any route file path changes (should not, per this spec's "no route additions or removals" constraint).
- No changes needed to `apps/site/tests/ops-api-data.test.js` or `ops-no-operator-keys-in-client.test.js` — this spec does not touch API route handlers or introduce any new client-side secret handling.

---

## Screenshots needed

For Gate 4B's own PR (not this Gate 4A spec), before/after screenshots at both 1440×900 and 390×844 for:
- `/ops` (showing the new section boundary)
- `/ops/deployments` (showing corrected status badges — this is the single most important before/after pair, since it demonstrates the Blocker fix)
- `/ops/health` and `/ops/agents` (showing the new `HealthBadge`)
- Any one route on mobile, before/after, showing the nav-collapse fix (again, the other Blocker fix)

This Gate 4A audit itself already captured a full round of "before" screenshots during the live preview session referenced in `docs/OPS-COCKPIT-USABILITY-AUDIT.md` (not committed to the repo as binary files, per this repo's convention of no tracked screenshot assets) — the Gate 4B implementer should recreate the same route list for consistency.

---

## Rollback plan

Every change in this spec is additive or component-internal:

- `StatusBadge`'s fix is a backward-compatible signature extension (new optional prop), not a breaking change — reverting is a single-file revert with no data or API impact.
- `HealthBadge` is a new, separate component — removing it and reverting call sites to the old (buggy) `StatusBadge` usage is a mechanical revert.
- Mobile CSS changes are scoped entirely to the existing `@media (max-width: 980px)` block plus the `OpsShell.jsx` client-side toggle state — reverting means restoring the prior media query block and removing the toggle state, no other component is affected.
- No database migration, no API route handler change, no auth change, and no change to any file outside `apps/site/app/ops/**`, `apps/site/components/**`, and `apps/site/app/globals.css` is anticipated by this spec. If Gate 4B implementation discovers a need to touch anything outside that boundary, that is out of this spec's approved scope and requires a fresh Architect check-in before proceeding.
- Standard rollback mechanism: revert the Gate 4B PR's merge commit. No backup/restore, no `missionctl` command, no tenant data is touched by any change in this spec — this is presentation-layer-only work against existing, unchanged API contracts.
