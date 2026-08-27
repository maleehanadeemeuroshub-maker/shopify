import crypto from 'node:crypto';
import { supabaseAdmin } from '../../_lib/supabaseAdmin.js';
import { getSessionUser } from '../../_lib/auth.js';
import { rowToOrder } from '../../_lib/orders.js';
import { methodNotAllowed } from '../../_lib/validate.js';

function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const { orderNumber } = req.query;

  const { data: row } = await supabaseAdmin().from('orders').select('*').eq('order_number', orderNumber).maybeSingle();
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
