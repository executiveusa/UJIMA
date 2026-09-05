# ROLLBACK

Base revision: `63d7e891a4fe5da6e8da6ff6108a975f7e8a5897`

Rollback strategy:
1. Revert normalization merge commit if CI/runtime fails.
2. Keep existing Netlify site ID unchanged.
3. If project rename causes routing issues, rename the project back to `asc3nd-social-purpose-os`.
4. Do not mutate ASC3ND tenant data during this run.
