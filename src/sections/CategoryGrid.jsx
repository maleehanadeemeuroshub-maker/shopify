import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductImage from '../components/ProductImage.jsx';
import SplitHeading from '../components/SplitHeading.jsx';
import { gsap, prefersReducedMotion, MQ } from '../lib/gsapConfig.js';
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
  const rowRef = useRef(null);
  const cardRefs = useRef([]);
  const imgRefs = useRef([]);
  const revealRefs = useRef([]);

  useLayoutEffect(() => {
    const cards = cardRefs.current.filter(Boolean);
    if (!cards.length) return undefined;

    if (prefersReducedMotion()) {
      gsap.set(cards, { opacity: 1, y: 0, rotateX: 0 });
      gsap.set(revealRefs.current, { scaleY: 0 });
      return undefined;
    }

    const ctx = gsap.context(() => {
      cards.forEach((card, i) => {
        const img = imgRefs.current[i];
        const reveal = revealRefs.current[i];

        // Entrance: the card lifts in with a slight 3D tilt while a solid
        // panel wipes away to reveal the image underneath.
        gsap.timeline({
          scrollTrigger: { trigger: card, start: 'top 88%', end: 'top 42%', scrub: 0.6 },
        })
          .fromTo(card, { opacity: 0, y: 46, rotateX: 8 }, { opacity: 1, y: 0, rotateX: 0, ease: 'none' }, 0)
          .fromTo(reveal, { scaleY: 1 }, { scaleY: 0, ease: 'none' }, 0.08);
      });

      // Depth: images drift at slightly different speeds as the row passes
      // through the viewport — alternating amounts, not alternating
      // direction, so the row still reads as one coherent plane.
      const mm = gsap.matchMedia();
      mm.add({ isDesktop: MQ.desktop, isTablet: MQ.tablet }, () => {
        cards.forEach((card, i) => {
          const img = imgRefs.current[i];
          if (!img) return;
          const travel = i % 2 === 0 ? 12 : 7;
          gsap.fromTo(
            img,
            { yPercent: -travel },
            {
              yPercent: travel,
              ease: 'none',
              scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
            }
          );
        });
      });

      return () => mm.revert();
    }, rowRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="category-grid">
      <div className="container">
        <div className="category-grid__head">
          <SplitHeading eyebrow="Shop by category">Find your fit</SplitHeading>
        </div>

        <div className="category-grid__row" ref={rowRef}>
          {CATEGORY_CARDS.map((c, i) => (
            <Link
              to={`/shop?category=${encodeURIComponent(c.category)}`}
              className="category-card"
              key={c.label}
              ref={(el) => (cardRefs.current[i] = el)}
            >
              <div className="category-card__parallax" ref={(el) => (imgRefs.current[i] = el)}>
                <ProductImage src={`https://images.unsplash.com/${c.image}?w=700&q=80&auto=format&fit=crop`} alt={c.label} />
              </div>
              <span className="category-card__reveal" ref={(el) => (revealRefs.current[i] = el)} aria-hidden="true" />
              <div className="category-card__overlay" />
              <span className="category-card__label">{c.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
