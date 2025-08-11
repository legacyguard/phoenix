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

// Function to search for key usage in files with multiple patterns
function searchForKeyUsage(key, files) {
  const usage = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, "utf8");

      // Multiple patterns to check for key usage
      const patterns = [
        // Exact key matches
        `t('${key}')`,
        `t("${key}")`,
        `t(\`${key}\`)`,

        // Namespace:key pattern (for useTranslation with namespace)
        `t('${key.replace(/^([^.]+)\./, "$1:")}')`,
        `t("${key.replace(/^([^.]+)\./, "$1:")}")`,
        `t(\`${key.replace(/^([^.]+)\./, "$1:")}\`)`,

        // Array access pattern for nested keys
        `t('${key.split(".").join("', '")}')`,
        `t("${key.split(".").join('", "')}")`,
        `t(\`${key.split(".").join("`, `")}\`)`,

        // Key as string literal
        `'${key}'`,
        `"${key}"`,
        `\`${key}\``,

        // Key in object properties
        `${key}:`,
        `"${key}":`,
        `'${key}':`,
      ];

      for (const pattern of patterns) {
        if (content.includes(pattern)) {
          usage.push({
            file: path.relative(process.cwd(), file),
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
async function reportUnusedTranslations() {
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
  let processedKeys = 0;
  for (const key of allKeys) {
    const usage = searchForKeyUsage(key, sourceFiles);
    keyUsage.set(key, usage);

    processedKeys++;
    if (processedKeys % 100 === 0) {
      console.log(`  Processed ${processedKeys}/${allKeys.size} keys...`);
    }
  }

  // Find potentially unused keys
  const potentiallyUnusedKeys = [];
  const usedKeys = [];

  for (const [key, usage] of keyUsage.entries()) {
    if (usage.length === 0) {
      potentiallyUnusedKeys.push(key);
    } else {
      usedKeys.push({ key, usage });
    }
  }

  console.log(`\n📊 Analysis Results:`);
  console.log(`Total keys: ${allKeys.size}`);
  console.log(`Used keys: ${usedKeys.length}`);
  console.log(`Potentially unused keys: ${potentiallyUnusedKeys.length}`);

  // Group potentially unused keys by file
  const unusedByFile = {};
  for (const key of potentiallyUnusedKeys) {
    const [fileName] = key.split(".");
    if (!unusedByFile[fileName]) {
      unusedByFile[fileName] = [];
    }
    unusedByFile[fileName].push(key.substring(fileName.length + 1));
  }

  console.log(`\n🗑️  Potentially unused keys by file:`);
  for (const [fileName, keys] of Object.entries(unusedByFile)) {
    console.log(`\n${fileName}.json (${keys.length} keys):`);
    keys.slice(0, 20).forEach((key) => {
      // Show first 20 keys
      console.log(`  - ${key}`);
    });
    if (keys.length > 20) {
      console.log(`  ... and ${keys.length - 20} more`);
    }
  }

  // Show some examples of used keys
  console.log(`\n✅ Examples of used keys:`);
  usedKeys.slice(0, 10).forEach(({ key, usage }) => {
    console.log(`  - ${key} (${usage.length} usages)`);
    usage.slice(0, 2).forEach((u) => {
      console.log(`    ${u.file}:${u.line} - ${u.pattern}`);
    });
  });

  // Save detailed report to file
  const reportPath = path.join(__dirname, "../translation-cleanup-report.json");
  const report = {
    summary: {
      totalKeys: allKeys.size,
      usedKeys: usedKeys.length,
      potentiallyUnusedKeys: potentiallyUnusedKeys.length,
      analyzedFiles: sourceFiles.length,
    },
    potentiallyUnusedByFile: unusedByFile,
    usedKeys: usedKeys.map(({ key, usage }) => ({
      key,
      usageCount: usage.length,
      usages: usage.slice(0, 5), // Limit to first 5 usages
    })),
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  console.log(`\n⚠️  IMPORTANT: This is a conservative analysis.`);
  console.log(
    `   - Keys marked as "potentially unused" may still be used in ways not detected`,
  );
  console.log(`   - Always manually review before removing any keys`);
  console.log(
    `   - Check for dynamic key usage, template literals, and other patterns`,
  );
  console.log(
    `   - Consider keeping keys that might be used in future features`,
  );
}

// Run the analysis
reportUnusedTranslations()
  .then(() => {
    console.log("\n🎉 Translation analysis completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error during analysis:", error);
    process.exit(1);
  });
