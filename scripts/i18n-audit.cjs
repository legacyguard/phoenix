const fs = require('fs');
const path = require('path');

// Script to find hardcoded strings in React components
const findHardcodedStrings = (dir) => {
  const results = [];
  
  const scanFile = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Look for hardcoded strings in JSX
    const jsxStringRegex = />[^<{]*[a-zA-Z][^<{]*</g;
    const matches = content.match(jsxStringRegex);
    
    if (matches) {
      matches.forEach(match => {
        const text = match.slice(1, -1).trim();
        if (text.length > 2 && !text.includes('{{') && !text.includes('t(')) {
          results.push({
            file: filePath,
            text: text,
            line: content.split('\n').findIndex(line => line.includes(match)) + 1
          });
        }
      });
    }
  };
  
  // Recursively scan directory
  const scanDirectory = (dirPath) => {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        scanFile(fullPath);
      }
    });
  };
  
  scanDirectory(dir);
  return results;
};

// Run audit
const hardcodedStrings = findHardcodedStrings('./src');
console.log('Hardcoded strings found:', hardcodedStrings.length);
hardcodedStrings.forEach(item => {
  console.log(`${item.file}:${item.line} - "${item.text}"`);
}); 