import { supabaseAdmin } from '../../../_lib/supabaseAdmin.js';
import { requireAuth, requireRole } from '../../../_lib/auth.js';
import { methodNotAllowed } from '../../../_lib/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH']);
  const user = await requireAuth(req, res);
  if (!user) return;
  if (!requireRole(user, res, 'admin')) return;

  const db = supabaseAdmin();
  const { data: row } = await db.from('products').select('id').eq('id', req.query.id).maybeSingle();
  if (!row) return res.status(404).json({ ok: false, error: 'Product not found.' });

  await db.from('products').update({ active: Boolean(req.body.active), updated_at: new Date().toISOString() }).eq('id', row.id);
  res.json({ ok: true });
}
