const fs = require('fs');
const path = require('path');

// Define all the old namespaces that should NOT be used anymore
const oldNamespaces = [
  // Old common.json (should not exist anymore)
  'common',
  
  // Previously tiny files that were consolidated
  'accessibility',
  'forms', 
  'general',
  'pwa',
  'steps',
  'app',
  'security',
  'consent',
  'annual-review',
  'progress',
  'notifications',
  'alerts',
  'admin',
  'calculator',
  'recommendations',
  'reminders',
  'asset-management',
  'documents',
  'upload',
  'vault',
  'guardians',
  'guardian',
  'executor',
  'beneficiary',
  'invitations',
  'crisis',
  'playbook',
  'will',
  'legal',
  'legal-pages',
  'cookies',
  'features',
  'country',
  'plans',
  'pricing',
  'life-events',
  'emails',
  'manual',
  'onboarding',
  'contact',
  'questions',
  'debug'
];

// Current valid namespaces
const validNamespaces = [
  'ui',
  'auth', 
  'dashboard',
  'assets',
  'family',
  'wills',
  'landing',
  'settings',
  'subscription',
  'time-capsule',
  'sharing',
  'help',
  'ai',
  'errors',
  'micro-copy'
];

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

// Function to extract translation calls from a file
function extractTranslationCalls(content) {
  const calls = [];
  
  // Pattern 1: useTranslation('namespace')
  const useTranslationPattern = /useTranslation\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  let match;
  while ((match = useTranslationPattern.exec(content)) !== null) {
    calls.push({
      type: 'useTranslation',
      namespace: match[1],
      line: content.substring(0, match.index).split('\n').length,
      fullMatch: match[0]
    });
  }
  
  // Pattern 2: t('key') or t("key") - check for old namespace patterns
  const tCallPattern = /t\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  while ((match = tCallPattern.exec(content)) !== null) {
    const key = match[1];
    // Check if key contains old namespace patterns
    for (const oldNamespace of oldNamespaces) {
      if (key.startsWith(`${oldNamespace}.`)) {
        calls.push({
          type: 't',
          namespace: oldNamespace,
          key: key,
          line: content.substring(0, match.index).split('\n').length,
          fullMatch: match[0]
        });
      }
    }
  }
  
  return calls;
}

// Function to validate translation calls in a file
function validateTranslationCalls(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const calls = extractTranslationCalls(content);
  const violations = [];
  
  for (const call of calls) {
    if (call.type === 'useTranslation') {
      if (oldNamespaces.includes(call.namespace)) {
        violations.push({
          type: 'useTranslation',
          namespace: call.namespace,
          line: call.line,
          message: `useTranslation('${call.namespace}') - This old namespace should not be used`
        });
      }
    } else if (call.type === 't') {
      violations.push({
        type: 't',
        namespace: call.namespace,
        key: call.key,
        line: call.line,
        message: `t('${call.key}') - Key from old namespace '${call.namespace}' should not be used`
      });
    }
  }
  
  return violations;
}

// Function to check if old translation files still exist
function checkOldTranslationFiles() {
  const localesPath = path.join(__dirname, '../src/i18n/locales/en');
  const existingFiles = fs.readdirSync(localesPath)
    .filter(file => file.endsWith('.json') && !file.includes('backup'))
    .map(file => file.replace('.json', ''));
  
  const oldFilesFound = existingFiles.filter(file => oldNamespaces.includes(file));
  const missingValidFiles = validNamespaces.filter(file => !existingFiles.includes(file));
  
  return { oldFilesFound, missingValidFiles, existingFiles };
}

// Function to check for common.json specifically
function checkCommonJson() {
  const localesPath = path.join(__dirname, '../src/i18n/locales/en');
  const commonJsonPath = path.join(localesPath, 'common.json');
  
  if (fs.existsSync(commonJsonPath)) {
    return {
      exists: true,
      size: fs.statSync(commonJsonPath).size,
      path: commonJsonPath
    };
  }
  
  return { exists: false };
}

