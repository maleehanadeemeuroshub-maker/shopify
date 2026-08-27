import { supabaseAdmin } from '../_lib/supabaseAdmin.js';
import { requireAuth, requireRole } from '../_lib/auth.js';
import { methodNotAllowed } from '../_lib/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const user = await requireAuth(req, res);
  if (!user) return;
  if (!requireRole(user, res, 'admin')) return;

  const { data, error } = await supabaseAdmin().from('products').select('category').eq('active', true);
  if (error) return res.status(500).json({ ok: false, error: 'Could not load categories.' });

  const counts = {};
  for (const row of data) counts[row.category] = (counts[row.category] ?? 0) + 1;
  const categories = Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  res.json({ ok: true, categories });
}
