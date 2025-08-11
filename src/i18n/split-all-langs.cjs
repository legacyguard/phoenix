const fs = require("fs");
const path = require("path");

const baseDir = "/Users/luborfedak/Documents/Github/phoenix/src/i18n/locales";
const languages = [
  "bg",
  "cs",
  "cy",
  "da",
  "de",
  "el",
  "es",
  "et",
  "fi",
  "fr",
  "ga",
  "hr",
  "hu",
  "is",
  "it",
  "lt",
  "lv",
  "me",
  "mk",
  "mt",
  "nl",
  "no",
  "pl",
  "pt",
  "ro",
  "ru",
  "sk",
  "sl",
  "sq",
  "sr",
  "sv",
  "tr",
  "uk",
];
const modules = [
  "common",
  "auth",
  "subscription",
  "dashboard",
  "documents",
  "assets",
  "family",
  "guardians",
  "wills",
  "settings",
  "onboarding",
  "help",
  "ui",
  "errors",
  "emails",
];

// Helper: Merge translations, giving precedence to existing
function mergeTranslations(english, existing) {
  if (typeof english !== "object" || typeof existing !== "object")
    return english;
  let merged = { ...english };
  for (const [k, v] of Object.entries(existing)) {
    if (k in merged && typeof v === "object" && typeof merged[k] === "object") {
      merged[k] = mergeTranslations(merged[k], v);
    } else {
      merged[k] = v;
    }
  }
  return merged;
}

languages.forEach((lang) => {
  const langDir = path.join(baseDir, lang);
  if (!fs.existsSync(langDir)) fs.mkdirSync(langDir);

  modules.forEach((module) => {
    const srcFile = path.join(baseDir, "en", `${module}.json`);
    const destFile = path.join(langDir, `${module}.json`);
    if (!fs.existsSync(srcFile)) return;
    const englishTranslations = JSON.parse(fs.readFileSync(srcFile, "utf8"));
    let existingTranslations = {};
    if (fs.existsSync(destFile)) {
      existingTranslations = JSON.parse(fs.readFileSync(destFile, "utf8"));
    } else if (fs.existsSync(path.join(langDir, "common.json"))) {
      // Try to get from the big original common.json
      try {
        const allCommon = JSON.parse(
          fs.readFileSync(path.join(langDir, "common.json"), "utf8"),
        );
        // Only get keys that are in the English file
        existingTranslations = {};
        for (const k of Object.keys(englishTranslations)) {
          if (allCommon[k] !== undefined)
            existingTranslations[k] = allCommon[k];
        }
      } catch {}
    }
    // Merge, giving precedence to existing translations
    const mergedTranslations = mergeTranslations(
      englishTranslations,
      existingTranslations,
    );
    fs.writeFileSync(
      destFile,
      JSON.stringify(mergedTranslations, null, 2),
      "utf8",
    );
    console.log(`Processed ${lang}/${module}.json`);
  });
});

console.log("\nAll language modules generated!");
