import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { PRODUCTS as SEED_PRODUCTS } from '../data/products.js';
import { productsApi } from '../lib/api.js';

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  // Seeded with the static catalog so the storefront renders real product
  // data immediately — never a blank/loading screen — then swaps to the
  // live database-backed catalog (which includes seller-added products)
  // once the fetch resolves.
  const [products, setProducts] = useState(SEED_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    productsApi.list().then((res) => {
      if (cancelled) return;
      if (res.ok && res.products.length > 0) setProducts(res.products);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => {
    const allSizes = Array.from(new Set(products.flatMap((p) => p.sizes)));
    const allColors = Array.from(new Set(products.flatMap((p) => p.colors)));
    const getProductById = (id) => products.find((p) => p.id === id);
    const getRelatedProducts = (product, limit = 4) =>
      products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, limit);

    return { products, loading, allSizes, allColors, getProductById, getRelatedProducts };
  }, [products, loading]);

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within a ProductsProvider');
  return ctx;
}
