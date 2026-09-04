import { verifyBrowserSessionToken } from '@asc3nd/core/auth';

export { verifyBrowserSessionToken };

export function browserSessionAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const user = verifyBrowserSessionToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  req.user = user;
  next();
}