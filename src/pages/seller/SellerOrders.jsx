import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../../lib/api.js';
import { formatPrice } from '../../utils/format.js';
import './Seller.css';

export default function SellerOrders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    ordersApi.forSeller().then((res) => res.ok && setOrders(res.orders));
  }, []);

  if (!orders) return null;

  return (
    <div className="seller container">
      <div className="seller__head">
        <h1>Orders</h1>
      </div>

      <nav className="seller__tabs">
        <Link to="/seller">Overview</Link>
        <Link to="/seller/products">Products</Link>
        <Link to="/seller/orders" className="is-active">
          Orders
        </Link>
      </nav>

      <div className="seller__panel">
        {orders.length === 0 ? (
          <p className="seller__empty">No orders yet — once your products sell, they&apos;ll show up here.</p>
        ) : (
          <div className="seller__order-list seller__order-list--detailed">
            {orders.map((o) => (
              <div className="seller__order-card" key={o.orderNumber}>
                <div className="seller__order-card-head">
                  <div>
                    <strong>{o.orderNumber}</strong>
                    <span>{new Date(o.date).toLocaleDateString()}</span>
                  </div>
                  <span className="seller__order-status">{o.status}</span>
                  <span className="seller__order-total">{formatPrice(o.sellerSubtotal)}</span>
                </div>
                <div className="seller__order-items">
                  {o.items.map((line) => (
                    <span key={`${o.orderNumber}-${line.id}`}>
                      {line.name} × {line.qty}
                    </span>
                  ))}
                </div>
                <div className="seller__order-shipping">
                  Ship to: {o.shippingAddress.city}, {o.shippingAddress.state}, {o.shippingAddress.country}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
