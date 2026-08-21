import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import MagneticButton from './MagneticButton.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import './Navbar.css';

const MEGA_COLUMNS = [
  {
    title: 'BUILD YOUR STORE',
    items: ['Website Builder', 'Themes', 'Domains', 'Customer Accounts', 'Sidekick AI'],
  },
  {
    title: 'SELL ANYWHERE',
    items: ['Online', 'AI Chats', 'Point of Sale', 'Shop App', 'Social & Marketplaces', 'Global'],
  },
  {
    title: 'MARKETING & DATA',
    items: ['Campaigns', 'Email & Chat', 'Discounts', 'Analytics', 'Test & Launch'],
  },
];

export default function Navbar() {
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);
  const { openAuth } = useModal();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const goToFeatures = () => navigate('/#features');

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <motion.header
      className={`navbar ${solid ? 'navbar--solid' : ''}`}
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
    >
      <div className="navbar__inner" ref={navRef}>
        <Link className="navbar__logo" to="/">
          <span className="navbar__mark">
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill="#ffffff" d="M100 12C140 12 180 45 180 92C180 130 155 152 128 168C128 168 130 140 118 118C118 118 148 108 148 78C148 50 126 30 100 30L100 12Z" />
              <path fill="#ffffff" d="M100 12C60 12 20 45 20 92C20 130 45 152 72 168C72 168 70 140 82 118C82 118 52 108 52 78C52 50 74 30 100 30L100 12Z" />
              <path fill="#ffffff" d="M40 96L100 62L160 96L136 96L100 76L64 96Z" />
              <path fill="#ffffff" d="M62 96C62 96 72 150 100 178C128 150 138 96 138 96L118 96C118 96 112 130 100 148C88 130 82 96 82 96Z" />
            </svg>
          </span>
          GENZ-WEARS
        </Link>

        <nav className="navbar__links">
          <Link className="navitem" to="/why-genzwears">
            Why GENZ-WEARS <ChevronDown size={12} strokeWidth={2} />
          </Link>
          <button
            className={`navitem ${menuOpen ? 'navitem--open' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            type="button"
          >
            Products <ChevronDown size={12} strokeWidth={2} />
          </button>
          <Link className="navitem" to="/pricing">
            Pricing
          </Link>
          <Link className="navitem" to="/enterprise">
            Enterprise
          </Link>
          <div className="navbar__badge">
            <span className="navbar__badge-dot" /> Spring &apos;26 Edition
          </div>
        </nav>

        <div className="navbar__right">
          {user ? (
            <>
              <span className="navbar__user">Hi, {user.name.split(' ')[0]}</span>
              <MagneticButton variant="outline" onClick={logout}>
                Log out
              </MagneticButton>
            </>
          ) : (
            <>
              <button className="navbar__login" onClick={() => openAuth('login')} type="button">
                Log in
              </button>
              <MagneticButton variant="solid" onClick={() => openAuth('signup')}>
                Start for free
              </MagneticButton>
            </>
          )}
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="mega-menu"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mega-menu__grid">
                {MEGA_COLUMNS.map((col) => (
                  <div className="mega-col" key={col.title}>
                    <h4>{col.title}</h4>
                    <ul>
                      {col.items.map((item) => (
                        <li
                          key={item}
                          onClick={() => {
                            setMenuOpen(false);
                            goToFeatures();
                          }}
                        >
                          <span className="mega-col__ic" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="mega-col mega-col--feature">
                  <h4>NON-STOP INNOVATION</h4>
                  <div className="innovation-panel">
                    <div className="innovation-panel__thumb" />
                    <Link to="/why-genzwears" onClick={() => setMenuOpen(false)}>
                      GENZ-WEARS Editions &rarr;
                    </Link>
                    <p>150+ updates to GENZ-WEARS, twice a year.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
