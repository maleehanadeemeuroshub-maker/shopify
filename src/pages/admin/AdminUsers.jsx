import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Pagination from '../../components/Pagination.jsx';
import { adminApi } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import '../seller/Seller.css';
import './Admin.css';

const ROLES = ['customer', 'seller', 'admin'];

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [result, setResult] = useState(null);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);

  const load = () => adminApi.users({ query, role, page }).then((res) => res.ok && setResult(res));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, role, page]);

  const handleRoleChange = async (id, newRole) => {
    const res = await adminApi.setUserRole(id, newRole);
    if (res.ok) {
      showToast('Role updated.');
      load();
    } else {
      showToast(res.error || 'Could not update role.', { tone: 'error' });
    }
  };

  return (
    <div className="seller container">
      <div className="seller__head">
        <h1>Users</h1>
      </div>

      <nav className="seller__tabs">
        <Link to="/admin">Overview</Link>
        <Link to="/admin/users" className="is-active">
          Users
        </Link>
        <Link to="/admin/products">Products</Link>
        <Link to="/admin/orders">Orders</Link>
        <Link to="/admin/categories">Categories</Link>
      </nav>

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Search by name or email…"
          value={query}
          onChange={(e) => {
            setPage(1);
            setQuery(e.target.value);
          }}
        />
        <select
          value={role}
          onChange={(e) => {
            setPage(1);
            setRole(e.target.value);
          }}
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="seller__panel">
        {!result ? null : result.users.length === 0 ? (
          <p className="seller__empty">No users match this search.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {result.users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td className="is-muted">{u.email}</td>
                    <td className="is-muted">{new Date(u.createdAt.replace(' ', 'T') + 'Z').toLocaleDateString()}</td>
                    <td>
                      <select
                        className="admin-role-select"
                        value={u.role}
                        disabled={u.id === currentUser.id && u.role === 'admin'}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
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
