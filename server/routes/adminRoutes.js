import { Router } from 'express';
import db from '../db/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireRole('admin'));

const PAGE_SIZE = 15;

function pageParams(req) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  return { page, offset: (page - 1) * PAGE_SIZE };
}

// ---- Overview -------------------------------------------------------------

router.get('/stats', (req, res) => {
  const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  const sellerCount = db.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'seller'").get().c;
  const productCount = db.prepare('SELECT COUNT(*) AS c FROM products WHERE active = 1').get().c;

  const orders = db
    .prepare('SELECT status, created_at, totals_json FROM orders')
    .all()
    .map((r) => ({ status: r.status, date: `${r.created_at.replace(' ', 'T')}Z`, total: JSON.parse(r.totals_json).total }));

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
});

router.get('/categories', (req, res) => {
  const categories = db
    .prepare('SELECT category, COUNT(*) AS count FROM products WHERE active = 1 GROUP BY category ORDER BY count DESC')
    .all();
  res.json({ ok: true, categories });
});

// ---- Users ------------------------------------------------------------

router.get('/users', (req, res) => {
  const { page, offset } = pageParams(req);
  const query = (req.query.query || '').trim().toLowerCase();
  const role = req.query.role || '';

  const where = [];
  const params = [];
  if (query) {
    where.push('(LOWER(name) LIKE ? OR LOWER(email) LIKE ?)');
    params.push(`%${query}%`, `%${query}%`);
  }
  if (role) {
    where.push('role = ?');
    params.push(role);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const total = db.prepare(`SELECT COUNT(*) AS c FROM users ${whereSql}`).get(...params).c;
  const rows = db
    .prepare(`SELECT id, email, name, role, created_at FROM users ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, PAGE_SIZE, offset);

  res.json({
    ok: true,
    users: rows.map((r) => ({ id: r.id, email: r.email, name: r.name, role: r.role, createdAt: r.created_at })),
    total,
    page,
    pageSize: PAGE_SIZE,
  });
});

router.patch('/users/:id/role', (req, res) => {
  const { role } = req.body;
  if (!['customer', 'seller', 'admin'].includes(role)) {
    return res.status(400).json({ ok: false, error: 'Invalid role.' });
  }

  const targetId = Number(req.params.id);
  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(targetId);
  if (!target) return res.status(404).json({ ok: false, error: 'User not found.' });

  if (target.role === 'admin' && role !== 'admin') {
    const adminCount = db.prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'admin'").get().c;
    if (adminCount <= 1) {
      return res.status(400).json({ ok: false, error: 'Cannot demote the last remaining admin.' });
    }
  }

  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, targetId);
  res.json({ ok: true, user: { id: target.id, email: target.email, name: target.name, role } });
});

// ---- Products ---------------------------------------------------------

router.get('/products', (req, res) => {
  const { page, offset } = pageParams(req);
  const query = (req.query.query || '').trim().toLowerCase();
  const status = req.query.status || '';

  const where = [];
  const params = [];
  if (query) {
    where.push('LOWER(p.name) LIKE ?');
    params.push(`%${query}%`);
  }
  if (status === 'active') where.push('p.active = 1');
  if (status === 'inactive') where.push('p.active = 0');
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const total = db.prepare(`SELECT COUNT(*) AS c FROM products p ${whereSql}`).get(...params).c;
  const rows = db
    .prepare(
      `SELECT p.*, u.name AS seller_name FROM products p LEFT JOIN users u ON u.id = p.seller_id
       ${whereSql} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`
    )
    .all(...params, PAGE_SIZE, offset);

  res.json({
    ok: true,
    products: rows.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      price: row.price,
      salePrice: row.sale_price,
      stock: row.stock,
      active: Boolean(row.active),
      image: JSON.parse(row.images_json)[0] ?? null,
      sellerId: row.seller_id,
      sellerName: row.seller_name ?? 'GENZ-WEARS',
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
  });
});

router.patch('/products/:id/active', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ ok: false, error: 'Product not found.' });

  db.prepare("UPDATE products SET active = ?, updated_at = datetime('now') WHERE id = ?").run(
    req.body.active ? 1 : 0,
    row.id
  );
  res.json({ ok: true });
});

// ---- Orders -------------------------------------------------------------

router.get('/orders', (req, res) => {
  const { page, offset } = pageParams(req);
  const query = (req.query.query || '').trim().toLowerCase();
  const status = req.query.status || '';

  const where = [];
  const params = [];
  if (query) {
    where.push('(LOWER(order_number) LIKE ? OR LOWER(customer_json) LIKE ?)');
    params.push(`%${query}%`, `%${query}%`);
  }
  if (status) {
    where.push('status = ?');
    params.push(status);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const total = db.prepare(`SELECT COUNT(*) AS c FROM orders ${whereSql}`).get(...params).c;
  const rows = db
    .prepare(`SELECT * FROM orders ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, PAGE_SIZE, offset);

  res.json({
    ok: true,
    orders: rows.map((row) => {
      const customer = JSON.parse(row.customer_json);
      const totals = JSON.parse(row.totals_json);
      const items = JSON.parse(row.items_json);
      return {
        orderNumber: row.order_number,
        date: `${row.created_at.replace(' ', 'T')}Z`,
        status: row.status,
        customerName: `${customer.firstName} ${customer.lastName}`.trim(),
        customerEmail: customer.email,
        itemCount: items.reduce((sum, item) => sum + item.qty, 0),
        total: totals.total,
      };
    }),
    total,
    page,
    pageSize: PAGE_SIZE,
  });
});

export default router;
