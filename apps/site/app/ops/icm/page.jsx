'use client';
import { useEffect, useState } from 'react';
import { OpsShell } from '../../../components/OpsShell';
import { api } from '../../../lib/api';

export default function IcmPage() {
  const [tree, setTree] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api('/api/icm/tree')
      .then((d) => setTree(d.tree || []))
      .catch((e) => setError(e?.message || 'Failed to load ICM workspace'));
  }, []);

  const renderedTree = (tree || []).map((x) => `${x.type === 'dir' ? '\u{1F4C1}' : '\u{1F4C4}'} ${x.path}`).join('\n');

  return (
    <OpsShell title="ICM workspace" subtitle="Folder structure is the agent architecture. Stage files are the control surface.">
      {error && (
        <div className="notice">
          ICM workspace could not be loaded: {error}
        </div>
      )}
      {!error && tree !== null && tree.length === 0 && (
        <div className="card">
          <h3>ICM workspace not initialized yet</h3>
          <p>
            No ICM workspace found for this tenant. Run the following command to create it:
          </p>
          <pre className="code">node missionctl/missionctl.mjs icm init demo-pnw</pre>
          <p className="notice">
            Live agent execution is deferred. The ICM workspace provides the folder structure
            and stage contracts that a human-supervised agent uses for mission tasks.
            See <code>docs/ICM-FACTORY-DECISION.md</code> for the deployment factory path.
          </p>
        </div>
      )}
      {!error && tree !== null && tree.length > 0 && (
        <div className="card">
          <pre className="code">{renderedTree}</pre>
        </div>
      )}
    </OpsShell>
  );
}
