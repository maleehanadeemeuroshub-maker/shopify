import db from '../db/index.js';
import { SESSION_COOKIE, verifySessionToken } from '../auth/tokens.js';

const getUserById = db.prepare('SELECT id, email, name, role, image FROM users WHERE id = ?');

export function requireAuth(req, res, next) {
  const token = req.cookies?.[SESSION_COOKIE];
  const payload = token ? verifySessionToken(token) : null;
  if (!payload) {
    return res.status(401).json({ ok: false, error: 'Not authenticated.' });
  }
  const user = getUserById.get(payload.sub);
  if (!user) {
    return res.status(401).json({ ok: false, error: 'Not authenticated.' });
  }
  req.user = user;
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ ok: false, error: 'Not authorized.' });
    }
    next();
  };
}

// Attaches req.user when a valid session cookie is present, but never
// rejects the request — for routes usable by both guests and logged-in
// users (e.g. guest checkout).
export function attachUser(req, res, next) {
  const token = req.cookies?.[SESSION_COOKIE];
  const payload = token ? verifySessionToken(token) : null;
  req.user = payload ? getUserById.get(payload.sub) ?? null : null;
  next();
}
