// Single function handling every /api/email/<action> route (Vercel's Hobby
// plan caps a deployment at 12 serverless functions — this app has more
// than 12 logical endpoints, so related routes are grouped into one
// function each via a dynamic catch segment; the URLs themselves are
// unchanged, so nothing in src/lib/api.js needed to change).
import {
  sendWelcomeEmail,
  sendLoginEmail,
  sendCartEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendAbandonedCartEmail,
} from '../../server/email/sendEmail.js';
import { requireFields, methodNotAllowed } from '../_lib/validate.js';

const ACTIONS = {
  welcome: {
    fields: ['name', 'email'],
    send: ({ name, email }) => sendWelcomeEmail({ name, email }),
  },
  login: {
    fields: ['name', 'email'],
    send: ({ name, email, userAgent, timestamp }) => sendLoginEmail({ name, email, userAgent, timestamp }),
  },
  cart: {
    fields: ['name', 'email', 'product'],
    send: ({ name, email, product, cartSubtotal, itemCount }) => sendCartEmail({ name, email, product, cartSubtotal, itemCount }),
  },
  order: {
    fields: ['name', 'email', 'order'],
    send: ({ name, email, order }) => sendOrderConfirmationEmail({ name, email, order }),
  },
  'order-status': {
    fields: ['name', 'email', 'order', 'status'],
    send: ({ name, email, order, status, tracking }) => sendOrderStatusEmail({ name, email, order, status, tracking }),
  },
  'abandoned-cart': {
    fields: ['name', 'email', 'items'],
    send: ({ name, email, items, cartTotal }) => sendAbandonedCartEmail({ name, email, items, cartTotal }),
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const action = ACTIONS[req.query.action];
  if (!action) return res.status(404).json({ ok: false, error: `Unknown email action "${req.query.action}".` });
  if (!requireFields(req, res, action.fields)) return;

  res.json(await action.send(req.body));
}
