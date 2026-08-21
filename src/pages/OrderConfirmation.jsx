import { useEffect, useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, MapPin, Package, Truck } from 'lucide-react';
import ProductImage from '../components/ProductImage.jsx';
import MagneticButton from '../components/MagneticButton.jsx';
import { formatPrice } from '../utils/format.js';
import './OrderConfirmation.css';

function estimateDelivery(delivery, fromDate) {
  const days = delivery === 'express' ? [1, 2] : [4, 6];
  const fmt = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const start = new Date(fromDate);
  start.setDate(start.getDate() + days[0]);
  const end = new Date(fromDate);
  end.setDate(end.getDate() + days[1]);
  return `${fmt(start)} – ${fmt(end)}`;
}

function readLastOrder() {
  try {
    const raw = localStorage.getItem('genzwears_last_order');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function OrderConfirmation() {
  const location = useLocation();
  // Lazy initializer so a hard refresh (no router state) still resolves the
  // order synchronously on first render, before the redirect check below runs.
  const [order] = useState(() => location.state?.order ?? readLastOrder());

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!order) return <Navigate to="/shop" replace />;

  return (
    <div className="confirmation container">
      <motion.div
        className="confirmation__head"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="confirmation__icon">
          <CheckCircle2 size={30} strokeWidth={1.5} />
        </span>
        <span className="eyebrow">Practice order — no real payment was made</span>
        <h1>Order Confirmed</h1>
        <p>
          Thanks, {order.customer.firstName}. A confirmation has been &ldquo;sent&rdquo; to {order.customer.email}. Your
          order number is <strong>{order.orderNumber}</strong>.
        </p>
      </motion.div>

      <div className="confirmation__layout">
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
          <div className="confirmation__card">
            <h3>
              <Package size={15} /> Payment Method
            </h3>
            <p>
              {order.payment === 'card' && 'Credit / Debit Card (demo)'}
              {order.payment === 'cod' && 'Cash on Delivery'}
              {order.payment === 'demo' && 'Demo Payment'}
            </p>
          </div>
        </aside>
      </div>

      <div className="confirmation__cta">
        <MagneticButton as={Link} to="/shop" variant="solid">
          Continue Shopping <ArrowRight size={16} />
        </MagneticButton>
        <Link to="/account" className="confirmation__account-link">
          View order in your account
        </Link>
      </div>
    </div>
  );
}
