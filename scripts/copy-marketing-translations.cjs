#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Define supported languages
const supportedLanguages = [
  "en",
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

// Define the translation files to copy
const translationFiles = ["landing.json", "pricing.json", "legal-pages.json"];

// Base directory for locales
const localesDir = path.join(__dirname, "..", "src", "i18n", "locales");

// Function to copy file to all language directories
function copyTranslationFile(fileName) {
  const sourcePath = path.join(localesDir, "en", fileName);

  // Check if source file exists
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Source file not found: ${sourcePath}`);
    return;
  }

  console.log(`📁 Copying ${fileName} to all language directories...`);

  supportedLanguages.forEach((lang) => {
    if (lang === "en") return; // Skip English as it's the source

    const targetDir = path.join(localesDir, lang);
    const targetPath = path.join(targetDir, fileName);

    // Create directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`📂 Created directory: ${targetDir}`);
    }

    try {
      // Read the source file
      const sourceContent = fs.readFileSync(sourcePath, "utf8");

      // Parse JSON to validate it
      const jsonData = JSON.parse(sourceContent);

      // Write to target file
      fs.writeFileSync(targetPath, JSON.stringify(jsonData, null, 2), "utf8");

      console.log(`✅ Copied ${fileName} to ${lang}/`);
    } catch (error) {
      console.error(`❌ Error copying ${fileName} to ${lang}/:`, error.message);
    }
  });
}

// Function to update i18n configuration
function updateI18nConfig() {
  const i18nConfigPath = path.join(__dirname, "..", "src", "i18n", "i18n.ts");

  if (!fs.existsSync(i18nConfigPath)) {
    console.error(`❌ i18n config file not found: ${i18nConfigPath}`);
    return;
  }

  try {
    let content = fs.readFileSync(i18nConfigPath, "utf8");

    // Check if namespaces already include the new ones
    if (
      content.includes("'landing'") &&
      content.includes("'pricing'") &&
      content.includes("'legal-pages'")
    ) {
      console.log("✅ i18n config already includes new namespaces");
      return;
    }

    // Add new namespaces to the namespaces array
    content = content.replace(
      /export const namespaces = \[([\s\S]*?)\] as const;/,
      (match, namespacesContent) => {
        const namespaces = namespacesContent
          .split(",")
          .map((ns) => ns.trim().replace(/['"]/g, ""))
          .filter((ns) => ns.length > 0);

        // Add new namespaces if they don't exist
        if (!namespaces.includes("landing")) {
          namespaces.push("'landing'");
        }
        if (!namespaces.includes("pricing")) {
          namespaces.push("'pricing'");
        }
        if (!namespaces.includes("legal-pages")) {
          namespaces.push("'legal-pages'");
        }

        return `export const namespaces = [\n  ${namespaces.join(",\n  ")}\n] as const;`;
      },
    );

    fs.writeFileSync(i18nConfigPath, content, "utf8");
    console.log("✅ Updated i18n config with new namespaces");
  } catch (error) {
    console.error("❌ Error updating i18n config:", error.message);
  }
}

// Function to create component index file
function createComponentIndex() {
  const componentsDir = path.join(__dirname, "..", "src", "components");

  // Create landing components index
  const landingIndexPath = path.join(componentsDir, "landing", "index.ts");
  const landingIndexContent = `export { default as LandingPage } from './LandingPage';\n`;

  try {
    fs.writeFileSync(landingIndexPath, landingIndexContent, "utf8");
    console.log("✅ Created landing components index");
  } catch (error) {
    console.error("❌ Error creating landing components index:", error.message);
  }

  // Create pricing components index
  const pricingIndexPath = path.join(componentsDir, "pricing", "index.ts");
  const pricingIndexContent = `export { default as PricingPage } from './PricingPage';\n`;

  try {
    fs.writeFileSync(pricingIndexPath, pricingIndexContent, "utf8");
    console.log("✅ Created pricing components index");
  } catch (error) {
    console.error("❌ Error creating pricing components index:", error.message);
  }

  // Create legal components index
  const legalIndexPath = path.join(componentsDir, "legal", "index.ts");
  const legalIndexContent = `export { default as TermsOfService } from './TermsOfService';\nexport { default as PrivacyPolicy } from './PrivacyPolicy';\n`;

  try {
    fs.writeFileSync(legalIndexPath, legalIndexContent, "utf8");
    console.log("✅ Created legal components index");
  } catch (error) {
    console.error("❌ Error creating legal components index:", error.message);
  }

  // Create SEO components index
  const seoIndexPath = path.join(componentsDir, "SEO", "index.ts");
  const seoIndexContent = `export { default as MetaTags } from './MetaTags';\n`;

  try {
    fs.writeFileSync(seoIndexPath, seoIndexContent, "utf8");
    console.log("✅ Created SEO components index");
  } catch (error) {
    console.error("❌ Error creating SEO components index:", error.message);
  }
}

// Main execution
function main() {
  console.log("🚀 Starting marketing translations copy process...\n");

  // Copy each translation file
  translationFiles.forEach((fileName) => {
    copyTranslationFile(fileName);
    console.log(""); // Add spacing
  });

  // Update i18n configuration
  console.log("🔧 Updating i18n configuration...");
  updateI18nConfig();

  // Create component index files
  console.log("📁 Creating component index files...");
  createComponentIndex();

  console.log("\n🎉 Marketing translations copy process completed!");
  console.log("\n📋 Summary:");
  console.log(`   - Copied ${translationFiles.length} translation files`);
  console.log(
    `   - Updated ${supportedLanguages.length - 1} language directories`,
  );
  console.log("   - Updated i18n configuration");
  console.log("   - Created component index files");

  console.log("\n📝 Next steps:");
  console.log("   1. Review the copied files for accuracy");
  console.log("   2. Translate the marketing content for each language");
  console.log("   3. Test the landing page and pricing components");
  console.log("   4. Verify legal pages are appropriate for each jurisdiction");
  console.log("   5. Update SEO meta tags for different languages");
  console.log("   6. Test the complete marketing funnel");
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  copyTranslationFile,
  updateI18nConfig,
  createComponentIndex,
  supportedLanguages,
  translationFiles,
};
