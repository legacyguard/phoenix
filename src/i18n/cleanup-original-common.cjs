const fs = require('fs');
const path = require('path');

const baseDir = '/Users/luborfedak/Documents/Github/phoenix/src/i18n/locales';
const backupDir = path.join(baseDir, '_backup_original_common');

// Create backup directory
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir);
  console.log('Created backup directory:', backupDir);
}

// Get all language directories
const languages = fs.readdirSync(baseDir, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && entry.name !== '_backup_original_common')
  .map(entry => entry.name);

console.log(`Found ${languages.length} language directories to process...\n`);

let processedCount = 0;
let backupCount = 0;

languages.forEach(lang => {
  const originalCommonPath = path.join(baseDir, lang, 'common.json');
  
  if (fs.existsSync(originalCommonPath)) {
    try {
      // Check if this is the large original common.json (not our new modular one)
      const stats = fs.statSync(originalCommonPath);
      const content = fs.readFileSync(originalCommonPath, 'utf8');
      
      // If the file is large (>50KB) or has many top-level keys, it's likely the original
      const isLargeOriginal = stats.size > 50000 || 
        (JSON.parse(content) && Object.keys(JSON.parse(content)).length > 20);
      
      if (isLargeOriginal) {
        // Backup first
        const backupPath = path.join(backupDir, `${lang}_common_original.json`);
        fs.copyFileSync(originalCommonPath, backupPath);
        backupCount++;
        
        // Then delete
        fs.unlinkSync(originalCommonPath);
        console.log(`✓ Backed up and deleted: ${lang}/common.json (${(stats.size / 1024).toFixed(1)}KB)`);
        processedCount++;
      } else {
        console.log(`- Skipped: ${lang}/common.json (appears to be new modular version)`);
      }
    } catch (error) {
      console.error(`✗ Error processing ${lang}/common.json:`, error.message);
    }
  }
});

console.log(`\n=== Summary ===`);
console.log(`Processed languages: ${processedCount}`);
console.log(`Files backed up: ${backupCount}`);
console.log(`Backup location: ${backupDir}`);
console.log(`\nOriginal common.json files have been safely removed!`);
