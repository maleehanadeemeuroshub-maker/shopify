import { useLayoutEffect, useRef } from 'react';
import ProductImage from '../components/ProductImage.jsx';
import SplitHeading from '../components/SplitHeading.jsx';
import StarRating from '../components/StarRating.jsx';
import { TESTIMONIALS } from '../data/testimonials.js';
import { gsap, prefersReducedMotion, MQ } from '../lib/gsapConfig.js';
import './Testimonials.css';

export default function Testimonials() {
  const gridRef = useRef(null);

  useLayoutEffect(() => {
    if (!gridRef.current || prefersReducedMotion()) return undefined;

    const ctx = gsap.context(() => {
      // Entrance (opacity/scale) lives on the card; the continuous parallax
      // drift lives on its wrapping cell — two separate elements so the two
      // independent scrubs never fight over the same transform.
      const cells = gsap.utils.toArray('.testimonial-cell', gridRef.current);

      cells.forEach((cell) => {
        const card = cell.querySelector('.testimonial-card');
        gsap.fromTo(
          card,
          { opacity: 0, scale: 0.97 },
          {
            opacity: 1,
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: cell, start: 'top 92%', end: 'top 68%', scrub: 0.6 },
          }
        );
      });

      // A whisper of depth: alternate rows drift at slightly different
      // speeds as the grid passes through the viewport.
      const mm = gsap.matchMedia();
      mm.add({ isDesktop: MQ.desktop, isTablet: MQ.tablet }, () => {
        cells.forEach((cell, i) => {
          const travel = i % 2 === 0 ? 10 : -10;
          gsap.fromTo(
            cell,
            { y: -travel },
            {
              y: travel,
              ease: 'none',
              scrollTrigger: { trigger: gridRef.current, start: 'top bottom', end: 'bottom top', scrub: true },
            }
          );
        });
      });

      return () => mm.revert();
    }, gridRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="testimonials">
      <div className="container">
        <div className="testimonials__head">
          <SplitHeading eyebrow="Customer stories">Loved by the community</SplitHeading>
        </div>

        <div className="testimonials__grid" ref={gridRef}>
          {TESTIMONIALS.map((t) => (
            <div className="testimonial-cell" key={t.name}>
              <div className="testimonial-card">
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
