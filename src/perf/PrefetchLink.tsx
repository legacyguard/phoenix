import React, { useEffect, useRef } from 'react';
import { prefetchUrl, prefetchRouteChunk } from './prefetch';

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  prefetch?: 'hover' | 'viewport' | 'none';
  routePath?: string; // ak je známy path pre registry
};

export default function PrefetchLink({ prefetch = 'hover', routePath, href = '#', onMouseEnter, ...rest }: Props) {
  const ref = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (prefetch !== 'viewport' || !ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          prefetchUrl(href);
          if (routePath) prefetchRouteChunk(routePath);
          io.disconnect();
        }
      });
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [prefetch, href, routePath]);

  const handleMouseEnter: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (onMouseEnter) onMouseEnter(e);
    if (prefetch === 'hover') {
      prefetchUrl(href);
      if (routePath) prefetchRouteChunk(routePath);
    }
  };

  return <a ref={ref} href={href} onMouseEnter={handleMouseEnter} {...rest} />;
}
