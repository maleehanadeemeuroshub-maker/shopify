import { sendOrderStatusEmail } from '../../server/email/sendEmail.js';
import { requireFields, methodNotAllowed } from '../_lib/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!requireFields(req, res, ['name', 'email', 'order', 'status'])) return;
  const { name, email, order, status, tracking } = req.body;
  res.json(await sendOrderStatusEmail({ name, email, order, status, tracking }));
}
