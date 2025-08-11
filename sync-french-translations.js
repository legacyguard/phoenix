import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to recursively get all keys from a nested object
function getAllKeys(obj, prefix = "") {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Function to get value by nested key
function getNestedValue(obj, key) {
  const keys = key.split(".");
  let current = obj;
  for (const k of keys) {
    if (current && typeof current === "object" && k in current) {
      current = current[k];
    } else {
      return undefined;
    }
  }
  return current;
}

// Function to set nested value
function setNestedValue(obj, key, value) {
  const keys = key.split(".");
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!(k in current) || typeof current[k] !== "object") {
      current[k] = {};
    }
    current = current[k];
  }

  current[keys[keys.length - 1]] = value;
}

// Function to sync a single file
function syncFile(enPath, frPath, filename) {
  console.log(`\n=== Syncing ${filename} ===`);

  try {
    const enContent = JSON.parse(fs.readFileSync(enPath, "utf8"));
    const frContent = JSON.parse(fs.readFileSync(frPath, "utf8"));

    const enKeys = getAllKeys(enContent);
    const frKeys = getAllKeys(frContent);

    // Find missing keys in French
    const missingInFrench = enKeys.filter((key) => !frKeys.includes(key));

    if (missingInFrench.length === 0) {
      console.log("✅ All keys already present in French");
      return { filename, added: 0, total: enKeys.length };
    }

    console.log(`📝 Adding ${missingInFrench.length} missing keys...`);

    // Add missing keys with English values as placeholders
    let addedCount = 0;
    for (const key of missingInFrench) {
      const enValue = getNestedValue(enContent, key);
      if (enValue !== undefined) {
        setNestedValue(frContent, key, enValue);
        addedCount++;
      }
    }

    // Write updated French file
    fs.writeFileSync(frPath, JSON.stringify(frContent, null, 2), "utf8");

    console.log(`✅ Added ${addedCount} keys to French file`);

    return { filename, added: addedCount, total: enKeys.length };
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
    return { filename, error: error.message };
  }
}

// Main sync function
function syncAllFrenchTranslations() {
  const enDir = path.join(__dirname, "src/i18n/locales/en");
  const frDir = path.join(__dirname, "src/i18n/locales/fr");

  console.log("🔄 Starting French translation sync...\n");

  try {
    const enFiles = fs
      .readdirSync(enDir)
      .filter((file) => file.endsWith(".json"));
    const results = [];
    let totalAdded = 0;
    let totalKeys = 0;

    for (const filename of enFiles) {
      const enPath = path.join(enDir, filename);
      const frPath = path.join(frDir, filename);

      if (fs.existsSync(frPath)) {
        const result = syncFile(enPath, frPath, filename);
        results.push(result);

        if (result.added) {
          totalAdded += result.added;
        }
        if (result.total) {
          totalKeys += result.total;
        }
      } else {
        console.log(`❌ French file missing: ${filename}`);
        results.push({ filename, error: "French file not found" });
      }
    }

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("📋 SYNC SUMMARY");
    console.log("=".repeat(50));
    console.log(`Total keys added: ${totalAdded}`);
    console.log(`Total keys in English: ${totalKeys}`);
    console.log(`Files processed: ${results.length}`);

    const filesWithChanges = results.filter((r) => r.added && r.added > 0);
    if (filesWithChanges.length > 0) {
      console.log("\n📝 Files updated:");
      filesWithChanges.forEach((r) => {
        console.log(`  - ${r.filename}: +${r.added} keys`);
      });
    }

    const filesNoChange = results.filter((r) => r.added === 0 && !r.error);
    if (filesNoChange.length > 0) {
      console.log("\n✅ Files already complete:");
      filesNoChange.forEach((r) => {
        console.log(`  - ${r.filename}`);
      });
    }

    console.log("\n🎯 Next steps:");
    console.log("1. Review the added keys in French files");
    console.log("2. Translate the English placeholder values to proper French");
    console.log(
      "3. Run audit script to verify completion: node audit-translations.js",
    );
  } catch (error) {
    console.error("❌ Error during sync:", error.message);
  }
}

// Run the sync
syncAllFrenchTranslations();
