import { supabaseAdmin } from '../../../_lib/supabaseAdmin.js';
import { requireAuth, requireRole } from '../../../_lib/auth.js';
import { methodNotAllowed } from '../../../_lib/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH']);
  const user = await requireAuth(req, res);
  if (!user) return;
  if (!requireRole(user, res, 'admin')) return;

  const { role } = req.body;
  if (!['customer', 'seller', 'admin'].includes(role)) {
    return res.status(400).json({ ok: false, error: 'Invalid role.' });
  }

  const targetId = req.query.id;
  const db = supabaseAdmin();
  const { data: target } = await db.from('profiles').select('*').eq('id', targetId).maybeSingle();
  if (!target) return res.status(404).json({ ok: false, error: 'User not found.' });

  if (target.role === 'admin' && role !== 'admin') {
    const { count } = await db.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin');
    if (count <= 1) {
      return res.status(400).json({ ok: false, error: 'Cannot demote the last remaining admin.' });
    }
  }

  await db.from('profiles').update({ role }).eq('id', targetId);
  res.json({ ok: true, user: { id: target.id, email: target.email, name: target.full_name, role } });
}
