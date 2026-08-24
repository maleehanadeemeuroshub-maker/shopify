import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackgroundVideo from '../components/BackgroundVideo.jsx';
import MagneticButton from '../components/MagneticButton.jsx';
import { gsap, prefersReducedMotion, MQ } from '../lib/gsapConfig.js';
import './Hero.css';

const Scene3D = lazy(() => import('../components/Scene3D.jsx'));

const HEADLINES = [
  ['Be the next', 'store they line up for'],
  ['Be the next', 'street style icon'],
  ['Be the next', 'sold-out drop'],
  ['Be the next', 'runway favourite'],
  ['Be the next', "city's best dressed"],
  ['Be the next', 'name on everyone’s list'],
];

const STATS = [
  { value: '30+', label: 'New styles added every season' },
  { value: '4.8★', label: 'Average rating across 2,000+ reviews' },
  { value: '30-Day', label: 'Free returns on every order' },
];

export default function Hero() {
  const [slide, setSlide] = useState(0);
  const rootRef = useRef(null);
  const labelRef = useRef(null);
  const lineRefs = useRef([]);
  const paraRef = useRef(null);
  const ctasRef = useRef(null);
  const statsRef = useRef(null);
  const headlineRef = useRef(null);
  const contentRef = useRef(null);
  const dotsRef = useRef(null);
  const fadeRef = useRef(null);

  const handleIndexChange = useCallback((i) => setSlide(i), []);
  const navigate = useNavigate();

  // entrance timeline
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(rootRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 })
        .fromTo(labelRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.25')
        .fromTo(
          lineRefs.current,
          { y: '110%', opacity: 0, filter: 'blur(8px)' },
          { y: '0%', opacity: 1, filter: 'blur(0px)', duration: 0.9, stagger: 0.12 },
          '-=0.2'
        )
        .fromTo(paraRef.current, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, '-=0.45')
        .fromTo(ctasRef.current, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, '-=0.5')
        .fromTo(
          statsRef.current ? statsRef.current.children : [],
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.08 },
          '-=0.4'
        );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  // Cinematic scroll-out: pin the hero for a stretch of scroll while its
  // content scales/blurs away, the 3D core and video zoom past camera, and a
  // solid-color veil rises underneath — so the hero doesn't just disappear,
  // it dissolves into the section behind it. Reversible (scrub, not a
  // one-shot), and scaled down per breakpoint instead of just shrinking the
  // desktop version.
  //
  // useLayoutEffect (not useEffect) is required here: this creates a
  // ScrollTrigger with pin:true, which wraps the hero in an extra "spacer"
  // div behind React's back. If cleanup (ctx.revert(), which unwraps the
  // spacer) ran in a useEffect cleanup instead, it would fire AFTER React
  // has already tried to remove the old DOM on route change — by then the
  // parent it expects is gone, and React throws, breaking navigation away
  // from Home entirely. useLayoutEffect cleanup runs synchronously before
  // that removal.
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return undefined;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        { isDesktop: MQ.desktop, isTablet: MQ.tablet },
        (context) => {
          const { isDesktop } = context.conditions;

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: rootRef.current,
              start: 'top top',
              end: isDesktop ? '+=100%' : '+=60%',
              scrub: 0.8,
              pin: true,
              pinSpacing: true,
            },
          });

          tl.to(contentRef.current, { yPercent: -18, scale: 0.92, filter: 'blur(3px)', ease: 'none' }, 0)
            .to(contentRef.current, { opacity: 0, ease: 'none' }, 0.15)
            .to('.hero__scene-wrap', { scale: isDesktop ? 1.35 : 1.15, opacity: 0, ease: 'none' }, 0)
            .to('.bg-video', { scale: 1.18, opacity: 0.5, ease: 'none' }, 0)
            .to(dotsRef.current, { opacity: 0, ease: 'none' }, 0)
            .to(fadeRef.current, { opacity: 1, ease: 'none' }, 0.35);

          return () => tl.scrollTrigger?.kill();
        }
      );

      return () => mm.revert();
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // headline crossfade on slide change
  useEffect(() => {
    if (!headlineRef.current) return;
    gsap.fromTo(
      headlineRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    );
  }, [slide]);

  return (
    <section className="hero" id="top" ref={rootRef}>
      <div className="hero__atmosphere" aria-hidden="true" />
      {/* Scene3D mounts asynchronously behind Suspense — this wrapper is
          always in the DOM at mount, so the scroll-out timeline (built in an
          effect that can run before the lazy chunk resolves) always has a
          real element to target, and stays in sync however long the 3D
          scene takes to load. */}
      <div className="hero__scene-wrap">
        <Suspense fallback={null}>
          <Scene3D />
        </Suspense>
      </div>
      <BackgroundVideo onIndexChange={handleIndexChange} />
      <div className="hero__fade" ref={fadeRef} aria-hidden="true" />

      <div className="hero__content" ref={contentRef}>
        <div className="eyebrow" ref={labelRef}>
          Spring &apos;26 Collection
        </div>

        <h1 className="hero__headline" ref={headlineRef}>
          <span className="hero__line-mask">
            <span className="hero__line" ref={(el) => (lineRefs.current[0] = el)}>
              {HEADLINES[slide][0]}
            </span>
          </span>
          <span className="hero__line-mask">
            <span className="hero__line hero__line--accent" ref={(el) => (lineRefs.current[1] = el)}>
              {HEADLINES[slide][1]}
            </span>
          </span>
        </h1>

        <p className="hero__para" ref={paraRef}>
          Heavyweight essentials, cut for movement.
          <br />
          Streetwear built to outlast the season it dropped in.
        </p>

        <div className="hero__ctas" ref={ctasRef}>
          <MagneticButton variant="solid" onClick={() => navigate('/shop')}>
            Shop Now <ArrowRight size={16} />
          </MagneticButton>
          <MagneticButton variant="outline" onClick={() => navigate('/why-genzwears')}>
            <span className="play-ic">&#9658;</span> Our Story
          </MagneticButton>
        </div>

        <div className="hero__stats" ref={statsRef}>
          {STATS.map((s) => (
            <div className="hero__stat" key={s.label}>
              <span className="hero__stat-value">{s.value}</span>
              <span className="hero__stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="hero__dots" ref={dotsRef}>
        {HEADLINES.map((_, i) => (
          <span key={i} className={i === slide ? 'active' : ''} />
        ))}
      </div>
    </section>
  );
}
