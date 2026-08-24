import { useLayoutEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard.jsx';
import SplitHeading from './SplitHeading.jsx';
import { gsap, prefersReducedMotion } from '../lib/gsapConfig.js';
import './ProductRail.css';

export default function ProductRail({ eyebrow, title, subtitle, products, viewAllHref = '/shop' }) {
  const gridRef = useRef(null);

  useLayoutEffect(() => {
    if (!gridRef.current || prefersReducedMotion()) return undefined;

    const ctx = gsap.context(() => {
      const cells = gsap.utils.toArray('.product-rail__cell', gridRef.current);
      cells.forEach((cell) => {
        gsap.fromTo(
          cell,
          { opacity: 0, y: 34, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: cell, start: 'top 92%', end: 'top 68%', scrub: 0.6 },
          }
        );
      });
    }, gridRef);

    return () => ctx.revert();
  }, [products]);

  if (!products.length) return null;

  return (
    <section className="product-rail">
      <div className="container">
        <div className="product-rail__head">
          <div>
            <SplitHeading eyebrow={eyebrow} headingClassName="product-rail__title">
              {title}
            </SplitHeading>
            {subtitle && <p className="product-rail__subtitle">{subtitle}</p>}
          </div>
          <Link to={viewAllHref} className="product-rail__viewall">
            View all <ArrowRight size={15} />
          </Link>
        </div>

        <div className="product-rail__grid" ref={gridRef}>
          {products.map((product) => (
            <div className="product-rail__cell" key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
