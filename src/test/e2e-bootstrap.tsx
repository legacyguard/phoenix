import React, { Suspense, useEffect } from 'react';

// pokus o i18n no-suspense bez tvrdého importu (funguje len ak existuje)
declare global { interface Window { __E2E__?: boolean } }
window.__E2E__ = true;

let patched = false;
try {
  // pokús sa importnúť existujúci i18n singleton, ale nerob z toho hard dependency
  // @ts-ignore
  const i18n = (window as any).i18n || undefined;
  // fallback: skús require (vite e2e build ho zabalí ak je v projekte)
  if (!i18n) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('../i18n/config') || require('../i18n/i18n') || require('../i18n');
      // @ts-ignore
      (window as any).i18n = mod?.default || mod?.i18n || mod;
    } catch {}
  }
  const inst = (window as any).i18n;
  if (inst && inst.options) {
    // vypni React suspense v i18n pre E2E
    inst.options.react = Object.assign({}, inst.options.react, { useSuspense: false });
    patched = true;
  }
} catch {}

export const E2EVisibleBanner: React.FC = () => {
  // malý nenápadný, ale detegovateľný prvok
  useEffect(() => { console.log('[E2E] banner mounted, i18nPatched=', patched); }, []);
  const style: React.CSSProperties = {
    position: 'fixed', inset: 'auto 8px 8px auto', zIndex: 99999,
    background: 'rgba(17,17,17,.85)', color: '#fff', padding: '6px 8px',
    fontSize: 12, borderRadius: 6, border: '1px solid rgba(255,255,255,.15)'
  };
  return (
    <div style={style} data-testid="e2e-banner">
      E2E active · i18nSuspense:{patched?'off':'unknown'}
    </div>
  );
};

export const E2EWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Suspense fallback={
      <div data-testid="e2e-fallback" style={{padding:16}}>
        <h1>Loading…</h1>
        <p>E2E fallback (Suspense)</p>
        <button type="button">ok</button>
      </div>
    }>
      {children}
      <E2EVisibleBanner />
    </Suspense>
  );
};
