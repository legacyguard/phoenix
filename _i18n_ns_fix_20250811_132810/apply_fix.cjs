const fs = require("fs"),
  path = require("path");
const [CSV, OUT, BDIR] = process.argv.slice(2);

function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function applyFixToText(txt, key, ns) {
  const keyRe = escRe(key);
  const nsKey = `${ns}:${key}`;
  let changes = 0;

  // t('key') / t("key")
  txt = txt.replace(
    new RegExp(`(\\bt\\s*\\(\\s*)(['\"])${keyRe}\\2`, "g"),
    (m, p, quote) => {
      changes++;
      return `${p}${quote}${nsKey}${quote}`;
    },
  );

  // i18n.t('key') / i18next.t('key')
  txt = txt.replace(
    new RegExp(`((?:i18n(?:ext)?\\.t)\\s*\\(\\s*)(['\"])${keyRe}\\2`, "g"),
    (m, p, quote) => {
      changes++;
      return `${p}${quote}${nsKey}${quote}`;
    },
  );

  // <Trans i18nKey="key">
  txt = txt.replace(
    new RegExp(`(i18nKey\\s*=\\s*)(['\"])${keyRe}\\2`, "g"),
    (m, p, quote) => {
      changes++;
      return `${p}${quote}${nsKey}${quote}`;
    },
  );

  return { txt, changes };
}

function parseCSVLine(line) {
  // CSV: "file","key","suggested_ns","reason"
  const arr = [];
  let i = 0,
    cur = "",
    inQ = false;
  while (i < line.length) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i += 2;
        continue;
      }
      if (ch === '"') {
        inQ = false;
        i++;
        continue;
      }
      cur += ch;
      i++;
      continue;
    } else {
      if (ch === ",") {
        arr.push(cur);
        cur = "";
        i++;
        continue;
      }
      if (ch === '"') {
        inQ = true;
        i++;
        continue;
      }
      cur += ch;
      i++;
      continue;
    }
  }
  arr.push(cur);
  return arr.map((s) => s.trim());
}

const raw = fs.readFileSync(CSV, "utf8").split(/\r?\n/).filter(Boolean);
if (!/^file,key,suggested_ns,reason$/i.test(raw[0])) {
  console.error("CSV header unexpected:", raw[0]);
  process.exit(1);
}
const rows = raw
  .slice(1)
  .map(parseCSVLine)
  .filter((cols) => cols.length >= 3 && cols[0] && cols[1] && cols[2]);

console.log(`Processing ${rows.length} rows from CSV...`);

// Skupina: file -> [{key, ns}]
const byFile = new Map();
for (const [file, key, ns] of rows) {
  if (key.includes(":")) continue; // už namespacované
  if (!/^[\w.-]+(\.[\w.-]+)*$/.test(key)) continue; // len literal kľúče
  const arr = byFile.get(file) || [];
  // dedupe per file+key
  if (!arr.find((x) => x.key === key && x.ns === ns)) arr.push({ key, ns });
  byFile.set(file, arr);
}

console.log(`Grouped into ${byFile.size} files...`);

const summary = {
  filesProcessed: 0,
  filesChanged: 0,
  totalReplacements: 0,
  skippedFiles: 0,
  errors: [],
};
const changedFiles = [];

for (const [file, list] of byFile.entries()) {
  if (!fs.existsSync(file)) {
    summary.skippedFiles++;
    continue;
  }
  let txt = fs.readFileSync(file, "utf8");
  const before = txt;
  let fileChanges = 0;
  for (const { key, ns } of list) {
    const r = applyFixToText(txt, key, ns);
    txt = r.txt;
    fileChanges += r.changes;
  }
  summary.filesProcessed++;
  if (fileChanges > 0) {
    // backup
    const bakPath = path.join(BDIR, "files", file);
    fs.mkdirSync(path.dirname(bakPath), { recursive: true });
    fs.writeFileSync(bakPath, before);
    fs.writeFileSync(file, txt);
    summary.filesChanged++;
    summary.totalReplacements += fileChanges;
    changedFiles.push({ file, replacements: fileChanges });
  }
}

fs.writeFileSync(
  path.join(OUT, "changed_files.json"),
  JSON.stringify(changedFiles, null, 2),
);
fs.writeFileSync(
  path.join(OUT, "_summary.json"),
  JSON.stringify(summary, null, 2),
);
console.log("== NAMESPACE FIX SUMMARY ==");
console.log(JSON.stringify(summary, null, 2));
