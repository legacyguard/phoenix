const fs = require("fs");
for (const p of [
  "next-i18next.config.ts",
  "next-i18next.config.js",
  "next-i18next.config.cjs",
  "next-i18next.config.mjs",
]) {
  if (fs.existsSync(p)) {
    const t = fs.readFileSync(p, "utf8");
    const m = t.match(/defaultNS\s*:\s*['"]([^'"]+)['"]/);
    if (m) {
      console.log(m[1]);
      process.exit(0);
    }
  }
}
console.log("common");
