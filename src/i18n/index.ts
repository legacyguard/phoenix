import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Load all locale JSONs eagerly via Vite's glob import
// This picks up: ./locales/{lang}/{namespace}.json
const modules = import.meta.glob('./locales/*/*.json', { eager: true });

// Build resources object: { [lang]: { [namespace]: object } }
const resources: Record<string, Record<string, unknown>> = {};
const namespaces = new Set<string>();

for (const path in modules) {
  // Example path: './locales/en/ui-common.json'
  const m = modules[path] as any;
  const segs = path.split('/');
  const lang = segs[2];
  const file = segs[3];
  const ns = file.replace(/\.json$/i, '');
  namespaces.add(ns);
  const value = m?.default ?? m ?? {};
  if (!resources[lang]) resources[lang] = {};
  resources[lang][ns] = value;
}

// Prefer English as default; if missing, fallback to the first available language
const defaultLng = resources['en'] ? 'en' : Object.keys(resources)[0];

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLng,
    fallbackLng: 'en',
    ns: Array.from(namespaces),
    defaultNS: namespaces.has('ui-common') ? 'ui-common' : Array.from(namespaces)[0],
    interpolation: { escapeValue: false },
    returnNull: false,
  });

export default i18n;
