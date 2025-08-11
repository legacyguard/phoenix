const fs = require("fs"),
  path = require("path");
const [infile, outDir, DEFAULT_NS] = process.argv.slice(2);
const rows = JSON.parse(fs.readFileSync(infile, "utf8")); // {file,line,key}

const byKey = new Map(),
  byFile = new Map();
for (const r of rows) {
  byKey.set(r.key, (byKey.get(r.key) || 0) + 1);
  byFile.set(r.file, (byFile.get(r.file) || 0) + 1);
}

const sortEntries = (m) => [...m.entries()].sort((a, b) => b[1] - a[1]);

// heuristika na návrh namespace podľa cesty/kontextu
function suggestNS(file, key) {
  const f = file.toLowerCase();
  const k = (key || "").toLowerCase();
  const has = (s) => f.includes(s) || k.startsWith(s);
  if (has("/emails/") || has("mailer") || has("/email"))
    return { ns: "emails", reason: "path/email" };
  if (has("/auth/") || has("login") || has("register") || has("password"))
    return { ns: "auth", reason: "auth path/key" };
  if (has("/dashboard/") || has("dashboard"))
    return { ns: "dashboard-main", reason: "dashboard path/key" };
  if (has("/onboarding/") || has("onboarding"))
    return { ns: "onboarding", reason: "onboarding path/key" };
  if (has("/settings/") || has("preferences") || has("privacy"))
    return { ns: "settings", reason: "settings path/key" };
  if (has("/billing/") || has("subscription") || has("plan"))
    return { ns: "billing", reason: "billing path/key" };
  if (has("/errors/") || has("error") || has("failed"))
    return { ns: "errors", reason: "errors path/key" };
  return { ns: DEFAULT_NS, reason: `defaultNS(${DEFAULT_NS})` };
}

// top 50 kľúčov
const topKeys = sortEntries(byKey)
  .slice(0, 50)
  .map(([k, n]) => `${n}\t${k}`);
fs.writeFileSync(path.join(outDir, "top_keys.txt"), topKeys.join("\n") + "\n");

// top 50 súborov
const topFiles = sortEntries(byFile)
  .slice(0, 50)
  .map(([f, n]) => `${n}\t${f}`);
fs.writeFileSync(
  path.join(outDir, "top_files.txt"),
  topFiles.join("\n") + "\n",
);

// návrhy mapovania (limit 2000 riadkov pre prehľad)
const limit = 2000;
const suggestionsHeader = "file,key,suggested_ns,reason";
const sugg = [];
let count = 0;
for (const r of rows) {
  if (++count > limit) break;
  const s = suggestNS(r.file, r.key);
  // CSV safe
  const csv = [r.file, r.key, s.ns, s.reason]
    .map((x) => `"${String(x).replace(/"/g, '""')}"`)
    .join(",");
  sugg.push(csv);
}
fs.writeFileSync(
  path.join(outDir, "suggestions.csv"),
  suggestionsHeader + "\n" + sugg.join("\n") + "\n",
);

// sumar
const summary = [
  `Unknown total: ${rows.length}`,
  `DefaultNS: ${DEFAULT_NS}`,
  `Top keys: ${topKeys.length}`,
  `Top files: ${topFiles.length}`,
  `Suggestions: ${Math.min(rows.length, limit)} (of ${rows.length})`,
].join("\n");
fs.writeFileSync(path.join(outDir, "_summary.txt"), summary + "\n");
console.log(summary);
