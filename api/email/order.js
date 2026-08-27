import { sendOrderConfirmationEmail } from '../../server/email/sendEmail.js';
import { requireFields, methodNotAllowed } from '../_lib/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!requireFields(req, res, ['name', 'email', 'order'])) return;
  const { name, email, order } = req.body;
  res.json(await sendOrderConfirmationEmail({ name, email, order }));
}
