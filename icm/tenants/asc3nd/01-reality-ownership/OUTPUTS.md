# Slice 01 required outputs

- `control-plane/asc3nd-system-inventory.json`
- owner resolution for organization truth, operational rows, public frontend, grants, deployment runtime, and source/migrations
- migration-priority list
- known collision-risk list
- checkpoint proving no public-frontend mutation

Acceptance:

- exactly one owner is named for each listed truth domain;
- public frontend remains frozen;
- historical frontends are not silently promoted;
- Grant Agent is not allowed to become a second organization truth store;
- hosted database/runtime providers are explicitly replaceable.
