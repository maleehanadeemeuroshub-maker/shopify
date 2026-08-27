import { supabaseAdmin } from '../_lib/supabaseAdmin.js';
import { requireAuth, requireRole } from '../_lib/auth.js';
import { rowToOrder } from '../_lib/orders.js';
import { methodNotAllowed } from '../_lib/validate.js';

// Orders aren't split per-seller at the schema level (items is a single
// jsonb blob per order), so this scans every order and picks out just the
// line items belonging to this seller's products. Fine at this app's scale;
// would need a normalized order_items table to stay fast at real volume.
export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const user = await requireAuth(req, res);
  if (!user) return;
  if (!requireRole(user, res, 'seller', 'admin')) return;

  const db = supabaseAdmin();
  const { data: products } = await db.from('products').select('id').eq('seller_id', user.id);
  const sellerProductIds = new Set((products ?? []).map((p) => p.id));

  const { data: rows, error } = await db.from('orders').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ ok: false, error: 'Could not load orders.' });

  const orders = rows
    .map(rowToOrder)
    .map((order) => ({ ...order, items: order.items.filter((item) => sellerProductIds.has(item.id)) }))
    .filter((order) => order.items.length > 0)
    .map((order) => ({
      ...order,
      sellerSubtotal: order.items.reduce((sum, item) => sum + item.price * item.qty, 0),
    }));

  res.json({ ok: true, orders });
}
