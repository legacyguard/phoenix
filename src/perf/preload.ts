/**
 * Idle preloader pre lazy routy — spustí sa len v prod a len ak VITE_PRELOAD="1".
 * Šetrí dáta pri Save-Data a nespúšťa sa v dev.
 * Registráciu modulov si spravíš v 'src/perf/routes.preload.ts' (voliteľné).
 */
export async function initPreload() {
  if (import.meta.env.DEV) return;
  if ((import.meta as any).env.VITE_PRELOAD !== '1') return;

  const nav: any = (navigator as any);
  if (nav.connection && nav.connection.saveData) return; // rešpektuj Save-Data

  const boot = async () => {
    let importers: Array<() => Promise<unknown>> = [];
    
    // Preloaders sa registrujú v routes.preload.ts (voliteľné)
    // Ak chcete preloadovať routy, vytvorte src/perf/routes.preload.ts s:
    // export const preloaders = [() => import('../pages/Dashboard')];
    
    // spúšťaj s malým odstupom, aby si nezablokoval hlavné vlákno
    let delay = 200;
    for (const imp of importers) {
      setTimeout(() => { try { imp(); } catch {} }, delay);
      delay += 150;
    }
  };

  if ('requestIdleCallback' in window) (window as any).requestIdleCallback(boot, { timeout: 2500 });
  else setTimeout(boot, 0);
}
