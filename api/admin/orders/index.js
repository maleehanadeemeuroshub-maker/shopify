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
  const status = req.query.status || '';

  let q = supabaseAdmin().from('orders').select('*', { count: 'exact' });
  if (query) q = q.ilike('order_number', `%${sanitizeLike(query)}%`);
  if (status) q = q.eq('status', status);

  const { data, count, error } = await q.order('created_at', { ascending: false }).range(from, to);
  if (error) return res.status(500).json({ ok: false, error: 'Could not load orders.' });

  res.json({
    ok: true,
    orders: data.map((row) => ({
      orderNumber: row.order_number,
      date: row.created_at,
      status: row.status,
      customerName: `${row.customer.firstName} ${row.customer.lastName}`.trim(),
      customerEmail: row.customer.email,
      itemCount: row.items.reduce((sum, item) => sum + item.qty, 0),
      total: row.totals.total,
    })),
    total: count,
    page,
    pageSize: PAGE_SIZE,
  });
}
