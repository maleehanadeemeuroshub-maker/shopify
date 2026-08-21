import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'genzwears_cart';

function lineId(productId, size, color) {
  return `${productId}__${size ?? 'na'}__${color ?? 'na'}`;
}

function readStoredCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, { size, color, qty = 1 } = {}) => {
    const id = lineId(product.id, size, color);
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
  }, []);

  const removeItem = useCallback((id) => {
    setItems((current) => current.filter((line) => line.id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    setItems((current) =>
      qty <= 0 ? current.filter((line) => line.id !== id) : current.map((line) => (line.id === id ? { ...line, qty } : line))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const { subtotal, itemCount } = useMemo(() => {
    return items.reduce(
      (acc, line) => ({
        subtotal: acc.subtotal + line.price * line.qty,
        itemCount: acc.itemCount + line.qty,
      }),
      { subtotal: 0, itemCount: 0 }
    );
  }, [items]);

  const value = useMemo(
    () => ({ items, addItem, removeItem, updateQty, clearCart, subtotal, itemCount, drawerOpen, openDrawer, closeDrawer }),
    [items, addItem, removeItem, updateQty, clearCart, subtotal, itemCount, drawerOpen, openDrawer, closeDrawer]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
