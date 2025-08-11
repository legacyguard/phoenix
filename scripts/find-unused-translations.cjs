const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Function to extract all keys from a JSON object recursively
function extractKeys(obj, prefix = "", keys = []) {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      extractKeys(value, fullKey, keys);
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Function to search for key usage in files
function searchForKeyUsage(key, files) {
  const usage = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf8");

      // Search for different patterns of key usage
      const patterns = [
        `t('${key}')`,
        `t("${key}")`,
        `t(\`${key}\`)`,
        `t('${key.replace(/\./g, "', '")}')`, // For nested keys
        `t("${key.replace(/\./g, '", "')}")`, // For nested keys
      ];

      for (const pattern of patterns) {
        if (content.includes(pattern)) {
          usage.push({
            file,
            pattern,
            line:
              content.split("\n").findIndex((line) => line.includes(pattern)) +
              1,
          });
        }
      }
    } catch (error) {
      console.warn(`Error reading file ${file}:`, error.message);
    }
  }

  return usage;
}

// Main function
async function findUnusedTranslations() {
  const localesDir = path.join(__dirname, "../src/i18n/locales");
  const enDir = path.join(localesDir, "en");

  // Get all JSON files in the English locale directory
  const jsonFiles = glob.sync(path.join(enDir, "*.json"));

  // Get all TypeScript/TSX files in the src directory
  const sourceFiles = glob.sync(path.join(__dirname, "../src/**/*.{ts,tsx}"));

  const allKeys = new Set();
  const keyUsage = new Map();

  console.log("🔍 Analyzing translation files...");

  // Extract all keys from English translation files
  for (const jsonFile of jsonFiles) {
    try {
      const content = fs.readFileSync(jsonFile, "utf8");
      const translations = JSON.parse(content);
      const fileName = path.basename(jsonFile, ".json");

      const keys = extractKeys(translations);
      console.log(`📁 ${fileName}.json: ${keys.length} keys`);

      for (const key of keys) {
        const fullKey = `${fileName}.${key}`;
        allKeys.add(fullKey);
        keyUsage.set(fullKey, []);
      }
    } catch (error) {
      console.error(`Error processing ${jsonFile}:`, error.message);
    }
  }

  console.log(
    `\n🔍 Searching for key usage in ${sourceFiles.length} source files...`,
  );

  // Search for key usage in source files
  for (const key of allKeys) {
    const usage = searchForKeyUsage(key, sourceFiles);
    keyUsage.set(key, usage);

    if (usage.length > 0) {
      console.log(`✅ ${key}: ${usage.length} usage(s)`);
    }
  }

  // Find unused keys
  const unusedKeys = [];
  for (const [key, usage] of keyUsage.entries()) {
    if (usage.length === 0) {
      unusedKeys.push(key);
    }
  }

  console.log(`\n📊 Results:`);
  console.log(`Total keys: ${allKeys.size}`);
  console.log(`Used keys: ${allKeys.size - unusedKeys.length}`);
  console.log(`Unused keys: ${unusedKeys.length}`);

  if (unusedKeys.length > 0) {
    console.log(`\n🗑️  Unused keys:`);
    unusedKeys.sort().forEach((key) => {
      console.log(`  - ${key}`);
    });

    // Group unused keys by file
    const unusedByFile = {};
    for (const key of unusedKeys) {
      const [fileName] = key.split(".");
      if (!unusedByFile[fileName]) {
        unusedByFile[fileName] = [];
      }
      unusedByFile[fileName].push(key.substring(fileName.length + 1));
    }

    console.log(`\n📁 Unused keys by file:`);
    for (const [fileName, keys] of Object.entries(unusedByFile)) {
      console.log(`\n${fileName}.json (${keys.length} keys):`);
      keys.forEach((key) => {
        console.log(`  - ${key}`);
      });
    }
  }

  return {
    totalKeys: allKeys.size,
    usedKeys: allKeys.size - unusedKeys.length,
    unusedKeys: unusedKeys.length,
    unusedByFile: unusedKeys.reduce((acc, key) => {
      const [fileName] = key.split(".");
      if (!acc[fileName]) {
        acc[fileName] = [];
      }
      acc[fileName].push(key.substring(fileName.length + 1));
      return acc;
    }, {}),
  };
}

// Run the analysis
findUnusedTranslations()
  .then((results) => {
    console.log("\n✅ Analysis complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error during analysis:", error);
    process.exit(1);
  });
