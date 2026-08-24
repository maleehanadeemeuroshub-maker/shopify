import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import SplitHeading from '../components/SplitHeading.jsx';
import { gsap, prefersReducedMotion } from '../lib/gsapConfig.js';
import './Newsletter.css';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const innerRef = useRef(null);

  useLayoutEffect(() => {
    if (!innerRef.current || prefersReducedMotion()) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        innerRef.current,
        { opacity: 0, y: 24, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: innerRef.current, start: 'top 90%', end: 'top 60%', scrub: 0.6 },
        }
      );
    }, innerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setSubscribed(true);
  };

  return (
    <section className="newsletter">
      <div className="container newsletter__inner" ref={innerRef}>
        <div>
          <SplitHeading eyebrow="Stay in the loop">Join the community</SplitHeading>
          <p>New drops, restocks, and members-only offers — straight to your inbox.</p>
        </div>

        {subscribed ? (
          <div className="newsletter__success">
            <CheckCircle2 size={18} /> You&apos;re on the list — welcome to GENZ-WEARS.
          </div>
        ) : (
          <form className="newsletter__form" onSubmit={handleSubmit}>
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit">
              Subscribe <ArrowRight size={15} />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
