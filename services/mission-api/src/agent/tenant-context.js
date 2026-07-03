export function loadAgentTenantId(req) {
  const op = req.operator;
  if (!op) throw new Error('Agent not authenticated');
  return op.tenantId;
}
