import { useLayoutEffect, useRef } from 'react';
import { gsap, SplitText, prefersReducedMotion } from '../lib/gsapConfig.js';
import './SplitHeading.css';

/**
 * A section heading whose words reveal progressively as the section scrolls
 * into view — scrubbed to scroll position (so it reverses cleanly on scroll
 * up), not a one-shot fade. Used in place of the generic whileInView fade
 * that used to sit on every section head.
 */
export default function SplitHeading({ as: Tag = 'h2', eyebrow, children, className = '', headingClassName = '' }) {
  const eyebrowRef = useRef(null);
  const headingRef = useRef(null);

  useLayoutEffect(() => {
    if (!headingRef.current || prefersReducedMotion()) return undefined;

    let split;
    const ctx = gsap.context(() => {
      split = new SplitText(headingRef.current, { type: 'words', mask: 'words', wordsClass: 'split-word' });

      gsap.fromTo(
        split.words,
        { yPercent: 115, opacity: 0, filter: 'blur(9px)' },
        {
          yPercent: 0,
          opacity: 1,
          filter: 'blur(0px)',
          stagger: 0.045,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 90%',
            end: 'top 48%',
            scrub: 0.6,
          },
        }
      );

      if (eyebrowRef.current) {
        gsap.fromTo(
          eyebrowRef.current,
          { opacity: 0, x: -10 },
          {
            opacity: 1,
            x: 0,
            ease: 'none',
            scrollTrigger: { trigger: eyebrowRef.current, start: 'top 94%', end: 'top 75%', scrub: 0.6 },
          }
        );
      }
    });

    return () => {
      ctx.revert();
      split?.revert();
    };
  }, [children]);

  return (
    <div className={`split-heading ${className}`}>
      {eyebrow && (
        <span className="eyebrow" ref={eyebrowRef}>
          {eyebrow}
        </span>
      )}
      <Tag className={headingClassName} ref={headingRef}>{children}</Tag>
    </div>
  );
}
