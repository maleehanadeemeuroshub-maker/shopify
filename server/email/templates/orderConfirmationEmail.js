import {
  wrapEmail,
  button,
  ghostButton,
  heading,
  paragraph,
  smallLabel,
  divider,
  productRow,
  totalsTable,
  statusBadge,
  escapeHtml,
  STORE_NAME,
  SITE_URL,
  formatCurrency,
} from './layout.js';

export function orderConfirmationEmail({ name, order }) {
  const subject = `Order Confirmed — #${order.orderNumber} 🎉`;
  const orderDate = new Date(order.date ?? Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const itemsHtml = order.items
    .map((line) =>
      productRow({
        image: line.image,
        name: line.name,
        meta: [line.color, line.size].filter(Boolean).join(' / ') + ` · Qty ${line.qty}`,
        price: formatCurrency(line.price * line.qty),
      })
    )
    .join('');

  const totalsRows = [
    ['Subtotal', formatCurrency(order.totals.listSubtotal)],
    ...(order.totals.discount > 0 ? [['Discount', `-${formatCurrency(order.totals.discount)}`]] : []),
    ['Shipping', order.totals.shipping === 0 ? 'Free' : formatCurrency(order.totals.shipping)],
    ['Total', formatCurrency(order.totals.total), true],
  ];

  const address = order.shippingAddress || {};

  const bodyHtml = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:22px;">
<tr>
<td>${heading(`Order Confirmed`)}</td>
<td align="right" style="vertical-align:top;padding-top:2px;">${statusBadge('Confirmed')}</td>
</tr>
</table>
${paragraph(`Hi ${escapeHtml(name)}, your order has been successfully placed. We'll email you again once it ships.`)}

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:26px;">
<tr>
<td style="font-family:Helvetica,Arial,sans-serif;font-size:12.5px;color:#9aa39c;">Order Number</td>
<td align="right" style="font-family:Helvetica,Arial,sans-serif;font-size:12.5px;color:#9aa39c;">Order Date</td>
</tr>
<tr>
<td style="font-family:Helvetica,Arial,sans-serif;font-size:14.5px;font-weight:700;color:#f3f5f2;padding-top:2px;">#${escapeHtml(order.orderNumber)}</td>
<td align="right" style="font-family:Helvetica,Arial,sans-serif;font-size:14.5px;font-weight:700;color:#f3f5f2;padding-top:2px;">${orderDate}</td>
</tr>
</table>

${divider()}
${smallLabel('Items')}
${itemsHtml}
${divider()}
${totalsTable(totalsRows)}
${divider()}
${smallLabel('Shipping To')}
${paragraph(
  `${escapeHtml(order.customer.firstName)} ${escapeHtml(order.customer.lastName)}<br/>${escapeHtml(address.address)}<br/>${escapeHtml(address.city)}, ${escapeHtml(address.state)} ${escapeHtml(address.postalCode)}<br/>${escapeHtml(address.country)}`
)}

<div style="text-align:center;margin:28px 0 4px;">
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
<tr>
<td style="padding:0 6px;">${button('Track Your Order', `${SITE_URL}/account/orders/${encodeURIComponent(order.orderNumber)}`)}</td>
<td style="padding:0 6px;">${ghostButton('Continue Shopping', `${SITE_URL}/shop`)}</td>
</tr>
</table>
</div>
`;

  return {
    subject,
    html: wrapEmail({
      preheader: `Your ${STORE_NAME} order #${order.orderNumber} is confirmed — total ${formatCurrency(order.totals.total)}.`,
      bodyHtml,
    }),
  };
}
