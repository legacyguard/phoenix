#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Common type replacements
const typeReplacements = [
  {
    pattern: /: Record<string, unknown>\[\]/g,
    replacement: ': Array<Record<string, unknown>>'
  },
  {
    pattern: /: Record<string, unknown>\b/g,
    replacement: ': Record<string, unknown>'
  },
  {
    pattern: /: Record<string, unknown>\?/g,
    replacement: ': Record<string, unknown>?'
  },
  {
    pattern: /: Record<string, unknown>\s*;/g,
    replacement: ': Record<string, unknown>;'
  },
  {
    pattern: /: Record<string, unknown>\s*\)/g,
    replacement: ': Record<string, unknown>)'
  },
  {
    pattern: /: Record<string, unknown>\s*=/g,
    replacement: ': Record<string, unknown> ='
  },
  {
    pattern: /: Record<string, unknown>\s*=>/g,
    replacement: ': Record<string, unknown> =>'
  }
];

// Function to process a file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modifiedContent = content;
    let hasChanges = false;

    // Apply type replacements
    typeReplacements.forEach(({ pattern, replacement }) => {
      if (pattern.test(modifiedContent)) {
        modifiedContent = modifiedContent.replace(pattern, replacement);
        hasChanges = true;
      }
    });

    // Fix common React Hook dependency issues
    modifiedContent = modifiedContent.replace(
      /useMemo\(\(\) => \{[\s\S]*?\}, \[([^\]]*)\]\)/g,
      (match, deps) => {
        if (!deps.includes('t') && match.includes('t(')) {
          return match.replace(/\[([^\]]*)\]\)/, '[$1, t])');
        }
        return match;
      }
    );

    if (hasChanges) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively find TypeScript/React files
function findFiles(dir, extensions = ['.ts', '.tsx']) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other build directories
        if (!['node_modules', 'dist', 'build', '.git'].includes(item)) {
          traverse(fullPath);
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Main execution
function main() {
  console.log('🔧 Starting linting error fixes...\n');
  
  const srcDir = path.join(__dirname, '..', 'src');
  const files = findFiles(srcDir);
  
  let fixedCount = 0;
  
  for (const file of files) {
    if (processFile(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\n🎉 Fixed ${fixedCount} files!`);
  
  // Run ESLint to check remaining issues
  console.log('\n🔍 Running ESLint to check remaining issues...');
  try {
    execSync('npm run lint', { stdio: 'inherit' });
  } catch (error) {
    console.log('\n⚠️  Some linting issues remain. Manual review may be needed.');
  }
}

if (require.main === module) {
  main();
}

module.exports = { processFile, findFiles }; 