const fs = require('fs');
const en = JSON.parse(fs.readFileSync('src/i18n/locales/en/common.json', 'utf8'));
const ga = JSON.parse(fs.readFileSync('src/i18n/locales/ga/common.json', 'utf8'));

function flattenKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? prefix + '.' + key : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, newKey));
    } else {
      keys.push(newKey);
    }
  }
  return keys;
}

const enKeys = flattenKeys(en);
const gaKeys = flattenKeys(ga);
const missingKeys = enKeys.filter(key => !gaKeys.includes(key));

console.log('Missing keys in Irish translation:');
missingKeys.slice(0, 20).forEach(key => console.log('  ' + key));
console.log('... and ' + (missingKeys.length - 20) + ' more');
console.log('Total missing: ' + missingKeys.length); 