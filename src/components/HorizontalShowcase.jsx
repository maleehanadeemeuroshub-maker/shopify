import { useLayoutEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard.jsx';
import { gsap, prefersReducedMotion, MQ } from '../lib/gsapConfig.js';
import './ProductRail.css';
import './HorizontalShowcase.css';

/**
 * Vertical scroll drives horizontal movement: the section pins while the
 * card track translates sideways by exactly its own overflow, so the scroll
 * distance maps 1:1 to horizontal pixels — no artificial pacing. Reverses
 * cleanly on scroll-up. Falls back to a native, swipeable horizontal strip
 * on mobile instead of scroll-jacking a touch screen.
 */
export default function HorizontalShowcase({ eyebrow, title, subtitle, products, viewAllHref = '/shop' }) {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);

  useLayoutEffect(() => {
    if (!trackRef.current || !viewportRef.current || prefersReducedMotion()) return undefined;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add({ isDesktop: MQ.desktop, isTablet: MQ.tablet }, () => {
        const track = trackRef.current;
        const getAmount = () => Math.max(0, track.scrollWidth - viewportRef.current.offsetWidth);

        const tween = gsap.to(track, {
          x: () => -getAmount(),
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: () => `+=${getAmount()}`,
            scrub: 0.7,
            pin: true,
            pinSpacing: true,
            invalidateOnRefresh: true,
          },
        });

        // Each card gets its own subtle entrance tied to its position along
        // the horizontal timeline, not the page's vertical scroll.
        gsap.utils.toArray('.h-showcase__item', track).forEach((item) => {
          gsap.fromTo(
            item,
            { opacity: 0.4, scale: 0.94 },
            {
              opacity: 1,
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: item,
                containerAnimation: tween,
                start: 'left 90%',
                end: 'left 55%',
                scrub: true,
              },
            }
          );
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [products]);

  if (!products.length) return null;

  // Reduced motion (or no JS pin at all): the track falls back to a plain
  // native horizontally-scrollable strip instead of being clipped and
  // unreachable.
  const staticFallback = prefersReducedMotion();

  return (
    <section className={`h-showcase ${staticFallback ? 'h-showcase--static' : ''}`} ref={sectionRef}>
      <div className="container product-rail__head">
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2 className="product-rail__title">{title}</h2>
          {subtitle && <p className="product-rail__subtitle">{subtitle}</p>}
        </div>
        <Link to={viewAllHref} className="product-rail__viewall">
          View all <ArrowRight size={15} />
        </Link>
      </div>

      <div className="h-showcase__viewport" ref={viewportRef}>
        <div className="h-showcase__track" ref={trackRef}>
          {products.map((product) => (
            <div className="h-showcase__item" key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
          <Link to={viewAllHref} className="h-showcase__item h-showcase__more">
            <span>
              View all <ArrowRight size={18} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
