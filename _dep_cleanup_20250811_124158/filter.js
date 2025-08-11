const fs = require("fs");
const path = process.argv[2];
const keep = new Set(process.argv.slice(3));
let data = { dependencies: [], devDependencies: [] };
try {
  data = JSON.parse(fs.readFileSync(path, "utf8"));
} catch {}
const filt = (arr) =>
  (arr || []).filter(
    (x) =>
      x &&
      ![...keep].some((k) => {
        if (k.endsWith("/*")) return x.startsWith(k.slice(0, -2));
        if (k.endsWith("*")) return x.startsWith(k.slice(0, -1));
        return x === k;
      }),
  );
const deps = filt(data.dependencies);
const dev = filt(data.devDependencies);
console.log(JSON.stringify({ deps, dev }, null, 2));
