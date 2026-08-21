import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Heart, LogOut, MapPin, Package, Truck, User, XCircle } from 'lucide-react';
import ProductImage from '../components/ProductImage.jsx';
import ProductCard from '../components/ProductCard.jsx';
import MagneticButton from '../components/MagneticButton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { emailApi } from '../lib/api.js';
import { PRODUCTS } from '../data/products.js';
import { formatPrice } from '../utils/format.js';
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

const STATUS_META = {
  confirmed: { label: 'Confirmed', color: '#95ff8a' },
  processing: { label: 'Processing', color: '#facc7a' },
  shipped: { label: 'Shipped', color: '#7ee0fa' },
  delivered: { label: 'Delivered', color: '#95ff8a' },
  cancelled: { label: 'Cancelled', color: '#ff9d9d' },
};

// Demo/admin-style controls: this practice project has no real order
// backend, so status transitions are simulated here and drive the same
// order-status emails a real admin panel would trigger.
const STATUS_ACTIONS = [
  { status: 'processing', label: 'Mark Processing', icon: Package },
  { status: 'shipped', label: 'Mark Shipped', icon: Truck },
  { status: 'delivered', label: 'Mark Delivered', icon: Package },
  { status: 'cancelled', label: 'Cancel Order', icon: XCircle },
];

export default function Account() {
  const { user, logout } = useAuth();
  const { ids } = useWishlist();
  const { showToast } = useToast();
  const [tab, setTab] = useState('profile');
  const [lastOrder, setLastOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('genzwears_last_order');
      if (raw) setLastOrder(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const simulateStatus = async (status) => {
    if (!lastOrder || updatingStatus) return;
    setUpdatingStatus(true);

    const tracking =
      status === 'shipped'
        ? { carrier: 'GENZ Express Logistics', trackingNumber: `GWX${Math.floor(1e8 + Math.random() * 9e8)}` }
        : undefined;

    const updatedOrder = { ...lastOrder, status };
    setLastOrder(updatedOrder);
    localStorage.setItem('genzwears_last_order', JSON.stringify(updatedOrder));

    const result = await emailApi.orderStatus({
      name: `${lastOrder.customer.firstName} ${lastOrder.customer.lastName}`.trim(),
      email: lastOrder.customer.email,
      order: lastOrder,
      status,
      tracking,
    });

    showToast(
      result.ok
        ? `Order marked as ${STATUS_META[status].label.toLowerCase()}. An email has been sent.`
        : `Order status updated, but the email couldn't be sent.`,
      { tone: result.ok ? 'success' : 'error' }
    );
    setUpdatingStatus(false);
  };

  if (!user) return <Navigate to="/" replace />;

  const wishlistProducts = PRODUCTS.filter((p) => ids.includes(p.id));

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
              {lastOrder ? (
                <div className="account__order">
                  <div className="account__order-head">
                    <div>
                      <strong>{lastOrder.orderNumber}</strong>
                      <span>{new Date(lastOrder.date).toLocaleDateString()}</span>
                    </div>
                    <div className="account__order-head-right">
                      <span
                        className="account__status-badge"
                        style={{
                          color: STATUS_META[lastOrder.status ?? 'confirmed'].color,
                          borderColor: `${STATUS_META[lastOrder.status ?? 'confirmed'].color}55`,
                          background: `${STATUS_META[lastOrder.status ?? 'confirmed'].color}1a`,
                        }}
                      >
                        {STATUS_META[lastOrder.status ?? 'confirmed'].label}
                      </span>
                      <span className="account__order-total">{formatPrice(lastOrder.totals.total)}</span>
                    </div>
                  </div>
                  <div className="account__order-items">
                    {lastOrder.items.map((line) => (
                      <div className="account__order-item" key={line.id}>
                        <div className="account__order-img">
                          <ProductImage src={line.image} alt={line.name} />
                        </div>
                        <div>
                          <p>{line.name}</p>
                          <span>Qty {line.qty}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link to="/order-confirmation" className="account__order-link">
                    View order details
                  </Link>

                  {lastOrder.status !== 'cancelled' && lastOrder.status !== 'delivered' && (
                    <div className="account__status-sim">
                      <p className="account__demo-note">
                        Demo admin controls — simulate a status change and its email:
                      </p>
                      <div className="account__status-actions">
                        {STATUS_ACTIONS.filter((a) => a.status !== lastOrder.status).map((a) => (
                          <button
                            key={a.status}
                            type="button"
                            className="account__status-btn"
                            disabled={updatingStatus}
                            onClick={() => simulateStatus(a.status)}
                          >
                            <a.icon size={14} /> {a.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
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
