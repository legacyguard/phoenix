#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.argv[2] || path.resolve(process.cwd(), 'src/i18n/locales');

function listJsonFiles(dir) {
  const acc = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) acc.push(...listJsonFiles(p));
    else if (entry.isFile() && entry.name.endsWith('.json')) acc.push(p);
  }
  return acc;
}

function hasConflictMarkers(text) {
  return text.includes('<<<<<<<') && text.includes('=======') && text.includes('>>>>>>>');
}

function resolveConflicts(text, prefer = 'A') {
  // Normalize newlines for consistent parsing
  let out = (text || '').replace(/\r\n?/g, '\n');
  // Regex matches git conflict blocks including labels after markers
  const re = /\<\<\<\<\<\<\<[^\n]*\n([\s\S]*?)\n=======\n([\s\S]*?)\n\>\>\>\>\>\>\>[^\n]*\n/m;
  let safety = 0;
  while (hasConflictMarkers(out)) {
    if (safety++ > 20000) throw new Error('Too many iterations while resolving conflicts');
    const match = out.match(re);
    if (!match) break;
    const a = match[1];
    const b = match[2];
    const chosen = prefer === 'A' ? a : b;
    out = out.replace(re, chosen);
  }
  return out;
}

function countKeys(obj) {
  let count = 0;
  const stack = [obj];
  while (stack.length) {
    const cur = stack.pop();
    if (cur && typeof cur === 'object') {
      for (const k of Object.keys(cur)) {
        count++;
        const v = cur[k];
        if (v && typeof v === 'object') stack.push(v);
      }
    }
  }
  return count;
}

function tryParse(jsonText) {
  try {
    const obj = JSON.parse(jsonText);
    return { ok: true, obj };
  } catch (e) {
    return { ok: false, error: e };
  }
}

function fixFile(file) {
  const original = fs.readFileSync(file, 'utf8');
  if (!hasConflictMarkers(original)) return { file, changed: false };

  const aResolved = resolveConflicts(original, 'A');
  const bResolved = resolveConflicts(original, 'B');

  const a = tryParse(aResolved);
  const b = tryParse(bResolved);

  let chosenText = null;
  if (a.ok && b.ok) {
    const ak = countKeys(a.obj);
    const bk = countKeys(b.obj);
    chosenText = ak >= bk ? aResolved : bResolved;
  } else if (a.ok) {
    chosenText = aResolved;
  } else if (b.ok) {
    chosenText = bResolved;
  } else {
    // Fallback: keep side A resolution even if invalid; last resort attempt to strip markers naively
    chosenText = aResolved;
  }

  // Final sanity: ensure it parses (or leave original untouched if not)
  const finalCheck = tryParse(chosenText);
  if (!finalCheck.ok) {
    return { file, changed: false, error: 'Could not produce valid JSON automatically' };
  }

  fs.writeFileSync(file, chosenText, 'utf8');
  return { file, changed: true };
}

function validateAll(files) {
  const errors = [];
  for (const f of files) {
    try {
      const txt = fs.readFileSync(f, 'utf8');
      // quick skip for HTML response accidentally in tree
      const head = (txt.trim().slice(0, 256) || '').toLowerCase();
      if (head.startsWith('<!doctype') || head.startsWith('<html')) {
        errors.push({ file: f, error: 'HTML content in JSON file' });
        continue;
      }
      JSON.parse(txt);
    } catch (e) {
      errors.push({ file: f, error: String(e?.message || e) });
    }
  }
  return errors;
}

const files = listJsonFiles(ROOT);
const conflicted = files.filter(f => {
  try {
    const t = fs.readFileSync(f, 'utf8');
    return hasConflictMarkers(t);
  } catch { return false; }
});

const results = conflicted.map(fixFile);
const changed = results.filter(r => r.changed).length;
const failed = results.filter(r => r.error);

let parseErrors = validateAll(files);

console.log('[i18n-resolve] scanned', files.length, 'json files');
console.log('[i18n-resolve] conflicted', conflicted.length, 'files');
console.log('[i18n-resolve] auto-fixed', changed, 'files');
if (failed.length) {
  console.log('[i18n-resolve] failed to auto-fix', failed.length, 'files:');
  for (const r of failed.slice(0, 50)) console.log(' -', r.file, '|', r.error);
}
if (parseErrors.length) {
  console.log('[i18n-resolve] JSON parse errors remaining before remediation:', parseErrors.length);
  for (const e of parseErrors.slice(0, 50)) console.log(' -', e.file, '|', e.error);
  // Remediation: back up and replace invalid JSON with empty object to enable fallbackNS
  const backupRoot = path.resolve(process.cwd(), 'src/i18n/.corrupted-backup');
  fs.mkdirSync(backupRoot, { recursive: true });
  for (const e of parseErrors) {
    try {
      const rel = path.relative(path.resolve(process.cwd(), 'src/i18n'), e.file);
      const dest = path.join(backupRoot, rel);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      // Move original file to backup
      fs.copyFileSync(e.file, dest);
      // Overwrite original with empty JSON so i18next can load and fallback
      fs.writeFileSync(e.file, '{\n}', 'utf8');
    } catch (err) {
      console.warn('[i18n-resolve] remediation failed for', e.file, String(err));
    }
  }
  // Re-validate after remediation
  parseErrors = validateAll(files);
}

if (parseErrors.length) {
  console.log('[i18n-resolve] JSON parse errors remaining after remediation:', parseErrors.length);
  for (const e of parseErrors.slice(0, 50)) console.log(' -', e.file, '|', e.error);
  process.exitCode = 1;
} else {
  console.log('[i18n-resolve] All locale JSON files parse successfully after remediation.');
}

