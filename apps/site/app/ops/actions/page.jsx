'use client';
import { useEffect, useState } from 'react';
import { OpsShell } from '../../../components/OpsShell';
import { StatusBadge } from '../../../components/StatusBadge';
import { api } from '../../../lib/api';

const ACTION_CLASSES = {
  HARD_BLOCKED: 'red',
  PENDING_APPROVAL: 'orange',
  DRY_RUN: 'green',
  EXECUTED: 'green',
  CREDENTIAL_MISSING: 'orange',
  ADAPTER_UNAVAILABLE: 'orange',
  ERROR: 'red',
};

export default function ActionsPage() {
  const [events, setEvents] = useState([]);
  const load = () => api('/api/ops/actions').then(r => setEvents(r.events || [])).catch(() => {});
  useEffect(load, []);

  return (
    <OpsShell
      title="Action audit log"
      subtitle="All approval-gated action attempts. Hard-blocked actions never reach an adapter. Dry-run mode is active by default."
    >
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Execution safety</h3>
        <p>
          Actions flow through policy evaluation → approval → adapter. Hard-blocked types
          (outbound messages, grant submission, legal/financial filing, public publishing) are
          rejected before any adapter is called. External-mode execution requires Architect
          approval of Gate 6B.
        </p>
      </div>

      <div className="grid">
        {events.length === 0 && (
          <div className="card">
            <h3>No action events yet</h3>
            <p>Actions are logged here when dispatched through the approval pipeline.</p>
          </div>
        )}
        {events.map((ev, i) => (
          <div className="card" key={ev.id || i}>
            <div className="preview-row">
              <div>
                <h3>{ev.type || ev.actionType || 'Unknown action'}</h3>
                <p>{ev.summary || ev.policyReason || ev.message || JSON.stringify(ev)}</p>
              </div>
              <StatusBadge value={ACTION_CLASSES[ev.state] || 'orange'} />
            </div>
            <p style={{ opacity: 0.6, fontSize: '0.85em' }}>{ev.timestamp || ev.createdAt || ''}</p>
          </div>
        ))}
      </div>
    </OpsShell>
  );
}
