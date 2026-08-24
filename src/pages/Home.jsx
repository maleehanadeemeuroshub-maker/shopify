import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../sections/Hero.jsx';
import TrustMarquee from '../sections/TrustMarquee.jsx';
import CategoryGrid from '../sections/CategoryGrid.jsx';
import ProductRail from '../components/ProductRail.jsx';
import HorizontalShowcase from '../components/HorizontalShowcase.jsx';
import PromoBanner from '../sections/PromoBanner.jsx';
import WhyChooseUs from '../sections/WhyChooseUs.jsx';
import Features from '../sections/Features.jsx';
import Testimonials from '../sections/Testimonials.jsx';
import BrandMarquee from '../sections/BrandMarquee.jsx';
import Newsletter from '../sections/Newsletter.jsx';
import { PRODUCTS } from '../data/products.js';

// Each rail pulls from a different slice of the catalog so the homepage
// doesn't repeat the same handful of products in every section — once a
// product is used in one rail, it's excluded from the ones below it.
const FEATURED = PRODUCTS.filter((p) => p.featured).slice(0, 8);
const usedAfterFeatured = new Set(FEATURED.map((p) => p.id));

const NEW_ARRIVALS = PRODUCTS.filter((p) => p.isNew && !usedAfterFeatured.has(p.id)).slice(0, 4);
NEW_ARRIVALS.forEach((p) => usedAfterFeatured.add(p.id));

const BEST_SELLERS = [...PRODUCTS]
  .filter((p) => !usedAfterFeatured.has(p.id))
  .sort((a, b) => b.reviews - a.reviews)
  .slice(0, 4);

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#features') {
      const el = document.getElementById('features');
      if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: 'smooth' }));
    }
  }, [location]);

  return (
    <>
      <Hero />
      <TrustMarquee />
      <CategoryGrid />
      <HorizontalShowcase
        eyebrow="Curated"
        title="Featured Collection"
        subtitle="Our current lineup of signature pieces."
        products={FEATURED}
      />
      <PromoBanner />
      <ProductRail
        eyebrow="Just dropped"
        title="New Arrivals"
        subtitle="The latest additions to the catalog."
        products={NEW_ARRIVALS}
        viewAllHref="/shop?category=New+Arrivals"
      />
      <WhyChooseUs />
      <ProductRail
        eyebrow="Fan favorites"
        title="Best Sellers"
        subtitle="What everyone keeps coming back for."
        products={BEST_SELLERS}
      />
      <Features />
      <Testimonials />
      <BrandMarquee />
      <Newsletter />
    </>
  );
}
