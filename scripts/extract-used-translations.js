#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = path.join(__dirname, '../src');
const outputDir = path.join(__dirname, '../src/i18n/extracted');

// Patterns to match translation usage
const translationPatterns = [
  /\bt\(['"`]([^'"`]+)['"`]/g,                    // t('key')
  /\bt\s*\(['"`]([^'"`]+)['"`]/g,                 // t ('key') with space
  /i18n\.t\(['"`]([^'"`]+)['"`]/g,               // i18n.t('key')
  /translate\(['"`]([^'"`]+)['"`]/g,              // translate('key')
  /\{t\(['"`]([^'"`]+)['"`]\}/g,                  // {t('key')}
  /translationKey:\s*['"`]([^'"`]+)['"`]/g,       // translationKey: 'key'
];

// Extract namespace from translation key
function extractNamespace(key) {
  const parts = key.split(':');
  if (parts.length > 1) {
    return { namespace: parts[0], key: parts.slice(1).join(':') };
  }
  // Check if key has dots indicating namespace
  const dotParts = key.split('.');
  if (dotParts.length > 1) {
    return { namespace: 'common', key: key };
  }
  return { namespace: 'common', key: key };
}

// Read and process a single file
async function processFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const keys = new Set();
    const namespaces = new Set();
    
    // Check if file uses useTranslation hook
    const useTranslationMatch = content.match(/useTranslation\(\s*(?:\[([^\]]+)\]|['"`]([^'"`]+)['"`])?\s*\)/);
    if (useTranslationMatch) {
      const nsMatch = useTranslationMatch[1] || useTranslationMatch[2];
      if (nsMatch) {
        // Extract namespaces from array or string
        const nsArray = nsMatch.includes(',') ? 
          nsMatch.split(',').map(ns => ns.trim().replace(/['"`]/g, '')) : 
          [nsMatch.replace(/['"`]/g, '')];
        nsArray.forEach(ns => namespaces.add(ns));
      }
    }
    
    // Extract all translation keys
    for (const pattern of translationPatterns) {
      let match;
      const regex = new RegExp(pattern);
      while ((match = regex.exec(content)) !== null) {
        const fullKey = match[1];
        if (fullKey && !fullKey.includes('${') && !fullKey.includes('{{')) {
          keys.add(fullKey);
          const { namespace } = extractNamespace(fullKey);
          namespaces.add(namespace);
        }
      }
    }
    
    return { keys: Array.from(keys), namespaces: Array.from(namespaces) };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return { keys: [], namespaces: [] };
  }
}

// Walk through directory recursively
async function walkDirectory(dir, fileCallback) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    // Skip certain directories
    if (entry.isDirectory()) {
      if (!['node_modules', '__tests__', '.git', 'dist', 'build'].includes(entry.name)) {
        await walkDirectory(fullPath, fileCallback);
      }
    } else if (entry.isFile() && /\.(tsx|jsx)$/.test(entry.name)) {
      await fileCallback(fullPath);
    }
  }
}

// Group keys by namespace and module
function organizeKeys(allKeys) {
  const organized = {};
  
  for (const [file, data] of allKeys) {
    for (const key of data.keys) {
      const { namespace, key: cleanKey } = extractNamespace(key);
      
      if (!organized[namespace]) {
        organized[namespace] = {};
      }
      
      // Try to organize by module based on key structure
      const keyParts = cleanKey.split('.');
      let current = organized[namespace];
      
      for (let i = 0; i < keyParts.length - 1; i++) {
        const part = keyParts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      
      // Set the final value
      const finalKey = keyParts[keyParts.length - 1];
      if (!current[finalKey]) {
        current[finalKey] = cleanKey;
      }
    }
  }
  
  return organized;
}

// Main function
async function main() {
  console.log('Extracting translation keys from TSX/JSX files...\n');
  
  const allKeys = new Map();
  const fileCount = { total: 0, withKeys: 0 };
  
  await walkDirectory(srcDir, async (filePath) => {
    fileCount.total++;
    const result = await processFile(filePath);
    
    if (result.keys.length > 0) {
      fileCount.withKeys++;
      const relativePath = path.relative(srcDir, filePath);
      allKeys.set(relativePath, result);
      console.log(`Found ${result.keys.length} keys in ${relativePath}`);
    }
  });
  
  console.log(`\nProcessed ${fileCount.total} files, ${fileCount.withKeys} contain translation keys`);
  
  // Organize keys by namespace
  const organized = organizeKeys(allKeys);
  
  // Create output directory
  await fs.mkdir(outputDir, { recursive: true });
  
  // Save organized keys
  await fs.writeFile(
    path.join(outputDir, 'used-translation-keys.json'),
    JSON.stringify(organized, null, 2)
  );
  
  // Create file mapping
  const fileMapping = {};
  for (const [file, data] of allKeys) {
    fileMapping[file] = {
      keys: data.keys,
      namespaces: data.namespaces
    };
  }
  
  await fs.writeFile(
    path.join(outputDir, 'file-translation-mapping.json'),
    JSON.stringify(fileMapping, null, 2)
  );
  
  // Generate summary report
  const namespaceStats = {};
  let totalKeys = 0;
  
  for (const [file, data] of allKeys) {
    totalKeys += data.keys.length;
    for (const ns of data.namespaces) {
      namespaceStats[ns] = (namespaceStats[ns] || 0) + 1;
    }
  }
  
  const report = `# Translation Keys Usage Report

## Summary
- Total files scanned: ${fileCount.total}
- Files with translations: ${fileCount.withKeys}
- Total unique keys found: ${totalKeys}

## Namespaces Used
${Object.entries(namespaceStats)
  .sort(([,a], [,b]) => b - a)
  .map(([ns, count]) => `- ${ns}: used in ${count} files`)
  .join('\n')}

## Files with Most Keys
${Array.from(allKeys.entries())
  .sort(([,a], [,b]) => b.keys.length - a.keys.length)
  .slice(0, 10)
  .map(([file, data]) => `- ${file}: ${data.keys.length} keys`)
  .join('\n')}

## Next Steps
1. Review used-translation-keys.json to see all keys organized by namespace
2. Compare with your existing translation files
3. Add any missing translations
4. Remove any unused translations
`;
  
  await fs.writeFile(
    path.join(outputDir, 'translation-usage-report.md'),
    report
  );
  
  console.log('\nExtraction complete! Check the output in:', outputDir);
  console.log('- used-translation-keys.json: All keys organized by namespace');
  console.log('- file-translation-mapping.json: Which files use which keys');
  console.log('- translation-usage-report.md: Summary report');
}

// Run the script
main().catch(console.error);
