import { motion } from 'framer-motion';
import MagneticButton from '../components/MagneticButton.jsx';
import './Footer.css';

const COLUMNS = [
  { title: 'Product', items: ['Website Builder', 'Themes', 'Checkout', 'Sidekick AI'] },
  { title: 'Company', items: ['About', 'Careers', 'Press', 'Partners'] },
  { title: 'Resources', items: ['Docs', 'API', 'Community', 'Support'] },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__glow" aria-hidden="true" />
      <div className="container">
        <motion.div
          className="footer__cta"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2>Ready to be the next store they line up for?</h2>
          <MagneticButton variant="solid">Start for free</MagneticButton>
        </motion.div>

        <div className="footer__grid">
          <div className="footer__brand">
            <span className="footer__logo">GENZ-WEARS</span>
            <p>The world&apos;s best commerce platform, engineered for the next generation of brands.</p>
          </div>
          {COLUMNS.map((col) => (
            <div className="footer__col" key={col.title}>
              <h5>{col.title}</h5>
              <ul>
                {col.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer__bottom">
          <span>&copy; 2026 GENZ-WEARS, Inc.</span>
          <span>Built for the next generation.</span>
        </div>
      </div>
    </footer>
  );
}
