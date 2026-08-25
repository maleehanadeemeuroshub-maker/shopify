import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Heart, LogOut, MapPin, Package, User } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import MagneticButton from '../components/MagneticButton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useProducts } from '../context/ProductsContext.jsx';
import { ordersApi } from '../lib/api.js';
import { formatPrice } from '../utils/format.js';
import { STATUS_META } from '../utils/orders.js';
import './Account.css';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
];

const MOCK_ADDRESSES = [
  { label: 'Home', name: 'Alex Rivera', line: '128 Fulton Street, Apt 4B', city: 'New York, NY 10038', country: 'United States' },
];

export default function Account() {
  const { user, ready, logout } = useAuth();
  const { ids } = useWishlist();
  const { products } = useProducts();
  const [tab, setTab] = useState('profile');
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    ordersApi.list().then((res) => {
      if (!cancelled && res.ok) setOrders(res.orders);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, user]);

  if (!ready) return null;
  if (!user) return <Navigate to="/" replace />;

  const wishlistProducts = products.filter((p) => ids.includes(p.id));

  return (
    <div className="account container">
      <h1>My Account</h1>
      <p className="account__welcome">Welcome back, {user.name.split(' ')[0]}.</p>

      <div className="account__layout">
        <nav className="account__nav">
          {TABS.map((t) => (
            <button key={t.id} type="button" className={tab === t.id ? 'is-active' : ''} onClick={() => setTab(t.id)}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
          <button type="button" className="account__logout" onClick={logout}>
            <LogOut size={16} /> Logout
          </button>
        </nav>

        <div className="account__panel">
          {tab === 'profile' && (
            <div className="account__card">
              <h2>Profile</h2>
              <div className="account__profile-grid">
                <div>
                  <span>Name</span>
                  <strong>{user.name}</strong>
                </div>
                <div>
                  <span>Email</span>
                  <strong>{user.email}</strong>
                </div>
                <div>
                  <span>Member since</span>
                  <strong>2026</strong>
                </div>
              </div>
              <p className="account__demo-note">This is demo account data for a practice storefront.</p>
            </div>
          )}

          {tab === 'orders' && (
            <div className="account__card">
              <h2>Orders</h2>
              {orders === null ? null : orders.length > 0 ? (
                <div className="account__order-history">
                  {orders.map((order) => {
                    const meta = STATUS_META[order.status] ?? STATUS_META.confirmed;
                    return (
                      <Link to={`/account/orders/${order.orderNumber}`} className="account__order-row" key={order.orderNumber}>
                        <div>
                          <strong>{order.orderNumber}</strong>
                          <span>{new Date(order.date).toLocaleDateString()}</span>
                        </div>
                        <span
                          className="account__status-badge"
                          style={{ color: meta.color, borderColor: `${meta.color}55`, background: `${meta.color}1a` }}
                        >
                          {meta.label}
                        </span>
                        <span className="account__order-total">{formatPrice(order.totals.total)}</span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="account__empty">
                  <p>You haven&apos;t placed any orders yet.</p>
                  <MagneticButton as={Link} to="/shop" variant="outline">
                    Start Shopping
                  </MagneticButton>
                </div>
              )}
            </div>
          )}

          {tab === 'wishlist' && (
            <div className="account__card">
              <h2>Wishlist</h2>
              {wishlistProducts.length > 0 ? (
                <div className="account__wishlist-grid">
                  {wishlistProducts.map((p) => (
                    <ProductCard product={p} key={p.id} />
                  ))}
                </div>
              ) : (
                <div className="account__empty">
                  <p>Nothing saved yet.</p>
                  <MagneticButton as={Link} to="/shop" variant="outline">
                    Explore the Shop
                  </MagneticButton>
                </div>
              )}
            </div>
          )}

          {tab === 'addresses' && (
            <div className="account__card">
              <h2>Addresses</h2>
              {MOCK_ADDRESSES.map((addr) => (
                <div className="account__address" key={addr.label}>
                  <span className="account__address-label">{addr.label}</span>
                  <p>
                    {addr.name}
                    <br />
                    {addr.line}
                    <br />
                    {addr.city}
                    <br />
                    {addr.country}
                  </p>
                </div>
              ))}
              <p className="account__demo-note">Demo address — editing isn&apos;t wired up in this practice build.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
