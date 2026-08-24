import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard.jsx';
import './ProductRail.css';
import './HorizontalShowcase.css';

/**
 * A horizontally swipeable product strip — plain native scroll, no
 * scroll-jacking. (The pin-and-translate scroll-down animation that used to
 * drive this track has moved to CategoryGrid, the section above.)
 */
export default function HorizontalShowcase({ eyebrow, title, subtitle, products, viewAllHref = '/shop' }) {
  if (!products.length) return null;

  return (
    <section className="h-showcase h-showcase--static">
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

      <div className="h-showcase__viewport">
        <div className="h-showcase__track">
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
