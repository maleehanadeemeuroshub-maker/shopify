import { useLayoutEffect, useRef } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import BorderBeamPanel from '../components/ui/border-beam-panel.tsx';
import { useModal } from '../context/ModalContext.jsx';
import { gsap, prefersReducedMotion } from '../lib/gsapConfig.js';
import './Features.css';

const CARDS = [
  {
    title: 'Get started fast',
    copy: 'You could be selling by tomorrow.',
    image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&q=80',
  },
  {
    title: 'Switch to GENZ-WEARS',
    copy: 'Get more customers. Make more sales.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
  },
  {
    title: 'Trusted by enterprise brands',
    copy: 'No matter your size, complexity, or ambition.',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&q=80',
  },
];

export default function Features() {
  const { openAuth } = useModal();
  const gridRef = useRef(null);

  useLayoutEffect(() => {
    if (!gridRef.current || prefersReducedMotion()) return undefined;

    const ctx = gsap.context(() => {
      // The scroll entrance animates the cell wrapper, not .fcard itself —
      // .fcard keeps its own CSS `:hover` transform untouched by GSAP.
      gsap.utils.toArray('.fcard-cell', gridRef.current).forEach((cell) => {
        gsap.fromTo(
          cell,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            ease: 'none',
            scrollTrigger: { trigger: cell, start: 'top 92%', end: 'top 66%', scrub: 0.6 },
          }
        );
      });

      const panel = gridRef.current.querySelector('.side-panel');
      if (panel) {
        gsap.fromTo(
          panel,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            ease: 'none',
            scrollTrigger: { trigger: panel, start: 'top 90%', end: 'top 62%', scrub: 0.6 },
          }
        );
      }
    }, gridRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="features" id="features">
      <div className="container features__grid" ref={gridRef}>
        <div className="features__cards">
          {CARDS.map((c) => (
            <div className="fcard-cell" key={c.title}>
              <div className="fcard">
                <BorderBeamPanel className="fcard__beam p-0 border-0 bg-transparent" radius={16} thickness={1.6} beams={2} glow>
                  <div className="fcard__img" style={{ backgroundImage: `url(${c.image})` }} />
                  <div className="fcard__text">
                    <h3>{c.title}</h3>
                    <p>{c.copy}</p>
                    <button className="fcard__link" onClick={() => openAuth('signup')} type="button">
                      Learn more <ArrowRight size={13} />
                    </button>
                  </div>
                </BorderBeamPanel>
              </div>
            </div>
          ))}
        </div>

        <div className="side-panel">
          <div className="eyebrow">Built into every store</div>
          <div className="shoppay-card">
            <div className="shoppay-badge">
              shop <span>Pay</span>
            </div>
            <div className="shoppay-glow" />
          </div>
          <p className="side-panel__caption">
            World&apos;s best checkout
            <span>Proven to convert better.</span>
          </p>
          <div className="mini-feature">
            <div className="mini-feature__icon">
              <Sparkles size={20} strokeWidth={1.8} />
            </div>
            <div>
              <h4>Sidekick</h4>
              <p>Your commerce-obsessed AI assistant.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
