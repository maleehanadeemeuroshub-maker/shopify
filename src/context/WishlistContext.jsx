import { createContext, useCallback, useContext, useMemo } from 'react';
import { useLocalStorageState } from '../hooks/useLocalStorageState.js';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'genzwears_wishlist';

export function WishlistProvider({ children }) {
  const [ids, setIds] = useLocalStorageState(STORAGE_KEY, []);

  const has = useCallback((id) => ids.includes(id), [ids]);

  const toggle = useCallback((id) => {
    setIds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  }, []);

  const remove = useCallback((id) => {
    setIds((current) => current.filter((x) => x !== id));
  }, []);

  const value = useMemo(() => ({ ids, has, toggle, remove, count: ids.length }), [ids, has, toggle, remove]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider');
  return ctx;
}
