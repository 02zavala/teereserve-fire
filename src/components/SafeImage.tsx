'use client';
import { useState, useMemo } from 'react';
import Image, { ImageProps } from 'next/image';

const FALLBACK = '/images/fallback.svg';

export default function SafeImage(props: ImageProps) {
  const [src, setSrc] = useState(props.src);
  
  const safeSrc = useMemo(() => {
    const s = typeof src === 'string' ? src : String(src);
    return s && s !== 'undefined' && s !== 'null' ? s : FALLBACK;
  }, [src]);
  
  return (
    <Image
      {...props}
      src={safeSrc}
      onError={() => setSrc(FALLBACK)}
      unoptimized={process.env.NODE_ENV === 'development'}
      alt={props.alt || 'image'}
    />
  );
}