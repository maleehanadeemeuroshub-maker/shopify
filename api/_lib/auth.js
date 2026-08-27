import { supabaseAdmin } from './supabaseAdmin.js';

function getBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length);
}

// Returns the logged-in user, or null — never rejects. For routes usable by
// both guests and logged-in users (e.g. guest checkout, product detail).
// Verifies the Supabase access token sent by the frontend, then loads the
// matching profile row (name/role live there, not on the auth user).
export async function getSessionUser(req) {
  const token = getBearerToken(req);
  if (!token) return null;

  const { data: authData, error: authError } = await supabaseAdmin().auth.getUser(token);
  if (authError || !authData?.user) return null;

  const { data: profile } = await supabaseAdmin()
    .from('profiles')
    .select('id,email,full_name,role,avatar_url')
    .eq('id', authData.user.id)
    .maybeSingle();
  if (!profile) return null;

  return { id: profile.id, email: profile.email, name: profile.full_name, role: profile.role, image: profile.avatar_url };
}

// Writes a 401 and returns null if there's no valid session; otherwise
// returns the user. Callers must `if (!user) return;` right after calling.
export async function requireAuth(req, res) {
  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ ok: false, error: 'Not authenticated.' });
    return null;
  }
  return user;
}

// Writes a 403 and returns false if the user's role isn't in `roles`.
export function requireRole(user, res, ...roles) {
  if (!user || !roles.includes(user.role)) {
    res.status(403).json({ ok: false, error: 'Not authorized.' });
    return false;
  }
  return true;
}
