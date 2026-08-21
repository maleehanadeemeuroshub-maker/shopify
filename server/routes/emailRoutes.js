import { Router } from 'express';
import {
  sendWelcomeEmail,
  sendLoginEmail,
  sendCartEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendAbandonedCartEmail,
} from '../email/sendEmail.js';

const router = Router();

function missingFields(body, fields) {
  return fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === '');
}

function validate(fields) {
  return (req, res, next) => {
    const missing = missingFields(req.body ?? {}, fields);
    if (missing.length) {
      return res.status(400).json({ ok: false, error: `Missing required field(s): ${missing.join(', ')}` });
    }
    next();
  };
}

// Every handler is wrapped defensively: an email failure is logged and
// returned as { ok:false } but never throws — the caller (React) already
// treats this as fire-and-forget and never blocks the underlying action on it.

router.post('/welcome', validate(['name', 'email']), async (req, res) => {
  const { name, email } = req.body;
  const result = await sendWelcomeEmail({ name, email });
  res.json(result);
});

router.post('/login', validate(['name', 'email']), async (req, res) => {
  const { name, email, userAgent, timestamp } = req.body;
  const result = await sendLoginEmail({ name, email, userAgent, timestamp });
  res.json(result);
});

router.post('/cart', validate(['name', 'email', 'product']), async (req, res) => {
  const { name, email, product, cartSubtotal, itemCount } = req.body;
  const result = await sendCartEmail({ name, email, product, cartSubtotal, itemCount });
  res.json(result);
});

router.post('/order', validate(['name', 'email', 'order']), async (req, res) => {
  const { name, email, order } = req.body;
  const result = await sendOrderConfirmationEmail({ name, email, order });
  res.json(result);
});

router.post('/order-status', validate(['name', 'email', 'order', 'status']), async (req, res) => {
  const { name, email, order, status, tracking } = req.body;
  const result = await sendOrderStatusEmail({ name, email, order, status, tracking });
  res.json(result);
});

router.post('/abandoned-cart', validate(['name', 'email', 'items']), async (req, res) => {
  const { name, email, items, cartTotal } = req.body;
  const result = await sendAbandonedCartEmail({ name, email, items, cartTotal });
  res.json(result);
});

export default router;
