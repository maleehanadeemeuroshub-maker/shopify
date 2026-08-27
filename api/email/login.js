import { sendLoginEmail } from '../../server/email/sendEmail.js';
import { requireFields, methodNotAllowed } from '../_lib/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  if (!requireFields(req, res, ['name', 'email'])) return;
  const { name, email, userAgent, timestamp } = req.body;
  res.json(await sendLoginEmail({ name, email, userAgent, timestamp }));
}
