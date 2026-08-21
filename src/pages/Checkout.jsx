import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { CreditCard, Info, Lock, Package, ShieldCheck, Truck } from 'lucide-react';
import ProductImage from '../components/ProductImage.jsx';
import MagneticButton from '../components/MagneticButton.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { computeCartTotals, STANDARD_SHIPPING, EXPRESS_SHIPPING } from '../utils/cartMath.js';
import { formatPrice } from '../utils/format.js';
import './Checkout.css';

function generateOrderNumber() {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `GW-${rand}`;
}

export default function Checkout() {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [delivery, setDelivery] = useState('standard');
  const [payment, setPayment] = useState('card');
  const [form, setForm] = useState({
    email: user?.email ?? '',
    firstName: user?.name?.split(' ')[0] ?? '',
    lastName: user?.name?.split(' ').slice(1).join(' ') ?? '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const shippingCost = delivery === 'express' ? EXPRESS_SHIPPING : items.length ? computeCartTotals(items).shipping : 0;
  const totals = useMemo(() => computeCartTotals(items, shippingCost), [items, shippingCost]);

  if (items.length === 0) {
    return <Navigate to="/shop" replace />;
  }

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.email.includes('@')) next.email = 'Enter a valid email address.';
    if (!form.firstName.trim()) next.firstName = 'Required.';
    if (!form.lastName.trim()) next.lastName = 'Required.';
    if (!form.phone.trim()) next.phone = 'Required.';
    if (!form.address.trim()) next.address = 'Required.';
    if (!form.city.trim()) next.city = 'Required.';
    if (!form.state.trim()) next.state = 'Required.';
    if (!form.postalCode.trim()) next.postalCode = 'Required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    const order = {
      orderNumber: generateOrderNumber(),
      date: new Date().toISOString(),
      items,
      totals,
      customer: { email: form.email, firstName: form.firstName, lastName: form.lastName, phone: form.phone },
      shippingAddress: {
        address: form.address,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
      },
      delivery,
      payment,
    };

    localStorage.setItem('genzwears_last_order', JSON.stringify(order));

    window.setTimeout(() => {
      clearCart();
      navigate('/order-confirmation', { state: { order } });
    }, 700);
  };

  return (
    <div className="checkout container">
      <div className="checkout__banner">
        <Info size={15} /> Practice storefront — this is a mock checkout. No real payment will be processed.
      </div>

      <h1>Checkout</h1>

      <form className="checkout__layout" onSubmit={handleSubmit}>
        <div className="checkout__form">
          <section className="checkout__section">
            <h2>Customer Information</h2>
            <div className="checkout__grid">
              <label className="checkout__field checkout__field--full">
                <span>Email</span>
                <input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" />
                {errors.email && <em>{errors.email}</em>}
              </label>
              <label className="checkout__field">
                <span>First Name</span>
                <input type="text" value={form.firstName} onChange={update('firstName')} />
                {errors.firstName && <em>{errors.firstName}</em>}
              </label>
              <label className="checkout__field">
                <span>Last Name</span>
                <input type="text" value={form.lastName} onChange={update('lastName')} />
                {errors.lastName && <em>{errors.lastName}</em>}
              </label>
              <label className="checkout__field checkout__field--full">
                <span>Phone</span>
                <input type="tel" value={form.phone} onChange={update('phone')} placeholder="(555) 000-0000" />
                {errors.phone && <em>{errors.phone}</em>}
              </label>
            </div>
          </section>

          <section className="checkout__section">
            <h2>Shipping Address</h2>
            <div className="checkout__grid">
              <label className="checkout__field checkout__field--full">
                <span>Address</span>
                <input type="text" value={form.address} onChange={update('address')} placeholder="Street address" />
                {errors.address && <em>{errors.address}</em>}
              </label>
              <label className="checkout__field">
                <span>City</span>
                <input type="text" value={form.city} onChange={update('city')} />
                {errors.city && <em>{errors.city}</em>}
              </label>
              <label className="checkout__field">
                <span>Province / State</span>
                <input type="text" value={form.state} onChange={update('state')} />
                {errors.state && <em>{errors.state}</em>}
              </label>
              <label className="checkout__field">
                <span>Postal Code</span>
                <input type="text" value={form.postalCode} onChange={update('postalCode')} />
                {errors.postalCode && <em>{errors.postalCode}</em>}
              </label>
              <label className="checkout__field">
                <span>Country</span>
                <select value={form.country} onChange={update('country')}>
                  <option>United States</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                  <option>Australia</option>
                  <option>Germany</option>
                </select>
              </label>
            </div>
          </section>

          <section className="checkout__section">
            <h2>Delivery</h2>
            <div className="checkout__options">
              <label className={`checkout__option ${delivery === 'standard' ? 'is-active' : ''}`}>
                <input type="radio" name="delivery" checked={delivery === 'standard'} onChange={() => setDelivery('standard')} />
                <Truck size={18} />
                <div>
                  <strong>Standard Delivery</strong>
                  <span>4–6 business days</span>
                </div>
                <span className="checkout__option-price">
                  {computeCartTotals(items).shipping === 0 ? 'Free' : formatPrice(STANDARD_SHIPPING)}
                </span>
              </label>
              <label className={`checkout__option ${delivery === 'express' ? 'is-active' : ''}`}>
                <input type="radio" name="delivery" checked={delivery === 'express'} onChange={() => setDelivery('express')} />
                <Package size={18} />
                <div>
                  <strong>Express Delivery</strong>
                  <span>1–2 business days</span>
                </div>
                <span className="checkout__option-price">{formatPrice(EXPRESS_SHIPPING)}</span>
              </label>
            </div>
          </section>

          <section className="checkout__section">
            <h2>Payment</h2>
            <div className="checkout__options">
              <label className={`checkout__option ${payment === 'card' ? 'is-active' : ''}`}>
                <input type="radio" name="payment" checked={payment === 'card'} onChange={() => setPayment('card')} />
                <CreditCard size={18} />
                <div>
                  <strong>Credit / Debit Card</strong>
                  <span>Demo card entry — not processed</span>
                </div>
              </label>
              <label className={`checkout__option ${payment === 'cod' ? 'is-active' : ''}`}>
                <input type="radio" name="payment" checked={payment === 'cod'} onChange={() => setPayment('cod')} />
                <Package size={18} />
                <div>
                  <strong>Cash on Delivery</strong>
                  <span>Pay when your order arrives</span>
                </div>
              </label>
              <label className={`checkout__option ${payment === 'demo' ? 'is-active' : ''}`}>
                <input type="radio" name="payment" checked={payment === 'demo'} onChange={() => setPayment('demo')} />
                <ShieldCheck size={18} />
                <div>
                  <strong>Demo Payment</strong>
                  <span>Instantly complete this practice order</span>
                </div>
              </label>
            </div>

            {payment === 'card' && (
              <div className="checkout__card-fields">
                <label className="checkout__field checkout__field--full">
                  <span>Card Number</span>
                  <input type="text" inputMode="numeric" placeholder="4242 4242 4242 4242" maxLength={19} />
                </label>
                <label className="checkout__field">
                  <span>Expiry</span>
                  <input type="text" placeholder="MM / YY" maxLength={7} />
                </label>
                <label className="checkout__field">
                  <span>CVC</span>
                  <input type="text" inputMode="numeric" placeholder="123" maxLength={4} />
                </label>
                <p className="checkout__lock">
                  <Lock size={12} /> Demo field only — no card data is transmitted or stored.
                </p>
              </div>
            )}
          </section>
        </div>

        <aside className="checkout__summary">
          <h2>Order Summary</h2>
          <div className="checkout__summary-items">
            {items.map((line) => (
              <div className="checkout__summary-line" key={line.id}>
                <div className="checkout__summary-img">
                  <ProductImage src={line.image} alt={line.name} />
                  <span>{line.qty}</span>
                </div>
                <div className="checkout__summary-info">
                  <p>{line.name}</p>
                  <span>{[line.color, line.size].filter(Boolean).join(' / ')}</span>
                </div>
                <span className="checkout__summary-price">{formatPrice(line.price * line.qty)}</span>
              </div>
            ))}
          </div>

          <div className="checkout__row">
            <span>Subtotal</span>
            <span>{formatPrice(totals.listSubtotal)}</span>
          </div>
          {totals.discount > 0 && (
            <div className="checkout__row checkout__row--discount">
              <span>Discount</span>
              <span>-{formatPrice(totals.discount)}</span>
            </div>
          )}
          <div className="checkout__row">
            <span>Shipping</span>
            <span>{totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping)}</span>
          </div>
          <div className="checkout__row checkout__row--total">
            <span>Total</span>
            <span>{formatPrice(totals.total)}</span>
          </div>

          <MagneticButton type="submit" variant="solid" className="checkout__submit" disabled={submitting}>
            {submitting ? 'Placing order…' : `Place Order · ${formatPrice(totals.total)}`}
          </MagneticButton>
          <Link to="/cart" className="checkout__back">
            Back to cart
          </Link>
        </aside>
      </form>
    </div>
  );
}
