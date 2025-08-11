const fs = require("fs");
const path = require("path");

// Function to find all TypeScript/React files
function findTsxFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (
      stat.isDirectory() &&
      !item.startsWith(".") &&
      item !== "node_modules" &&
      item !== "backup-"
    ) {
      files.push(...findTsxFiles(fullPath));
    } else if (item.endsWith(".tsx") || item.endsWith(".ts")) {
      files.push(fullPath);
    }
  }

  return files;
}

// Function to extract translation keys from a file
function extractTranslationKeys(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const keys = new Set();

  // Find t('key') or t("key") patterns
  const tPattern = /t\(['"`]([^'"`]+)['"`]\)/g;
  let match;

  while ((match = tPattern.exec(content)) !== null) {
    keys.add(match[1]);
  }

  // Find t('key.subkey') patterns
  const nestedPattern = /t\(['"`]([^'"`]+\.[^'"`]+)['"`]\)/g;
  while ((match = nestedPattern.exec(content)) !== null) {
    keys.add(match[1]);
  }

  return Array.from(keys);
}

// Function to check if a key exists in common.json
function keyExistsInCommon(key, commonData) {
  const parts = key.split(".");
  let current = commonData;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return false;
    }
  }

  return true;
}

// Main analysis function
function analyzeCommonUsage() {
  console.log("🔍 Analyzing common.json usage...\n");

  // Load common.json
  const commonPath = path.join(__dirname, "../src/i18n/locales/en/common.json");
  const commonData = JSON.parse(fs.readFileSync(commonPath, "utf8"));

  // Find all TSX files
  const srcPath = path.join(__dirname, "../src");
  const tsxFiles = findTsxFiles(srcPath);

  const analysis = {
    filesUsingCommon: [],
    unusedKeys: new Set(Object.keys(commonData)),
    keyUsage: {},
  };

  console.log(`📁 Found ${tsxFiles.length} TypeScript/React files\n`);

  // Analyze each file
  for (const filePath of tsxFiles) {
    const relativePath = path.relative(srcPath, filePath);
    const keys = extractTranslationKeys(filePath);
    const commonKeys = [];

    for (const key of keys) {
      if (keyExistsInCommon(key, commonData)) {
        commonKeys.push(key);
        analysis.unusedKeys.delete(key.split(".")[0]);

        if (!analysis.keyUsage[key]) {
          analysis.keyUsage[key] = [];
        }
        analysis.keyUsage[key].push(relativePath);
      }
    }

    if (commonKeys.length > 0) {
      analysis.filesUsingCommon.push({
        file: relativePath,
        keys: commonKeys,
      });
    }
  }

  // Print results
  console.log(`📊 Analysis Results:\n`);
  console.log(`Files using common.json: ${analysis.filesUsingCommon.length}`);
  console.log(`Keys being used: ${Object.keys(analysis.keyUsage).length}`);
  console.log(`Unused top-level keys: ${analysis.unusedKeys.size}\n`);

  console.log("📋 Files using common.json:");
  analysis.filesUsingCommon.forEach(({ file, keys }) => {
    console.log(`  ${file} (${keys.length} keys)`);
  });

  console.log("\n🔑 Most used keys:");
  const sortedKeys = Object.entries(analysis.keyUsage)
    .sort(([, a], [, b]) => b.length - a.length)
    .slice(0, 20);

  sortedKeys.forEach(([key, files]) => {
    console.log(`  ${key} (${files.length} files)`);
  });

  console.log("\n🗑️ Unused top-level keys:");
  Array.from(analysis.unusedKeys)
    .sort()
    .forEach((key) => {
      console.log(`  ${key}`);
    });

  // Save detailed analysis to file
  const analysisPath = path.join(__dirname, "common-usage-analysis.json");
  fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2));
  console.log(`\n💾 Detailed analysis saved to: ${analysisPath}`);

  return analysis;
}

// Run analysis
if (require.main === module) {
  analyzeCommonUsage();
}

module.exports = { analyzeCommonUsage };
