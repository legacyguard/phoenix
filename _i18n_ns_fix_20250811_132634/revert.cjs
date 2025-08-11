const fs = require("fs"),
  path = require("path");
const [OUT, BDIR] = process.argv.slice(2);
const changed = JSON.parse(
  fs.readFileSync(path.join(OUT, "changed_files.json"), "utf8"),
);
for (const { file } of changed) {
  const bak = path.join(BDIR, "files", file);
  if (fs.existsSync(bak)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.copyFileSync(bak, file);
  }
}
