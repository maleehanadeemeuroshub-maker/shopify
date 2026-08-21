export function formatPrice(value) {
  if (typeof value !== 'number') return '';
  return `$${value.toFixed(2)}`;
}

export function discountPercent(price, salePrice) {
  if (!salePrice || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}
