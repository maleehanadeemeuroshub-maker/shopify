import crypto from 'node:crypto';
import { supabaseAdmin } from '../_lib/supabaseAdmin.js';
import { getSessionUser, requireAuth } from '../_lib/auth.js';
import { requireFields, methodNotAllowed } from '../_lib/validate.js';
import { rowToOrder } from '../_lib/orders.js';
import { computeCartTotals, STANDARD_SHIPPING, EXPRESS_SHIPPING } from '../../src/utils/cartMath.js';
import { sendOrderConfirmationEmail } from '../../server/email/sendEmail.js';

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
export default async function handler(req, res) {
  const db = supabaseAdmin();

  if (req.method === 'POST') {
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

    // Decrement stock atomically (race-safe against concurrent checkouts)
    // and write the normalized order_items rows. Best-effort rollback of the
    // order row if either step fails, so a half-written order never lingers.
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

    return res.json({ ok: true, order, accessToken });
  }

  if (req.method === 'GET') {
    const user = await requireAuth(req, res);
    if (!user) return;

    const { data, error } = await db
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ ok: false, error: 'Could not load orders.' });

    return res.json({ ok: true, orders: data.map(rowToOrder) });
  }

  return methodNotAllowed(res, ['GET', 'POST']);
}
