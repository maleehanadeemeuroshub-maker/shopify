export const FREE_SHIPPING_THRESHOLD = 100;
export const STANDARD_SHIPPING = 7.99;
export const EXPRESS_SHIPPING = 17.99;

export function computeCartTotals(items, shippingCost = null) {
  const listSubtotal = items.reduce((sum, l) => sum + l.originalPrice * l.qty, 0);
  const discountedSubtotal = items.reduce((sum, l) => sum + l.price * l.qty, 0);
  const discount = listSubtotal - discountedSubtotal;

  const shipping = shippingCost ?? (items.length === 0 ? 0 : discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING);
  const total = discountedSubtotal + shipping;

  return { listSubtotal, discountedSubtotal, discount, shipping, total };
}
