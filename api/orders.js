// Single function for every /api/orders operation (see api/admin.js for
// why — query-string dispatch, not path segments). src/lib/api.js's
// ordersApi builds these query strings.
import crypto from 'node:crypto';
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { getSessionUser, requireAuth, requireRole } from './_lib/auth.js';
import { requireFields, methodNotAllowed } from './_lib/validate.js';
import { rowToOrder } from './_lib/orders.js';
import { computeCartTotals, EXPRESS_SHIPPING } from '../src/utils/cartMath.js';
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from '../server/email/sendEmail.js';

function generateOrderNumber() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `GW-${rand}`;
}

function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

// Guests and logged-in users can both place orders — logged-in orders are
// tied to the account (user_id) so they show up in order history; guest
// orders are retrievable only via the one-time access token issued below.
async function createOrder(req, res, db) {
  if (!requireFields(req, res, ['items', 'customer', 'shippingAddress', 'delivery', 'payment'])) return;
  const { items: requestedItems, promoCode, customer, shippingAddress, delivery, payment } = req.body;
  if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
    return res.status(400).json({ ok: false, error: 'Order must contain at least one item.' });
  }

  // Never trust price/name/image from the client — only productId, size,
  // color and qty are taken from the request; everything else (price,
  // availability, stock) is re-read from the database right now.
  const productIds = [...new Set(requestedItems.map((l) => l.productId))];
  const { data: products, error: productsError } = await db.from('products').select('*').in('id', productIds);
  if (productsError) {
    console.error('[orders/create]', productsError);
    return res.status(500).json({ ok: false, error: 'Could not verify products.' });
  }
  const productById = new Map(products.map((p) => [p.id, p]));

  const verifiedItems = [];
  for (const line of requestedItems) {
    const product = productById.get(line.productId);
    const qty = Number(line.qty) || 0;
    if (!product || !product.active) {
      return res.status(400).json({ ok: false, error: `"${line.name || line.productId}" is no longer available.` });
    }
    if (qty <= 0) {
      return res.status(400).json({ ok: false, error: `Invalid quantity for "${product.name}".` });
    }
    if (product.stock < qty) {
      return res.status(400).json({ ok: false, error: `Only ${product.stock} left of "${product.name}" — please lower the quantity.` });
    }
    const price = product.sale_price ?? product.price;
    verifiedItems.push({
      id: product.id,
      name: product.name,
      image: product.images?.[0] ?? null,
      price,
      originalPrice: product.price,
      size: line.size ?? null,
      color: line.color ?? null,
      qty,
    });
  }

  const shippingCost = delivery === 'express' ? EXPRESS_SHIPPING : null; // null → computeCartTotals applies the free-shipping threshold
  const totals = computeCartTotals(verifiedItems, shippingCost, promoCode);

  const user = await getSessionUser(req);
  const accessToken = crypto.randomBytes(24).toString('hex');
  const accessTokenHash = hashToken(accessToken);

  let inserted = null;
  let orderNumber;
  for (let attempt = 0; attempt < 5 && !inserted; attempt += 1) {
    orderNumber = generateOrderNumber();
    const { data, error } = await db
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user?.id ?? null,
        access_token_hash: accessTokenHash,
        items: verifiedItems,
        totals,
        customer,
        shipping: shippingAddress,
        delivery,
        payment,
      })
      .select('*')
      .single();
    if (error) {
      if (error.code !== '23505') throw error; // unique_violation on order_number — retry with a new one
    } else {
      inserted = data;
    }
  }
  if (!inserted) {
    return res.status(500).json({ ok: false, error: 'Could not generate a unique order number. Please try again.' });
  }

  // Decrement stock atomically (race-safe against concurrent checkouts) and
  // write the normalized order_items rows. Best-effort rollback of the order
  // row if either step fails, so a half-written order never lingers.
  for (const item of verifiedItems) {
    const { data: ok } = await db.rpc('decrement_product_stock', { p_product_id: item.id, p_qty: item.qty });
    if (!ok) {
      await db.from('orders').delete().eq('id', inserted.id);
      return res.status(409).json({ ok: false, error: `"${item.name}" sold out while we were processing your order. Please try again.` });
    }
  }

  const { error: itemsError } = await db.from('order_items').insert(
    verifiedItems.map((item) => ({
      order_id: inserted.id,
      product_id: item.id,
      product_name: item.name,
      unit_price: item.price,
      qty: item.qty,
      size: item.size,
      color: item.color,
      line_total: +(item.price * item.qty).toFixed(2),
    }))
  );
  if (itemsError) console.error('[orders/create] order_items insert failed (order itself still succeeded):', itemsError);

  const order = rowToOrder(inserted);
  sendOrderConfirmationEmail({ name: `${customer.firstName} ${customer.lastName}`.trim(), email: customer.email, order });

  res.json({ ok: true, order, accessToken });
}

