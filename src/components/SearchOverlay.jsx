import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { ArrowRight, Search, SearchX, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductImage from './ProductImage.jsx';
import { PRODUCTS } from '../data/products.js';
import { formatPrice } from '../utils/format.js';
import './SearchOverlay.css';

function searchProducts(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PRODUCTS.filter((p) => {
    const haystack = [p.name, p.category, p.subcategory, p.description, p.shortDescription, ...(p.tags ?? [])]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  }).slice(0, 6);
}

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // The input itself always reflects `query` immediately; only the (more
  // expensive) results computation is deferred, so typing stays responsive
  // under load without changing what results eventually render.
  const deferredQuery = useDeferredValue(query);
  const results = useMemo(() => searchProducts(deferredQuery), [deferredQuery]);

  useEffect(() => {
    if (open) {
      setQuery('');
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const goToResults = () => {
    if (!query.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="search-overlay-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.div
            className="search-overlay"
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="search-overlay__bar container">
              <Search size={18} className="search-overlay__icon" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, categories, tags…"
                onKeyDown={(e) => e.key === 'Enter' && goToResults()}
              />
              <button type="button" className="search-overlay__close" onClick={onClose} aria-label="Close search">
                <X size={18} />
              </button>
            </div>

            {query.trim() && (
              <div className="search-overlay__results container">
                {results.length > 0 ? (
                  <>
                    <div className="search-overlay__grid">
                      {results.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="search-result"
                          onClick={() => {
                            navigate(`/product/${p.id}`);
                            onClose();
                          }}
                        >
                          <div className="search-result__img">
                            <ProductImage src={p.images[0]} alt={p.name} />
                          </div>
                          <div className="search-result__info">
                            <span className="search-result__category">{p.category}</span>
                            <span className="search-result__name">{p.name}</span>
                            <span className="search-result__price">{formatPrice(p.salePrice ?? p.price)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <button type="button" className="search-overlay__viewall" onClick={goToResults}>
                      View all results for &ldquo;{query}&rdquo; <ArrowRight size={14} />
                    </button>
                  </>
                ) : (
                  <div className="search-overlay__empty">
                    <SearchX size={26} strokeWidth={1.3} />
                    <p>No products found for &ldquo;{query}&rdquo;</p>
                    <span>Try a different name, category, or tag.</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
