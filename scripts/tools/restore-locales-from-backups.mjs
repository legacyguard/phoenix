#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const LOCALES_ROOT = path.resolve(process.cwd(), 'src/i18n/locales');

function listLangDirs(root) {
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => path.join(root, d.name));
}

function listJson(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.json'))
    .map((e) => path.join(dir, e.name));
}

function findBackupCandidates(langDir, filename) {
  // backups look like .backup-gtranslate-YYYY..., .backup-fill-..., .backup-*
  const backups = fs
    .readdirSync(langDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith('.backup-'))
    .map((d) => path.join(langDir, d.name))
    .sort(); // lexicographic sort so later names likely newer

  const candidates = [];
  for (const bdir of backups) {
    const candidatePath = path.join(bdir, filename);
    if (fs.existsSync(candidatePath)) {
      candidates.push(candidatePath);
    }
  }
  return candidates;
}

function isInvalidJson(text) {
  if (!text || !text.trim()) return true;
  const head = text.trim().slice(0, 128).toLowerCase();
  if (head.startsWith('<!doctype') || head.startsWith('<html')) return true;
  if (text.includes('<<<<<<<') || text.includes('=======') || text.includes('>>>>>>>')) return true;
  try {
    JSON.parse(text);
    return false;
  } catch (_) {
    return true;
  }
}

function restoreLang(langDir) {
  const files = listJson(langDir);
  let restored = 0;
  for (const file of files) {
    const base = path.basename(file);
    const original = fs.readFileSync(file, 'utf8');
    if (!isInvalidJson(original)) continue;
    const backups = findBackupCandidates(langDir, base);
    if (backups.length === 0) continue;
    // Prefer the newest candidate (last after sort)
    for (let i = backups.length - 1; i >= 0; i--) {
      const cand = backups[i];
      try {
        const txt = fs.readFileSync(cand, 'utf8');
        if (!isInvalidJson(txt)) {
          fs.writeFileSync(file, txt, 'utf8');
          restored++;
          break;
        }
      } catch (_) {}
    }
  }
  return restored;
}

function validateAll(root) {
  const errors = [];
  for (const lang of listLangDirs(root)) {
    for (const f of listJson(lang)) {
      try {
        const t = fs.readFileSync(f, 'utf8');
        const head = t.trim().slice(0, 128).toLowerCase();
        if (head.startsWith('<!doctype') || head.startsWith('<html')) {
          errors.push({ file: f, error: 'HTML content' });
          continue;
        }
        JSON.parse(t);
      } catch (e) {
        errors.push({ file: f, error: String(e?.message || e) });
      }
    }
  }
  return errors;
}

function main() {
  const langs = listLangDirs(LOCALES_ROOT);
  let totalRestored = 0;
  for (const ld of langs) {
    const r = restoreLang(ld);
    totalRestored += r;
    if (r) console.log('[restore] restored', r, 'files in', path.basename(ld));
  }
  const errors = validateAll(LOCALES_ROOT);
  console.log('[restore] total restored:', totalRestored);
  if (errors.length) {
    console.log('[restore] parse errors remaining:', errors.length);
    for (const e of errors.slice(0, 50)) console.log(' -', e.file, '|', e.error);
    process.exitCode = 1;
  } else {
    console.log('[restore] all locale JSON valid');
  }
}

main();

