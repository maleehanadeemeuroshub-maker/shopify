import { useCallback, useEffect, useState } from 'react';
import { getSeedReviews } from '../utils/reviewSeeds.js';

const STORAGE_KEY = 'genzwears_reviews';

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useProductReviews(product) {
  const [userReviews, setUserReviews] = useState(() => readAll()[product?.id] ?? []);

  useEffect(() => {
    setUserReviews(readAll()[product?.id] ?? []);
  }, [product?.id]);

  const addReview = useCallback(
    (review) => {
      const entry = {
        id: `r_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        date: new Date().toISOString(),
        verified: false,
        ...review,
      };
      setUserReviews((current) => {
        const next = [entry, ...current];
        const all = readAll();
        all[product.id] = next;
        writeAll(all);
        return next;
      });
      return entry;
    },
    [product?.id]
  );

  const seedReviews = product ? getSeedReviews(product) : [];
  const reviews = [...userReviews, ...seedReviews].sort((a, b) => new Date(b.date) - new Date(a.date));

  const count = reviews.length;
  const average = count ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : product?.rating ?? 0;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));

  return { reviews, addReview, count, average, distribution };
}
