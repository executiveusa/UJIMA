import crypto from 'node:crypto';

function jwtSecret() {
  return process.env.JWT_SECRET || 'dev-only-secret-change-me';
}

export function verifyBrowserSessionToken(token) {
  try {
    if (!token || !token.includes('.')) return null;
    const [body, sig] = token.split('.');
    const expected = crypto.createHmac('sha256', jwtSecret()).update(body).digest('base64url');
    const sigBuf = Buffer.from(sig || '');
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Date.now()) return null;
    if (!payload.tenantId || !payload.sub) return null;
    return payload;
  } catch {
    return null;
  }
}

export function browserSessionAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const user = verifyBrowserSessionToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  req.user = user;
  next();
}
