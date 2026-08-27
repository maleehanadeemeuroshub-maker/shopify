import { supabaseAdmin } from '../../_lib/supabaseAdmin.js';
import { requireAuth, requireRole } from '../../_lib/auth.js';
import { methodNotAllowed } from '../../_lib/validate.js';
import { PAGE_SIZE, pageParams, sanitizeLike } from '../../_lib/admin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const user = await requireAuth(req, res);
  if (!user) return;
  if (!requireRole(user, res, 'admin')) return;

  const { page, from, to } = pageParams(req);
  const query = (req.query.query || '').trim();
  const role = req.query.role || '';

  let q = supabaseAdmin().from('profiles').select('id,email,full_name,role,created_at', { count: 'exact' });
  if (query) {
    const safe = sanitizeLike(query);
    q = q.or(`full_name.ilike.%${safe}%,email.ilike.%${safe}%`);
  }
  if (role) q = q.eq('role', role);

  const { data, count, error } = await q.order('created_at', { ascending: false }).range(from, to);
  if (error) return res.status(500).json({ ok: false, error: 'Could not load users.' });

  res.json({
    ok: true,
    users: data.map((r) => ({ id: r.id, email: r.email, name: r.full_name, role: r.role, createdAt: r.created_at })),
    total: count,
    page,
    pageSize: PAGE_SIZE,
  });
}
