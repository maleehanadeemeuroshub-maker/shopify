import { supabaseAdmin } from '../_lib/supabaseAdmin.js';
import { requireAuth, requireRole } from '../_lib/auth.js';
import { rowToProduct } from '../_lib/products.js';
import { methodNotAllowed } from '../_lib/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const user = await requireAuth(req, res);
  if (!user) return;
  if (!requireRole(user, res, 'seller', 'admin')) return;

  const { data, error } = await supabaseAdmin()
    .from('products')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ ok: false, error: 'Could not load products.' });

  res.json({ ok: true, products: data.map(rowToProduct) });
}
