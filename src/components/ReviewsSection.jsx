import { useState } from 'react';
import { MessageSquarePlus, ShieldCheck } from 'lucide-react';
import StarRating from './StarRating.jsx';
import StarRatingInput from './StarRatingInput.jsx';
import { useProductReviews } from '../hooks/useProductReviews.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import './ReviewsSection.css';

function formatReviewDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ReviewsSection({ product }) {
  const { reviews, addReview, count, average, distribution } = useProductReviews(product);
  const { user } = useAuth();
  const { showToast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: user?.name ?? '', rating: 0, title: '', body: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.rating) {
      setError('Please select a star rating.');
      return;
    }
    if (!form.name.trim() || !form.title.trim() || !form.body.trim()) {
      setError('Please fill out every field.');
      return;
    }

    addReview({ name: form.name.trim(), rating: form.rating, title: form.title.trim(), body: form.body.trim() });
    setForm({ name: user?.name ?? '', rating: 0, title: '', body: '' });
    setError('');
    setFormOpen(false);
    showToast('Thanks — your review has been posted.');
  };

  const maxCount = Math.max(1, ...distribution.map((d) => d.count));

  return (
    <section className="reviews-section" id="reviews">
      <div className="reviews-section__head">
        <h2>Customer Reviews</h2>
        <button type="button" className="reviews-section__write-btn" onClick={() => setFormOpen((o) => !o)}>
          <MessageSquarePlus size={15} /> {formOpen ? 'Cancel' : 'Write a Review'}
        </button>
      </div>

      <div className="reviews-section__summary">
        <div className="reviews-section__avg">
          <strong>{average.toFixed(1)}</strong>
          <StarRating rating={average} size={16} />
          <span>
            {count} review{count === 1 ? '' : 's'}
          </span>
        </div>
        <div className="reviews-section__bars">
          {distribution.map((d) => (
            <div className="reviews-section__bar-row" key={d.star}>
              <span>{d.star}★</span>
              <div className="reviews-section__bar">
                <div className="reviews-section__bar-fill" style={{ width: `${(d.count / maxCount) * 100}%` }} />
              </div>
              <span>{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {formOpen && (
        <form className="reviews-section__form" onSubmit={handleSubmit}>
          <label>
            <span>Your rating</span>
            <StarRatingInput value={form.rating} onChange={(rating) => setForm((f) => ({ ...f, rating }))} />
          </label>
          <label>
            <span>Your name</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Jordan M."
            />
          </label>
          <label>
            <span>Review title</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Sum it up in a few words"
            />
          </label>
          <label>
            <span>Your review</span>
            <textarea
              rows={4}
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="What did you like or dislike?"
            />
          </label>
          {error && <p className="reviews-section__error">{error}</p>}
          <button type="submit" className="reviews-section__submit">
            Post Review
          </button>
        </form>
      )}

      <div className="reviews-section__list">
        {reviews.map((r) => (
          <div className="reviews-section__item" key={r.id}>
            <div className="reviews-section__item-head">
              <StarRating rating={r.rating} size={13} />
              {r.verified && (
                <span className="reviews-section__verified">
                  <ShieldCheck size={12} /> Verified Purchase
                </span>
              )}
            </div>
            <h3>{r.title}</h3>
            <p>{r.body}</p>
            <div className="reviews-section__item-meta">
              <span>{r.name}</span>
              <span>{formatReviewDate(r.date)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
