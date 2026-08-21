import { Minus, Plus } from 'lucide-react';
import './ProductSelectors.css';

const COLOR_SWATCH = {
  Black: '#111214',
  White: '#f2f2ee',
  Stone: '#c9beac',
  Olive: '#5a5f3f',
  Navy: '#22293e',
};

export function ColorSelector({ colors, value, onChange }) {
  return (
    <div className="selector">
      <span className="selector__label">
        Color{value ? <em> — {value}</em> : null}
      </span>
      <div className="selector__swatches">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            className={`color-swatch ${value === color ? 'is-active' : ''}`}
            style={{ background: COLOR_SWATCH[color] ?? '#888' }}
            onClick={() => onChange(color)}
            aria-label={color}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}

export function SizeSelector({ sizes, value, onChange, onSizeGuide }) {
  return (
    <div className="selector">
      <span className="selector__label selector__label--row">
        Size
        {onSizeGuide && (
          <button type="button" className="selector__guide-link" onClick={onSizeGuide}>
            Size guide
          </button>
        )}
      </span>
      <div className="selector__sizes">
        {sizes.map((size) => (
          <button
            key={size}
            type="button"
            className={`size-chip ${value === size ? 'is-active' : ''}`}
            onClick={() => onChange(size)}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}

export function QuantitySelector({ value, onChange, max }) {
  return (
    <div className="selector">
      <span className="selector__label">Quantity</span>
      <div className="qty-stepper">
        <button type="button" onClick={() => onChange(Math.max(1, value - 1))} aria-label="Decrease quantity">
          <Minus size={13} />
        </button>
        <span>{value}</span>
        <button
          type="button"
          onClick={() => onChange(max ? Math.min(max, value + 1) : value + 1)}
          aria-label="Increase quantity"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}
