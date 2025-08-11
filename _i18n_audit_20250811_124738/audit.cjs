const fs = require('fs'), path=require('path');

const [locListFile, srcListFile, baseFile, outDir] = process.argv.slice(2);
const locFiles = fs.readFileSync(locListFile,'utf8').trim().split('\n').filter(Boolean);
const srcFiles = fs.readFileSync(srcListFile,'utf8').trim().split('\n').filter(Boolean);
const BASE = fs.readFileSync(baseFile,'utf8').trim();

const byLocaleNsKeys = new Map(); // locale -> ns -> Set(keys)
const invalidJson = [];
const placeholderMap = new Map(); // keyFull -> locale -> Set(placeholders)

function flatten(obj, prefix='') {
  const out=[];
  for (const [k,v] of Object.entries(obj||{})) {
    const p = prefix? `${prefix}.${k}` : k;
    if (v && typeof v==='object' && !Array.isArray(v)) out.push(...flatten(v,p));
    else out.push(p);
  }
  return out;
}
function placeholders(str) {
  const set=new Set();
  if (typeof str==='string') {
    for (const m of str.matchAll(/\{\{\s*([^{}\s]+)\s*\}\}/g)) set.add(m[1]);
  }
  return set;
}

for (const f of locFiles) {
  const m = f.match(/[/\\]([a-zA-Z0-9_-]+)[/\\]([^/\\]+)\.json$/);
  if (!m) continue;
  const locale = m[1], ns = m[2];
  try {
    const json = JSON.parse(fs.readFileSync(f,'utf8'));
    const keys = flatten(json);
    if (!byLocaleNsKeys.has(locale)) byLocaleNsKeys.set(locale, new Map());
    byLocaleNsKeys.get(locale).set(ns, new Set(keys));
    // placeholders snapshot
    for (const k of keys) {
      const val = k.split('.').reduce((o,seg)=> (o&&o[seg]!=null?o[seg]:undefined), json);
      const ph = placeholders(val);
      if (ph.size) {
        const full = `${ns}:${k}`;
        if (!placeholderMap.has(full)) placeholderMap.set(full, new Map());
        placeholderMap.get(full).set(locale, ph);
      }
    }
  } catch(e) {
    invalidJson.push({file:f, error:String(e.message||e)});
  }
}

// Scan source files for used i18n keys
const used = new Set();            // "ns:key.dot"
const unknownNs = [];              // {file,line,key}
const reLines = [
  /[\s\(]t\s*\(\s*['"]([^'"]+)['"]\s*[\),]/g,
  /i18n\.t\s*\(\s*['"]([^'"]+)['"]\s*[\),]/g,
  /i18next\.t\s*\(\s*['"]([^'"]+)['"]\s*[\),]/g,
  /<Trans[^>]*\bi18nKey\s*=\s*['"]([^'"]+)['"][^>]*>/g
];

for (const f of srcFiles) {
  let txt=''; try { txt = fs.readFileSync(f,'utf8'); } catch {}
  const lines = txt.split('\n');
  for (let ln=0; ln<lines.length; ln++) {
    const line = lines[ln];
    for (const re of reLines) {
      re.lastIndex=0;
      let m; while ((m=re.exec(line))) {
        const k = m[1];
        if (k.includes(':')) used.add(k);
        else unknownNs.push({file:f, line:ln+1, key:k});
      }
    }
  }
}

// Build locale list
const locales = [...byLocaleNsKeys.keys()].sort();

// Missing by locale
const missingByLocale = {};
for (const loc of locales) {
  missingByLocale[loc] = [];
}
for (const k of used) {
  const [ns, rest] = k.split(':');
  for (const loc of locales) {
    const nsMap = byLocaleNsKeys.get(loc) || new Map();
    const set = nsMap.get(ns);
    if (!set || !set.has(rest)) missingByLocale[loc].push(k);
  }
}

// Unused keys (only in BASE)
const unusedInBase = [];
{
  const nsMap = byLocaleNsKeys.get(BASE) || new Map();
  for (const [ns, set] of nsMap) {
    for (const key of set) {
      const full = `${ns}:${key}`;
      if (!used.has(full)) unusedInBase.push(full);
    }
  }
}

// Placeholder mismatch across locales (compare to BASE if exists)
const placeholderMismatch = [];
for (const [fullKey, perLoc] of placeholderMap) {
  const baseSet = perLoc.get(BASE);
  if (!baseSet) continue;
  for (const loc of locales) {
    if (loc===BASE) continue;
    const set = perLoc.get(loc);
    const a = set? [...set].sort().join(',') : '';
    const b = [...baseSet].sort().join(',');
    if (a !== b) {
      placeholderMismatch.push({ key: fullKey, base: BASE, basePlaceholders:[...baseSet], locale: loc, localePlaceholders: set? [...set]: [] });
    }
  }
}

// Outputs
fs.writeFileSync(path.join(outDir,'missing_by_locale.json'), JSON.stringify(missingByLocale,null,2));
fs.writeFileSync(path.join(outDir,'unused_in_base.json'), JSON.stringify({base:BASE, unused:unusedInBase.sort()},null,2));
fs.writeFileSync(path.join(outDir,'unknown_namespace_usages.json'), JSON.stringify(unknownNs,null,2));
fs.writeFileSync(path.join(outDir,'invalid_json.json'), JSON.stringify(invalidJson,null,2));
fs.writeFileSync(path.join(outDir,'placeholder_mismatch.json'), JSON.stringify(placeholderMismatch,null,2));

// Summary
const sum = [];
sum.push(`Locales dir: ${process.cwd()+'/'+path.relative(process.cwd(), '${LOC}')}`); // filled by shell, not perfect
sum.push(`Base locale: ${BASE}`);
sum.push(`Locales found: ${locales.length}`);
sum.push(`Used keys detected: ${used.size}`);
for (const loc of locales) sum.push(`Missing in ${loc}: ${missingByLocale[loc].length}`);
sum.push(`Unused keys in ${BASE}: ${unusedInBase.length}`);
sum.push(`Unknown-namespace usages: ${unknownNs.length}`);
sum.push(`Invalid JSON files: ${invalidJson.length}`);
sum.push(`Placeholder mismatches: ${placeholderMismatch.length}`);
fs.writeFileSync(path.join(outDir,'_summary.txt'), sum.join('\n'));
