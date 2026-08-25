import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../../components/Pagination.jsx';
import { adminApi, ordersApi } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatPrice } from '../../utils/format.js';
import '../seller/Seller.css';
import './Admin.css';

const STATUSES = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const { showToast } = useToast();
  const [result, setResult] = useState(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [updating, setUpdating] = useState(null);

  const load = () => adminApi.orders({ query, status, page }).then((res) => res.ok && setResult(res));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status, page]);

  const handleStatusChange = async (orderNumber, newStatus) => {
    setUpdating(orderNumber);
    const res = await ordersApi.updateStatus(orderNumber, { status: newStatus });
    setUpdating(null);

    if (res.ok) {
      showToast('Order status updated.');
      load();
    } else {
      showToast(res.error || 'Could not update order status.', { tone: 'error' });
    }
  };

  return (
    <div className="seller container">
      <div className="seller__head">
        <h1>Orders</h1>
      </div>

      <nav className="seller__tabs">
        <Link to="/admin">Overview</Link>
        <Link to="/admin/users">Users</Link>
        <Link to="/admin/products">Products</Link>
        <Link to="/admin/orders" className="is-active">
          Orders
        </Link>
        <Link to="/admin/categories">Categories</Link>
      </nav>

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Search by order number or customer email…"
          value={query}
          onChange={(e) => {
            setPage(1);
            setQuery(e.target.value);
          }}
        />
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="seller__panel">
        {!result ? null : result.orders.length === 0 ? (
          <p className="seller__empty">No orders match this search.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {result.orders.map((o) => (
                  <tr key={o.orderNumber}>
                    <td>
                      {o.orderNumber}
                      <br />
                      <span className="is-muted">{new Date(o.date).toLocaleDateString()}</span>
                    </td>
                    <td>
                      {o.customerName}
                      <br />
                      <span className="is-muted">{o.customerEmail}</span>
                    </td>
                    <td className="is-muted">{o.itemCount}</td>
                    <td>{formatPrice(o.total)}</td>
                    <td>
                      <select
                        className="admin-role-select"
                        value={o.status}
                        disabled={updating === o.orderNumber}
                        onChange={(e) => handleStatusChange(o.orderNumber, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {result && <Pagination page={result.page} pageSize={result.pageSize} total={result.total} onChange={setPage} />}
      </div>
    </div>
  );
}
