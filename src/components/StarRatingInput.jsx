import { useState } from 'react';
import { Star } from 'lucide-react';
import './StarRatingInput.css';

export default function StarRatingInput({ value, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="star-rating-input" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={n <= (hover || value) ? 'is-filled' : ''}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Star size={22} strokeWidth={1.4} fill={n <= (hover || value) ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}
