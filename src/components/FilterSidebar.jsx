import { CATEGORIES, ALL_SIZES, ALL_COLORS_LIST } from '../data/products.js';
import './FilterSidebar.css';

export const PRICE_BUCKETS = [
  { id: 'u50', label: 'Under $50', test: (p) => p < 50 },
  { id: '50-100', label: '$50 – $100', test: (p) => p >= 50 && p <= 100 },
  { id: '100-150', label: '$100 – $150', test: (p) => p >= 100 && p <= 150 },
  { id: '150plus', label: '$150+', test: (p) => p > 150 },
];

function FilterGroup({ title, children }) {
  return (
    <div className="filter-group">
      <h4>{title}</h4>
      {children}
    </div>
  );
}

export default function FilterSidebar({ filters, toggle, setInStockOnly, setMinRating, className = '' }) {
  return (
    <aside className={`filter-sidebar ${className}`}>
      <FilterGroup title="Category">
        {CATEGORIES.map((c) => (
          <label className="filter-check" key={c}>
            <input type="checkbox" checked={filters.categories.includes(c)} onChange={() => toggle('categories', c)} />
            <span>{c}</span>
          </label>
        ))}
      </FilterGroup>

      <FilterGroup title="Price">
        {PRICE_BUCKETS.map((b) => (
          <label className="filter-check" key={b.id}>
            <input type="checkbox" checked={filters.price.includes(b.id)} onChange={() => toggle('price', b.id)} />
            <span>{b.label}</span>
          </label>
        ))}
      </FilterGroup>

      <FilterGroup title="Size">
        <div className="filter-chip-grid">
          {ALL_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              className={`filter-chip ${filters.sizes.includes(s) ? 'is-active' : ''}`}
              onClick={() => toggle('sizes', s)}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Color">
        <div className="filter-chip-grid">
          {ALL_COLORS_LIST.map((c) => (
            <button
              key={c}
              type="button"
              className={`filter-chip ${filters.colors.includes(c) ? 'is-active' : ''}`}
              onClick={() => toggle('colors', c)}
            >
              {c}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Rating">
        {[4, 3].map((r) => (
          <label className="filter-check" key={r}>
            <input type="radio" name="rating" checked={filters.minRating === r} onChange={() => setMinRating(filters.minRating === r ? null : r)} />
            <span>{r}★ &amp; up</span>
          </label>
        ))}
      </FilterGroup>

      <FilterGroup title="Availability">
        <label className="filter-check">
          <input type="checkbox" checked={filters.inStockOnly} onChange={() => setInStockOnly(!filters.inStockOnly)} />
          <span>In stock only</span>
        </label>
      </FilterGroup>
    </aside>
  );
}
