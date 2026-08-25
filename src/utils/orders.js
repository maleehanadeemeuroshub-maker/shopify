export function estimateDelivery(delivery, fromDate) {
  const days = delivery === 'express' ? [1, 2] : [4, 6];
  const fmt = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const start = new Date(fromDate);
  start.setDate(start.getDate() + days[0]);
  const end = new Date(fromDate);
  end.setDate(end.getDate() + days[1]);
  return `${fmt(start)} – ${fmt(end)}`;
}

export const STATUS_META = {
  confirmed: { label: 'Confirmed', color: '#95ff8a' },
  processing: { label: 'Processing', color: '#facc7a' },
  shipped: { label: 'Shipped', color: '#7ee0fa' },
  delivered: { label: 'Delivered', color: '#95ff8a' },
  cancelled: { label: 'Cancelled', color: '#ff9d9d' },
};
