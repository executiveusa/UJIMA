'use client';
import { useEffect, useState } from 'react';
import { OpsShell } from '../../../components/OpsShell';
import { StatusBadge } from '../../../components/StatusBadge';
import { api } from '../../../lib/api';

export default function ReadinessPage() {
  const [data, setData] = useState(null);
  const load = () => api('/api/ops/readiness').then(setData).catch(() => {});
  useEffect(load, []);

  const checks = data?.checks || [];
  const summary = data?.summary || {};

  return (
    <OpsShell
      title="Gate 6B Readiness"
      subtitle="Pre-flight checks before live VPS staging. Human intake required for items marked BLOCKED."
    >
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Gate 6B Status</h3>
        <p>
          {data?.gate6bBlocked
            ? 'BLOCKED — GATE_6B_LIVE_APPROVED is not set. External live actions disabled until Architect approves Gate 6B.'
            : 'WARNING — GATE_6B_LIVE_APPROVED is set. Live actions are unblocked.'}
        </p>
        {summary.total > 0 && (
          <p style={{ marginTop: '0.5rem' }}>
            {summary.passed} / {summary.total} checks passing
          </p>
        )}
      </div>

      <div className="grid">
        {checks.length === 0 && (
          <div className="card">
            <h3>Loading readiness checks…</h3>
          </div>
        )}
        {checks.map((check) => (
          <div className="card" key={check.id}>
            <div className="preview-row">
              <div>
                <h3>{check.label}</h3>
                <p>{check.detail}</p>
              </div>
              <StatusBadge value={check.pass ? 'green' : 'red'} />
            </div>
          </div>
        ))}
      </div>

      {data?.note && (
        <div className="card" style={{ marginTop: '1rem', opacity: 0.75 }}>
          <p>{data.note}</p>
        </div>
      )}
    </OpsShell>
  );
}
