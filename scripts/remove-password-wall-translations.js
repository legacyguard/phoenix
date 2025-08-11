#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to remove password wall translations from a JSON file
function removePasswordWallTranslations(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Remove passwordWall section from auth.json files
    if (data.passwordWall) {
      delete data.passwordWall;
      console.log(`Removed passwordWall from ${filePath}`);
    }
    
    // Remove passwordWall section from micro-copy.json files
    if (data.tooltips && data.tooltips.passwordWall) {
      delete data.tooltips.passwordWall;
      console.log(`Removed passwordWall tooltips from ${filePath}`);
    }
    
    // Write back the cleaned file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to process all language files
function processLanguageFiles() {
  const localesDir = path.join(__dirname, '..', 'src', 'i18n', 'locales');
  
  if (!fs.existsSync(localesDir)) {
    console.error('Locales directory not found:', localesDir);
    return;
  }
  
  const languages = fs.readdirSync(localesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  console.log(`Found ${languages.length} language directories`);
  
  let processedFiles = 0;
  let successCount = 0;
  
  for (const lang of languages) {
    const langDir = path.join(localesDir, lang);
    
    // Process auth.json
    const authFile = path.join(langDir, 'auth.json');
    if (fs.existsSync(authFile)) {
      processedFiles++;
      if (removePasswordWallTranslations(authFile)) {
        successCount++;
      }
    }
    
    // Process micro-copy.json
    const microCopyFile = path.join(langDir, 'micro-copy.json');
    if (fs.existsSync(microCopyFile)) {
      processedFiles++;
      if (removePasswordWallTranslations(microCopyFile)) {
        successCount++;
      }
    }
  }
  
  console.log(`\nProcessing complete!`);
  console.log(`Total files processed: ${processedFiles}`);
  console.log(`Successful removals: ${successCount}`);
  console.log(`Failed removals: ${processedFiles - successCount}`);
}

// Run the script
if (require.main === module) {
  processLanguageFiles();
}

module.exports = { removePasswordWallTranslations, processLanguageFiles };