async function listMyOrders(req, res, db) {
  const user = await requireAuth(req, res);
  if (!user) return;

  const { data, error } = await db.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ ok: false, error: 'Could not load orders.' });

  res.json({ ok: true, orders: data.map(rowToOrder) });
}

// Orders aren't split per-seller at the schema level (items is a single
// jsonb blob per order), so this scans every order and picks out just the
// line items belonging to this seller's products. Fine at this app's scale;
// would need to join through order_items to stay fast at real volume.
async function listOrdersForSeller(req, res, db) {
  const user = await requireAuth(req, res);
  if (!user) return;
  if (!requireRole(user, res, 'seller', 'admin')) return;

  const { data: products } = await db.from('products').select('id').eq('seller_id', user.id);
  const sellerProductIds = new Set((products ?? []).map((p) => p.id));

  const { data: rows, error } = await db.from('orders').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ ok: false, error: 'Could not load orders.' });

  const orders = rows
    .map(rowToOrder)
    .map((order) => ({ ...order, items: order.items.filter((item) => sellerProductIds.has(item.id)) }))
    .filter((order) => order.items.length > 0)
    .map((order) => ({ ...order, sellerSubtotal: order.items.reduce((sum, item) => sum + item.price * item.qty, 0) }));

  res.json({ ok: true, orders });
}

async function getOrder(req, res, db, orderNumber) {
  const { data: row } = await db.from('orders').select('*').eq('order_number', orderNumber).maybeSingle();
  if (!row) return res.status(404).json({ ok: false, error: 'Order not found.' });

  const user = await getSessionUser(req);
  const ownsByAccount = user && row.user_id === user.id;
  const suppliedToken = req.headers['x-order-token'];
  const ownsByToken = suppliedToken && hashToken(suppliedToken) === row.access_token_hash;
  if (!ownsByAccount && !ownsByToken) {
    return res.status(404).json({ ok: false, error: 'Order not found.' });
  }

  res.json({ ok: true, order: rowToOrder(row) });
}

const STATUSES = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

async function updateOrderStatus(req, res, db, orderNumber) {
  const user = await requireAuth(req, res);
  if (!user) return;
  if (!requireFields(req, res, ['status'])) return;

  const { status, tracking } = req.body;
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ ok: false, error: `Invalid status "${status}".` });
  }

  const { data: row } = await db.from('orders').select('*').eq('order_number', orderNumber).maybeSingle();
  const owns = row && (row.user_id === user.id || user.role === 'admin');
  if (!owns) {
    return res.status(404).json({ ok: false, error: 'Order not found.' });
  }

  const { data: updatedRow, error } = await db
    .from('orders')
    .update({ status, tracking: tracking ?? null, updated_at: new Date().toISOString() })
    .eq('id', row.id)
    .select('*')
    .single();
  if (error) return res.status(500).json({ ok: false, error: 'Could not update order.' });

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
}

export default async function handler(req, res) {
  const db = supabaseAdmin();
  const { orderNumber, resource, action } = req.query;

  if (orderNumber && action === 'status') {
    if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH']);
    return updateOrderStatus(req, res, db, orderNumber);
  }
  if (orderNumber) {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
    return getOrder(req, res, db, orderNumber);
  }
  if (resource === 'for-seller') {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
    return listOrdersForSeller(req, res, db);
  }

  if (req.method === 'POST') return createOrder(req, res, db);
  if (req.method === 'GET') return listMyOrders(req, res, db);
  return methodNotAllowed(res, ['GET', 'POST']);
}
