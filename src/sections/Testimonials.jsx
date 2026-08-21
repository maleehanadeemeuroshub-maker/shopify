import { motion } from 'framer-motion';
import ProductImage from '../components/ProductImage.jsx';
import StarRating from '../components/StarRating.jsx';
import { TESTIMONIALS } from '../data/testimonials.js';
import './Testimonials.css';

export default function Testimonials() {
  return (
    <section className="testimonials">
      <div className="container">
        <motion.div
          className="testimonials__head"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <span className="eyebrow">Customer stories</span>
          <h2>Loved by the community</h2>
        </motion.div>

        <div className="testimonials__grid">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              className="testimonial-card"
              key={t.name}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <StarRating rating={t.rating} />
              <p>&ldquo;{t.quote}&rdquo;</p>
              <div className="testimonial-card__author">
                <div className="testimonial-card__avatar">
                  <ProductImage src={`https://images.unsplash.com/${t.avatar}?w=100&q=80&auto=format&fit=crop`} alt={t.name} />
                </div>
                <div>
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
