import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../sections/Hero.jsx';
import TrustMarquee from '../sections/TrustMarquee.jsx';
import CategoryGrid from '../sections/CategoryGrid.jsx';
import ProductRail from '../components/ProductRail.jsx';
import PromoBanner from '../sections/PromoBanner.jsx';
import WhyChooseUs from '../sections/WhyChooseUs.jsx';
import Features from '../sections/Features.jsx';
import Testimonials from '../sections/Testimonials.jsx';
import BrandMarquee from '../sections/BrandMarquee.jsx';
import Newsletter from '../sections/Newsletter.jsx';
import { useProducts } from '../context/ProductsContext.jsx';

export default function Home() {
  const location = useLocation();
  const { products } = useProducts();

  // Each rail pulls from a different slice of the catalog so the homepage
  // doesn't repeat the same handful of products in every section — once a
  // product is used in one rail, it's excluded from the ones below it.
  const { FEATURED, NEW_ARRIVALS, BEST_SELLERS } = useMemo(() => {
    const featured = products.filter((p) => p.featured).slice(0, 8);
    const used = new Set(featured.map((p) => p.id));

    const newArrivals = products.filter((p) => p.isNew && !used.has(p.id)).slice(0, 4);
    newArrivals.forEach((p) => used.add(p.id));

    const bestSellers = [...products]
      .filter((p) => !used.has(p.id))
      .sort((a, b) => b.reviews - a.reviews)
      .slice(0, 4);

    return { FEATURED: featured, NEW_ARRIVALS: newArrivals, BEST_SELLERS: bestSellers };
  }, [products]);

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
      <ProductRail
        eyebrow="Curated"
        title="Featured Collection"
        subtitle="Our current lineup of signature pieces."
        products={FEATURED}
        marquee
      />
      <PromoBanner />
      <ProductRail
        eyebrow="Just dropped"
        title="New Arrivals"
        subtitle="The latest additions to the catalog."
        products={NEW_ARRIVALS}
        viewAllHref="/shop?category=New+Arrivals"
        marquee
      />
      <WhyChooseUs />
      <ProductRail
        eyebrow="Fan favorites"
        title="Best Sellers"
        subtitle="What everyone keeps coming back for."
        products={BEST_SELLERS}
        marquee
      />
      <Features />
      <Testimonials />
      <BrandMarquee />
      <Newsletter />
    </>
  );
}
