import { Router } from 'express';
import db from '../db/index.js';
import { hashPassword, verifyPassword } from '../auth/passwords.js';
import { SESSION_COOKIE, signSessionToken, createResetToken, hashResetToken } from '../auth/tokens.js';
import { requireAuth } from '../middleware/auth.js';
import { sendWelcomeEmail, sendLoginEmail, sendPasswordResetEmail } from '../email/sendEmail.js';

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const findByEmail = db.prepare('SELECT * FROM users WHERE email = ?');
const findById = db.prepare('SELECT * FROM users WHERE id = ?');
const insertUser = db.prepare(
  'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)'
);
const updatePasswordHash = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?');
const updateRole = db.prepare('UPDATE users SET role = ? WHERE id = ?');
const insertResetToken = db.prepare(
  'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)'
);
const findValidResetToken = db.prepare(
  `SELECT * FROM password_reset_tokens WHERE token_hash = ? AND used_at IS NULL AND expires_at > datetime('now')`
);
const markResetTokenUsed = db.prepare(
  `UPDATE password_reset_tokens SET used_at = datetime('now') WHERE id = ?`
);

function missingFields(body, fields) {
  return fields.filter((f) => !body[f]);
}

function validate(fields) {
  return (req, res, next) => {
    const missing = missingFields(req.body ?? {}, fields);
    if (missing.length) {
      return res.status(400).json({ ok: false, error: `Missing required field(s): ${missing.join(', ')}` });
    }
    next();
  };
}

function safeUser(row) {
  return { id: row.id, email: row.email, name: row.name, role: row.role, image: row.image };
}

function setSessionCookie(res, user) {
  res.cookie(SESSION_COOKIE, signSessionToken(user), COOKIE_OPTIONS);
}

router.post('/signup', validate(['name', 'email', 'password']), async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = String(email).trim().toLowerCase();

  if (password.length < 6) {
    return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters.' });
  }
  if (findByEmail.get(normalizedEmail)) {
    return res.status(409).json({ ok: false, error: 'An account with this email already exists.' });
  }

  const passwordHash = await hashPassword(password);
  const { lastInsertRowid } = insertUser.run(normalizedEmail, passwordHash, name.trim(), 'customer');
  const user = safeUser(findById.get(lastInsertRowid));

  setSessionCookie(res, user);
  sendWelcomeEmail({ name: user.name, email: user.email });

  res.json({ ok: true, user });
});

router.post('/login', validate(['email', 'password']), async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email).trim().toLowerCase();

  const row = findByEmail.get(normalizedEmail);
  const valid = row ? await verifyPassword(password, row.password_hash) : false;
  if (!row || !valid) {
    return res.status(401).json({ ok: false, error: 'Invalid email or password.' });
  }

  const user = safeUser(row);
  setSessionCookie(res, user);
  sendLoginEmail({
    name: user.name,
    email: user.email,
    userAgent: req.get('user-agent'),
    timestamp: Date.now(),
  });

  res.json({ ok: true, user });
});

router.post('/logout', (req, res) => {
  res.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: 'lax', secure: COOKIE_OPTIONS.secure });
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ ok: true, user: safeUser(req.user) });
});

// Self-serve upgrade — this practice storefront has no seller approval
// workflow, so any customer can start selling immediately. Re-issues the
// session cookie so the new role takes effect without a re-login.
router.post('/become-seller', requireAuth, (req, res) => {
  if (req.user.role === 'customer') {
    updateRole.run('seller', req.user.id);
  }
  const user = safeUser(findById.get(req.user.id));
  setSessionCookie(res, user);
  res.json({ ok: true, user });
});

// Always responds { ok: true } regardless of whether the account exists, so
// this endpoint can't be used to enumerate registered email addresses.
router.post('/forgot-password', validate(['email']), async (req, res) => {
  const normalizedEmail = String(req.body.email).trim().toLowerCase();
  const row = findByEmail.get(normalizedEmail);

  if (row) {
    const { raw, tokenHash, expiresAt } = createResetToken();
    insertResetToken.run(row.id, tokenHash, expiresAt);
    sendPasswordResetEmail({ name: row.name, email: row.email, token: raw });
  }

  res.json({ ok: true });
});

router.post('/reset-password', validate(['token', 'password']), async (req, res) => {
  const { token, password } = req.body;

  if (password.length < 6) {
    return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters.' });
  }

  const tokenHash = hashResetToken(token);
  const record = findValidResetToken.get(tokenHash);
  if (!record) {
    return res.status(400).json({ ok: false, error: 'This reset link is invalid or has expired.' });
  }

  const passwordHash = await hashPassword(password);
  updatePasswordHash.run(passwordHash, record.user_id);
  markResetTokenUsed.run(record.id);

  res.json({ ok: true });
});

export default router;
