export function StatusBadge({ value, variant, label: labelProp }) {
  if (variant && variant !== 'default') {
    return (
      <span className={`badge ${variant}`} title={String(value || '').toUpperCase()}>
        {labelProp || value}
      </span>
    );
  }
  // Approval-risk inference (no variant passed)
  const text = String(value || 'green').toLowerCase();
  const cls = text === 'red' ? 'badge red' : text === 'orange' ? 'badge orange' : text === 'yellow' ? 'badge gold' : 'badge mint';
  const label = text === 'red' ? 'Signer review' : text === 'orange' ? 'Review before external use' : text === 'yellow' ? 'Review draft' : 'Internal only';
  return <span className={cls} title={String(value || 'green').toUpperCase()}>{label}</span>;
}
