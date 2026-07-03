export function agentSuccess(res, payload = {}, status = 200) {
  return res.status(status).json({ ok: true, ...payload });
}

export function agentError(res, code = 'AGENT_ERROR', message = 'An error occurred', status = 400) {
  return res.status(status).json({ ok: false, error: { code, message } });
}

export { agentError as operatorError };
