import { useEffect, useRef, useState } from 'react';
import './BackgroundVideo.css';

const SOURCES = [
  '/hero-1.mp4',
  '/hero-2.mp4',
  '/hero-3.mp4',
  '/hero-4.mp4',
  '/hero-5.mp4',
  '/hero-6.mp4',
];

export default function BackgroundVideo({ onIndexChange }) {
  const [active, setActive] = useState(0);
  const videoRefs = useRef([]);

  const advance = () => {
    setActive((i) => {
      const next = (i + 1) % SOURCES.length;
      onIndexChange?.(next);
      return next;
    });
  };

  // Play the active clip from the start and let it run to completion —
  // no fixed timer, so shorter and longer clips each get their full length
  // before the crossfade to the next one.
  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === active) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [active]);

  return (
    <div className="bg-video">
      <div className="bg-video__frame">
        {SOURCES.map((src, i) => (
          <video
            key={src}
            ref={(el) => (videoRefs.current[i] = el)}
            className={i === active ? 'active' : ''}
            muted
            playsInline
            preload={i === 0 ? 'auto' : 'metadata'}
            onEnded={i === active ? advance : undefined}
            src={src}
          />
        ))}
        <div className="bg-video__vignette" />
      </div>
    </div>
  );
}
