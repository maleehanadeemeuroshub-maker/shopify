import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { emailApi } from '../lib/api.js';
import { getPromoCode } from '../utils/cartMath.js';
import { useLocalStorageState } from '../hooks/useLocalStorageState.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';

const CartContext = createContext(null);
const STORAGE_KEY = 'genzwears_cart';
const PROMO_STORAGE_KEY = 'genzwears_promo';

// Shortened for demo purposes — a real store would wait hours, not minutes,
// before treating a cart as abandoned.
const ABANDONED_CART_DELAY_MS = 2 * 60 * 1000;

function lineId(productId, size, color) {
  return `${productId}__${size ?? 'na'}__${color ?? 'na'}`;
}

export function CartProvider({ children }) {
  const [items, setItems] = useLocalStorageState(STORAGE_KEY, []);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Stored as a raw string (not JSON) for backward compatibility with
  // already-saved promo codes, so it keeps its own read/write effect
  // instead of useLocalStorageState (which round-trips through JSON).
  const [promoCode, setPromoCode] = useState(() => localStorage.getItem(PROMO_STORAGE_KEY) || null);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (promoCode) localStorage.setItem(PROMO_STORAGE_KEY, promoCode);
    else localStorage.removeItem(PROMO_STORAGE_KEY);
  }, [promoCode]);

  const { subtotal, itemCount } = useMemo(() => {
    return items.reduce(
      (acc, line) => ({
        subtotal: acc.subtotal + line.price * line.qty,
        itemCount: acc.itemCount + line.qty,
      }),
      { subtotal: 0, itemCount: 0 }
    );
  }, [items]);

  // Abandoned-cart watcher: fires once per non-empty cart, only after the
  // cart has sat untouched for ABANDONED_CART_DELAY_MS. Any cart edit
  // (add/remove/qty change) restarts the countdown; emptying the cart
  // (including a completed checkout, which calls clearCart) cancels it and
  // re-arms the "once per cart" gate for next time.
  const abandonedFiredRef = useRef(false);
  useEffect(() => {
    if (items.length === 0) {
      abandonedFiredRef.current = false;
      return undefined;
    }
    if (!user || abandonedFiredRef.current) return undefined;

    const timer = window.setTimeout(() => {
      abandonedFiredRef.current = true;
      emailApi.abandonedCart({
        name: user.name,
        email: user.email,
        items: items.map((l) => ({ name: l.name, image: l.image, color: l.color, size: l.size, price: l.price, qty: l.qty })),
        cartTotal: subtotal,
      });
    }, ABANDONED_CART_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [items, user, subtotal]);

  const addItem = useCallback(
    (product, { size, color, qty = 1 } = {}) => {
      const id = lineId(product.id, size, color);
      // Decided outside the setState updater on purpose: updater functions
      // can run more than once (React StrictMode double-invokes them in
      // dev), and this flag gates a real network call — it must not fire twice.
      const isNewLine = !items.some((line) => line.id === id);

      setItems((current) => {
        const existing = current.find((line) => line.id === id);
        if (existing) {
          return current.map((line) => (line.id === id ? { ...line, qty: line.qty + qty } : line));
        }
        return [
          ...current,
          {
            id,
            productId: product.id,
            name: product.name,
            image: product.images?.[0],
            price: product.salePrice ?? product.price,
            originalPrice: product.price,
            size: size ?? null,
            color: color ?? null,
            qty,
          },
        ];
      });
      setDrawerOpen(true);

      // One cart email per newly-added line — never on a quantity bump of
      // something already in the cart, and only for logged-in users (we
      // need a real address to send to).
      if (isNewLine && user) {
        const unitPrice = product.salePrice ?? product.price;
        emailApi.cart({
          name: user.name,
          email: user.email,
          product: { name: product.name, image: product.images?.[0], price: unitPrice, qty, size, color },
          cartSubtotal: subtotal + unitPrice * qty,
          itemCount: itemCount + qty,
        });
        showToast("Added to cart. We've sent you a confirmation email.");
      }
    },
    [items, user, subtotal, itemCount, showToast]
  );

  const removeItem = useCallback((id) => {
    setItems((current) => current.filter((line) => line.id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    setItems((current) =>
      qty <= 0 ? current.filter((line) => line.id !== id) : current.map((line) => (line.id === id ? { ...line, qty } : line))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setPromoCode(null);
  }, []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const applyPromoCode = useCallback((code) => {
    const promo = getPromoCode(code);
    if (!promo) return { ok: false, message: 'That code is not valid.' };
    setPromoCode(code.trim().toUpperCase());
    return { ok: true, message: promo.label };
  }, []);

  const removePromoCode = useCallback(() => setPromoCode(null), []);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      subtotal,
      itemCount,
      drawerOpen,
      openDrawer,
      closeDrawer,
      promoCode,
      applyPromoCode,
      removePromoCode,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQty,
      clearCart,
      subtotal,
      itemCount,
      drawerOpen,
      openDrawer,
      closeDrawer,
      promoCode,
      applyPromoCode,
      removePromoCode,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
