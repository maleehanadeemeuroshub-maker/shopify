import ProductImage from '../components/ProductImage.jsx';
import SplitHeading from '../components/SplitHeading.jsx';
import StarRating from '../components/StarRating.jsx';
import Marquee from '../components/Marquee.jsx';
import { TESTIMONIALS } from '../data/testimonials.js';
import './Testimonials.css';

export default function Testimonials() {
  return (
    <section className="testimonials">
      <div className="container">
        <div className="testimonials__head">
          <SplitHeading eyebrow="Customer stories">Loved by the community</SplitHeading>
        </div>
      </div>

      <Marquee
        className="testimonials__marquee"
        itemClassName="marquee__item--card"
        speed={42}
        gap={22}
        separator={null}
        items={TESTIMONIALS.map((t) => (
          <div className="testimonial-card" key={t.name}>
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
        ))}
      />
    </section>
  );
}
