import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductImage from '../../components/ProductImage.jsx';
import Pagination from '../../components/Pagination.jsx';
import { adminApi } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatPrice } from '../../utils/format.js';
import '../seller/Seller.css';
import './Admin.css';

export default function AdminProducts() {
  const { showToast } = useToast();
  const [result, setResult] = useState(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const load = () => adminApi.products({ query, status, page }).then((res) => res.ok && setResult(res));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status, page]);

  const handleToggle = async (product) => {
    const res = await adminApi.setProductActive(product.id, !product.active);
    if (res.ok) {
      showToast(product.active ? 'Product hidden from the storefront.' : 'Product made visible.');
      load();
    } else {
      showToast(res.error || 'Could not update product.', { tone: 'error' });
    }
  };

  return (
    <div className="seller container">
      <div className="seller__head">
        <h1>Products</h1>
      </div>

      <nav className="seller__tabs">
        <Link to="/admin">Overview</Link>
        <Link to="/admin/users">Users</Link>
        <Link to="/admin/products" className="is-active">
          Products
        </Link>
        <Link to="/admin/orders">Orders</Link>
        <Link to="/admin/categories">Categories</Link>
      </nav>

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Search by product name…"
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
          <option value="active">Active</option>
          <option value="inactive">Hidden</option>
        </select>
      </div>

      <div className="seller__panel">
        {!result ? null : result.products.length === 0 ? (
          <p className="seller__empty">No products match this search.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Seller</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {result.products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="admin-table__thumb">
                        <ProductImage src={p.image} alt={p.name} />
                      </div>
                    </td>
                    <td>{p.name}</td>
                    <td className="is-muted">{p.sellerName}</td>
                    <td>{formatPrice(p.salePrice ?? p.price)}</td>
                    <td className="is-muted">{p.stock}</td>
                    <td>
                      <span className={`admin-pill ${p.active ? 'admin-pill--active' : 'admin-pill--inactive'}`}>
                        {p.active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="admin-toggle" onClick={() => handleToggle(p)}>
                        {p.active ? 'Hide' : 'Unhide'}
                      </button>
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
