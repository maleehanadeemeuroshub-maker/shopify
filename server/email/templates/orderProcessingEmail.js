import { wrapEmail, button, heading, paragraph, statusBadge, escapeHtml, SITE_URL } from './layout.js';

export function orderProcessingEmail({ name, order }) {
  const subject = `Your Order #${order.orderNumber} Is Being Prepared`;

  const bodyHtml = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:22px;">
<tr>
<td>${heading('Order Processing')}</td>
<td align="right" style="vertical-align:top;padding-top:2px;">${statusBadge('Processing', '#facc7a')}</td>
</tr>
</table>
${paragraph(`Hi ${escapeHtml(name)}, your order is now being prepared.`)}
${paragraph(`Order <strong style="color:#f3f5f2;">#${escapeHtml(order.orderNumber)}</strong> is being picked, packed, and readied for shipment. We'll send you tracking details as soon as it's on its way.`)}
<div style="text-align:center;margin:28px 0 4px;">
${button('View Order', `${SITE_URL}/account/orders/${encodeURIComponent(order.orderNumber)}`)}
</div>
`;

  return {
    subject,
    html: wrapEmail({ preheader: `Order #${order.orderNumber} is being prepared for shipment.`, bodyHtml }),
  };
}
