#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = '/Users/luborfedak/Documents/Github/phoenix';
const enDir = path.join(root, 'src/i18n/locales/en');
const bgDir = path.join(root, 'src/i18n/locales/bg');

function readJsonSafe(p) {
  try {
    const text = fs.readFileSync(p, 'utf8');
    return { ok: true, text, data: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

function listJson(dir) {
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
}

function reconcile(enVal, bgVal) {
  const et = Object.prototype.toString.call(enVal);
  const bt = Object.prototype.toString.call(bgVal);

  // For strings: keep BG if string; otherwise empty string
  if (et === '[object String]') {
    if (bt === '[object String]') return bgVal;
    return '';
  }

  // For numbers/booleans/null: prefer BG if same type, else copy EN to keep structure coherent
  if (et === '[object Number]' || et === '[object Boolean]' || enVal === null) {
    if (et === bt) return bgVal;
    return enVal;
  }

  // Arrays: mirror EN length; reconcile items one by one
  if (et === '[object Array]') {
    const enArr = enVal;
    const bgArr = Array.isArray(bgVal) ? bgVal : [];
    const out = [];
    for (let i = 0; i < enArr.length; i++) {
      out.push(reconcile(enArr[i], bgArr[i]));
    }
    return out;
  }

  // Objects: follow EN key order strictly; recurse
  if (et === '[object Object]') {
    const result = {};
    const bgObj = (bt === '[object Object]') ? bgVal : {};
    for (const k of Object.keys(enVal)) {
      result[k] = reconcile(enVal[k], bgObj[k]);
    }
    return result;
  }

  // Fallback: copy EN
  return enVal;
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function main() {
  const enFiles = listJson(enDir);
  const bgFiles = listJson(bgDir);
  const bgSet = new Set(bgFiles);
  const backupDir = path.join(bgDir, `.backup-${timestamp()}`);
  ensureDir(backupDir);

  const actions = [];

  for (const file of enFiles) {
    const enPath = path.join(enDir, file);
    const bgPath = path.join(bgDir, file);
    const enRes = readJsonSafe(enPath);
    if (!enRes.ok) {
      console.error(`[ERROR] Failed to parse EN ${file}:`, enRes.error);
      process.exitCode = 1;
      continue;
    }

    const bgRes = readJsonSafe(bgPath);
    const bgData = bgRes.ok ? bgRes.data : undefined;

    // Reconcile into new BG data
    const newBg = reconcile(enRes.data, bgData);
    const newText = JSON.stringify(newBg, null, 2) + '\n';

    // Backup existing BG file if it exists and contents differ
    if (fs.existsSync(bgPath)) {
      const currentText = fs.readFileSync(bgPath, 'utf8');
      if (currentText !== newText) {
        const bkpPath = path.join(backupDir, file);
        fs.writeFileSync(bkpPath, currentText, 'utf8');
        actions.push({ file, action: 'updated_with_backup', backup: path.relative(root, bkpPath) });
      } else {
        actions.push({ file, action: 'unchanged' });
      }
    } else {
      actions.push({ file, action: 'created' });
    }

    fs.writeFileSync(bgPath, newText, 'utf8');
  }

  // Report extras in BG that aren't in EN
  const extraInBg = bgFiles.filter(f => !new Set(enFiles).has(f));
  if (extraInBg.length) {
    actions.push({ extraBgFiles: extraInBg, note: 'These BG files have no EN counterpart and were left untouched.' });
  }

  console.log(JSON.stringify({ ok: true, actions }, null, 2));
}

main();
