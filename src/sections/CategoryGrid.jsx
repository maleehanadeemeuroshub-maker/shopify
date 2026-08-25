import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import ProductImage from '../components/ProductImage.jsx';
import SplitHeading from '../components/SplitHeading.jsx';
import Marquee from '../components/Marquee.jsx';
import { useProducts } from '../context/ProductsContext.jsx';
import { matchesPill } from '../data/products.js';
import './CategoryGrid.css';

// Distinct from every product photo in src/data/products.js — these are
// category-level lifestyle shots, not tied to any single product's images.
const CATEGORY_CARDS = [
  { label: 'Hoodies', category: 'Hoodies', image: 'photo-1516762689617-e1cffcef479d' },
  { label: 'T-Shirts', category: 'T-Shirts', image: 'photo-1445205170230-053b83016050' },
  { label: 'Jackets', category: 'Jackets', image: 'photo-1495121605193-b116b5b9c5fe' },
  { label: 'Accessories', category: 'Accessories', image: 'photo-1523381210434-271e8be1f52b' },
];

export default function CategoryGrid() {
  const { products } = useProducts();
  const counts = useMemo(
    () =>
      Object.fromEntries(
        CATEGORY_CARDS.map((c) => [c.category, products.filter((p) => matchesPill(p, c.category)).length])
      ),
    [products]
  );

  return (
    <section className="category-grid">
      <div className="container">
        <div className="category-grid__head">
          <SplitHeading eyebrow="Shop by category">Find your fit</SplitHeading>
        </div>
      </div>

      <Marquee
        className="category-grid__marquee"
        itemClassName="marquee__item--card"
        speed={32}
        gap={20}
        separator={null}
        items={CATEGORY_CARDS.map((c) => (
          <Link to={`/shop?category=${encodeURIComponent(c.category)}`} className="category-card" key={c.label}>
            <div className="category-card__parallax">
              <ProductImage src={`https://images.unsplash.com/${c.image}?w=700&q=80&auto=format&fit=crop`} alt={c.label} />
            </div>
            <div className="category-card__overlay" />
            <span className="category-card__label">{c.label}</span>
            <span className="category-card__count">{counts[c.category] ?? 0} pieces</span>
          </Link>
        ))}
      />
    </section>
  );
}
