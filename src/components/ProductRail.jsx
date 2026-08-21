import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard.jsx';
import './ProductRail.css';

export default function ProductRail({ eyebrow, title, subtitle, products, viewAllHref = '/shop' }) {
  if (!products.length) return null;

  return (
    <section className="product-rail">
      <div className="container">
        <motion.div
          className="product-rail__head"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h2 className="product-rail__title">{title}</h2>
            {subtitle && <p className="product-rail__subtitle">{subtitle}</p>}
          </div>
          <Link to={viewAllHref} className="product-rail__viewall">
            View all <ArrowRight size={15} />
          </Link>
        </motion.div>

        <div className="product-rail__grid">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: (i % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
