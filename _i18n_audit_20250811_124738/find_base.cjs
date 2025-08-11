const fs = require("fs"),
  paths = [
    "next-i18next.config.ts",
    "next-i18next.config.js",
    "next-i18next.config.cjs",
    "next-i18next.config.mjs",
  ];
let def = null;
for (const p of paths) {
  if (fs.existsSync(p)) {
    try {
      const txt = fs.readFileSync(p, "utf8");
      const m = txt.match(/defaultLocale\s*:\s*['"]([a-zA-Z-_]+)['"]/);
      if (m) {
        def = m[1];
        break;
      }
    } catch {}
  }
}
console.log(def || "");
