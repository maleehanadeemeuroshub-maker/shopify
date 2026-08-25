import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me';
const SESSION_TTL = '7d';
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export const SESSION_COOKIE = 'gz_session';

export function signSessionToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: SESSION_TTL });
}

export function verifySessionToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Reset tokens follow the standard pattern: the raw token is emailed to the
// user and never stored; only its hash lives in the database, so a leaked
// database can't be used to forge password resets.
export function createResetToken() {
  const raw = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS).toISOString();
  return { raw, tokenHash, expiresAt };
}

export function hashResetToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}
