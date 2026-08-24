import { useLayoutEffect, useRef } from 'react';
import { Award, Lock, RefreshCw, Truck } from 'lucide-react';
import { gsap, prefersReducedMotion, MQ } from '../lib/gsapConfig.js';
import './WhyChooseUs.css';

const POINTS = [
  { icon: Award, title: 'Premium Quality', copy: 'Heavyweight fabrics and construction built to outlast a season.' },
  { icon: Truck, title: 'Fast Delivery', copy: 'Standard and express shipping options, dispatched within 24 hours.' },
  { icon: RefreshCw, title: 'Easy Returns', copy: '30-day returns on unworn items — no questions asked.' },
  { icon: Lock, title: 'Secure Checkout', copy: 'Your information stays protected from cart to confirmation.' },
];

export default function WhyChooseUs() {
  const sectionRef = useRef(null);
  const itemRefs = useRef([]);

  useLayoutEffect(() => {
    const items = itemRefs.current.filter(Boolean);
    if (!items.length) return undefined;

    if (prefersReducedMotion()) {
      gsap.set(items, { opacity: 1, y: 0, scale: 1 });
      return undefined;
    }

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Desktop/tablet: pin the section while each point steps in in turn —
      // a small, deliberate "scene" instead of four cards fading in at once.
      mm.add({ isDesktop: MQ.desktop, isTablet: MQ.tablet }, (context) => {
        const { isDesktop } = context.conditions;
        const step = 1 / items.length;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top+=80',
            end: isDesktop ? '+=110%' : '+=70%',
            scrub: 0.8,
            pin: true,
            pinSpacing: true,
          },
        });

        items.forEach((el, i) => {
          tl.fromTo(
            el,
            { opacity: 0, y: 46, scale: 0.94 },
            { opacity: 1, y: 0, scale: 1, ease: 'none' },
            i * step
          );
        });

        return () => tl.scrollTrigger?.kill();
      });

      // Mobile: no pin, no scroll-jacking — items settle in individually as
      // they cross the fold, at native touch-scroll speed.
      mm.add(MQ.mobile, () => {
        items.forEach((el, i) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              delay: (i % 2) * 0.08,
              ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 92%' },
            }
          );
        });
      });

      return () => mm.revert();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="why-us" ref={sectionRef}>
      <div className="container">
        <div className="why-us__grid">
          {POINTS.map((p, i) => (
            <div className="why-us__item" key={p.title} ref={(el) => (itemRefs.current[i] = el)}>
              <span className="why-us__icon">
                <p.icon size={20} strokeWidth={1.6} />
              </span>
              <h3>{p.title}</h3>
              <p>{p.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
