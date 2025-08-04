const fs = require('fs');
const path = require('path');

// Function to recursively get all keys from a nested object
function getAllKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Function to get nested value by dot notation
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Function to set nested value by dot notation
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[lastKey] = value;
}

// Function to compare two translation files
function compareTranslations(enFile, ukFile) {
  console.log(`\nComparing ${enFile} with ${ukFile}...`);
  
  const enPath = path.join(__dirname, 'src/i18n/locales/en', enFile);
  const ukPath = path.join(__dirname, 'src/i18n/locales/uk', ukFile);
  
  if (!fs.existsSync(enPath)) {
    console.log(`English file ${enFile} not found`);
    return;
  }
  
  if (!fs.existsSync(ukPath)) {
    console.log(`Ukrainian file ${ukFile} not found`);
    return;
  }
  
  const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const ukData = JSON.parse(fs.readFileSync(ukPath, 'utf8'));
  
  const enKeys = getAllKeys(enData);
  const ukKeys = getAllKeys(ukData);
  
  const missingKeys = enKeys.filter(key => !ukKeys.includes(key));
  const extraKeys = ukKeys.filter(key => !enKeys.includes(key));
  
  console.log(`Missing keys in Ukrainian: ${missingKeys.length}`);
  console.log(`Extra keys in Ukrainian: ${extraKeys.length}`);
  
  if (missingKeys.length > 0) {
    console.log('Missing keys:');
    missingKeys.forEach(key => {
      const enValue = getNestedValue(enData, key);
      console.log(`  ${key}: "${enValue}"`);
      
      // Add missing key to Ukrainian data
      setNestedValue(ukData, key, enValue);
    });
    
    // Write updated Ukrainian file
    fs.writeFileSync(ukPath, JSON.stringify(ukData, null, 2) + '\n', 'utf8');
    console.log(`Updated ${ukFile} with missing keys`);
  }
  
  if (extraKeys.length > 0) {
    console.log('Extra keys in Ukrainian:');
    extraKeys.forEach(key => console.log(`  ${key}`));
  }
  
  return { missingKeys, extraKeys };
}

// List of all translation files
const translationFiles = [
  'ui.json',
  'settings.json',
  'emails.json',
  'errors.json',
  'help.json',
  'onboarding.json',
  'guardians.json',
  'wills.json',
  'assets.json',
  'family.json',
  'dashboard.json',
  'documents.json',
  'subscription.json',
  'auth.json'
];

// Compare all files
console.log('Starting translation comparison...');
translationFiles.forEach(file => {
  compareTranslations(file, file);
});

console.log('\nTranslation comparison completed!'); 