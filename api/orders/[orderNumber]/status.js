import { supabaseAdmin } from '../../_lib/supabaseAdmin.js';
import { requireAuth } from '../../_lib/auth.js';
import { requireFields, methodNotAllowed } from '../../_lib/validate.js';
import { rowToOrder } from '../../_lib/orders.js';
import { sendOrderStatusEmail } from '../../../server/email/sendEmail.js';

const STATUSES = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default async function handler(req, res) {
  if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH']);
  const user = await requireAuth(req, res);
  if (!user) return;
  if (!requireFields(req, res, ['status'])) return;

  const { status, tracking } = req.body;
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ ok: false, error: `Invalid status "${status}".` });
  }

  const { orderNumber } = req.query;
  const db = supabaseAdmin();
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
