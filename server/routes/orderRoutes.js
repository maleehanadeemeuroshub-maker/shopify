import { Router } from 'express';
import crypto from 'node:crypto';
import db from '../db/index.js';
import { requireAuth, requireRole, attachUser } from '../middleware/auth.js';
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from '../email/sendEmail.js';

const router = Router();

const insertOrder = db.prepare(`
  INSERT INTO orders
    (order_number, user_id, access_token_hash, items_json, totals_json, customer_json, shipping_json, delivery, payment)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const findByOrderNumber = db.prepare('SELECT * FROM orders WHERE order_number = ?');
const listByUser = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC');
const updateStatus = db.prepare(
  `UPDATE orders SET status = ?, tracking_json = ?, updated_at = datetime('now') WHERE id = ?`
);

const STATUSES = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

function missingFields(body, fields) {
  return fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === '');
}

function validate(fields) {
  return (req, res, next) => {
    const missing = missingFields(req.body ?? {}, fields);
    if (missing.length) {
      return res.status(400).json({ ok: false, error: `Missing required field(s): ${missing.join(', ')}` });
    }
    next();
  };
}

function generateOrderNumber() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `GW-${rand}`;
}

function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function rowToOrder(row) {
  return {
    orderNumber: row.order_number,
    date: `${row.created_at.replace(' ', 'T')}Z`,
    status: row.status,
    items: JSON.parse(row.items_json),
    totals: JSON.parse(row.totals_json),
    customer: JSON.parse(row.customer_json),
    shippingAddress: JSON.parse(row.shipping_json),
    delivery: row.delivery,
    payment: row.payment,
    tracking: row.tracking_json ? JSON.parse(row.tracking_json) : null,
  };
}

// Guests and logged-in users can both place orders — logged-in orders are
// tied to the account (user_id) so they show up in order history; guest
// orders are retrievable only via the one-time access token issued below.
router.post(
  '/',
  attachUser,
  validate(['items', 'totals', 'customer', 'shippingAddress', 'delivery', 'payment']),
  async (req, res) => {
    const { items, totals, customer, shippingAddress, delivery, payment } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, error: 'Order must contain at least one item.' });
    }

    const accessToken = crypto.randomBytes(24).toString('hex');
    const accessTokenHash = hashToken(accessToken);

    let orderNumber;
    let inserted;
    for (let attempt = 0; attempt < 5 && !inserted; attempt += 1) {
      orderNumber = generateOrderNumber();
      try {
        inserted = insertOrder.run(
          orderNumber,
          req.user?.id ?? null,
          accessTokenHash,
          JSON.stringify(items),
          JSON.stringify(totals),
          JSON.stringify(customer),
          JSON.stringify(shippingAddress),
          delivery,
          payment
        );
      } catch (err) {
        if (!String(err.message).includes('UNIQUE')) throw err;
      }
    }
    if (!inserted) {
      return res.status(500).json({ ok: false, error: 'Could not generate a unique order number. Please try again.' });
    }

    const row = findByOrderNumber.get(orderNumber);
    const order = rowToOrder(row);

    sendOrderConfirmationEmail({
      name: `${customer.firstName} ${customer.lastName}`.trim(),
      email: customer.email,
      order,
    });

    res.json({ ok: true, order, accessToken });
  }
);

router.get('/', requireAuth, (req, res) => {
  const orders = listByUser.all(req.user.id).map(rowToOrder);
  res.json({ ok: true, orders });
});

// Orders aren't split per-seller at the schema level (items_json is a single
// blob per order), so this scans every order and picks out just the line
// items belonging to this seller's products. Fine at this app's scale; would
// need a normalized order_items table to stay fast at real volume.
// Placed before /:orderNumber so "for-seller" isn't parsed as an order number.
router.get('/for-seller', requireAuth, requireRole('seller', 'admin'), (req, res) => {
  const sellerProductIds = new Set(
    db.prepare('SELECT id FROM products WHERE seller_id = ?').all(req.user.id).map((r) => r.id)
  );

  const orders = db
    .prepare('SELECT * FROM orders ORDER BY created_at DESC')
    .all()
    .map(rowToOrder)
    .map((order) => ({ ...order, items: order.items.filter((item) => sellerProductIds.has(item.id)) }))
    .filter((order) => order.items.length > 0)
    .map((order) => ({
      ...order,
      sellerSubtotal: order.items.reduce((sum, item) => sum + item.price * item.qty, 0),
    }));

  res.json({ ok: true, orders });
});

router.get('/:orderNumber', attachUser, (req, res) => {
  const row = findByOrderNumber.get(req.params.orderNumber);
  if (!row) return res.status(404).json({ ok: false, error: 'Order not found.' });

  const ownsByAccount = req.user && row.user_id === req.user.id;
  const suppliedToken = req.get('x-order-token');
  const ownsByToken = suppliedToken && hashToken(suppliedToken) === row.access_token_hash;
  if (!ownsByAccount && !ownsByToken) {
    return res.status(404).json({ ok: false, error: 'Order not found.' });
  }

  res.json({ ok: true, order: rowToOrder(row) });
});

router.patch('/:orderNumber/status', requireAuth, validate(['status']), async (req, res) => {
  const { status, tracking } = req.body;
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ ok: false, error: `Invalid status "${status}".` });
  }

  const row = findByOrderNumber.get(req.params.orderNumber);
  const owns = row && (row.user_id === req.user.id || req.user.role === 'admin');
  if (!owns) {
    return res.status(404).json({ ok: false, error: 'Order not found.' });
  }

  updateStatus.run(status, tracking ? JSON.stringify(tracking) : null, row.id);
  const updatedRow = findByOrderNumber.get(req.params.orderNumber);
  const order = rowToOrder(updatedRow);

  const customer = order.customer;
  const emailResult = await sendOrderStatusEmail({
    name: `${customer.firstName} ${customer.lastName}`.trim(),
    email: customer.email,
    order,
    status,
    tracking,
  });

  res.json({ ok: true, order, emailSent: emailResult.ok });
});

export default router;
