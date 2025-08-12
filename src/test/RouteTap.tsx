import React from 'react';
import { useLocation, useOutlet } from 'react-router-dom';

const box: React.CSSProperties = {
  padding: '12px', margin: '8px 0', border: '1px dashed #d33',
  background: 'rgba(221,51,51,0.06)', borderRadius: 8, fontSize: 14
};

export default function RouteTap() {
  const child = useOutlet();
  const loc = useLocation();
  React.useEffect(() => {
    // jasný log do konzoly pri každej zmene
    // eslint-disable-next-line no-console
    console.log('[E2E][RouteTap]', { path: loc.pathname, hasChild: !!child });
  }, [loc.pathname, !!child]);

  if (child) return <>{child}</>;
  return (
    <div data-testid="e2e-route-empty" style={box}>
      <strong>Route EMPTY</strong> — {loc.pathname}
      <div style={{marginTop:8}}>
        Žiadny zodpovedajúci child route element. (E2E RouteTap)
      </div>
      <button type="button">ok</button>
    </div>
  );
}
