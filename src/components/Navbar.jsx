import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SearchOverlay from './SearchOverlay.jsx';
import { useModal } from '../context/ModalContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import './Navbar.css';

const SHOP_MEGA = [
  {
    title: 'CLOTHING',
    links: [
      { label: 'T-Shirts', category: 'T-Shirts' },
      { label: 'Hoodies', category: 'Hoodies' },
      { label: 'Sweatshirts', category: 'Sweatshirts' },
      { label: 'Cargo Pants', category: 'Cargo Pants' },
      { label: 'Denim Jeans', category: 'Denim Jeans' },
      { label: 'Jackets', category: 'Jackets' },
    ],
  },
  {
    title: 'ACCESSORIES',
    links: [
      { label: 'Caps', category: 'Caps' },
      { label: 'Bags', category: 'Bags' },
      { label: 'Watches', category: 'Watches' },
      { label: 'Sunglasses', category: 'Sunglasses' },
      { label: 'Sneakers', category: 'Sneakers' },
    ],
  },
  {
    title: 'FEATURED',
    links: [
      { label: 'New Arrivals', category: 'New Arrivals' },
      { label: 'Best Sellers', category: 'All', sort: 'bestselling' },
      { label: 'Sale', category: 'Sale' },
    ],
  },
];

export default function Navbar() {
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navRef = useRef(null);
  const { openAuth } = useModal();
  const { user } = useAuth();
  const { itemCount, openDrawer } = useCart();
  const { count: wishCount } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
        setMobileNavOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const goShop = (category, sort) => {
    setMenuOpen(false);
    const params = new URLSearchParams();
    if (category && category !== 'All') params.set('category', category);
    if (sort) params.set('sort', sort);
    const qs = params.toString();
    navigate(qs ? `/shop?${qs}` : '/shop');
  };

  return (
    <>
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
            <button
              className={`navitem ${menuOpen ? 'navitem--open' : ''}`}
              onClick={() => setMenuOpen((v) => !v)}
              type="button"
            >
              Shop <ChevronDown size={12} strokeWidth={2} />
            </button>
            <Link className="navitem" to="/shop?category=New+Arrivals">
              New Arrivals
            </Link>
            <Link className="navitem" to="/shop">
              Collections
            </Link>
            <Link className="navitem navitem--sale" to="/shop?category=Sale">
              Sale
            </Link>
          </nav>

          <div className="navbar__right">
            <button
              type="button"
              className="navbar__icon navbar__hamburger"
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label="Menu"
            >
              {mobileNavOpen ? <X size={19} /> : <Menu size={19} />}
            </button>

            <button type="button" className="navbar__icon" onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search size={18} />
            </button>

            {user ? (
              <Link className="navbar__icon" to="/account" aria-label="Account">
                <User size={18} />
              </Link>
            ) : (
              <button type="button" className="navbar__icon" onClick={() => openAuth('login')} aria-label="Log in">
                <User size={18} />
              </button>
            )}

            <Link className="navbar__icon navbar__icon--badge" to="/wishlist" aria-label="Wishlist">
              <Heart size={18} />
              {wishCount > 0 && <span className="navbar__badge-count">{wishCount}</span>}
            </Link>

            <button type="button" className="navbar__icon navbar__icon--badge" onClick={openDrawer} aria-label="Cart">
              <ShoppingBag size={18} />
              {itemCount > 0 && <span className="navbar__badge-count">{itemCount}</span>}
            </button>
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
                  {SHOP_MEGA.map((col) => (
                    <div className="mega-col" key={col.title}>
                      <h4>{col.title}</h4>
                      <ul>
                        {col.links.map((link) => (
                          <li key={link.label} onClick={() => goShop(link.category, link.sort)}>
                            <span className="mega-col__ic" />
                            {link.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div className="mega-col mega-col--feature">
                    <h4>SPRING &apos;26 EDIT</h4>
                    <div className="innovation-panel">
                      <div className="innovation-panel__thumb" />
                      <button type="button" onClick={() => goShop('New Arrivals')}>
                        Shop the new drop &rarr;
                      </button>
                      <p>Fresh pieces added weekly.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {mobileNavOpen && (
              <motion.div
                className="mobile-nav"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link to="/shop" onClick={() => setMobileNavOpen(false)}>
                  Shop
                </Link>
                <Link to="/shop?category=New+Arrivals" onClick={() => setMobileNavOpen(false)}>
                  New Arrivals
                </Link>
                <Link to="/shop" onClick={() => setMobileNavOpen(false)}>
                  Collections
                </Link>
                <Link to="/shop?category=Sale" onClick={() => setMobileNavOpen(false)} className="mobile-nav__sale">
                  Sale
                </Link>
                <Link to={user ? '/account' : '#'} onClick={(e) => {
                  setMobileNavOpen(false);
                  if (!user) { e.preventDefault(); openAuth('login'); }
                }}>
                  Account
                </Link>
                <Link to="/wishlist" onClick={() => setMobileNavOpen(false)}>
                  Wishlist
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
