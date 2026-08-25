import { wrapEmail, button, heading, paragraph, infoCard, statusBadge, escapeHtml, SITE_URL } from './layout.js';

export function orderShippedEmail({ name, order, tracking }) {
  const subject = `Your Order #${order.orderNumber} Has Shipped 🚚`;
  const carrier = tracking?.carrier || 'Standard Carrier';
  const trackingNumber = tracking?.trackingNumber || 'Not yet assigned';
  const trackingUrl = tracking?.trackingUrl || `${SITE_URL}/account/orders/${encodeURIComponent(order.orderNumber)}`;

  const bodyHtml = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:22px;">
<tr>
<td>${heading('Your Order Is on the Way')}</td>
<td align="right" style="vertical-align:top;padding-top:2px;">${statusBadge('Shipped', '#7ee0fa')}</td>
</tr>
</table>
${paragraph(`Hi ${escapeHtml(name)}, order <strong style="color:#f3f5f2;">#${escapeHtml(order.orderNumber)}</strong> has shipped and is on its way to you.`)}
${infoCard([
  ['Carrier', carrier],
  ['Tracking Number', trackingNumber],
])}
<div style="text-align:center;margin:28px 0 4px;">
${button('Track Your Package', trackingUrl)}
</div>
`;

  return {
    subject,
    html: wrapEmail({ preheader: `Order #${order.orderNumber} has shipped via ${carrier}.`, bodyHtml }),
  };
}
