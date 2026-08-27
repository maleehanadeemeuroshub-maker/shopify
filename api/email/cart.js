import { sendCartEmail } from '../../server/email/sendEmail.js';
import { requireFields, methodNotAllowed } from '../_lib/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!requireFields(req, res, ['name', 'email', 'product'])) return;
  const { name, email, product, cartSubtotal, itemCount } = req.body;
  res.json(await sendCartEmail({ name, email, product, cartSubtotal, itemCount }));
}
