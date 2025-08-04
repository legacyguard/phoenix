const fs = require('fs');
const path = require('path');

const baseDir = '/Users/luborfedak/Documents/Github/phoenix/src/i18n/locales';

// Recursively find all .json files in the locales directory
function findJsonFiles(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findJsonFiles(entryPath, acc);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      acc.push(entryPath);
    }
  }
  return acc;
}

const jsonFiles = findJsonFiles(baseDir);
let errorCount = 0;

console.log('Scanning all JSON files under src/i18n/locales for syntax errors...\n');

jsonFiles.forEach(file => {
  try {
    JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    errorCount++;
    console.log(`[ERROR] ${file}: ${err.message}`);
  }
});

if (!errorCount) {
  console.log('\nAll translation JSON files are valid!');
} else {
  console.log(`\nFound ${errorCount} malformed JSON file(s). Please fix them before proceeding.`);
}

