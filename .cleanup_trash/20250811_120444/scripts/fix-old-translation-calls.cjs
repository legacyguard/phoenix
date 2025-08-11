const fs = require('fs');
const path = require('path');

// Comprehensive mapping from old namespaces to new consolidated namespaces
const namespaceMapping = {
  // Common namespace mappings
  'common': 'ui',
  'app': 'ui',
  'forms': 'ui',
  'general': 'ui',
  'pwa': 'ui',
  'steps': 'ui',
  'security': 'ui',
  'consent': 'ui',
  'progress': 'ui',
  'notifications': 'ui',
  'alerts': 'ui',
  'accessibility': 'ui',
  
  // Dashboard related mappings
  'admin': 'dashboard',
  'annual-review': 'dashboard',
  'calculator': 'dashboard',
  'recommendations': 'dashboard',
  'reminders': 'dashboard',
  
  // Assets and vault mappings
  'asset-management': 'assets',
  'documents': 'assets',
  'upload': 'assets',
  'vault': 'assets',
  
  // Family and guardians mappings
  'guardians': 'family',
  'guardian': 'family',
  'executor': 'family',
  'beneficiary': 'family',
  'invitations': 'family',
  'crisis': 'family',
  'playbook': 'family',
  
  // Will and legal mappings
  'will': 'wills',
  'legal': 'wills',
  'legal-pages': 'wills',
  'cookies': 'wills',
  
  // Landing and features mappings
  'features': 'landing',
  'country': 'landing',
  'plans': 'landing',
  'pricing': 'landing',
  
  // Time capsule and life events
  'life-events': 'time-capsule',
  'emails': 'sharing',
  
  // Manual and onboarding
  'manual': 'help',
  'onboarding': 'help',
  'contact': 'help',
  'questions': 'help',
  'debug': 'help'
};

// Function to find all TypeScript/React files
function findTsxFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && !item.includes('backup')) {
      files.push(...findTsxFiles(fullPath));
    } else if (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.jsx') || item.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to fix translation calls in a file
function fixTranslationCalls(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const fixes = [];
  
  // Fix t() calls with old namespace patterns
  for (const [oldNamespace, newNamespace] of Object.entries(namespaceMapping)) {
    const oldPattern = new RegExp(`t\\(\\s*['"\`]${oldNamespace}\\.([^'"\`]+)['"\`]\\s*\\)`, 'g');
    const matches = content.match(oldPattern);
    
    if (matches) {
      content = content.replace(oldPattern, (match, key) => {
        const newKey = `${newNamespace}.${key}`;
        fixes.push({
          type: 't',
          old: `${oldNamespace}.${key}`,
          new: newKey,
          line: content.substring(0, content.indexOf(match)).split('\n').length
        });
        modified = true;
        return `t('${newKey}')`;
      });
    }
  }
  
  // Fix useTranslation() calls with old namespaces
  for (const [oldNamespace, newNamespace] of Object.entries(namespaceMapping)) {
    const oldPattern = new RegExp(`useTranslation\\s*\\(\\s*['"\`]${oldNamespace}['"\`]\\s*\\)`, 'g');
    const matches = content.match(oldPattern);
    
    if (matches) {
      content = content.replace(oldPattern, (match) => {
        fixes.push({
          type: 'useTranslation',
          old: oldNamespace,
          new: newNamespace,
          line: content.substring(0, content.indexOf(match)).split('\n').length
        });
        modified = true;
        return `useTranslation('${newNamespace}')`;
      });
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  
  return { modified, fixes };
}

// Main function to fix all translation calls
function fixAllTranslationCalls() {
  console.log('🔧 Fixing old translation calls...\n');
  
  const srcPath = path.join(__dirname, '../src');
  const tsxFiles = findTsxFiles(srcPath);
  
  console.log(`📁 Found ${tsxFiles.length} files to process\n`);
  
  let totalFilesModified = 0;
  let totalFixes = 0;
  const allFixes = [];
  
  for (const filePath of tsxFiles) {
    const relativePath = path.relative(srcPath, filePath);
    const result = fixTranslationCalls(filePath);
    
    if (result.modified) {
      console.log(`✅ ${relativePath}:`);
      result.fixes.forEach(fix => {
        console.log(`   Line ${fix.line}: ${fix.type}('${fix.old}') → ${fix.type}('${fix.new}')`);
      });
      totalFilesModified++;
      totalFixes += result.fixes.length;
      allFixes.push({ file: relativePath, fixes: result.fixes });
    }
  }
  
  // Generate summary report
  console.log('\n📊 FIX SUMMARY');
  console.log('==============\n');
  
  console.log(`📁 Files processed: ${tsxFiles.length}`);
  console.log(`✅ Files modified: ${totalFilesModified}`);
  console.log(`🔧 Total fixes applied: ${totalFixes}`);
  
  // Summary by namespace mapping
  const fixesByNamespace = {};
  allFixes.forEach(({ fixes }) => {
    fixes.forEach(fix => {
      const mapping = `${fix.old.split('.')[0]} → ${fix.new.split('.')[0]}`;
      fixesByNamespace[mapping] = (fixesByNamespace[mapping] || 0) + 1;
    });
  });
  
  if (Object.keys(fixesByNamespace).length > 0) {
    console.log('\n🔄 Namespace mappings applied:');
    Object.entries(fixesByNamespace)
      .sort(([,a], [,b]) => b - a)
      .forEach(([mapping, count]) => {
        console.log(`   ${mapping}: ${count} fixes`);
      });
  }
  
  // Summary by fix type
  const fixesByType = {};
  allFixes.forEach(({ fixes }) => {
    fixes.forEach(fix => {
      fixesByType[fix.type] = (fixesByType[fix.type] || 0) + 1;
    });
  });
  
  if (Object.keys(fixesByType).length > 0) {
    console.log('\n🔧 Fixes by type:');
    Object.entries(fixesByType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
  }
  
  if (totalFixes > 0) {
    console.log('\n✅ SUCCESS - All old translation calls have been fixed!');
    console.log('\n🎉 The application should now use only the new consolidated namespaces.');
  } else {
    console.log('\nℹ️  No fixes were needed - all translation calls are already using the correct namespaces.');
  }
  
  return { totalFilesModified, totalFixes, allFixes };
}

// Run the fix
if (require.main === module) {
  fixAllTranslationCalls();
}

module.exports = { fixAllTranslationCalls, namespaceMapping }; 