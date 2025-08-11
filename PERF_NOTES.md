# Performance notes (Phase 3)
- RUM: nastav `VITE_RUM_ENDPOINT` pre zber Web-Vitals (LCP/CLS/INP). Vypnutie logu: `VITE_RUM_CONSOLE=0`.
- Size-guard baseline: `npm run size:baseline` (po vedomej zmene rozpočtu).
- PWA: SW artefakty sú vylúčené zo size-guard; cache stratégie sú konzervatívne (static cache-first, pages network-first).
- Prefetch: používaj `<PrefetchLink prefetch="hover|viewport">`.
- Imports-guard: zakazuje `date-fns` root, `date-fns/locale` index, lodash default/CJS, lucide namespace.
- i18n-guard: baseline režim – fail len na nové porušenia.
