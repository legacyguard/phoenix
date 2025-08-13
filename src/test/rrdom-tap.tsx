import React, { useEffect, useMemo } from "react";
// Dôležité: NEIMPORTUJ priamo 'react-router-dom', aby nevznikla rekurzia.
// Reálny balík je namapovaný aliasom 'react-router-dom-real' vo vite.config.e2e.shim.ts
import * as RRD from "react-router-dom-real";

// Pomocné tagovanie
const tag = (label: string, extra?: unknown) => {
  try { console.log(`[E2E][RRD] ${label}`, extra ?? ""); } catch {}
};

// Viditeľný marker priamo v DOM keď route nemá child
function Box({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div
      data-testid="e2e-route-box"
      style={{ border: "2px dashed red", padding: 6, margin: 4 }}
    >
      <div data-testid="e2e-route-label" style={{ fontSize: 12, opacity: 0.8 }}>
        {label}
      </div>
      <button data-testid="e2e-route-probe-btn" onClick={()=>tag("probe click")}>probe</button>
      <input data-testid="e2e-route-probe-input" placeholder="probe" />
      {children}
    </div>
  );
}

// Wrap BrowserRouter
export function BrowserRouter(props: React.ComponentProps<typeof RRD.BrowserRouter>) {
  tag("BrowserRouter mount", { hasChildren: !!props.children });
  return (
    <RRD.BrowserRouter {...props}>
      <Box label="BrowserRouter">{props.children}</Box>
    </RRD.BrowserRouter>
  );
}

// Wrap RouterProvider (pre createBrowserRouter/RouterProvider použitie)
export function RouterProvider(props: React.ComponentProps<typeof RRD.RouterProvider>) {
  tag("RouterProvider mount");
  return (
    <RRD.RouterProvider
      {...props}
      fallbackElement={
        <Box label="RouterProvider.fallback (no route yet)" />
      }
    />
  );
}

// Wrap Routes
export function Routes(props: React.ComponentProps<typeof RRD.Routes>) {
  const count = useMemo(()=>React.Children.count(props.children), [props.children]);
  tag("Routes", { children: count });
  return (
    <RRD.Routes {...props}>
      <Box label={`Routes (children=${count})`}>{props.children}</Box>
    </RRD.Routes>
  );
}

// Wrap Outlet → použijeme useOutlet a zobrazíme, či child existuje
export function Outlet(props: React.ComponentProps<typeof RRD.Outlet>) {
  const el = RRD.useOutlet();
  const hasChild = !!el;
  useEffect(() => { tag("Outlet", { hasChild }); }, [hasChild]);
  return (
    <div data-testid="e2e-outlet-wrap">
      {!hasChild && <Box label="Outlet has NO child" />}
      {hasChild && el}
    </div>
  );
}

// Ostatné exporty ponechajme z originálneho balíka
export * from "react-router-dom-real";
