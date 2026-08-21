import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackgroundVideo from '../components/BackgroundVideo.jsx';
import MagneticButton from '../components/MagneticButton.jsx';
import { useModal } from '../context/ModalContext.jsx';
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
  { value: '150+', label: 'Product editions shipped yearly' },
  { value: '2.4M', label: 'Storefronts powered worldwide' },
  { value: '99.98%', label: 'Uptime, cinematic or not' },
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

  const handleIndexChange = useCallback((i) => setSlide(i), []);
  const { openAuth } = useModal();
  const navigate = useNavigate();

  // entrance timeline
  useEffect(() => {
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
      <Suspense fallback={null}>
        <Scene3D className="hero__scene" />
      </Suspense>
      <BackgroundVideo onIndexChange={handleIndexChange} />

      <div className="hero__content">
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
          Dream big and build fast on GENZ-WEARS.
          <br />
          The world&apos;s best commerce platform, engineered for the next generation of brands.
        </p>

        <div className="hero__ctas" ref={ctasRef}>
          <MagneticButton variant="solid" onClick={() => openAuth('signup')}>
            Start for free <ArrowRight size={16} />
          </MagneticButton>
          <MagneticButton variant="outline" onClick={() => navigate('/why-genzwears')}>
            <span className="play-ic">&#9658;</span> Why we build GENZ-WEARS
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

      <div className="hero__dots">
        {HEADLINES.map((_, i) => (
          <span key={i} className={i === slide ? 'active' : ''} />
        ))}
      </div>
    </section>
  );
}
