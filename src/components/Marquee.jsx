import './Marquee.css';

/**
 * Infinite horizontal scroll — CSS-only (no rAF loop). Renders the item list
 * twice back-to-back and animates translateX(-50%) so the loop point is
 * seamless as long as both copies are the same width, which duplicating the
 * exact same markup guarantees.
 */
export default function Marquee({ items, speed = 28, reverse = false, separator = '•', className = '' }) {
  return (
    <div className={`marquee ${className}`}>
      <div
        className={`marquee__track ${reverse ? 'marquee__track--reverse' : ''}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {[0, 1].map((rep) => (
          // The second copy is a purely visual duplicate for the seamless loop.
          // `inert` (not just aria-hidden) keeps any interactive items inside it
          // — e.g. <Link> — from becoming invisible keyboard tab-stops.
          <div className="marquee__group" key={rep} aria-hidden={rep === 1 || undefined} inert={rep === 1 || undefined}>
            {items.map((item, i) => (
              <span className="marquee__item" key={i}>
                {item}
                {separator && <span className="marquee__sep">{separator}</span>}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
