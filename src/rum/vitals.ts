/**
 * Web Vitals (LCP/CLS/INP) – lazy import, prod-only.
 * Loguje do konzoly, alebo pošle beacon na VITE_RUM_ENDPOINT (ak je nastavený).
 */
export function initWebVitals() {
  if (import.meta.env.DEV) return; // nič v dev
  const boot = () => {
    import('web-vitals').then(({ onLCP, onCLS, onINP }) => {
      const send = (metric: any) => {
        const payload = {
          name: metric.name,
          value: metric.value,
          id: metric.id,
          rating: metric.rating,
          path: location.pathname,
          ts: Date.now(),
          ua: navigator.userAgent,
        };
        const body = JSON.stringify(payload);
        const ep = (import.meta as any).env.VITE_RUM_ENDPOINT;
        if (ep) {
          try { navigator.sendBeacon(ep, body); } catch {}
        } else {
          // default: log do konzoly, vypneš VITE_RUM_CONSOLE=0
          if ((import.meta as any).env.VITE_RUM_CONSOLE !== '0') {
            // eslint-disable-next-line no-console
            console.info('[web-vitals]', payload.name, payload.value, payload.rating);
          }
        }
      };
      onLCP(send);
      onCLS(send);
      onINP(send);
    }).catch(() => {});
  };
  if ('requestIdleCallback' in window) (window as any).requestIdleCallback(boot, { timeout: 3000 });
  else setTimeout(boot, 0);
}
