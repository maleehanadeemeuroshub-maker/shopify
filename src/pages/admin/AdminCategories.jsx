import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../lib/api.js';
import '../seller/Seller.css';
import './Admin.css';

export default function AdminCategories() {
  const [categories, setCategories] = useState(null);

  useEffect(() => {
    adminApi.categories().then((res) => res.ok && setCategories(res.categories));
  }, []);

  if (!categories) return null;

  const maxCount = Math.max(1, ...categories.map((c) => c.count));

  return (
    <div className="seller container">
      <div className="seller__head">
        <h1>Categories</h1>
      </div>

      <nav className="seller__tabs">
        <Link to="/admin">Overview</Link>
        <Link to="/admin/users">Users</Link>
        <Link to="/admin/products">Products</Link>
        <Link to="/admin/orders">Orders</Link>
        <Link to="/admin/categories" className="is-active">
          Categories
        </Link>
      </nav>

      <div className="seller__panel">
        <h2>Active Listings by Category</h2>
        {categories.length === 0 ? (
          <p className="seller__empty">No active products yet.</p>
        ) : (
          <div className="admin-categories">
            {categories.map((c) => (
              <div className="admin-category-row" key={c.category}>
                <span>{c.category}</span>
                <div className="admin-category-bar-track">
                  <div className="admin-category-bar-fill" style={{ width: `${(c.count / maxCount) * 100}%` }} />
                </div>
                <span>{c.count}</span>
              </div>
            ))}
          </div>
        )}
        <p className="admin-categories__note">
          The category taxonomy itself (used for navigation and filtering) is fixed platform configuration, not
          user-editable data — this view shows how the live catalog is actually distributed across it.
        </p>
      </div>
    </div>
  );
}