// Main validation function
function validateNoOldKeys() {
  console.log('🔍 Validating no old translation keys are being used...\n');
  
  const srcPath = path.join(__dirname, '../src');
  const tsxFiles = findTsxFiles(srcPath);
  
  console.log(`📁 Found ${tsxFiles.length} files to validate\n`);
  
  let totalViolations = 0;
  let filesWithViolations = 0;
  const allViolations = [];
  
  // Validate translation calls in all files
  for (const filePath of tsxFiles) {
    const relativePath = path.relative(srcPath, filePath);
    const violations = validateTranslationCalls(filePath);
    
    if (violations.length > 0) {
      console.log(`❌ ${relativePath}:`);
      violations.forEach(violation => {
        console.log(`   Line ${violation.line}: ${violation.message}`);
      });
      totalViolations += violations.length;
      filesWithViolations++;
      allViolations.push({ file: relativePath, violations });
    }
  }
  
  // Check for old translation files
  console.log('\n📁 Checking for old translation files...');
  const fileCheck = checkOldTranslationFiles();
  
  if (fileCheck.oldFilesFound.length > 0) {
    console.log(`❌ Old translation files found: ${fileCheck.oldFilesFound.join(', ')}`);
  } else {
    console.log('✅ No old translation files found');
  }
  
  if (fileCheck.missingValidFiles.length > 0) {
    console.log(`❌ Missing valid translation files: ${fileCheck.missingValidFiles.join(', ')}`);
  } else {
    console.log('✅ All valid translation files present');
  }
  
  // Check for common.json specifically
  console.log('\n📄 Checking for common.json...');
  const commonCheck = checkCommonJson();
  
  if (commonCheck.exists) {
    console.log(`❌ common.json still exists (${commonCheck.size} bytes)`);
  } else {
    console.log('✅ common.json has been properly removed');
  }
  
  // Generate validation report
  console.log('\n📊 VALIDATION REPORT');
  console.log('====================\n');
  
  console.log(`📁 Files processed: ${tsxFiles.length}`);
  console.log(`❌ Files with violations: ${filesWithViolations}`);
  console.log(`🚫 Total violations found: ${totalViolations}`);
  
  console.log('\n📁 Translation Files:');
  console.log(`   Old files found: ${fileCheck.oldFilesFound.length}`);
  console.log(`   Missing valid files: ${fileCheck.missingValidFiles.length}`);
  console.log(`   common.json exists: ${commonCheck.exists ? 'YES' : 'NO'}`);
  
  // Summary of violations by type
  const violationsByType = {};
  allViolations.forEach(({ violations }) => {
    violations.forEach(violation => {
      violationsByType[violation.type] = (violationsByType[violation.type] || 0) + 1;
    });
  });
  
  if (Object.keys(violationsByType).length > 0) {
    console.log('\n🚫 Violations by type:');
    Object.entries(violationsByType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
  }
  
  // Final status
  const hasViolations = totalViolations > 0 || 
                       fileCheck.oldFilesFound.length > 0 || 
                       commonCheck.exists;
  
  if (hasViolations) {
    console.log('\n❌ VALIDATION FAILED - Old translation keys/files found!');
    console.log('\n🔧 Required Actions:');
    console.log('   1. Remove any old translation files');
    console.log('   2. Update any useTranslation() calls to use new namespaces');
    console.log('   3. Update any t() calls that reference old namespaces');
    console.log('   4. Ensure common.json is completely removed');
    return false;
  } else {
    console.log('\n✅ VALIDATION PASSED - No old translation keys/files found!');
    console.log('\n🎉 All translation calls are using the new consolidated namespaces.');
    return true;
  }
}

// Run the validation
if (require.main === module) {
  validateNoOldKeys();
}

module.exports = { validateNoOldKeys }; 