import { wrapEmail, button, ghostButton, heading, paragraph, productRow, totalsTable, escapeHtml, STORE_NAME, SITE_URL, formatCurrency } from './layout.js';

export function cartEmail({ name, product, cartSubtotal, itemCount }) {
  const subject = 'Added to Your Cart 🛍️';

  const meta = [product.color, product.size].filter(Boolean).join(' / ');

  const bodyHtml = `
${heading(`Hi ${escapeHtml(name)},`)}
${paragraph(`You've added <strong style="color:#f3f5f2;">${escapeHtml(product.name)}</strong> to your cart.`)}
${productRow({
  image: product.image,
  name: product.name,
  meta: [meta, `Qty ${product.qty}`].filter(Boolean).join(' · '),
  price: formatCurrency(product.price * (product.qty || 1)),
})}
${totalsTable([
  [`Cart subtotal (${itemCount} item${itemCount === 1 ? '' : 's'})`, formatCurrency(cartSubtotal), true],
])}
<div style="text-align:center;margin:30px 0 4px;">
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
<tr>
<td style="padding:0 6px;">${button('View Cart', `${SITE_URL}/cart`)}</td>
<td style="padding:0 6px;">${ghostButton('Continue Shopping', `${SITE_URL}/shop`)}</td>
</tr>
</table>
</div>
`;

  return {
    subject,
    html: wrapEmail({ preheader: `${product.name} is in your cart — ${formatCurrency(cartSubtotal)} subtotal.`, bodyHtml }),
  };
}
