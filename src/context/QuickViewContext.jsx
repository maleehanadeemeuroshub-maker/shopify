import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const QuickViewContext = createContext(null);

export function QuickViewProvider({ children }) {
  const [productId, setProductId] = useState(null);

  const open = useCallback((id) => setProductId(id), []);
  const close = useCallback(() => setProductId(null), []);

  const value = useMemo(() => ({ productId, open, close }), [productId, open, close]);

  return <QuickViewContext.Provider value={value}>{children}</QuickViewContext.Provider>;
}

export function useQuickView() {
  const ctx = useContext(QuickViewContext);
  if (!ctx) throw new Error('useQuickView must be used within a QuickViewProvider');
  return ctx;
}
