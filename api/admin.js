// Single function for every /api/admin/* operation. Vercel's plain (non-
// Next.js) /api file routing only matches a fixed number of literal path
// segments per file — there's no real catch-all here, so consolidating
// many endpoints into one function has to route on the query string
// instead of the path (query strings never affect path routing, so this
// one file always matches plain /api/admin regardless of what's in it).
// src/lib/api.js's adminApi builds these query strings.
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { requireAuth, requireRole } from './_lib/auth.js';
import { methodNotAllowed } from './_lib/validate.js';
import { PAGE_SIZE, pageParams, sanitizeLike } from './_lib/admin.js';

async function getStats(req, res, db) {
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

async function getCategories(req, res, db) {
  const { data, error } = await db.from('products').select('category').eq('active', true);
  if (error) return res.status(500).json({ ok: false, error: 'Could not load categories.' });

  const counts = {};
  for (const row of data) counts[row.category] = (counts[row.category] ?? 0) + 1;
  const categories = Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  res.json({ ok: true, categories });
}

async function listUsers(req, res, db) {
  const { page, from, to } = pageParams(req);
  const query = (req.query.query || '').trim();
  const role = req.query.role || '';

  let q = db.from('profiles').select('id,email,full_name,role,created_at', { count: 'exact' });
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

async function setUserRole(req, res, db, targetId) {
  const { role } = req.body;
  if (!['customer', 'seller', 'admin'].includes(role)) {
    return res.status(400).json({ ok: false, error: 'Invalid role.' });
  }

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

async function listProducts(req, res, db) {
  const { page, from, to } = pageParams(req);
  const query = (req.query.query || '').trim();
  const status = req.query.status || '';

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

async function setProductActive(req, res, db, productId) {
  const { data: row } = await db.from('products').select('id').eq('id', productId).maybeSingle();
  if (!row) return res.status(404).json({ ok: false, error: 'Product not found.' });

  await db.from('products').update({ active: Boolean(req.body.active), updated_at: new Date().toISOString() }).eq('id', row.id);
  res.json({ ok: true });
}

async function listOrders(req, res, db) {
  const { page, from, to } = pageParams(req);
  const query = (req.query.query || '').trim();
  const status = req.query.status || '';

  let q = db.from('orders').select('*', { count: 'exact' });
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

export default async function handler(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return;
  if (!requireRole(user, res, 'admin')) return;

  const db = supabaseAdmin();
  const { resource, id, action } = req.query;

  if (resource === 'stats') {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
    return getStats(req, res, db);
  }
  if (resource === 'categories') {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
    return getCategories(req, res, db);
  }
  if (resource === 'users' && !id) {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
    return listUsers(req, res, db);
  }
  if (resource === 'users' && id && action === 'role') {
    if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH']);
    return setUserRole(req, res, db, id);
  }
  if (resource === 'products' && !id) {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
    return listProducts(req, res, db);
  }
  if (resource === 'products' && id && action === 'active') {
    if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH']);
    return setProductActive(req, res, db, id);
  }
  if (resource === 'orders' && !id) {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
    return listOrders(req, res, db);
  }

  return res.status(404).json({ ok: false, error: 'Not found.' });
}
