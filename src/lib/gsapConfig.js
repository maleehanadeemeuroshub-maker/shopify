import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { SplitText } from 'gsap/SplitText';

let registered = false;

export function ensureGsapRegistered() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
  registered = true;
}

ensureGsapRegistered();

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Shared breakpoints for ScrollTrigger.matchMedia — desktop gets the full
// cinematic treatment, tablet gets a scaled-down version, mobile gets
// touch-first behavior instead of scaled-down desktop motion.
export const MQ = {
  desktop: '(min-width: 1000px)',
  tablet: '(min-width: 600px) and (max-width: 999px)',
  mobile: '(max-width: 599px)',
  motionOk: '(prefers-reduced-motion: no-preference)',
  reduced: '(prefers-reduced-motion: reduce)',
};

export { gsap, ScrollTrigger, ScrollSmoother, SplitText };
