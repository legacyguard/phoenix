const fs = require('fs');
const path = require('path');

// Define final consolidation mapping for remaining files
const finalConsolidationMap = {
  'admin': 'dashboard',      // Admin features go to dashboard
  'app': 'ui',              // App-level features go to ui
  'calculator': 'dashboard', // Calculator features go to dashboard
  'contact': 'help',         // Contact features go to help
  'cookies': 'legal',        // Cookie policy goes to legal
  'crisis': 'family',        // Crisis features go to family
  'playbook': 'family',      // Playbook features go to family
  'questions': 'help',       // Questions go to help
  'recommendations': 'dashboard', // Recommendations go to dashboard
  'reminders': 'dashboard'   // Reminders go to dashboard
};

// Function to load and merge files
function finalConsolidation() {
  console.log('🔄 Final consolidation of remaining files...\n');
  
  const localesPath = path.join(__dirname, '../src/i18n/locales/en');
  const mergedFiles = [];
  
  for (const [sourceFile, targetFile] of Object.entries(finalConsolidationMap)) {
    const sourcePath = path.join(localesPath, `${sourceFile}.json`);
    const targetPath = path.join(localesPath, `${targetFile}.json`);
    
    if (fs.existsSync(sourcePath) && fs.existsSync(targetPath)) {
      console.log(`📝 Merging ${sourceFile}.json into ${targetFile}.json...`);
      
      // Load both files
      const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
      const targetData = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
      
      // Merge data
      const mergedData = { ...targetData, ...sourceData };
      
      // Write merged file
      fs.writeFileSync(targetPath, JSON.stringify(mergedData, null, 2));
      
      console.log(`  ✅ Merged ${Object.keys(sourceData).length} keys from ${sourceFile}.json`);
      console.log(`  📄 Updated ${targetFile}.json (${Object.keys(mergedData).length} keys total)`);
      
      // Create backup and remove source file
      const backupPath = path.join(localesPath, `${sourceFile}.json.final-backup`);
      fs.writeFileSync(backupPath, fs.readFileSync(sourcePath, 'utf8'));
      fs.unlinkSync(sourcePath);
      
      console.log(`  🗑️  Removed ${sourceFile}.json (backup: ${sourceFile}.json.final-backup)`);
      
      mergedFiles.push({ source: sourceFile, target: targetFile, keyCount: Object.keys(sourceData).length });
    }
  }
  
  return mergedFiles;
}

// Function to update i18n configuration to remove old namespaces
function updateI18nConfig() {
  console.log('\n⚙️ Updating i18n configuration...\n');
  
  const i18nPath = path.join(__dirname, '../src/i18n/i18n.ts');
  let i18nContent = fs.readFileSync(i18nPath, 'utf8');
  
  // Remove old namespaces from the array
  const oldNamespaces = Object.keys(finalConsolidationMap);
  const namespaceMatch = i18nContent.match(/export const namespaces = \[([\s\S]*?)\]/);
  
  if (namespaceMatch) {
    const existingNamespaces = namespaceMatch[1]
      .split(',')
      .map(ns => ns.trim().replace(/'/g, ''))
      .filter(ns => ns.length > 0 && !oldNamespaces.includes(ns));
    
    const newNamespacesString = existingNamespaces.map(ns => `'${ns}'`).join(',\n  ');
    
    i18nContent = i18nContent.replace(
      /export const namespaces = \[([\s\S]*?)\]/,
      `export const namespaces = [\n  ${newNamespacesString}\n]`
    );
    
    fs.writeFileSync(i18nPath, i18nContent);
    console.log(`✅ Updated i18n.ts, removed ${oldNamespaces.length} old namespaces`);
    console.log(`📊 Total namespaces: ${existingNamespaces.length}`);
  }
}

// Function to update component imports
function updateComponentImports() {
  console.log('\n🔧 Updating component imports...\n');
  
  const srcPath = path.join(__dirname, '../src');
  const updatedFiles = [];
  
  // Find all TypeScript/React files
  function findTsxFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'backup-') {
        files.push(...findTsxFiles(fullPath));
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }
  
  const tsxFiles = findTsxFiles(srcPath);
  
  for (const filePath of tsxFiles) {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Update useTranslation calls
    for (const [oldNamespace, newNamespace] of Object.entries(finalConsolidationMap)) {
      const oldPattern = new RegExp(`useTranslation\\(['"]${oldNamespace}['"]\\)`, 'g');
      if (oldPattern.test(content)) {
        content = content.replace(oldPattern, `useTranslation('${newNamespace}')`);
        updated = true;
      }
    }
    
    if (updated) {
      fs.writeFileSync(filePath, content);
      const relativePath = path.relative(srcPath, filePath);
      console.log(`✅ Updated ${relativePath}`);
      updatedFiles.push(relativePath);
    }
  }
  
  return updatedFiles;
}

// Main execution
function main() {
  try {
    // Step 1: Final consolidation
    const mergedFiles = finalConsolidation();
    
    // Step 2: Update i18n configuration
    updateI18nConfig();
    
    // Step 3: Update component imports
    const updatedFiles = updateComponentImports();
    
    // Summary
    console.log('\n🎉 Final consolidation completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Merged ${mergedFiles.length} files`);
    console.log(`   - Updated ${updatedFiles.length} component files`);
    
    console.log('\n📁 Final file structure:');
    const localesPath = path.join(__dirname, '../src/i18n/locales/en');
    const finalFiles = fs.readdirSync(localesPath)
      .filter(file => file.endsWith('.json') && !file.includes('backup'))
      .sort();
    
    finalFiles.forEach(file => {
      const filePath = path.join(localesPath, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`   - ${file} (${Object.keys(data).length} keys)`);
    });
    
    console.log(`\n📊 Total files: ${finalFiles.length}`);
    
  } catch (error) {
    console.error('❌ Error during final consolidation:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main }; 