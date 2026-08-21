import { wrapEmail, button, heading, paragraph, productRow, totalsTable, escapeHtml, SITE_URL, formatCurrency } from './layout.js';

export function abandonedCartEmail({ name, items, cartTotal }) {
  const subject = 'You Left Something Behind 🛒';

  const itemsHtml = items
    .map((line) =>
      productRow({
        image: line.image,
        name: line.name,
        meta: [line.color, line.size].filter(Boolean).join(' / ') + ` · Qty ${line.qty}`,
        price: formatCurrency(line.price * line.qty),
      })
    )
    .join('');

  const bodyHtml = `
${heading(`Hi ${escapeHtml(name)},`)}
${paragraph("You've still got items waiting in your cart. They're not reserved forever — grab them before they sell out.")}
${itemsHtml}
${totalsTable([['Cart total', formatCurrency(cartTotal), true]])}
<div style="text-align:center;margin:30px 0 4px;">
${button('Return to Cart', `${SITE_URL}/cart`)}
</div>
`;

  return {
    subject,
    html: wrapEmail({ preheader: `Your cart is waiting — ${formatCurrency(cartTotal)} total.`, bodyHtml }),
  };
}
