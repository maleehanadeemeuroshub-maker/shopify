import { supabaseAdmin } from '../_lib/supabaseAdmin.js';
import { requireAuth, requireRole } from '../_lib/auth.js';
import { methodNotAllowed } from '../_lib/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const user = await requireAuth(req, res);
  if (!user) return;
  if (!requireRole(user, res, 'admin')) return;

  const db = supabaseAdmin();
  const [{ count: userCount }, { count: sellerCount }, { count: productCount }, { data: orderRows }] = await Promise.all([
    db.from('profiles').select('*', { count: 'exact', head: true }),
    db.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seller'),
    db.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
    db.from('orders').select('status, created_at, totals'),
  ]);

  const orders = (orderRows ?? []).map((r) => ({ status: r.status, date: r.created_at, total: r.totals.total }));
  const revenue = orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const chart = days.map((d) => {
    const key = d.toDateString();
    const value = orders
      .filter((o) => o.status !== 'cancelled' && new Date(o.date).toDateString() === key)
      .reduce((sum, o) => sum + o.total, 0);
    return { label: d.toLocaleDateString(undefined, { weekday: 'short' }), value };
  });

  res.json({ ok: true, stats: { userCount, sellerCount, productCount, orderCount: orders.length, revenue }, chart });
}
