import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import ProductImage from './ProductImage.jsx';
import MagneticButton from './MagneticButton.jsx';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../utils/format.js';
import './CartDrawer.css';

export default function CartDrawer() {
  const { items, removeItem, updateQty, subtotal, drawerOpen, closeDrawer } = useCart();

  return createPortal(
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            className="cart-drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeDrawer}
          />
          <motion.aside
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Shopping cart"
          >
            <header className="cart-drawer__header">
              <h2>
                <ShoppingBag size={18} /> Your Cart {items.length > 0 && <span>({items.length})</span>}
              </h2>
              <button type="button" onClick={closeDrawer} aria-label="Close cart" className="cart-drawer__close">
                <X size={18} />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="cart-drawer__empty">
                <ShoppingBag size={34} strokeWidth={1.2} />
                <p>Your cart is empty.</p>
                <MagneticButton as={Link} to="/shop" variant="outline" onClick={closeDrawer}>
                  Start shopping
                </MagneticButton>
              </div>
            ) : (
              <>
                <div className="cart-drawer__items">
                  {items.map((line) => (
                    <div className="cart-line" key={line.id}>
                      <div className="cart-line__img">
                        <ProductImage src={line.image} alt={line.name} />
                      </div>
                      <div className="cart-line__info">
                        <p className="cart-line__name">{line.name}</p>
                        <p className="cart-line__variant">
                          {[line.color, line.size].filter(Boolean).join(' / ')}
                        </p>
                        <div className="cart-line__bottom">
                          <div className="cart-line__stepper">
                            <button type="button" onClick={() => updateQty(line.id, line.qty - 1)} aria-label="Decrease quantity">
                              <Minus size={12} />
                            </button>
                            <span>{line.qty}</span>
                            <button type="button" onClick={() => updateQty(line.id, line.qty + 1)} aria-label="Increase quantity">
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="cart-line__price">{formatPrice(line.price * line.qty)}</span>
                        </div>
                      </div>
                      <button type="button" className="cart-line__remove" onClick={() => removeItem(line.id)} aria-label="Remove item">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <footer className="cart-drawer__footer">
                  <div className="cart-drawer__subtotal">
                    <span>Subtotal</span>
                    <strong>{formatPrice(subtotal)}</strong>
                  </div>
                  <p className="cart-drawer__note">Shipping and taxes calculated at checkout.</p>
                  <div className="cart-drawer__ctas">
                    <MagneticButton as={Link} to="/cart" variant="outline" onClick={closeDrawer}>
                      View Cart
                    </MagneticButton>
                    <MagneticButton as={Link} to="/checkout" variant="solid" onClick={closeDrawer}>
                      Checkout
                    </MagneticButton>
                  </div>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
