'use client';

import styles from './MissionEvidencePanel.module.css';

function approvalLabel(status) {
  if (!status) return 'Needs your decision';
  if (status === 'draft' || status === 'review') return 'Needs your decision';
  if (status === 'approved') return 'Approved';
  if (status === 'rejected') return 'Rejected';
  if (status === 'executed') return 'Executed';
  if (status === 'verified') return 'Verified';
  if (status === 'logged') return 'Logged';
  return status;
}

export function MissionEvidencePanel({ work, evidence, busy = false, onDecision, onArtifact }) {
  if (!work?.id || work.phase === 'routing_failed') return null;
  const artifacts = evidence?.artifacts || [];
  const approval = evidence?.approval || null;
  const needsDecision = work.status === 'needs_you' && work.approvalRequired === true;
  if (!artifacts.length && !approval && !needsDecision) return null;
  const decidable = needsDecision && (!approval || ['draft', 'review'].includes(approval.status));
  const displayedApproval = approval || (needsDecision ? { approvalClass: 'governed', status: 'draft', comments: 'Review this action before anything consequential happens.' } : null);

  return (
    <section className={styles.panel} aria-label="Work evidence and approvals">
      <div className={styles.heading}>
        <div>
          <span>Work packet</span>
          <strong>Evidence you can inspect</strong>
        </div>
        {displayedApproval && <span className={styles.status}>{approvalLabel(displayedApproval.status)}</span>}
      </div>

      {artifacts.length > 0 && (
        <div className={styles.artifacts}>
          {artifacts.map((artifact) => (
            <article key={artifact.id} className={styles.artifact}>
              <div>
                <small>{artifact.kind}</small>
                <strong>{artifact.title}</strong>
                <span>{artifact.approvalStatus === 'approved' ? 'Approved artifact' : 'Artifact'}</span>
              </div>
              <div className={styles.actions}>
                <button type="button" onClick={() => onArtifact(artifact, false)}>Preview</button>
                <button type="button" onClick={() => onArtifact(artifact, true)}>Download</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {displayedApproval && (
        <div className={styles.approval}>
          <div>
            <small>{displayedApproval.approvalClass || 'governed'} approval</small>
            <strong>{approvalLabel(displayedApproval.status)}</strong>
            <p>{displayedApproval.comments || 'Review this action before anything consequential happens.'}</p>
          </div>
          {decidable && (
            <div className={styles.decisionActions}>
              <button type="button" className={styles.reject} disabled={busy} onClick={() => onDecision('reject')}>Reject</button>
              <button type="button" className={styles.approve} disabled={busy} onClick={() => onDecision('approve')}>Approve</button>
            </div>
          )}
        </div>
      )}
      <small className={styles.guardrail}>Approval updates the shared control-room record. It does not publish, send, pay, submit, deploy, or execute the action by itself.</small>
    </section>
  );
}