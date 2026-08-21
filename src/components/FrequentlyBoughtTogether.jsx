import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Plus, ShoppingBag } from 'lucide-react';
import ProductImage from './ProductImage.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatPrice } from '../utils/format.js';
import './FrequentlyBoughtTogether.css';

export default function FrequentlyBoughtTogether({ mainProduct, suggestions }) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const items = useMemo(() => [mainProduct, ...suggestions], [mainProduct, suggestions]);
  const [selected, setSelected] = useState(() => new Set(items.map((p) => p.id)));

  if (suggestions.length === 0) return null;

  const toggle = (id) => {
    if (id === mainProduct.id) return;
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedItems = items.filter((p) => selected.has(p.id));
  const total = selectedItems.reduce((sum, p) => sum + (p.salePrice ?? p.price), 0);

  const handleAddAll = () => {
    selectedItems.forEach((p) => addItem(p, { size: p.sizes[0], color: p.colors[0], qty: 1 }));
    showToast(`Added ${selectedItems.length} item${selectedItems.length === 1 ? '' : 's'} to your cart.`);
  };

  return (
    <section className="fbt">
      <h2>Frequently Bought Together</h2>
      <div className="fbt__row">
        {items.map((p, i) => (
          <div className="fbt__item-wrap" key={p.id}>
            {i > 0 && <Plus size={16} className="fbt__plus" />}
            <label
              className={`fbt__item ${selected.has(p.id) ? 'is-selected' : ''} ${p.id === mainProduct.id ? 'is-main' : ''}`}
            >
              <input
                type="checkbox"
                checked={selected.has(p.id)}
                onChange={() => toggle(p.id)}
                disabled={p.id === mainProduct.id}
              />
              <span className="fbt__check">{selected.has(p.id) && <Check size={11} />}</span>
              <Link to={`/product/${p.id}`} className="fbt__thumb" onClick={(e) => e.stopPropagation()}>
                <ProductImage src={p.images[0]} alt={p.name} />
              </Link>
              <span className="fbt__name">{p.name}</span>
              <span className="fbt__price">{formatPrice(p.salePrice ?? p.price)}</span>
            </label>
          </div>
        ))}
      </div>

      <div className="fbt__footer">
        <div>
          <span>
            Total for {selectedItems.length} item{selectedItems.length === 1 ? '' : 's'}
          </span>
          <strong>{formatPrice(total)}</strong>
        </div>
        <button type="button" className="fbt__add-btn" onClick={handleAddAll} disabled={selectedItems.length === 0}>
          <ShoppingBag size={15} /> Add Selected to Cart
        </button>
      </div>
    </section>
  );
}
