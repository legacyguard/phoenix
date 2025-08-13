import React from 'react';
import * as RRD from 'react-router-dom';

// Re-export všetko ako z RRD, ale Outlet nahradíme
export * from 'react-router-dom';

const box: React.CSSProperties = {
  padding: 12, margin: '8px 0', border: '1px dashed #d33',
  background: 'rgba(221,51,51,0.06)', borderRadius: 8, fontSize: 14
};

export function Outlet(_props: any) {
  const child = RRD.useOutlet();
  const loc = RRD.useLocation();
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[E2E][OutletTap]', { path: loc.pathname, hasChild: !!child });
  }, [loc.pathname, !!child]);

  if (child) return <>{child}</>;
  return (
    <div data-testid="e2e-route-empty" style={box}>
      <strong>Route EMPTY</strong> — {loc.pathname}
      <div style={{marginTop:8}}>Žiadny child route element. (E2E OutletTap)</div>
      <button type="button">ok</button>
      <input type="text" placeholder="test input" />
    </div>
  );
}
