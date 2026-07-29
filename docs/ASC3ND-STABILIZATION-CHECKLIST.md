# ASC3ND Stabilization Checklist

## A. Canonical mapping

- [x] Define one repository per system layer.
- [x] Record current canonical Vercel project names.
- [x] Record the workbook GitHub/Vercel naming mismatch.
- [ ] Verify each Vercel project’s connected GitHub repository.
- [ ] Verify each Vercel project’s root directory.
- [ ] Record current production deployment SHA and rollback SHA.
- [ ] Compare `asc3nd-frontend` with duplicate candidate `asc3nd-frontend-website` before deletion.

## B. Public event frontend

- [ ] Confirm the canonical production URL.
- [ ] Confirm English and Spanish routes.
- [ ] Inspect the exact RSVP form fields.
- [ ] Confirm the form POST target.
- [ ] Confirm the public origin is allowed by the RSVP API.
- [ ] Review open Next.js security dependency PR.
- [ ] Run lint, build, responsive, accessibility, and form-submission checks.
- [ ] Freeze and record the approved production SHA.

## C. Workbook and RSVP backend

- [x] Verify the current API intake whitelist.
- [x] Verify database fields and status enum.
- [x] Verify redacted adapter output.
- [x] Record missing organizer fields and adapter mismatch.
- [ ] Remove hard-coded fallback RPC URL and anon token on a review branch.
- [ ] Require `SUPABASE_RPC` and `SUPABASE_ANON` environment variables.
- [ ] Verify explicit `RSVP_PUBLIC_ORIGIN` configuration.
- [ ] Verify explicit `RSVP_PUBLIC_BASE_URL` configuration.
- [ ] Add API validation, CORS, redaction, and failure tests.
- [ ] Review or close unrelated pricing PR #1.
- [ ] Create an RSVP Organizer feature branch from the verified workbook baseline.

## D. RSVP Organizer v0.1

- [ ] Implement deterministic fixture records shaped like the adapter.
- [ ] Build Overview.
- [ ] Build People list and filters.
- [ ] Build deterministic Follow-up Queue.
- [ ] Build redacted Person Detail.
- [ ] Display fixture/live mode and freshness.
- [ ] Keep all production actions disabled.
- [ ] Add 375, 768, and 1280 pixel checks.
- [ ] Add keyboard and visible-focus checks.
- [ ] Create preview deployment.
- [ ] Present exact preview commit for owner approval.

## E. Mission OS

- [x] Narrow the first prototype contract to RSVP organization only.
- [x] Defer ThePopeBot and broad Control Tower work.
- [ ] Review open dependency PR #18.
- [ ] Keep reusable agent work isolated from the RSVP Organizer branch.
- [ ] Revisit issue #19 only after the visual organizer is trusted.

## F. Brand kit

- [ ] Add approved SVG logo.
- [ ] Add color and typography tokens.
- [ ] Add accessibility contrast guidance.
- [ ] Add flyer and social templates.
- [ ] Add English and Spanish lockups.
- [ ] Version the first approved brand release.

## Production gate

Production changes require all of the following:

- [ ] exact commit identified;
- [ ] preview URL available;
- [ ] browser review completed;
- [ ] build and required checks pass;
- [ ] rollback commit recorded;
- [ ] Jeremy explicitly approves the exact commit;
- [ ] post-deployment verification completed.
