export function prefetchUrl(url: string) {
  try {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  } catch {}
}

type Importer = () => Promise<unknown>;
const registry: Record<string, Importer> = {};
export function registerRoutePrefetch(path: string, importer: Importer) {
  registry[path] = importer;
}
export function prefetchRouteChunk(path: string) {
  const imp = registry[path];
  if (imp) { imp(); } // trigger dynamic import
}
