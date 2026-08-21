import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import './ProductImage.css';

export default function ProductImage({ src, alt, className = '', style, ...props }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div className={`product-image-fallback ${className}`} style={style} {...props}>
        <ImageOff size={22} strokeWidth={1.4} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
