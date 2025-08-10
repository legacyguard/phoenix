#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..');

// Update i18n configuration
function updateI18nConfig() {
  const configPath = path.join(PROJECT_ROOT, 'src', 'i18n', 'i18n.ts');
  let content = fs.readFileSync(configPath, 'utf8');
  
  // Replace ui-misc with ui-components and ui-elements
  content = content.replace(/['"]ui-misc['"]/g, '"ui-components", "ui-elements"');
  
  fs.writeFileSync(configPath, content);
  console.log('✅ Updated i18n.ts configuration');
}

// Find all TypeScript/JavaScript files that might have ui-misc references
function findFilesWithUiMiscReferences() {
  const files = [];
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and dist directories
        if (item !== 'node_modules' && item !== 'dist' && item !== '.git') {
          scanDirectory(fullPath);
        }
      } else if (extensions.includes(path.extname(item))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('ui-misc')) {
          files.push(fullPath);
        }
      }
    }
  }
  
  scanDirectory(path.join(PROJECT_ROOT, 'src'));
  return files;
}

// Analyze which keys from ui-misc are used in a file
function analyzeKeyUsage(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Find all translation key references
  const patterns = [
    /t\(['"]ui-misc:([^'"]+)['"]/g,
    /\$t\(['"]ui-misc:([^'"]+)['"]/g,
    /i18n\.t\(['"]ui-misc:([^'"]+)['"]/g,
    /useTranslation\(['"]ui-misc['"]\)/g
  ];
  
  const keys = new Set();
  let hasHookUsage = false;
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      if (match[1]) {
        keys.add(match[1]);
      } else {
        hasHookUsage = true;
      }
    }
  }
  
  return { keys: Array.from(keys), hasHookUsage };
}

// Get the namespace for a key based on the split
function getNamespaceForKey(key) {
  // Read the English ui-components file to determine which keys belong there
  const componentsPath = path.join(PROJECT_ROOT, 'src/i18n/locales/en/ui-components.json');
  const componentsContent = JSON.parse(fs.readFileSync(componentsPath, 'utf8'));
  
  // Check if the key's top-level category exists in ui-components
  const topLevel = key.split('.')[0];
  if (componentsContent[topLevel]) {
    return 'ui-components';
  }
  return 'ui-elements';
}

// Update references in a file
function updateFileReferences(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const { keys, hasHookUsage } = analyzeKeyUsage(filePath);
  
  let updates = 0;
  
  // Update specific key references
  for (const key of keys) {
    const namespace = getNamespaceForKey(key);
    const patterns = [
      new RegExp(`t\\(['"]ui-misc:${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'),
      new RegExp(`\\$t\\(['"]ui-misc:${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'),
      new RegExp(`i18n\\.t\\(['"]ui-misc:${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g')
    ];
    
    for (const pattern of patterns) {
      const newContent = content.replace(pattern, (match) => {
        updates++;
        return match.replace('ui-misc:', `${namespace}:`);
      });
      content = newContent;
    }
  }
  
  // Handle useTranslation hook usage
  if (hasHookUsage) {
    // If the file uses both components and elements keys, we need to be smart about it
    const usedNamespaces = new Set();
    for (const key of keys) {
      usedNamespaces.add(getNamespaceForKey(key));
    }
    
    if (usedNamespaces.size === 1) {
      // All keys are from the same namespace
      const namespace = Array.from(usedNamespaces)[0];
      content = content.replace(/useTranslation\(['"]ui-misc['"]\)/g, `useTranslation('${namespace}')`);
      updates++;
    } else if (usedNamespaces.size === 2) {
      // Keys from both namespaces - need to use multiple hooks
      console.log(`  ⚠️  ${path.relative(PROJECT_ROOT, filePath)}: Uses keys from both ui-components and ui-elements`);
      console.log('      Manual review needed for useTranslation hook');
    }
  }
  
  if (updates > 0) {
    fs.writeFileSync(filePath, content);
    return updates;
  }
  
  return 0;
}

// Main execution
async function main() {
  console.log('🚀 Updating namespace references from ui-misc to ui-components/ui-elements...\n');
  
  // Update i18n configuration
  updateI18nConfig();
  
  // Find files with ui-misc references
  console.log('\n📂 Scanning for files with ui-misc references...');
  const files = findFilesWithUiMiscReferences();
  
  if (files.length === 0) {
    console.log('✅ No files with ui-misc references found!');
    return;
  }
  
  console.log(`Found ${files.length} files with ui-misc references\n`);
  
  // Update each file
  let totalUpdates = 0;
  for (const file of files) {
    const updates = updateFileReferences(file);
    if (updates > 0) {
      console.log(`  ✅ ${path.relative(PROJECT_ROOT, file)}: ${updates} references updated`);
      totalUpdates += updates;
    }
  }
  
  console.log(`\n✅ Updated ${totalUpdates} references across ${files.length} files`);
  
  // Check if the build still works
  console.log('\n🔨 Testing build...');
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  
  try {
    await execAsync('npm run build', { cwd: PROJECT_ROOT });
    console.log('✅ Build successful!');
  } catch (error) {
    console.error('❌ Build failed. Please check the errors above.');
  }
}

main().catch(console.error);
