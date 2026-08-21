import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MagneticButton from '../components/MagneticButton.jsx';
import './Footer.css';

const COLUMNS = [
  {
    title: 'Shop',
    target: '/shop',
    items: [
      { label: 'New Arrivals', target: '/shop?category=New+Arrivals' },
      { label: 'Hoodies', target: '/shop?category=Hoodies' },
      { label: 'Accessories', target: '/shop?category=Accessories' },
      { label: 'Sale', target: '/shop?category=Sale' },
      { label: 'All Products', target: '/shop' },
    ],
  },
  {
    title: 'Company',
    target: '/why-genzwears',
    items: ['About Us', 'Careers', 'Press', 'Wholesale'].map((label) => ({
      label,
      target: label === 'Wholesale' ? '/enterprise' : '/why-genzwears',
    })),
  },
  {
    title: 'Support',
    target: '/account',
    items: [
      { label: 'My Account', target: '/account' },
      { label: 'Track Order', target: '/account' },
      { label: 'Wishlist', target: '/wishlist' },
      { label: 'Cart', target: '/cart' },
    ],
  },
];

export default function Footer() {
  const navigate = useNavigate();

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
          <h2>Ready to find your next favorite piece?</h2>
          <MagneticButton variant="solid" onClick={() => navigate('/shop')}>
            Shop Now
          </MagneticButton>
        </motion.div>

        <div className="footer__grid">
          <div className="footer__brand">
            <span className="footer__logo">GENZ-WEARS</span>
            <p>Heavyweight streetwear essentials, cut for movement — a practice storefront built with React.</p>
          </div>
          {COLUMNS.map((col) => (
            <div className="footer__col" key={col.title}>
              <h5>{col.title}</h5>
              <ul>
                {col.items.map((item) => (
                  <li key={item.label} onClick={() => navigate(item.target ?? col.target)}>
                    {item.label}
                  </li>
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
