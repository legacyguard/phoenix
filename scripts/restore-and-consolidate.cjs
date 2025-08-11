const fs = require("fs");
const path = require("path");

// Define the final 15-file structure
const finalStructure = {
  ui: ["ui", "accessibility", "forms", "general", "pwa", "steps", "app"],
  auth: ["auth", "security", "consent"],
  dashboard: [
    "dashboard",
    "annual-review",
    "progress",
    "notifications",
    "alerts",
    "admin",
    "calculator",
    "recommendations",
    "reminders",
  ],
  assets: ["assets", "asset-management", "documents", "upload", "vault"],
  family: [
    "family",
    "guardians",
    "guardian",
    "executor",
    "beneficiary",
    "invitations",
    "crisis",
    "playbook",
  ],
  wills: ["wills", "will", "legal", "legal-pages", "cookies"],
  landing: ["landing", "features"],
  settings: ["settings", "country"],
  subscription: ["subscription", "plans", "pricing"],
  "time-capsule": ["time-capsule", "life-events"],
  sharing: ["sharing", "emails"],
  help: ["help", "manual", "onboarding", "contact", "questions"],
  ai: ["ai"],
  errors: ["errors", "debug"],
  "micro-copy": ["micro-copy"],
};

// Function to load from backup or create empty
function loadFromBackup(fileName) {
  const backupPath = path.join(
    __dirname,
    "../src/i18n/locales/en",
    `${fileName}.json.backup`,
  );
  const originalPath = path.join(
    __dirname,
    "../src/i18n/locales/en",
    `${fileName}.json`,
  );

  if (fs.existsSync(backupPath)) {
    return JSON.parse(fs.readFileSync(backupPath, "utf8"));
  } else if (fs.existsSync(originalPath)) {
    return JSON.parse(fs.readFileSync(originalPath, "utf8"));
  }

  return {};
}

// Function to create consolidated files
function createConsolidatedFiles() {
  console.log("🔄 Creating consolidated files from backups...\n");

  const localesPath = path.join(__dirname, "../src/i18n/locales/en");
  const consolidatedFiles = [];

  for (const [targetFile, sourceFiles] of Object.entries(finalStructure)) {
    console.log(`📝 Creating ${targetFile}.json...`);

    const objectsToMerge = [];
    const existingFiles = [];

    // Load all source files from backups
    for (const sourceFile of sourceFiles) {
      const data = loadFromBackup(sourceFile);

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
      const mergedData = {};
      for (const obj of objectsToMerge) {
        for (const [key, value] of Object.entries(obj)) {
          if (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value)
          ) {
            mergedData[key] = { ...mergedData[key], ...value };
          } else {
            mergedData[key] = value;
          }
        }
      }

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

// Function to clean up old files
function cleanupOldFiles() {
  console.log("\n🗑️ Cleaning up old files...\n");

  const localesPath = path.join(__dirname, "../src/i18n/locales/en");
  const removedFiles = [];

  // Remove any remaining old files (not in final structure)
  const allSourceFiles = Object.values(finalStructure).flat();
  const files = fs.readdirSync(localesPath);

  for (const file of files) {
    if (file.endsWith(".json") && !file.includes("backup")) {
      const fileName = file.replace(".json", "");

      // If this file is not in our final structure, remove it
      if (
        !allSourceFiles.includes(fileName) &&
        !Object.keys(finalStructure).includes(fileName)
      ) {
        const filePath = path.join(localesPath, file);
        fs.unlinkSync(filePath);
        console.log(`🗑️  Removed ${file}`);
        removedFiles.push(fileName);
      }
    }
  }

  return removedFiles;
}

// Main execution
function main() {
  try {
    // Step 1: Create consolidated files from backups
    const consolidatedFiles = createConsolidatedFiles();

    // Step 2: Update i18n configuration
    const newNamespaces = updateI18nConfig(consolidatedFiles);

    // Step 3: Update component imports
    const updatedFiles = updateComponentImports(consolidatedFiles);

    // Step 4: Clean up old files
    const removedFiles = cleanupOldFiles();

    // Summary
    console.log("\n🎉 Consolidation completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - Created ${consolidatedFiles.length} consolidated files`);
    console.log(`   - Updated ${updatedFiles.length} component files`);
    console.log(`   - Removed ${removedFiles.length} old files`);
    console.log(`   - Total namespaces: ${newNamespaces.length}`);

    console.log("\n📁 Final file structure:");
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
