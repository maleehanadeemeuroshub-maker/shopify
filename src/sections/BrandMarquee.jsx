import { Link } from 'react-router-dom';
import Marquee from '../components/Marquee.jsx';
import './BrandMarquee.css';

const WORDS = ['GENZ-WEARS', 'NEW DROPS', 'STREETWEAR', 'SHOP NOW'];

export default function BrandMarquee() {
  return (
    <section className="brand-marquee">
      <Marquee
        items={WORDS.map((w) => (
          <Link to="/shop" className="brand-marquee__word" key={w}>
            {w}
          </Link>
        ))}
        speed={22}
        separator={<span className="brand-marquee__dot">✦</span>}
      />
    </section>
  );
}
