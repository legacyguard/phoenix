const fs = require("fs");
const path = require("path");

const localesDir = "./src/i18n/locales";
const expectedKeys = [
  "details.importanceLevel",
  "details.important",
  "details.reference",
  "errors.storageLimitReached",
  "types.other",
  "validation.nameMaxLength",
  "validation.nameMinLength",
  "validation.nameRequired",
];

function checkObjectHasKeys(obj, keyPath) {
  const keys = keyPath.split(".");
  let current = obj;

  for (const key of keys) {
    if (!current || typeof current !== "object" || !(key in current)) {
      return false;
    }
    current = current[key];
  }

  return typeof current === "string" && current.trim().length > 0;
}

console.log(
  "Checking documents.json translations in all language directories...\n",
);

const languageDirs = fs
  .readdirSync(localesDir)
  .filter((dir) => fs.statSync(path.join(localesDir, dir)).isDirectory())
  .sort();

const results = [];
let allValid = true;

languageDirs.forEach((lang) => {
  const documentsPath = path.join(localesDir, lang, "documents.json");

  if (!fs.existsSync(documentsPath)) {
    console.log(`❌ ${lang}: documents.json file missing`);
    allValid = false;
    return;
  }

  try {
    const content = fs.readFileSync(documentsPath, "utf8");
    const json = JSON.parse(content);

    const missingKeys = [];
    const emptyKeys = [];

    expectedKeys.forEach((keyPath) => {
      if (!checkObjectHasKeys(json, keyPath)) {
        const keys = keyPath.split(".");
        let current = json;
        let found = true;

        for (const key of keys) {
          if (!current || typeof current !== "object" || !(key in current)) {
            missingKeys.push(keyPath);
            found = false;
            break;
          }
          current = current[key];
        }

        if (
          found &&
          (!current ||
            typeof current !== "string" ||
            current.trim().length === 0)
        ) {
          emptyKeys.push(keyPath);
        }
      }
    });

    if (missingKeys.length === 0 && emptyKeys.length === 0) {
      console.log(`✅ ${lang}: OK`);
      results.push({ lang, status: "OK" });
    } else {
      console.log(`❌ ${lang}: Issues found`);
      if (missingKeys.length > 0) {
        console.log(`   Missing keys: ${missingKeys.join(", ")}`);
      }
      if (emptyKeys.length > 0) {
        console.log(`   Empty values: ${emptyKeys.join(", ")}`);
      }
      allValid = false;
      results.push({ lang, status: "ERROR", missingKeys, emptyKeys });
    }
  } catch (error) {
    console.log(`❌ ${lang}: JSON parse error - ${error.message}`);
    allValid = false;
    results.push({ lang, status: "PARSE_ERROR", error: error.message });
  }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Total languages checked: ${languageDirs.length}`);
console.log(
  `Valid translations: ${results.filter((r) => r.status === "OK").length}`,
);
console.log(`Issues found: ${results.filter((r) => r.status !== "OK").length}`);

if (allValid) {
  console.log("\n🎉 All documents.json translations are valid!");
} else {
  console.log("\n⚠️  Some translations need attention.");
}
