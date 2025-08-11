#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..');

// Mapping of old namespaces to new ones
const namespaceMap = {
  'ui': 'ui-common',  // Default to ui-common, but will need manual review
  'dashboard': 'dashboard-main',  // Default to dashboard-main
  'family': 'family-core'  // Default to family-core
};

// Files that should be excluded from processing
const excludePatterns = [
  '__tests__',
  '.test.',
  '.spec.',
  'pdfGenerationService'  // This file has different issues
];

function shouldExcludeFile(filePath) {
  return excludePatterns.some(pattern => filePath.includes(pattern));
}

// Fix references in a file
function fixFileReferences(filePath) {
  if (shouldExcludeFile(filePath)) {
    return 0;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let replacements = 0;
  
  for (const [oldNs, newNs] of Object.entries(namespaceMap)) {
    // Match useTranslation('ui'), useTranslation("ui"), etc.
    const hookPattern = new RegExp(`useTranslation\\((['"])${oldNs}\\1\\)`, 'g');
    if (hookPattern.test(content)) {
      content = content.replace(hookPattern, `useTranslation($1${newNs}$1)`);
      modified = true;
      replacements++;
    }
    
    // Match t('ui:...), t("ui:...), etc.
    const tPattern = new RegExp(`(t\\((['"])${oldNs}):`, 'g');
    if (tPattern.test(content)) {
      content = content.replace(tPattern, `$1$2${newNs}:`);
      modified = true;
      replacements++;
    }
    
    // Match $t('ui:...), $t("ui:...), etc.
    const dollarTPattern = new RegExp(`(\\$t\\((['"])${oldNs}):`, 'g');
    if (dollarTPattern.test(content)) {
      content = content.replace(dollarTPattern, `$1$2${newNs}:`);
      modified = true;
      replacements++;
    }
    
    // Match i18n.t('ui:...), i18n.t("ui:...), etc.
    const i18nPattern = new RegExp(`(i18n\\.t\\((['"])${oldNs}):`, 'g');
    if (i18nPattern.test(content)) {
      content = content.replace(i18nPattern, `$1$2${newNs}:`);
      modified = true;
      replacements++;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
  }
  
  return replacements;
}

// Scan and fix all files
function scanAndFix() {
  console.log('🔧 Fixing broken namespace references...\n');
  
  let totalFiles = 0;
  let totalReplacements = 0;
  const fixedFiles = [];
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (item !== 'node_modules' && item !== 'dist' && item !== '.git') {
          scanDirectory(fullPath);
        }
      } else if (['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(item))) {
        const replacements = fixFileReferences(fullPath);
        if (replacements > 0) {
          totalFiles++;
          totalReplacements += replacements;
          fixedFiles.push({
            path: path.relative(PROJECT_ROOT, fullPath),
            replacements
          });
        }
      }
    }
  }
  
  scanDirectory(path.join(PROJECT_ROOT, 'src'));
  
  if (fixedFiles.length > 0) {
    console.log('  Fixed files:');
    fixedFiles.forEach(({ path, replacements }) => {
      console.log(`    ✅ ${path}: ${replacements} references`);
    });
    console.log(`\n  Total: ${totalReplacements} references fixed in ${totalFiles} files`);
  } else {
    console.log('  No broken references found to fix.');
  }
  
  return { totalFiles, totalReplacements };
}

// Files that need manual review
function findFilesNeedingManualReview() {
  console.log('\n⚠️  Files that may need manual review:\n');
  
  const filesNeedingReview = [];
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (item !== 'node_modules' && item !== 'dist' && item !== '.git') {
          scanDirectory(fullPath);
        }
      } else if (['.ts', '.tsx'].includes(path.extname(item))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Check for complex patterns that might need manual review
        if (content.includes('ui-common') || content.includes('ui-components') || content.includes('ui-elements')) {
          // Check if the file uses keys from multiple UI namespaces
          const hasCommon = /t\(['"]ui-common:/.test(content);
          const hasComponents = /t\(['"]ui-components:/.test(content);
          const hasElements = /t\(['"]ui-elements:/.test(content);
          
          const count = [hasCommon, hasComponents, hasElements].filter(Boolean).length;
          if (count > 1) {
            filesNeedingReview.push(path.relative(PROJECT_ROOT, fullPath));
          }
        }
        
        // Check for dashboard-main vs dashboard-review
        if (content.includes('dashboard-main') || content.includes('dashboard-review')) {
          const hasMain = /t\(['"]dashboard-main:/.test(content);
          const hasReview = /t\(['"]dashboard-review:/.test(content);
          
          if (hasMain && hasReview) {
            filesNeedingReview.push(path.relative(PROJECT_ROOT, fullPath));
          }
        }
        
        // Check for family namespaces
        if (content.includes('family-')) {
          const hasCore = /t\(['"]family-core:/.test(content);
          const hasEmergency = /t\(['"]family-emergency:/.test(content);
          const hasCommunication = /t\(['"]family-communication:/.test(content);
          
          const count = [hasCore, hasEmergency, hasCommunication].filter(Boolean).length;
          if (count > 1) {
            filesNeedingReview.push(path.relative(PROJECT_ROOT, fullPath));
          }
        }
      }
    }
  }
  
  scanDirectory(path.join(PROJECT_ROOT, 'src'));
  
  if (filesNeedingReview.length > 0) {
    console.log('  These files use multiple related namespaces and may need optimization:');
    [...new Set(filesNeedingReview)].forEach(file => {
      console.log(`    • ${file}`);
    });
    console.log('\n  Consider using multiple useTranslation hooks or consolidating keys.');
  } else {
    console.log('  No files need manual review.');
  }
  
  return filesNeedingReview.length;
}

// Main execution
async function main() {
  console.log('🚀 Fixing broken namespace references...\n');
  
  // Fix the broken references
  const { totalFiles, totalReplacements } = scanAndFix();
  
  // Find files needing manual review
  const reviewCount = findFilesNeedingManualReview();
  
  console.log('\n📊 Summary:\n');
  console.log(`  ✅ Fixed ${totalReplacements} references in ${totalFiles} files`);
  if (reviewCount > 0) {
    console.log(`  ⚠️  ${reviewCount} files may need manual review`);
  }
  
  console.log('\n📝 Important notes:\n');
  console.log('  • "ui" namespace → "ui-common" (default mapping)');
  console.log('  • "dashboard" namespace → "dashboard-main" (default mapping)');
  console.log('  • "family" namespace → "family-core" (default mapping)');
  console.log('\n  Some components may need specific namespaces:');
  console.log('  • UI components using forms → might need "ui-common"');
  console.log('  • UI components using analytics → might need "ui-elements"');
  console.log('  • Dashboard annual review → might need "dashboard-review"');
  console.log('  • Family emergency features → might need "family-emergency"');
  
  console.log('\n✅ Reference fixing complete!');
}

main().catch(console.error);
