# UJIMA Plugin Security

## Secret handling

`UJIMA_MISSION_TOKEN` is a credential. Never commit, log, paste, export, or embed it in plugin package files.

The plugin package contains no default token and no production URL requirement.

## Authority

The MCP bridge cannot choose a tenant. The server derives tenant identity from the signed UJIMA token.

`ujima.approve` and `ujima.reject` require `humanConfirmed: true`, and callers must only supply that value after a real human decision.

## Failure behavior

Missing URL/token → fail closed.

401/403 from UJIMA → return the authorization error; do not retry using another tenant.

Unknown mission/work state → read current UJIMA state; do not infer completion.

## Revocation

Revoke or replace the UJIMA mission session at the UJIMA auth boundary. Do not create permanent shared tokens for agent clients.
