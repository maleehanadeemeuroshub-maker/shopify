import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './PromoBanner.css';

export default function PromoBanner() {
  return (
    <section className="promo-banner">
      <div className="promo-banner__glow" aria-hidden="true" />
      <motion.div
        className="container promo-banner__inner"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="eyebrow">Limited time</span>
        <h2>Up to 30% off selected styles</h2>
        <p>Seasonal markdowns on hoodies, jackets, and denim — while stock lasts.</p>
        <Link to="/shop?category=Sale" className="promo-banner__cta">
          Shop the Sale <ArrowRight size={16} />
        </Link>
      </motion.div>
    </section>
  );
}
