import { Resend } from 'resend';
import { welcomeEmail } from './templates/welcomeEmail.js';
import { loginEmail } from './templates/loginEmail.js';
import { cartEmail } from './templates/cartEmail.js';
import { orderConfirmationEmail } from './templates/orderConfirmationEmail.js';
import { orderProcessingEmail } from './templates/orderProcessingEmail.js';
import { orderShippedEmail } from './templates/orderShippedEmail.js';
import { orderDeliveredEmail } from './templates/orderDeliveredEmail.js';
import { orderCancelledEmail } from './templates/orderCancelledEmail.js';
import { abandonedCartEmail } from './templates/abandonedCartEmail.js';
import { passwordResetEmail } from './templates/passwordReset.js';

const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const SITE_URL = process.env.SITE_URL || 'http://localhost:5173';

let resendClient = null;
function getClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

/**
 * Low-level dispatch. Never throws — always resolves to a result object so
 * callers (routes, and ultimately the checkout/login/cart flows in the
 * React app) can treat "email failed" as a non-fatal, logged event.
 */
async function dispatch({ to, subject, html }) {
  const client = getClient();

  if (!client) {
    console.warn(`[email] RESEND_API_KEY not configured — skipping send. Would have sent "${subject}" to ${to}`);
    return { ok: true, skipped: true, reason: 'RESEND_API_KEY not configured' };
  }

  try {
    const { data, error } = await client.emails.send({ from: FROM_EMAIL, to, subject, html });
    if (error) {
      console.error(`[email] FAILED "${subject}" to ${to}:`, error.message || error);
      return { ok: false, error: error.message || String(error) };
    }
    console.log(`[email] sent "${subject}" to ${to} (id: ${data?.id})`);
    return { ok: true, id: data?.id };
  } catch (err) {
    console.error(`[email] FAILED "${subject}" to ${to}:`, err.message);
    return { ok: false, error: err.message };
  }
}

export async function sendWelcomeEmail({ name, email }) {
  const { subject, html } = welcomeEmail({ name });
  return dispatch({ to: email, subject, html });
}

export async function sendLoginEmail({ name, email, userAgent, timestamp }) {
  const { subject, html } = loginEmail({ name, userAgent, timestamp });
  return dispatch({ to: email, subject, html });
}

export async function sendCartEmail({ name, email, product, cartSubtotal, itemCount }) {
  const { subject, html } = cartEmail({ name, product, cartSubtotal, itemCount });
  return dispatch({ to: email, subject, html });
}

export async function sendOrderConfirmationEmail({ name, email, order }) {
  const { subject, html } = orderConfirmationEmail({ name, order });
  return dispatch({ to: email, subject, html });
}

const STATUS_TEMPLATES = {
  processing: orderProcessingEmail,
  shipped: orderShippedEmail,
  delivered: orderDeliveredEmail,
  cancelled: orderCancelledEmail,
};

export async function sendOrderStatusEmail({ name, email, order, status, tracking }) {
  const templateFn = STATUS_TEMPLATES[status];
  if (!templateFn) {
    return { ok: false, error: `Unknown order status "${status}"` };
  }
  const { subject, html } = templateFn({ name, order, tracking });
  return dispatch({ to: email, subject, html });
}

export async function sendAbandonedCartEmail({ name, email, items, cartTotal }) {
  const { subject, html } = abandonedCartEmail({ name, items, cartTotal });
  return dispatch({ to: email, subject, html });
}

export async function sendPasswordResetEmail({ name, email, token }) {
  const resetUrl = `${SITE_URL}/reset-password?token=${encodeURIComponent(token)}`;
  const { subject, html } = passwordResetEmail({ name, resetUrl });
  return dispatch({ to: email, subject, html });
}
