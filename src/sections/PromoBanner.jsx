import { useLayoutEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SplitHeading from '../components/SplitHeading.jsx';
import { gsap, prefersReducedMotion } from '../lib/gsapConfig.js';
import './PromoBanner.css';

export default function PromoBanner() {
  const bannerRef = useRef(null);
  const restRef = useRef(null);

  useLayoutEffect(() => {
    if (!bannerRef.current || prefersReducedMotion()) return undefined;

    const ctx = gsap.context(() => {
      // The whole banner reveals like a card expanding to full bleed —
      // scale + rounded clip-path unwinding together, scrubbed to scroll.
      gsap.fromTo(
        bannerRef.current,
        { clipPath: 'inset(13% 6% round 30px)', scale: 0.95 },
        {
          clipPath: 'inset(0% 0% round 0px)',
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: bannerRef.current, start: 'top 88%', end: 'top 38%', scrub: 0.6 },
        }
      );

      gsap.fromTo(
        restRef.current,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          ease: 'none',
          scrollTrigger: { trigger: bannerRef.current, start: 'top 65%', end: 'top 32%', scrub: 0.6 },
        }
      );
    }, bannerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="promo-banner" ref={bannerRef}>
      <div className="promo-banner__glow" aria-hidden="true" />
      <div className="container promo-banner__inner">
        <SplitHeading eyebrow="Limited time" className="promo-banner__head">
          Up to 30% off selected styles
        </SplitHeading>
        <div className="promo-banner__rest" ref={restRef}>
          <p>Seasonal markdowns on hoodies, jackets, and denim — while stock lasts.</p>
          <Link to="/shop?category=Sale" className="promo-banner__cta">
            Shop the Sale <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
