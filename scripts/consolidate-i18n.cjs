const fs = require("fs");
const path = require("path");

// Define consolidation mapping
const consolidationMap = {
  ui: ["ui", "accessibility", "forms", "general", "pwa", "steps"],
  auth: ["auth", "security", "consent"],
  dashboard: [
    "dashboard",
    "annual-review",
    "progress",
    "notifications",
    "alerts",
  ],
  assets: ["assets", "asset-management", "documents", "upload", "vault"],
  family: [
    "family",
    "guardians",
    "guardian",
    "executor",
    "beneficiary",
    "invitations",
  ],
  wills: ["wills", "will", "legal", "legal-pages"],
  landing: ["landing", "features"],
  settings: ["settings", "country"],
  subscription: ["subscription", "plans", "pricing"],
  "time-capsule": ["time-capsule", "life-events"],
  sharing: ["sharing", "emails"],
  help: ["help", "manual", "onboarding"],
  ai: ["ai"],
  errors: ["errors", "debug"],
  "micro-copy": ["micro-copy"], // Keep as is
};

// Function to load JSON file safely
function loadJsonFile(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      return JSON.parse(content);
    } catch (error) {
      console.warn(`⚠️  Error loading ${filePath}:`, error.message);
      return {};
    }
  }
  return {};
}

// Function to merge JSON objects
function mergeJsonObjects(objects) {
  const merged = {};

  for (const obj of objects) {
    for (const [key, value] of Object.entries(obj)) {
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        merged[key] = { ...merged[key], ...value };
      } else {
        merged[key] = value;
      }
    }
  }

  return merged;
}

// Function to consolidate files
function consolidateFiles() {
  console.log("🔄 Starting i18n consolidation...\n");

  const localesPath = path.join(__dirname, "../src/i18n/locales/en");
  const consolidatedFiles = [];

  for (const [targetFile, sourceFiles] of Object.entries(consolidationMap)) {
    console.log(`📝 Consolidating ${targetFile}.json...`);

    const objectsToMerge = [];
    const existingFiles = [];

    // Load all source files
    for (const sourceFile of sourceFiles) {
      const filePath = path.join(localesPath, `${sourceFile}.json`);
      const data = loadJsonFile(filePath);

      if (Object.keys(data).length > 0) {
        objectsToMerge.push(data);
        existingFiles.push(sourceFile);
        console.log(
          `  ✅ Loaded ${sourceFile}.json (${Object.keys(data).length} keys)`,
        );
      } else {
        console.log(`  ⚠️  Skipped ${sourceFile}.json (empty or not found)`);
      }
    }

    if (objectsToMerge.length > 0) {
      // Merge all objects
      const mergedData = mergeJsonObjects(objectsToMerge);

      // Write consolidated file
      const targetPath = path.join(localesPath, `${targetFile}.json`);
      fs.writeFileSync(targetPath, JSON.stringify(mergedData, null, 2));

      console.log(
        `  📄 Created ${targetFile}.json (${Object.keys(mergedData).length} keys)`,
      );
      consolidatedFiles.push({
        target: targetFile,
        sources: existingFiles,
        keyCount: Object.keys(mergedData).length,
      });
    }
  }

  return consolidatedFiles;
}

// Function to update i18n configuration
function updateI18nConfig(consolidatedFiles) {
  console.log("\n⚙️ Updating i18n configuration...\n");

  const i18nPath = path.join(__dirname, "../src/i18n/i18n.ts");
  let i18nContent = fs.readFileSync(i18nPath, "utf8");

  // Create new namespaces array
  const newNamespaces = consolidatedFiles.map((file) => file.target).sort();

  const newNamespacesString = newNamespaces
    .map((ns) => `'${ns}'`)
    .join(",\n  ");

  // Replace the namespaces array
  i18nContent = i18nContent.replace(
    /export const namespaces = \[([\s\S]*?)\]/,
    `export const namespaces = [\n  ${newNamespacesString}\n]`,
  );

  fs.writeFileSync(i18nPath, i18nContent);
  console.log(
    `✅ Updated i18n.ts with ${newNamespaces.length} consolidated namespaces`,
  );

  return newNamespaces;
}

// Function to update component imports
function updateComponentImports(consolidatedFiles) {
  console.log("\n🔧 Updating component imports...\n");

  const srcPath = path.join(__dirname, "../src");
  const updatedFiles = [];

  // Create mapping from old namespaces to new ones
  const namespaceMapping = {};
  for (const { target, sources } of consolidatedFiles) {
    for (const source of sources) {
      namespaceMapping[source] = target;
    }
  }

  // Find all TypeScript/React files
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

  const tsxFiles = findTsxFiles(srcPath);

  for (const filePath of tsxFiles) {
    let content = fs.readFileSync(filePath, "utf8");
    let updated = false;

    // Update useTranslation calls
    for (const [oldNamespace, newNamespace] of Object.entries(
      namespaceMapping,
    )) {
      const oldPattern = new RegExp(
        `useTranslation\\(['"]${oldNamespace}['"]\\)`,
        "g",
      );
      if (oldPattern.test(content)) {
        content = content.replace(
          oldPattern,
          `useTranslation('${newNamespace}')`,
        );
        updated = true;
      }
    }

    if (updated) {
      fs.writeFileSync(filePath, content);
      const relativePath = path.relative(srcPath, filePath);
      console.log(`✅ Updated ${relativePath}`);
      updatedFiles.push(relativePath);
    }
  }

  return updatedFiles;
}

// Function to remove old files
function removeOldFiles(consolidatedFiles) {
  console.log("\n🗑️ Removing old files...\n");

  const localesPath = path.join(__dirname, "../src/i18n/locales/en");
  const removedFiles = [];

  for (const { sources } of consolidatedFiles) {
    for (const source of sources) {
      const filePath = path.join(localesPath, `${source}.json`);

      // Don't remove files that are the same as target (e.g., ui.json, auth.json)
      if (fs.existsSync(filePath)) {
        // Create backup before removing
        const backupPath = path.join(localesPath, `${source}.json.backup`);
        fs.writeFileSync(backupPath, fs.readFileSync(filePath, "utf8"));

        fs.unlinkSync(filePath);
        console.log(
          `🗑️  Removed ${source}.json (backup: ${source}.json.backup)`,
        );
        removedFiles.push(source);
      }
    }
  }

  return removedFiles;
}

// Main execution
function main() {
  try {
    // Step 1: Consolidate files
    const consolidatedFiles = consolidateFiles();

    // Step 2: Update i18n configuration
    const newNamespaces = updateI18nConfig(consolidatedFiles);

    // Step 3: Update component imports
    const updatedFiles = updateComponentImports(consolidatedFiles);

    // Step 4: Remove old files
    const removedFiles = removeOldFiles(consolidatedFiles);

    // Summary
    console.log("\n🎉 Consolidation completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - Consolidated ${consolidatedFiles.length} files`);
    console.log(`   - Updated ${updatedFiles.length} component files`);
    console.log(`   - Removed ${removedFiles.length} old files`);
    console.log(`   - Total namespaces: ${newNamespaces.length}`);

    console.log("\n📁 New file structure:");
    consolidatedFiles.forEach(({ target, keyCount }) => {
      console.log(`   - ${target}.json (${keyCount} keys)`);
    });
  } catch (error) {
    console.error("❌ Error during consolidation:", error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main };
