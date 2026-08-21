import { wrapEmail, button, heading, paragraph, statusBadge, escapeHtml, SITE_URL, SUPPORT_EMAIL } from './layout.js';

export function orderCancelledEmail({ name, order }) {
  const subject = `Your Order #${order.orderNumber} Has Been Cancelled`;

  const bodyHtml = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:22px;">
<tr>
<td>${heading('Order Cancelled')}</td>
<td align="right" style="vertical-align:top;padding-top:2px;">${statusBadge('Cancelled', '#ff9d9d')}</td>
</tr>
</table>
${paragraph(`Hi ${escapeHtml(name)}, order <strong style="color:#f3f5f2;">#${escapeHtml(order.orderNumber)}</strong> has been cancelled.`)}
${paragraph(`If you didn't request this, or have any questions, contact us at ${SUPPORT_EMAIL} and we'll help right away.`)}
<div style="text-align:center;margin:28px 0 4px;">
${button('Continue Shopping', `${SITE_URL}/shop`)}
</div>
`;

  return {
    subject,
    html: wrapEmail({ preheader: `Order #${order.orderNumber} has been cancelled.`, bodyHtml }),
  };
}
