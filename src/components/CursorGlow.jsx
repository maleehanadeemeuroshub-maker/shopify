import { useEffect, useRef } from 'react';
import './CursorGlow.css';

export default function CursorGlow() {
  const glowRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let raf;
    const onMove = (e) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
    };
    const tick = () => {
      current.current.x += (pos.current.x - current.current.x) * 0.06;
      current.current.y += (pos.current.y - current.current.y) * 0.06;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={glowRef} className="cursor-glow" aria-hidden="true" />;
}
