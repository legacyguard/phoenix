#!/usr/bin/env node
/*
 Validates i18n JSON structure across languages:
 - Ensures each namespace has < 900 keys per language
 - Ensures namespaces are present for all languages
 - Ensures keys sets match per namespace across languages (warns; does not fail unless --strict)
*/

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const LOCALES_DIR = path.join(ROOT, 'src', 'i18n', 'locales');
const STRICT = process.argv.includes('--strict');

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return {}; }
}

function listLangs() {
  return fs.readdirSync(LOCALES_DIR).filter(f => fs.statSync(path.join(LOCALES_DIR, f)).isDirectory());
}

function listNamespaces(lang) {
  const dir = path.join(LOCALES_DIR, lang);
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => f.replace(/\.json$/, ''));
}

function flattenKeys(obj, prefix = '') {
  let keys = [];
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? prefix + '.' + k : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) keys = keys.concat(flattenKeys(v, key));
    else keys.push(key);
  }
  return keys;
}

function main() {
  const langs = listLangs();
  if (!langs.length) {
    console.log('No languages found.');
    process.exit(0);
  }

  const allNamespaces = new Set();
  const byLang = {};

  for (const lang of langs) {
    const nss = listNamespaces(lang);
    byLang[lang] = {};
    nss.forEach(ns => allNamespaces.add(ns));
    for (const ns of nss) {
      const p = path.join(LOCALES_DIR, lang, ns + '.json');
      const json = readJson(p);
      const flat = flattenKeys(json);
      byLang[lang][ns] = { count: flat.length, keys: new Set(flat) };
      if (flat.length >= 900) {
        console.error(`[FAIL] ${lang}/${ns}.json has ${flat.length} keys (>= 900)`);
        process.exitCode = 1;
      }
    }
  }

  const nsList = Array.from(allNamespaces);
  // Ensure namespace presence
  for (const lang of langs) {
    for (const ns of nsList) {
      if (!byLang[lang][ns]) {
        const msg = `[WARN] Missing namespace for ${lang}/${ns}.json`;
        if (STRICT) { console.error(msg); process.exitCode = 1; } else { console.warn(msg); }
      }
    }
  }

  // Key parity check
  const refLang = langs.includes('en') ? 'en' : langs[0];
  for (const ns of nsList) {
    const ref = byLang[refLang][ns];
    if (!ref) continue;
    for (const lang of langs) {
      const cur = byLang[lang][ns];
      if (!cur) continue;
      const missing = [...ref.keys].filter(k => !cur.keys.has(k));
      const extra = [...cur.keys].filter(k => !ref.keys.has(k));
      if (missing.length || extra.length) {
        const msg = `[WARN] Key mismatch in ${lang}/${ns}.json: missing=${missing.length}, extra=${extra.length}`;
        if (STRICT) { console.error(msg); process.exitCode = 1; } else { console.warn(msg); }
      }
    }
  }

  if (process.exitCode) {
    console.error('i18n validation failed.');
  } else {
    console.log('i18n validation passed.');
  }
}

main();

