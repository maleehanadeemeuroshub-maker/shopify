import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Package, Truck, XCircle } from 'lucide-react';
import ProductImage from '../components/ProductImage.jsx';
import OrderProgress from '../components/OrderProgress.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { ordersApi } from '../lib/api.js';
import { formatPrice } from '../utils/format.js';
import { estimateDelivery, STATUS_META } from '../utils/orders.js';
import './Account.css';
import './OrderConfirmation.css';
import './OrderTracking.css';

// Demo/admin-style controls: this practice project has no separate admin
// role yet, so an order's owner can simulate status transitions here — the
// same real order-status emails a real admin panel would trigger.
const STATUS_ACTIONS = [
  { status: 'processing', label: 'Mark Processing', icon: Package },
  { status: 'shipped', label: 'Mark Shipped', icon: Truck },
  { status: 'delivered', label: 'Mark Delivered', icon: Package },
  { status: 'cancelled', label: 'Cancel Order', icon: XCircle },
];

export default function OrderTracking() {
  const { orderNumber } = useParams();
  const { user, ready } = useAuth();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    ordersApi.get(orderNumber).then((res) => {
      if (cancelled) return;
      if (res.ok) setOrder(res.order);
      else setNotFound(true);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [orderNumber, ready, user]);

  const simulateStatus = async (status) => {
    if (!order || updatingStatus) return;
    setUpdatingStatus(true);

    const tracking =
      status === 'shipped'
        ? { carrier: 'GENZ Express Logistics', trackingNumber: `GWX${Math.floor(1e8 + Math.random() * 9e8)}` }
        : undefined;

    const res = await ordersApi.updateStatus(orderNumber, { status, tracking });
    if (res.ok) {
      setOrder(res.order);
      showToast(
        res.emailSent
          ? `Order marked as ${STATUS_META[status].label.toLowerCase()}. An email has been sent.`
          : "Order status updated, but the email couldn't be sent.",
        { tone: res.emailSent ? 'success' : 'error' }
      );
    } else {
      showToast(res.error || 'Could not update order status.', { tone: 'error' });
    }
    setUpdatingStatus(false);
  };

  if (!ready || (user && loading)) return null;
  if (!user) return <Navigate to="/" replace />;
  if (notFound) return <Navigate to="/account" replace />;
  if (!order) return null;

  const meta = STATUS_META[order.status] ?? STATUS_META.confirmed;

  return (
    <div className="account container">
      <Link to="/account" className="order-tracking__back">
        <ArrowLeft size={14} /> Back to orders
      </Link>
      <h1>Order #{order.orderNumber}</h1>
      <p className="account__welcome">Placed {new Date(order.date).toLocaleDateString()}</p>

      <div className="account__card">
        <div className="account__order-head">
          <div>
            <strong>{order.orderNumber}</strong>
            <span>{new Date(order.date).toLocaleDateString()}</span>
          </div>
          <div className="account__order-head-right">
            <span
              className="account__status-badge"
              style={{ color: meta.color, borderColor: `${meta.color}55`, background: `${meta.color}1a` }}
            >
              {meta.label}
            </span>
            <span className="account__order-total">{formatPrice(order.totals.total)}</span>
          </div>
        </div>

        <div className="account__order-tracking">
          <OrderProgress status={order.status} />
        </div>

        <div className="confirmation__layout order-tracking__layout">
          <div className="confirmation__items">
            <h2>Order Items</h2>
            {order.items.map((line) => (
              <div className="confirmation__line" key={line.id}>
                <div className="confirmation__line-img">
                  <ProductImage src={line.image} alt={line.name} />
                </div>
                <div className="confirmation__line-info">
                  <p>{line.name}</p>
                  <span>{[line.color, line.size].filter(Boolean).join(' / ')} · Qty {line.qty}</span>
                </div>
                <span className="confirmation__line-price">{formatPrice(line.price * line.qty)}</span>
              </div>
            ))}

            <div className="confirmation__totals">
              <div>
                <span>Subtotal</span>
                <span>{formatPrice(order.totals.listSubtotal)}</span>
              </div>
              {order.totals.discount > 0 && (
                <div>
                  <span>Discount</span>
                  <span>-{formatPrice(order.totals.discount)}</span>
                </div>
              )}
              <div>
                <span>Shipping</span>
                <span>{order.totals.shipping === 0 ? 'Free' : formatPrice(order.totals.shipping)}</span>
              </div>
              <div className="confirmation__totals-final">
                <span>Total</span>
                <span>{formatPrice(order.totals.total)}</span>
              </div>
            </div>
          </div>

          <aside className="confirmation__aside">
            <div className="confirmation__card">
              <h3>
                <MapPin size={15} /> Shipping To
              </h3>
              <p>
                {order.customer.firstName} {order.customer.lastName}
                <br />
                {order.shippingAddress.address}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                <br />
                {order.shippingAddress.country}
              </p>
            </div>
            <div className="confirmation__card">
              <h3>
                <Truck size={15} /> Delivery
              </h3>
              <p>
                {order.delivery === 'express' ? 'Express Delivery' : 'Standard Delivery'}
                <br />
                Estimated arrival: {estimateDelivery(order.delivery, order.date)}
              </p>
            </div>
            {order.tracking?.trackingNumber && (
              <div className="confirmation__card">
                <h3>
                  <Package size={15} /> Tracking
                </h3>
                <p>
                  {order.tracking.carrier}
                  <br />
                  {order.tracking.trackingNumber}
                </p>
              </div>
            )}
          </aside>
        </div>

        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <div className="account__status-sim">
            <p className="account__demo-note">Demo admin controls — simulate a status change and its email:</p>
            <div className="account__status-actions">
              {STATUS_ACTIONS.filter((a) => a.status !== order.status).map((a) => (
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
    </div>
  );
}
