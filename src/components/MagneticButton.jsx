import { useMemo, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import './MagneticButton.css';

export default function MagneticButton({
  as: As = 'button',
  variant = 'solid',
  children,
  className = '',
  strength = 14,
  ...props
}) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 });

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    x.set((relX / (rect.width / 2)) * strength);
    y.set((relY / (rect.height / 2)) * strength);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const MotionTag = useMemo(() => motion(As), [As]);

  return (
    <MotionTag
      ref={ref}
      className={`magnetic-btn magnetic-btn--${variant} ${className}`}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...props}
    >
      {children}
    </MotionTag>
  );
}
