export const FREE_SHIPPING_THRESHOLD = 100;
export const STANDARD_SHIPPING = 7.99;
export const EXPRESS_SHIPPING = 17.99;

// Demo promo codes — a real store would validate these server-side.
export const PROMO_CODES = {
  WELCOME10: { type: 'percent', value: 10, label: '10% off your order' },
  GENZ20: { type: 'percent', value: 20, label: '20% off your order' },
  FREESHIP: { type: 'free_shipping', value: 0, label: 'Free shipping' },
};

export function getPromoCode(code) {
  if (!code) return null;
  return PROMO_CODES[code.trim().toUpperCase()] ?? null;
}

export function computeCartTotals(items, shippingCost = null, promoCode = null) {
  const listSubtotal = items.reduce((sum, l) => sum + l.originalPrice * l.qty, 0);
  const discountedSubtotal = items.reduce((sum, l) => sum + l.price * l.qty, 0);
  const discount = listSubtotal - discountedSubtotal;

  const baseShipping = shippingCost ?? (items.length === 0 ? 0 : discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING);

  const promo = getPromoCode(promoCode);
  const promoDiscount = promo?.type === 'percent' ? +(discountedSubtotal * (promo.value / 100)).toFixed(2) : 0;
  const shipping = promo?.type === 'free_shipping' ? 0 : baseShipping;

  const total = Math.max(0, discountedSubtotal - promoDiscount + shipping);

  return { listSubtotal, discountedSubtotal, discount, shipping, promo, promoDiscount, total };
}
