import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient.js';
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

// `||` (not `??`) on purpose — both a missing selector (null/undefined) and
// a DB-loaded row's '' placeholder (see schema.sql) must collapse to the
// same "na" id, or a product with no size/color options would get a
// different line id locally vs. after reloading from the cart_items table.
function lineId(productId, size, color) {
  return `${productId}__${size || 'na'}__${color || 'na'}`;
}

// Applies the (product_id, size, color) match to a cart_items query builder.
// size/color are stored as '' (not null) for no-selection lines — see the
// column comment in supabase/schema.sql for why.
function matchLine(query, { productId, size, color }) {
  return query.eq('product_id', productId).eq('size', size ?? '').eq('color', color ?? '');
}

async function ensureCart(userId) {
  const { data: existing } = await supabase.from('carts').select('id').eq('user_id', userId).maybeSingle();
  if (existing) return existing.id;
  const { data: created, error } = await supabase.from('carts').insert({ user_id: userId }).select('id').single();
  if (error) throw error;
  return created.id;
}

async function fetchCartItemsFromDb(cartId) {
  const { data, error } = await supabase
    .from('cart_items')
    .select('product_id, size, color, qty, products(name, images, price, sale_price)')
    .eq('cart_id', cartId);
  if (error) throw error;
  return (data ?? [])
    .filter((row) => row.products) // product may have been deleted since it was added
    .map((row) => ({
      id: lineId(row.product_id, row.size, row.color),
      productId: row.product_id,
      name: row.products.name,
      image: row.products.images?.[0],
      price: row.products.sale_price ?? row.products.price,
      originalPrice: row.products.price,
      size: row.size,
      color: row.color,
      qty: row.qty,
    }));
}

async function upsertCartItem(cartId, { productId, size, color, qty }) {
  const { error } = await supabase
    .from('cart_items')
    .upsert(
      { cart_id: cartId, product_id: productId, size: size ?? '', color: color ?? '', qty, updated_at: new Date().toISOString() },
      { onConflict: 'cart_id,product_id,size,color' }
    );
  if (error) throw error;
}

async function deleteCartItem(cartId, line) {
  const { error } = await matchLine(supabase.from('cart_items').delete().eq('cart_id', cartId), line);
  if (error) throw error;
}

async function clearCartItems(cartId) {
  const { error } = await supabase.from('cart_items').delete().eq('cart_id', cartId);
  if (error) throw error;
}

export function CartProvider({ children }) {
  const [items, setItems] = useLocalStorageState(STORAGE_KEY, []);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  // Stored as a raw string (not JSON) for backward compatibility with
  // already-saved promo codes, so it keeps its own read/write effect
  // instead of useLocalStorageState (which round-trips through JSON).
  const [promoCode, setPromoCode] = useState(() => localStorage.getItem(PROMO_STORAGE_KEY) || null);
  const { user } = useAuth();
  const { showToast } = useToast();

  const cartIdRef = useRef(null);
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    if (promoCode) localStorage.setItem(PROMO_STORAGE_KEY, promoCode);
    else localStorage.removeItem(PROMO_STORAGE_KEY);
  }, [promoCode]);

  // Loads (and, for genuinely new guest-added lines, merges) the
  // Supabase-backed cart whenever a session is present — on login, and on
  // every page refresh (session restore). Only line items that don't
  // already exist in the DB cart are carried over from localStorage, so
  // repeated syncs (e.g. refreshing while logged in) never double a
  // quantity that's already stored server-side.
  useEffect(() => {
    if (!user) {
      cartIdRef.current = null;
      return undefined;
    }

    let cancelled = false;
    setSyncing(true);
    setSyncError(null);

    (async () => {
      const cartId = await ensureCart(user.id);
      if (cancelled) return;

      const guestItems = itemsRef.current;
      for (const line of guestItems) {
        const { data: existingRow } = await matchLine(
          supabase.from('cart_items').select('id').eq('cart_id', cartId),
          line
        ).maybeSingle();
        if (!existingRow) {
          await upsertCartItem(cartId, { productId: line.productId, size: line.size, color: line.color, qty: line.qty });
        }
      }

      const dbItems = await fetchCartItemsFromDb(cartId);
      if (cancelled) return;
      cartIdRef.current = cartId;
      setItems(dbItems);
    })()
      .catch((err) => {
        console.error('[cart] failed to sync with account:', err.message);
        if (!cancelled) setSyncError('Could not load your saved cart. Showing what was on this device.');
      })
      .finally(() => {
        if (!cancelled) setSyncing(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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

  const syncWrite = useCallback((fn) => {
    if (!cartIdRef.current) return;
    fn(cartIdRef.current).catch((err) => {
      console.error('[cart] failed to sync change:', err.message);
      setSyncError("Your cart changed here, but we couldn't save it to your account. It may not persist across devices.");
    });
  }, []);

  const addItem = useCallback(
    (product, { size, color, qty = 1 } = {}) => {
      const id = lineId(product.id, size, color);
      // Decided outside the setState updater on purpose: updater functions
      // can run more than once (React StrictMode double-invokes them in
      // dev), and this flag gates a real network call — it must not fire twice.
      const isNewLine = !items.some((line) => line.id === id);
      const existingLine = items.find((line) => line.id === id);
      const nextQty = (existingLine?.qty ?? 0) + qty;

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

      syncWrite((cartId) => upsertCartItem(cartId, { productId: product.id, size, color, qty: nextQty }));

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
    [items, user, subtotal, itemCount, showToast, syncWrite]
  );

  const removeItem = useCallback(
    (id) => {
      const line = items.find((l) => l.id === id);
      setItems((current) => current.filter((l) => l.id !== id));
      if (line) syncWrite((cartId) => deleteCartItem(cartId, line));
    },
    [items, syncWrite]
  );

  const updateQty = useCallback(
    (id, qty) => {
      const line = items.find((l) => l.id === id);
      setItems((current) =>
        qty <= 0 ? current.filter((l) => l.id !== id) : current.map((l) => (l.id === id ? { ...l, qty } : l))
      );
      if (line) {
        syncWrite((cartId) => (qty <= 0 ? deleteCartItem(cartId, line) : upsertCartItem(cartId, { productId: line.productId, size: line.size, color: line.color, qty })));
      }
    },
    [items, syncWrite]
  );

  const clearCart = useCallback(() => {
    syncWrite((cartId) => clearCartItems(cartId));
    setItems([]);
    setPromoCode(null);
  }, [syncWrite]);

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
      syncing,
      syncError,
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
      syncing,
      syncError,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
