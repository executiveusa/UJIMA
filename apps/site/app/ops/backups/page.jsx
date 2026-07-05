'use client';
import { useEffect, useState } from 'react';
import { OpsShell } from '../../../components/OpsShell';
import { StatusBadge } from '../../../components/StatusBadge';
import { api } from '../../../lib/api';

export default function BackupsPage() {
  const [backups, setBackups] = useState([]);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = () => api('/api/ops/backups').then(r => setBackups(r.backups || [])).catch(() => {});
  useEffect(load, []);

  async function drillBackup() {
    setCreating(true);
    setMsg(null);
    try {
      const r = await api('/api/ops/backups', { method: 'POST', body: JSON.stringify({ notes: 'Pre-staging drill backup', createdBy: 'ops-ui' }) });
      if (r.ok) {
        setMsg(`Backup created: ${r.backup?.id || 'ok'}`);
        load();
      } else {
        setMsg(`Error: ${r.error?.message || 'unknown'}`);
      }
    } catch (e) {
      setMsg(`Error: ${e.message}`);
    } finally {
      setCreating(false);
    }
  }

  return (
    <OpsShell
      title="Backup & restore drill"
      subtitle="Local data backup drill. Must be verified before Gate 6B live staging."
    >
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Drill status</h3>
        <p>
          Run a local backup drill to confirm that mission-data can be snapshotted and
          restored before the first live VPS deployment. This is a Gate 6B prerequisite.
        </p>
        <div className="hero-actions" style={{ marginTop: '1rem' }}>
          <button className="cta" onClick={drillBackup} disabled={creating}>
            {creating ? 'Creating backup…' : 'Run local backup drill'}
          </button>
        </div>
        {msg && <p style={{ marginTop: '0.75rem' }}>{msg}</p>}
      </div>

      <div className="grid">
        {backups.length === 0 && (
          <div className="card">
            <h3>No backups yet</h3>
            <p>Click "Run local backup drill" above to create the first local snapshot.</p>
          </div>
        )}
        {backups.map((b) => (
          <div className="card" key={b.id}>
            <div className="preview-row">
              <div>
                <h3>{b.id}</h3>
                <p>{b.notes || 'No notes'}</p>
              </div>
              <StatusBadge value={b.verified ? 'green' : 'orange'} />
            </div>
            <p style={{ opacity: 0.6, fontSize: '0.85em' }}>
              {b.createdAt || ''} · by {b.createdBy || 'system'}
            </p>
          </div>
        ))}
      </div>
    </OpsShell>
  );
}
