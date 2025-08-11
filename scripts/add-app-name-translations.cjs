const fs = require("fs");
const path = require("path");

// Function to add app name to a language file
function addAppName(langCode) {
  const uiPath = path.join(
    __dirname,
    "..",
    "src",
    "i18n",
    "locales",
    langCode,
    "ui.json",
  );

  if (!fs.existsSync(uiPath)) {
    console.log(`Skipping ${langCode}: ui.json not found`);
    return;
  }

  try {
    const content = fs.readFileSync(uiPath, "utf8");
    const data = JSON.parse(content);

    // Check if name key already exists at top level
    if (data.name) {
      console.log(`Skipping ${langCode}: name key already exists`);
      return;
    }

    // Add name key at the top level
    // For most languages, we'll use "LegacyGuard" as it's the brand name
    // For some languages, we might want to translate it differently
    const appName = "LegacyGuard"; // Keep as LegacyGuard for brand consistency

    // Create new object with name at the top
    const newData = {
      name: appName,
      ...data,
    };

    // Write back to file
    fs.writeFileSync(uiPath, JSON.stringify(newData, null, 2));
    console.log(`✅ Added app name to ${langCode}`);
  } catch (error) {
    console.error(`❌ Error processing ${langCode}:`, error.message);
  }
}

// Get all language directories
const localesPath = path.join(__dirname, "..", "src", "i18n", "locales");
const languages = fs.readdirSync(localesPath).filter((dir) => {
  return fs.statSync(path.join(localesPath, dir)).isDirectory();
});

console.log("Adding app name to all language files...\n");

languages.forEach((langCode) => {
  addAppName(langCode);
});

console.log("\n✅ Completed adding app name to all language files!");
