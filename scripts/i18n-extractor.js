#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as parser from '@babel/parser';
import _traverse from '@babel/traverse';
const traverse = _traverse.default || _traverse;
import generate from '@babel/generator';
import * as t from '@babel/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  componentsDir: path.join(__dirname, '../src/components'),
  outputDir: path.join(__dirname, '../src/i18n/extracted'),
  excludePatterns: [
    /node_modules/,
    /__tests__/,
    /\.test\./,
    /\.spec\./,
    /ui\//  // Skip UI library components
  ],
  minStringLength: 3,
  excludeStrings: [
    // Common non-translatable strings
    /^[0-9]+$/,
    /^[a-z0-9-_]+$/i,  // IDs, classes
    /^#[0-9a-f]{3,6}$/i,  // Colors
    /^(px|em|rem|%|vh|vw)$/,  // Units
    /^(true|false|null|undefined)$/,
    /^https?:\/\//,  // URLs
    /^[A-Z_]+$/,  // Constants
    /^\s*$/,  // Empty/whitespace
  ]
};

// Helper to generate i18n key from file path and string content
function generateI18nKey(filePath, stringValue, counter) {
  const relativePath = path.relative(CONFIG.componentsDir, filePath);
  const pathParts = relativePath.split(path.sep);
  const fileName = path.basename(filePath, path.extname(filePath));
  
  // Clean string for key generation
  const cleanString = stringValue
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 30);
  
  // Build key hierarchy
  let keyBase = fileName.charAt(0).toLowerCase() + fileName.slice(1);
  
  // Add parent directory if exists
  if (pathParts.length > 1) {
    const parentDir = pathParts[pathParts.length - 2];
    keyBase = `${parentDir}.${keyBase}`;
  }
  
  return `${keyBase}.${cleanString}_${counter}`;
}

// Check if string should be extracted
function shouldExtractString(value) {
  if (typeof value !== 'string') return false;
  if (value.length < CONFIG.minStringLength) return false;
  
  return !CONFIG.excludeStrings.some(pattern => pattern.test(value));
}

// Extract strings from a single file
async function extractStringsFromFile(filePath) {
  const code = await fs.readFile(filePath, 'utf8');
  const strings = new Map();
  let counter = 1;
  
  try {
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
    
    traverse(ast, {
      // JSX Text
      JSXText(path) {
        const value = path.node.value.trim();
        if (shouldExtractString(value)) {
          const key = generateI18nKey(filePath, value, counter++);
          strings.set(key, value);
          
          // Mark for replacement
          path.node._i18nKey = key;
        }
      },
      
      // String literals in JSX attributes
      JSXAttribute(path) {
        if (t.isStringLiteral(path.node.value)) {
          const value = path.node.value.value;
          if (shouldExtractString(value)) {
            // Skip certain attributes
            const attrName = path.node.name.name;
            if (['className', 'id', 'href', 'src', 'alt', 'type', 'name'].includes(attrName)) {
              return;
            }
            
            const key = generateI18nKey(filePath, value, counter++);
            strings.set(key, value);
            path.node.value._i18nKey = key;
          }
        }
      },
      
      // String literals in JS (e.g., toast messages, errors)
      StringLiteral(path) {
        // Skip if already processed or in certain contexts
        if (path.node._i18nKey) return;
        if (path.parent.type === 'ImportDeclaration') return;
        if (path.parent.type === 'CallExpression' && 
            path.parent.callee.name === 'require') return;
        
        const value = path.node.value;
        if (shouldExtractString(value)) {
          // Check if it's likely a user-facing string
          const parent = path.parent;
          const isUserFacing = 
            parent.type === 'CallExpression' && 
            ['toast', 'alert', 'confirm', 'setError', 'console'].some(
              fn => parent.callee.name?.includes(fn) || 
                    parent.callee.property?.name?.includes(fn)
            );
          
          if (isUserFacing || parent.type === 'JSXExpressionContainer') {
            const key = generateI18nKey(filePath, value, counter++);
            strings.set(key, value);
            path.node._i18nKey = key;
          }
        }
      },
      
      // Template literals
      TemplateLiteral(path) {
        if (path.node.quasis.length === 1 && path.node.expressions.length === 0) {
          const value = path.node.quasis[0].value.cooked;
          if (shouldExtractString(value)) {
            const key = generateI18nKey(filePath, value, counter++);
            strings.set(key, value);
            path.node._i18nKey = key;
          }
        }
      }
    });
    
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error.message);
    return null;
  }
  
  return strings;
}

// Process all files in directory
async function processDirectory(dir) {
  const allStrings = new Map();
  const fileMapping = new Map();
  
  async function walkDir(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      // Check exclusions
      if (CONFIG.excludePatterns.some(pattern => pattern.test(fullPath))) {
        continue;
      }
      
      if (entry.isDirectory()) {
        await walkDir(fullPath);
      } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
        console.log(`Processing: ${fullPath}`);
        const strings = await extractStringsFromFile(fullPath);
        
        if (strings && strings.size > 0) {
          const relativePath = path.relative(CONFIG.componentsDir, fullPath);
          fileMapping.set(relativePath, Array.from(strings.keys()));
          
          strings.forEach((value, key) => {
            allStrings.set(key, value);
          });
        }
      }
    }
  }
  
  await walkDir(dir);
  return { allStrings, fileMapping };
}

// Generate i18n JSON structure
function generateI18nStructure(stringsMap) {
  const result = {};
  
  stringsMap.forEach((value, key) => {
    const parts = key.split('.');
    let current = result;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = value;
  });
  
  return result;
}

// Main execution
async function main() {
  console.log('Starting i18n extraction...\n');
  
  // Ensure output directory exists
  await fs.mkdir(CONFIG.outputDir, { recursive: true });
  
  // Process all files
  const { allStrings, fileMapping } = await processDirectory(CONFIG.componentsDir);
  
  console.log(`\nExtracted ${allStrings.size} unique strings from ${fileMapping.size} files`);
  
  // Generate i18n structure
  const i18nStructure = generateI18nStructure(allStrings);
  
  // Save extracted strings
  await fs.writeFile(
    path.join(CONFIG.outputDir, 'extracted-strings.json'),
    JSON.stringify(i18nStructure, null, 2)
  );
  
  // Save file mapping
  await fs.writeFile(
    path.join(CONFIG.outputDir, 'file-mapping.json'),
    JSON.stringify(Object.fromEntries(fileMapping), null, 2)
  );
  
  // Generate migration guide
  const migrationGuide = `# i18n Migration Guide

## Extracted Strings
- Total strings: ${allStrings.size}
- Total files: ${fileMapping.size}

## Next Steps:
1. Review extracted-strings.json and refine the translations
2. Merge into your main translation files
3. Run the refactoring script to update components
4. Review and test the changes

## Files to be updated:
${Array.from(fileMapping.keys()).map(f => `- ${f}`).join('\n')}
`;
  
  await fs.writeFile(
    path.join(CONFIG.outputDir, 'migration-guide.md'),
    migrationGuide
  );
  
  console.log('\nExtraction complete! Check the output in:', CONFIG.outputDir);
}

// Run the script
main().catch(console.error);
