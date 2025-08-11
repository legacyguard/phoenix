const fs = require("fs");
const en = JSON.parse(
  fs.readFileSync("src/i18n/locales/en/common.json", "utf8"),
);
const ga = JSON.parse(
  fs.readFileSync("src/i18n/locales/ga/common.json", "utf8"),
);

function flattenKeys(obj, prefix = "") {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? prefix + "." + key : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, newKey));
    } else {
      keys.push(newKey);
    }
  }
  return keys;
}

const enKeys = flattenKeys(en);
const gaKeys = flattenKeys(ga);
const missingKeys = enKeys.filter((key) => !gaKeys.includes(key));

// Group missing keys by their top-level section
const missingSections = {};
missingKeys.forEach((key) => {
  const section = key.split(".")[0];
  if (!missingSections[section]) missingSections[section] = [];
  missingSections[section].push(key);
});

console.log("Remaining missing sections and their key counts:");
Object.entries(missingSections)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([section, keys]) => {
    console.log(`${section}: ${keys.length} keys missing`);
  });

console.log(`\nTotal missing keys: ${missingKeys.length}`);
console.log(
  `Completion: ${((gaKeys.length / enKeys.length) * 100).toFixed(1)}%`,
);
