const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to extract all keys from a JSON object recursively
function extractKeys(obj, prefix = '', keys = []) {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
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
      const content = fs.readFileSync(file, 'utf8');
      
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
            line: content.split('\n').findIndex(line => line.includes(pattern)) + 1
          });
        }
      }
    } catch (error) {
      console.warn(`Error reading file ${file}:`, error.message);
    }
  }
  
  return usage;
}

// Function to remove a key from a nested object
function removeKeyFromObject(obj, keyPath) {
  const keys = keyPath.split('.');
  let current = obj;
  
  // Navigate to the parent of the key to be removed
  for (let i = 0; i < keys.length - 1; i++) {
    if (current[keys[i]] && typeof current[keys[i]] === 'object') {
      current = current[keys[i]];
    } else {
      return false; // Key path doesn't exist
    }
  }
  
  // Remove the key
  const lastKey = keys[keys.length - 1];
  if (current.hasOwnProperty(lastKey)) {
    delete current[lastKey];
    return true;
  }
  
  return false;
}

// Function to clean up empty objects after key removal
function cleanupEmptyObjects(obj) {
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      cleanupEmptyObjects(value);
      
      // Remove empty objects
      if (Object.keys(value).length === 0) {
        delete obj[key];
      }
    }
  }
}

// Main function
async function cleanupUnusedTranslations() {
  const localesDir = path.join(__dirname, '../src/i18n/locales');
  const enDir = path.join(localesDir, 'en');
  
  // Get all JSON files in the English locale directory
  const jsonFiles = glob.sync(path.join(enDir, '*.json'));
  
  // Get all TypeScript/TSX files in the src directory
  const sourceFiles = glob.sync(path.join(__dirname, '../src/**/*.{ts,tsx}'));
  
  const allKeys = new Set();
  const keyUsage = new Map();
  
  console.log('🔍 Analyzing translation files...');
  
  // Extract all keys from English translation files
  for (const jsonFile of jsonFiles) {
    try {
      const content = fs.readFileSync(jsonFile, 'utf8');
      const translations = JSON.parse(content);
      const fileName = path.basename(jsonFile, '.json');
      
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
  
  console.log(`\n🔍 Searching for key usage in ${sourceFiles.length} source files...`);
  
  // Search for key usage in source files
  for (const key of allKeys) {
    const usage = searchForKeyUsage(key, sourceFiles);
    keyUsage.set(key, usage);
  }
  
  // Find unused keys
  const unusedKeys = [];
  for (const [key, usage] of keyUsage.entries()) {
    if (usage.length === 0) {
      unusedKeys.push(key);
    }
  }
  
  console.log(`\n📊 Analysis Results:`);
  console.log(`Total keys: ${allKeys.size}`);
  console.log(`Used keys: ${allKeys.size - unusedKeys.length}`);
  console.log(`Unused keys: ${unusedKeys.length}`);
  
  if (unusedKeys.length === 0) {
    console.log('\n✅ No unused keys found!');
    return;
  }
  
  // Group unused keys by file
  const unusedByFile = {};
  for (const key of unusedKeys) {
    const [fileName] = key.split('.');
    if (!unusedByFile[fileName]) {
      unusedByFile[fileName] = [];
    }
    unusedByFile[fileName].push(key.substring(fileName.length + 1));
  }
  
  console.log(`\n🗑️  Unused keys by file:`);
  for (const [fileName, keys] of Object.entries(unusedByFile)) {
    console.log(`\n${fileName}.json (${keys.length} keys):`);
    keys.forEach(key => {
      console.log(`  - ${key}`);
    });
  }
  
  // Ask for confirmation
  console.log(`\n⚠️  This will remove ${unusedKeys.length} unused translation keys from all locale files.`);
  console.log('Proceeding with cleanup...');
  
  // Get all locale directories
  const localeDirs = glob.sync(path.join(localesDir, '*/')).map(dir => path.basename(dir));
  
  // Process each locale directory
  for (const locale of localeDirs) {
    if (locale === '_backup_original_common') continue; // Skip backup directory
    
    console.log(`\n🧹 Cleaning up ${locale} locale...`);
    const localeDir = path.join(localesDir, locale);
    
    // Process each JSON file in the locale
    for (const [fileName, keysToRemove] of Object.entries(unusedByFile)) {
      const jsonFile = path.join(localeDir, `${fileName}.json`);
      
      if (!fs.existsSync(jsonFile)) {
        console.log(`  ⚠️  ${fileName}.json not found in ${locale}`);
        continue;
      }
      
      try {
        const content = fs.readFileSync(jsonFile, 'utf8');
        const translations = JSON.parse(content);
        
        let removedCount = 0;
        for (const key of keysToRemove) {
          if (removeKeyFromObject(translations, key)) {
            removedCount++;
          }
        }
        
        // Clean up empty objects
        cleanupEmptyObjects(translations);
        
        // Write back the cleaned translations
        fs.writeFileSync(jsonFile, JSON.stringify(translations, null, 2) + '\n');
        
        console.log(`  ✅ ${fileName}.json: removed ${removedCount} keys`);
        
      } catch (error) {
        console.error(`  ❌ Error processing ${fileName}.json in ${locale}:`, error.message);
      }
    }
  }
  
  console.log('\n✅ Cleanup complete!');
  
  // Show final statistics
  console.log('\n📊 Final Statistics:');
  console.log(`Removed ${unusedKeys.length} unused keys from all locale files`);
  console.log(`Processed ${localeDirs.length} locales`);
}

// Run the cleanup
cleanupUnusedTranslations()
  .then(() => {
    console.log('\n🎉 Translation cleanup completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }); 