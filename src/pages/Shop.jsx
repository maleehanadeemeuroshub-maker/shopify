import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import FilterSidebar, { PRICE_BUCKETS } from '../components/FilterSidebar.jsx';
import { SHOP_PILLS, matchesPill } from '../data/products.js';
import { useProducts } from '../context/ProductsContext.jsx';
import './Shop.css';

const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'bestselling', label: 'Best Selling' },
  { id: 'rating', label: 'Highest Rated' },
];

const EMPTY_FILTERS = { categories: [], price: [], sizes: [], colors: [] };

function sortProducts(list, sort) {
  const sorted = [...list];
  switch (sort) {
    case 'newest':
      return sorted.sort((a, b) => (b.isNew === a.isNew ? b.numericId - a.numericId : b.isNew ? 1 : -1));
    case 'price-asc':
      return sorted.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    case 'price-desc':
      return sorted.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    case 'bestselling':
      return sorted.sort((a, b) => b.reviews - a.reviews);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'featured':
    default:
      return sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

export default function Shop() {
  const { products } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const pill = searchParams.get('category') || 'All';
  const query = searchParams.get('q') || '';

  const [sort, setSort] = useState(() =>
    SORT_OPTIONS.some((o) => o.id === searchParams.get('sort')) ? searchParams.get('sort') : 'featured'
  );
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const setPill = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'All') next.delete('category');
    else next.set('category', value);
    setSearchParams(next);
  };

  const toggleFilter = (type, value) => {
    setFilters((current) => {
      const set = current[type].includes(value) ? current[type].filter((v) => v !== value) : [...current[type], value];
      return { ...current, [type]: set };
    });
  };

  const clearAll = () => {
    setFilters(EMPTY_FILTERS);
    setInStockOnly(false);
    setMinRating(null);
    if (query) {
      const next = new URLSearchParams(searchParams);
      next.delete('q');
      setSearchParams(next);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => matchesPill(p, pill));

    if (q) {
      list = list.filter((p) =>
        [p.name, p.category, p.subcategory, p.description, p.shortDescription, ...(p.tags ?? [])]
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }
    if (filters.categories.length) list = list.filter((p) => filters.categories.includes(p.category));
    if (filters.price.length) {
      list = list.filter((p) => {
        const price = p.salePrice ?? p.price;
        return filters.price.some((id) => PRICE_BUCKETS.find((b) => b.id === id)?.test(price));
      });
    }
    if (filters.sizes.length) list = list.filter((p) => p.sizes.some((s) => filters.sizes.includes(s)));
    if (filters.colors.length) list = list.filter((p) => p.colors.some((c) => filters.colors.includes(c)));
    if (minRating) list = list.filter((p) => p.rating >= minRating);
    if (inStockOnly) list = list.filter((p) => p.stock > 0);

    return sortProducts(list, sort);
  }, [products, pill, query, filters, minRating, inStockOnly, sort]);

  const activeChips = [
    ...filters.categories.map((v) => ({ type: 'categories', value: v, label: v })),
    ...filters.price.map((v) => ({ type: 'price', value: v, label: PRICE_BUCKETS.find((b) => b.id === v)?.label })),
    ...filters.sizes.map((v) => ({ type: 'sizes', value: v, label: `Size ${v}` })),
    ...filters.colors.map((v) => ({ type: 'colors', value: v, label: v })),
    ...(minRating ? [{ type: 'rating', value: minRating, label: `${minRating}★ & up` }] : []),
    ...(inStockOnly ? [{ type: 'stock', value: true, label: 'In stock only' }] : []),
    ...(query ? [{ type: 'query', value: query, label: `“${query}”` }] : []),
  ];

  const removeChip = (chip) => {
    if (chip.type === 'rating') setMinRating(null);
    else if (chip.type === 'stock') setInStockOnly(false);
    else if (chip.type === 'query') {
      const next = new URLSearchParams(searchParams);
      next.delete('q');
      setSearchParams(next);
    } else toggleFilter(chip.type, chip.value);
  };

  return (
    <div className="shop-page">
      <div className="shop-hero container">
        <span className="eyebrow">Catalog</span>
        <h1>Shop All</h1>
        <p>Explore our latest collection.</p>
      </div>

      <div className="shop-pills container">
        {SHOP_PILLS.map((p) => (
          <button key={p} type="button" className={`shop-pill ${pill === p ? 'is-active' : ''}`} onClick={() => setPill(p)}>
            {p}
          </button>
        ))}
      </div>

      <div className="shop-toolbar container">
        <button type="button" className="shop-toolbar__filters" onClick={() => setMobileFiltersOpen(true)}>
          <SlidersHorizontal size={15} /> Filters
        </button>

        <span className="shop-toolbar__count">{filtered.length} products</span>

        <div className="shop-sort">
          <button type="button" className="shop-sort__trigger" onClick={() => setSortOpen((v) => !v)}>
            Sort: {SORT_OPTIONS.find((o) => o.id === sort)?.label} <ChevronDown size={13} />
          </button>
          <AnimatePresence>
            {sortOpen && (
              <motion.div
                className="shop-sort__menu"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className={o.id === sort ? 'is-active' : ''}
                    onClick={() => {
                      setSort(o.id);
                      setSortOpen(false);
                    }}
                  >
                    {o.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="shop-chips container">
          {activeChips.map((chip) => (
            <button key={`${chip.type}-${chip.value}`} type="button" className="shop-chip" onClick={() => removeChip(chip)}>
              {chip.label} <X size={12} />
            </button>
          ))}
          <button type="button" className="shop-chip shop-chip--clear" onClick={clearAll}>
            Clear All
          </button>
        </div>
      )}

      <div className="shop-layout container">
        <FilterSidebar
          className="shop-layout__sidebar"
          filters={{ ...filters, inStockOnly, minRating }}
          toggle={toggleFilter}
          setInStockOnly={setInStockOnly}
          setMinRating={setMinRating}
        />

        <div className="shop-layout__results">
          {filtered.length === 0 ? (
            <div className="shop-empty">
              <p>No products match your filters.</p>
              <button type="button" onClick={clearAll}>
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="shop-grid">
              {filtered.map((product) => (
                <ProductCard product={product} key={product.id} />
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              className="shop-mobile-filters-scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              className="shop-mobile-filters"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="shop-mobile-filters__head">
                <h3>Filters</h3>
                <button type="button" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
                  <X size={18} />
                </button>
              </div>
              <FilterSidebar
                filters={{ ...filters, inStockOnly, minRating }}
                toggle={toggleFilter}
                setInStockOnly={setInStockOnly}
                setMinRating={setMinRating}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
