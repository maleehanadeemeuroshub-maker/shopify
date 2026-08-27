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

  const db = supabaseAdmin();
  let q = db.from('products').select('*', { count: 'exact' });
  if (query) q = q.ilike('name', `%${sanitizeLike(query)}%`);
  if (status === 'active') q = q.eq('active', true);
  if (status === 'inactive') q = q.eq('active', false);

  const { data, count, error } = await q.order('created_at', { ascending: false }).range(from, to);
  if (error) return res.status(500).json({ ok: false, error: 'Could not load products.' });

  const sellerIds = [...new Set(data.map((r) => r.seller_id).filter(Boolean))];
  const sellerNames = new Map();
  if (sellerIds.length) {
    const { data: sellers } = await db.from('profiles').select('id,full_name').in('id', sellerIds);
    for (const s of sellers ?? []) sellerNames.set(s.id, s.full_name);
  }

  res.json({
    ok: true,
    products: data.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      price: row.price,
      salePrice: row.sale_price,
      stock: row.stock,
      active: row.active,
      image: row.images?.[0] ?? null,
      sellerId: row.seller_id,
      sellerName: sellerNames.get(row.seller_id) ?? 'GENZ-WEARS',
    })),
    total: count,
    page,
    pageSize: PAGE_SIZE,
  });
}
