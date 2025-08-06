const fs = require('fs');
const path = require('path');

// Define mappings for old namespace references in translation file values
const valueMappings = {
  // Fix guardians.* references to family.*
  'guardians.GuardianPlaybook': 'family.GuardianPlaybook',
  'guardians.GuardianPlaybookView': 'family.GuardianPlaybookView',
  
  // Fix playbook.* references to family.*
  'playbook.tabs.': 'family.tabs.',
  'playbook.status.': 'family.status.',
  'playbook.': 'family.'
};

// Function to fix old namespace references in translation file values
function fixTranslationFileReferences(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const fixes = [];
  
  // Apply all value mappings
  for (const [oldPattern, newPattern] of Object.entries(valueMappings)) {
    if (content.includes(oldPattern)) {
      const oldContent = content;
      content = content.replace(new RegExp(oldPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPattern);
      
      if (content !== oldContent) {
        modified = true;
        fixes.push({
          old: oldPattern,
          new: newPattern,
          count: (oldContent.match(new RegExp(oldPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
        });
      }
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  
  return { modified, fixes };
}

// Function to fix all translation files
function fixAllTranslationFiles() {
  console.log('🔧 Fixing old namespace references in translation files...\n');
  
  const localesPath = path.join(__dirname, '../src/i18n/locales/en');
  const validNamespaces = [
    'ui', 'auth', 'dashboard', 'assets', 'family', 'wills', 'landing', 'settings', 
    'subscription', 'time-capsule', 'sharing', 'help', 'ai', 'errors', 'micro-copy'
  ];
  
  let totalFilesModified = 0;
  let totalFixes = 0;
  const allFixes = [];
  
  for (const namespace of validNamespaces) {
    const filePath = path.join(localesPath, `${namespace}.json`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${namespace}.json - file not found`);
      continue;
    }
    
    const result = fixTranslationFileReferences(filePath);
    
    if (result.modified) {
      console.log(`✅ ${namespace}.json:`);
      result.fixes.forEach(fix => {
        console.log(`   "${fix.old}" → "${fix.new}" (${fix.count} occurrences)`);
      });
      totalFilesModified++;
      totalFixes += result.fixes.reduce((sum, fix) => sum + fix.count, 0);
      allFixes.push({ file: namespace, fixes: result.fixes });
    }
  }
  
  // Generate summary report
  console.log('\n📊 FIX SUMMARY');
  console.log('==============\n');
  
  console.log(`📁 Translation files processed: ${validNamespaces.length}`);
  console.log(`✅ Files modified: ${totalFilesModified}`);
  console.log(`🔧 Total fixes applied: ${totalFixes}`);
  
  if (totalFixes > 0) {
    console.log('\n🔄 Value mappings applied:');
    Object.entries(valueMappings).forEach(([old, new_]) => {
      console.log(`   "${old}" → "${new_}"`);
    });
  }
  
  if (totalFixes > 0) {
    console.log('\n✅ SUCCESS - Old namespace references in translation files have been fixed!');
  } else {
    console.log('\nℹ️  No fixes were needed - translation files are already clean.');
  }
  
  return { totalFilesModified, totalFixes, allFixes };
}

// Run the fix
if (require.main === module) {
  fixAllTranslationFiles();
}

module.exports = { fixAllTranslationFiles, fixTranslationFileReferences }; 