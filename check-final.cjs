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

console.log("Final status of Irish translation:");
console.log(`Total keys in English: ${enKeys.length}`);
console.log(`Total keys in Irish: ${gaKeys.length}`);
console.log(`Missing keys: ${missingKeys.length}`);
console.log(
  `Completion percentage: ${((gaKeys.length / enKeys.length) * 100).toFixed(1)}%`,
);

console.log("\nMissing keys in Irish translation:");
missingKeys.slice(0, 20).forEach((key) => console.log("  " + key));
if (missingKeys.length > 20) {
  console.log("... and " + (missingKeys.length - 20) + " more");
}
