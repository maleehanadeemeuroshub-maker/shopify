import { useEffect, useRef, useState } from 'react';
import './BackgroundVideo.css';

const SOURCES = ['/hero-1.mp4', '/hero-2.mp4', '/hero-3.mp4', '/hero-4.mp4', '/hero-5.mp4'];
const INTERVAL = 6000;

export default function BackgroundVideo({ onIndexChange }) {
  const [active, setActive] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setActive((i) => {
        const next = (i + 1) % SOURCES.length;
        onIndexChange?.(next);
        return next;
      });
    }, INTERVAL);
    return () => clearInterval(timer.current);
  }, [onIndexChange]);

  return (
    <div className="bg-video">
      <div className="bg-video__frame">
        {SOURCES.map((src, i) => (
          <video
            key={src}
            className={i === active ? 'active' : ''}
            autoPlay
            muted
            loop
            playsInline
            preload={i === 0 ? 'auto' : 'metadata'}
            src={src}
          />
        ))}
        <div className="bg-video__vignette" />
      </div>
    </div>
  );
}

export { SOURCES };
