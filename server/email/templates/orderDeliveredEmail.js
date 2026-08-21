import { wrapEmail, button, ghostButton, heading, paragraph, statusBadge, escapeHtml, SITE_URL } from './layout.js';

export function orderDeliveredEmail({ name, order }) {
  const subject = `Your Order #${order.orderNumber} Has Been Delivered 📦`;

  const bodyHtml = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:22px;">
<tr>
<td>${heading('Delivered')}</td>
<td align="right" style="vertical-align:top;padding-top:2px;">${statusBadge('Delivered', '#95ff8a')}</td>
</tr>
</table>
${paragraph(`Hi ${escapeHtml(name)}, order <strong style="color:#f3f5f2;">#${escapeHtml(order.orderNumber)}</strong> has been delivered. We hope you love it.`)}
${paragraph("Something not right? Reach out to our support team and we'll help sort it out.")}
<div style="text-align:center;margin:28px 0 4px;">
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
<tr>
<td style="padding:0 6px;">${button('View Order', `${SITE_URL}/account`)}</td>
<td style="padding:0 6px;">${ghostButton('Shop Again', `${SITE_URL}/shop`)}</td>
</tr>
</table>
</div>
`;

  return {
    subject,
    html: wrapEmail({ preheader: `Order #${order.orderNumber} has been delivered.`, bodyHtml }),
  };
}
