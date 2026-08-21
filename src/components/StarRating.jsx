import { Star } from 'lucide-react';
import './StarRating.css';

export default function StarRating({ rating = 0, reviews, size = 13, showValue = false }) {
  return (
    <div className="star-rating">
      <div className="star-rating__stars">
        {Array.from({ length: 5 }).map((_, i) => {
          const fillPercent = Math.max(0, Math.min(1, rating - i)) * 100;
          return (
            <span className="star-rating__star" key={i} style={{ width: size, height: size }}>
              <Star size={size} strokeWidth={1.4} className="star-rating__base" />
              <span className="star-rating__fill" style={{ width: `${fillPercent}%` }}>
                <Star size={size} strokeWidth={1.4} fill="currentColor" />
              </span>
            </span>
          );
        })}
      </div>
      {showValue && <span className="star-rating__value">{rating.toFixed(1)}</span>}
      {typeof reviews === 'number' && <span className="star-rating__reviews">({reviews})</span>}
    </div>
  );
}
