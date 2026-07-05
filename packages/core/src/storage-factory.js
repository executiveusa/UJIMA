/**
 * storage-factory.js — canonical thin wrapper around @asc3nd/db storage
 *
 * All code in packages/core and services/ should import storage through here,
 * not directly from @asc3nd/db or from services/mission-api/src/storage.js.
 *
 * Known inconsistency (documented in PRODUCTION-GAPS.md):
 *   services/mission-api/src/storage.js has its own storageMode() that returns
 *   'postgres-ready' / 'json-dry-run' — different strings from the canonical
 *   'postgres' / 'json' / 'memory' returned here. Migration is deferred to Gate 6B.
 *
 * Canonical mode values:
 *   'json'     — file-backed JSON (default, local dev)
 *   'memory'   — in-memory (tests)
 *   'postgres' — Postgres via DATABASE_URL (production)
 */

export {
  storageMode,
  assertProductionStorage,
  createRepositories,
  clearRepositoryCache,
} from '../../db/src/index.js';

import { storageMode as _storageMode } from '../../db/src/index.js';

/**
 * Returns true when running in local-development JSON mode (safe to proceed without Postgres).
 */
export function isLocalJsonMode() {
  return _storageMode() === 'json';
}

/**
 * Returns a labelled description of current storage for operator readiness checks.
 */
export function storageStatusSummary() {
  const mode = _storageMode();
  const labels = {
    json: 'JSON file-backed (local dev only — not for production)',
    memory: 'In-memory (test mode — not persistent)',
    postgres: 'Postgres (production-ready)',
  };
  return { mode, label: labels[mode] || `Custom: ${mode}` };
}
