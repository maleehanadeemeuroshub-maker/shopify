import { sendAbandonedCartEmail } from '../../server/email/sendEmail.js';
import { requireFields, methodNotAllowed } from '../_lib/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!requireFields(req, res, ['name', 'email', 'items'])) return;
  const { name, email, items, cartTotal } = req.body;
  res.json(await sendAbandonedCartEmail({ name, email, items, cartTotal }));
}
