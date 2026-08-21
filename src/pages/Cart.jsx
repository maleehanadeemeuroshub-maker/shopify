import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Minus, Plus, ShoppingBag, Tag, X } from 'lucide-react';
import ProductImage from '../components/ProductImage.jsx';
import MagneticButton from '../components/MagneticButton.jsx';
import { useCart } from '../context/CartContext.jsx';
import { computeCartTotals, FREE_SHIPPING_THRESHOLD } from '../utils/cartMath.js';
import { formatPrice } from '../utils/format.js';
import './Cart.css';

export default function Cart() {
  const { items, removeItem, updateQty, promoCode, applyPromoCode, removePromoCode } = useCart();
  const { listSubtotal, discount, shipping, total, discountedSubtotal, promo, promoDiscount } = computeCartTotals(
    items,
    null,
    promoCode
  );
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const result = applyPromoCode(promoInput);
    if (result.ok) {
      setPromoError('');
      setPromoInput('');
    } else {
      setPromoError(result.message);
    }
  };

  if (items.length === 0) {
    return (
      <div className="cart-page cart-page--empty container">
        <ShoppingBag size={40} strokeWidth={1.2} />
        <h1>Your cart is empty</h1>
        <p>Looks like you haven&apos;t added anything yet.</p>
        <MagneticButton as={Link} to="/shop" variant="solid">
          Start Shopping <ArrowRight size={16} />
        </MagneticButton>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <h1>Your Cart</h1>

      <div className="cart-page__layout">
        <div className="cart-page__items">
          {items.map((line) => (
            <motion.div
              className="cart-page__line"
              key={line.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Link to={`/product/${line.productId}`} className="cart-page__img">
                <ProductImage src={line.image} alt={line.name} />
              </Link>
              <div className="cart-page__details">
                <Link to={`/product/${line.productId}`} className="cart-page__name">
                  {line.name}
                </Link>
                <span className="cart-page__variant">{[line.color, line.size].filter(Boolean).join(' / ')}</span>
                <span className="cart-page__price-mobile">{formatPrice(line.price)}</span>
              </div>

              <div className="cart-page__qty">
                <div className="cart-page__stepper">
                  <button type="button" onClick={() => updateQty(line.id, line.qty - 1)} aria-label="Decrease quantity">
                    <Minus size={12} />
                  </button>
                  <span>{line.qty}</span>
                  <button type="button" onClick={() => updateQty(line.id, line.qty + 1)} aria-label="Increase quantity">
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              <span className="cart-page__unit-price">{formatPrice(line.price)}</span>
              <span className="cart-page__line-total">{formatPrice(line.price * line.qty)}</span>

              <button type="button" className="cart-page__remove" onClick={() => removeItem(line.id)} aria-label="Remove item">
                <X size={15} />
              </button>
            </motion.div>
          ))}
        </div>

        <aside className="cart-page__summary">
          <h2>Order Summary</h2>
          <div className="cart-page__row">
            <span>Subtotal</span>
            <span>{formatPrice(listSubtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="cart-page__row cart-page__row--discount">
              <span>Discount</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="cart-page__row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
          </div>
          {shipping > 0 && (
            <p className="cart-page__shipnote">
              Add {formatPrice(FREE_SHIPPING_THRESHOLD - discountedSubtotal)} more for free shipping.
            </p>
          )}

          {promo && promoDiscount > 0 && (
            <div className="cart-page__row cart-page__row--discount">
              <span>Promo ({promoCode})</span>
              <span>-{formatPrice(promoDiscount)}</span>
            </div>
          )}

          <div className="cart-page__row cart-page__row--total">
            <span>Estimated Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          {promo ? (
            <div className="cart-page__promo cart-page__promo--applied">
              <span>
                <Check size={13} /> <strong>{promoCode}</strong> applied — {promo.label}
              </span>
              <button type="button" onClick={removePromoCode}>
                Remove
              </button>
            </div>
          ) : (
            <form className="cart-page__promo" onSubmit={handleApplyPromo}>
              <div className="cart-page__promo-input">
                <Tag size={14} />
                <input
                  type="text"
                  placeholder="Promo code"
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value);
                    setPromoError('');
                  }}
                />
              </div>
              <button type="submit">Apply</button>
            </form>
          )}
          {promoError && <p className="cart-page__promo-error">{promoError}</p>}

          <MagneticButton as={Link} to="/checkout" variant="solid" className="cart-page__checkout">
            Checkout <ArrowRight size={16} />
          </MagneticButton>
          <Link to="/shop" className="cart-page__continue">
            Continue Shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
