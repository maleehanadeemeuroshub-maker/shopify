export function rowToOrder(row) {
  return {
    orderNumber: row.order_number,
    date: row.created_at,
    status: row.status,
    items: row.items,
    totals: row.totals,
    customer: row.customer,
    shippingAddress: row.shipping,
    delivery: row.delivery,
    payment: row.payment,
    tracking: row.tracking ?? null,
  };
}
