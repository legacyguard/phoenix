const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'src/i18n/locales/en/common.json');
const frPath = path.join(__dirname, 'src/i18n/locales/fr/common.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const frData = JSON.parse(fs.readFileSync(frPath, 'utf8'));

function findMissingKeys(obj1, obj2, prefix = '') {
  const missing = [];
  
  for (const key in obj1) {
    const fullKey = prefix ? prefix + '.' + key : key;
    
    if (!(key in obj2)) {
      missing.push(fullKey);
    } else if (typeof obj1[key] === 'object' && obj1[key] !== null && !Array.isArray(obj1[key]) && 
               typeof obj2[key] === 'object' && obj2[key] !== null && !Array.isArray(obj2[key])) {
      missing.push(...findMissingKeys(obj1[key], obj2[key], fullKey));
    }
  }
  
  return missing;
}

function findUntranslatedValues(obj1, obj2, prefix = '') {
  const untranslated = [];
  
  for (const key in obj1) {
    const fullKey = prefix ? prefix + '.' + key : key;
    
    if (key in obj2) {
      if (typeof obj1[key] === 'string' && typeof obj2[key] === 'string') {
        if (obj1[key] === obj2[key]) {
          untranslated.push(fullKey);
        }
      } else if (typeof obj1[key] === 'object' && obj1[key] !== null && !Array.isArray(obj1[key]) &&
                 typeof obj2[key] === 'object' && obj2[key] !== null && !Array.isArray(obj2[key])) {
        untranslated.push(...findUntranslatedValues(obj1[key], obj2[key], fullKey));
      }
    }
  }
  
  return untranslated;
}

const missingKeys = findMissingKeys(enData, frData);
const untranslatedValues = findUntranslatedValues(enData, frData);

console.log('Missing keys in French file:');
missingKeys.forEach(key => console.log('  ' + key));

console.log('\nUntranslated values in French file:');
untranslatedValues.forEach(key => console.log('  ' + key));

console.log('\nTotal missing keys: ' + missingKeys.length);
console.log('Total untranslated values: ' + untranslatedValues.length); 