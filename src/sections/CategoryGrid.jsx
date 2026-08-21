import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductImage from '../components/ProductImage.jsx';
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
  return (
    <section className="category-grid">
      <div className="container">
        <motion.div
          className="category-grid__head"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <span className="eyebrow">Shop by category</span>
          <h2>Find your fit</h2>
        </motion.div>

        <div className="category-grid__row">
          {CATEGORY_CARDS.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link to={`/shop?category=${encodeURIComponent(c.category)}`} className="category-card">
                <ProductImage src={`https://images.unsplash.com/${c.image}?w=700&q=80&auto=format&fit=crop`} alt={c.label} />
                <div className="category-card__overlay" />
                <span className="category-card__label">{c.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
