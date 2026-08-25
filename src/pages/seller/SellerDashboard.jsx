import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Package, ShoppingBag, Star } from 'lucide-react';
import { productsApi, ordersApi } from '../../lib/api.js';
import { formatPrice } from '../../utils/format.js';
import './Seller.css';

export default function SellerDashboard() {
  const [products, setProducts] = useState(null);
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([productsApi.mine(), ordersApi.forSeller()]).then(([p, o]) => {
      if (cancelled) return;
      if (p.ok) setProducts(p.products);
      if (o.ok) setOrders(o.orders);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    if (!products || !orders) return null;
    const activeProducts = products.filter((p) => p.active);
    const revenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.sellerSubtotal, 0);
    const avgRating = activeProducts.length
      ? activeProducts.reduce((sum, p) => sum + p.rating, 0) / activeProducts.length
      : 0;
    return { revenue, orderCount: orders.length, productCount: activeProducts.length, avgRating };
  }, [products, orders]);

  const chartData = useMemo(() => {
    if (!orders) return [];
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    return days.map((d) => {
      const key = d.toDateString();
      const value = orders
        .filter((o) => o.status !== 'cancelled' && new Date(o.date).toDateString() === key)
        .reduce((sum, o) => sum + o.sellerSubtotal, 0);
      return { label: d.toLocaleDateString(undefined, { weekday: 'short' }), value };
    });
  }, [orders]);

  if (!stats) return null;

  const maxChartValue = Math.max(1, ...chartData.map((d) => d.value));

  return (
    <div className="seller container">
      <div className="seller__head">
        <h1>Seller Dashboard</h1>
        <Link to="/seller/products/new" className="seller__cta">
          + Add Product
        </Link>
      </div>

      <nav className="seller__tabs">
        <Link to="/seller" className="is-active">
          Overview
        </Link>
        <Link to="/seller/products">Products</Link>
        <Link to="/seller/orders">Orders</Link>
      </nav>

      <div className="seller__stats">
        <div className="seller__stat">
          <DollarSign size={18} />
          <div>
            <span>Revenue</span>
            <strong>{formatPrice(stats.revenue)}</strong>
          </div>
        </div>
        <div className="seller__stat">
          <ShoppingBag size={18} />
          <div>
            <span>Orders</span>
            <strong>{stats.orderCount}</strong>
          </div>
        </div>
        <div className="seller__stat">
          <Package size={18} />
          <div>
            <span>Products</span>
            <strong>{stats.productCount}</strong>
          </div>
        </div>
        <div className="seller__stat">
          <Star size={18} />
          <div>
            <span>Avg Rating</span>
            <strong>{stats.avgRating ? stats.avgRating.toFixed(1) : '—'}</strong>
          </div>
        </div>
      </div>

      <div className="seller__panel">
        <h2>Revenue — Last 7 Days</h2>
        <div className="seller__chart">
          {chartData.map((d) => (
            <div className="seller__chart-bar" key={d.label}>
              <div className="seller__chart-bar-fill" style={{ height: `${(d.value / maxChartValue) * 100}%` }} />
              <span>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="seller__panel">
        <h2>Recent Orders</h2>
        {orders.length === 0 ? (
          <p className="seller__empty">No orders yet — once your products sell, they&apos;ll show up here.</p>
        ) : (
          <div className="seller__order-list">
            {orders.slice(0, 5).map((o) => (
              <Link to="/seller/orders" className="seller__order-row" key={o.orderNumber}>
                <div>
                  <strong>{o.orderNumber}</strong>
                  <span>{new Date(o.date).toLocaleDateString()}</span>
                </div>
                <span className="seller__order-status">{o.status}</span>
                <span className="seller__order-total">{formatPrice(o.sellerSubtotal)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
