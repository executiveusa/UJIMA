# Ops Cockpit Build Triage — Phase 9 Gate 4A

**Audience:** Architect, operator, next builder
**Purpose:** Classify the `npm run build` failure carried forward from Gate 3 before any UI/design work begins
**Status:** Resolved. Root cause identified, fix applied, verified stable across repeated runs.

---

## Exact command

```bash
npm run build
```

Which runs (root `package.json`):

```json
"build": "npm run build --workspace @asc3nd/site"
```

Which in turn ran (`apps/site/package.json`, before this fix):

```json
"build": "next build"
```

## Error summary

`next build` (Next.js 16.2.9, Turbopack by default) failed during the static prerendering phase ("Generating static pages using 3 workers") with:

```
TypeError: Cannot read properties of null (reading 'useContext')
    at ignore-listed frames {
  digest: '...'
}
Export encountered an error on <route>/page: <route>, exiting the build.
⨯ Next.js build worker exited with code: 1 and signal: null
```

The specific route that failed varied between sandbox sessions (`/_global-error`, `/_not-found`, or a real route like `/ops/crm` depending on which page a prerender worker picked up first), but the error signature was identical every time: a `useContext` call against a null React dispatcher during static export.

A companion warning always preceded the failure:

```
⚠ You are using a non-standard "NODE_ENV" value in your environment. This creates
  inconsistencies in the project and is strongly advised against.
```

## Root cause

This sandbox's shell has `NODE_ENV=development` set ambiently (confirmed via `echo $NODE_ENV`). `next build` is documented to force `NODE_ENV=production` internally, but with this Next.js 16.2.9 + React 19.2.7 + Turbopack combination, an ambient `NODE_ENV=development` in the parent process still leaks into the static-generation worker pool and produces a React dev/prod dispatcher mismatch during prerendering — the classic signature of that mismatch is exactly `Cannot read properties of null (reading 'useContext')`.

This was proven, not assumed:

| Test | Command | Result |
|---|---|---|
| Ambient env (as CI/Vercel/dev would inherit unless careful) | `npm run build` (unmodified) | Fails, 2/2 runs, same error signature |
| Explicit override | `NODE_ENV=production npm run build` | Passes, 2/2 runs |
| Webpack instead of Turbopack, ambient env | `NODE_ENV=development npx next build --webpack` | Also fails, same error (rules out Turbopack as the sole cause) |
| Webpack, explicit override | `NODE_ENV=production npx next build --webpack` | Passes |

Ruled out:
- **Multiple React copies** — `find … -iname react/package.json` confirms exactly one `react@19.2.7` and one `react-dom@19.2.7`, hoisted to the workspace root. Not a duplicate-instance bug.
- **Turbopack-specific bug** — reproduces identically under `--webpack`.
- **App code defect** — no `createContext` calls exist anywhere in `apps/site/app` or `apps/site/components`; the failure is inside a Next.js/React internal path exercised only during static export, and the failing route was non-deterministic across sessions (consistent with a worker-pool env-inheritance issue, not a broken component).

## Classification

**Local sandbox environment issue that also represents a real local-development robustness gap.** It is not a Turbopack bug, not an app code bug, and not a CI/Vercel-affecting bug (see below) — but it would affect any developer whose shell happens to export `NODE_ENV=development` before running `npm run build`, which is a common pattern (e.g., a shell profile, a devcontainer default, or running `next dev` in the same terminal session beforehand). That makes it worth fixing at the npm-script level rather than just documenting as a sandbox quirk.

## Whether CI/Vercel passes

**Yes.** Confirmed on PR #7 (Gate 3):
- GitHub Actions "Mission OS CI" workflow: `success` (both the `push` and `pull_request` triggered runs)
- Vercel preview deployments (both `ascend-social-purpose-agentic-systems-` and `ascend-social-purpose-agentic-systems-site` projects): `Ready`

Neither CI nor Vercel export a stray `NODE_ENV=development` ahead of their build step, so they were never affected. This confirms the issue was environment-local to the interactive sandbox, not a defect that shipped or would have blocked deployment.

## Whether local dev is blocked

Before the fix: yes, for any shell session with `NODE_ENV=development` already exported, `npm run build` was 100% reproducibly broken (0/4 successful runs across two separate sandbox sessions). `npm run dev` (using `next dev`, not `next build`) was not affected — dev server mode does not run the static-export worker path that triggers this.

## Affected route

Non-deterministic — whichever route the static-generation worker pool happened to prerender when the dispatcher mismatch occurred (`/_global-error`, `/_not-found`, and `/ops/crm` were each observed as the failing route in different runs). This is additional evidence the defect is in the shared render/export path, not in any single page's code.

## Fix applied

`apps/site/package.json`:

```diff
-    "build": "next build",
+    "build": "cross-env NODE_ENV=production next build",
```

Added `cross-env` as a `devDependency` of `@asc3nd/site` (`^10.1.0`) rather than the shell-only `NODE_ENV=production next build` prefix, because the latter syntax does not work under Windows' default `cmd.exe` npm script shell — this repo's own runbooks (e.g. `docs/VPS-BOOTSTRAP-RUNBOOK.md`, prior Gate instructions) show operators working from Windows PowerShell locally. `cross-env` normalizes the env-var assignment across POSIX shells, PowerShell, and `cmd.exe`.

**Verification:** `npm run build` now passes 4/4 consecutive runs (2 before this doc was written, 2 confirming after `.next` was cleared each time) with the ambient `NODE_ENV=development` left untouched — i.e., the fix is self-contained in the script and does not depend on the caller's shell state.

## Recommended fix or deferral

Fix applied in this gate (Gate 4A), scoped narrowly to the `build` script and a single new devDependency. No application code, routing, auth, or UI was touched. This clears the Gate 3 carry-forward condition: local development is no longer blocked, and Gate 4A/4B UI audit and design work can proceed without carrying an unresolved build gap.

If a future session sees this error again, re-run the same trio of checks above (`npm run build` plain vs. `NODE_ENV=production npm run build` vs. `--webpack`) before assuming it is the same root cause — do not assume this fix is permanent for a different Next.js/React version bump without re-verifying.
