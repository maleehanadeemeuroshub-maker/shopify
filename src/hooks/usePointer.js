import { useEffect, useRef } from 'react';

/**
 * Tracks normalized pointer position (-1..1) in a ref so consumers
 * (e.g. R3F useFrame loops) can read it every frame without re-rendering.
 */
export function usePointer() {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  return pointer;
}
