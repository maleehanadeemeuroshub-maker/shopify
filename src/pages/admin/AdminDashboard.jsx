import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Package, ShoppingBag, Users } from 'lucide-react';
import { adminApi } from '../../lib/api.js';
import { formatPrice } from '../../utils/format.js';
import '../seller/Seller.css';
import './Admin.css';

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminApi.stats().then((res) => res.ok && setData(res));
  }, []);

  if (!data) return null;

  const { stats, chart } = data;
  const maxChartValue = Math.max(1, ...chart.map((d) => d.value));

  return (
    <div className="seller container">
      <div className="seller__head">
        <h1>Admin Dashboard</h1>
      </div>

      <nav className="seller__tabs">
        <Link to="/admin" className="is-active">
          Overview
        </Link>
        <Link to="/admin/users">Users</Link>
        <Link to="/admin/products">Products</Link>
        <Link to="/admin/orders">Orders</Link>
        <Link to="/admin/categories">Categories</Link>
      </nav>

      <div className="seller__stats">
        <div className="seller__stat">
          <DollarSign size={18} />
          <div>
            <span>Platform Revenue</span>
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
            <span>Active Products</span>
            <strong>{stats.productCount}</strong>
          </div>
        </div>
        <div className="seller__stat">
          <Users size={18} />
          <div>
            <span>Users · Sellers</span>
            <strong>
              {stats.userCount} · {stats.sellerCount}
            </strong>
          </div>
        </div>
      </div>

      <div className="seller__panel">
        <h2>Platform Revenue — Last 7 Days</h2>
        <div className="seller__chart">
          {chart.map((d) => (
            <div className="seller__chart-bar" key={d.label}>
              <div className="seller__chart-bar-fill" style={{ height: `${(d.value / maxChartValue) * 100}%` }} />
              <span>{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
