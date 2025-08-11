#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as parser from '@babel/parser';
import _traverse from '@babel/traverse';
const traverse = _traverse.default || _traverse;
import _generate from '@babel/generator';
const generate = _generate.default || _generate;
import * as t from '@babel/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the extracted strings and file mapping
async function loadExtractedData() {
  const extractedStrings = JSON.parse(
    await fs.readFile(path.join(__dirname, '../src/i18n/extracted/extracted-strings.json'), 'utf8')
  );
  const fileMapping = JSON.parse(
    await fs.readFile(path.join(__dirname, '../src/i18n/extracted/file-mapping.json'), 'utf8')
  );
  
  // Flatten the extracted strings to create a reverse lookup
  const stringToKey = new Map();
  
  function flattenKeys(obj, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        stringToKey.set(value, fullKey);
      } else if (typeof value === 'object') {
        flattenKeys(value, prefix ? `${prefix}.${key}` : key);
      }
    }
  }
  
  flattenKeys(extractedStrings);
  return { stringToKey, fileMapping };
}

// Check if the file already imports useTranslation
function hasUseTranslation(ast) {
  let hasImport = false;
  
  traverse(ast, {
    ImportDeclaration(path) {
      if (path.node.source.value === 'react-i18next') {
        const hasUseTranslation = path.node.specifiers.some(
          spec => t.isImportSpecifier(spec) && spec.imported.name === 'useTranslation'
        );
        if (hasUseTranslation) {
          hasImport = true;
          path.stop();
        }
      }
    }
  });
  
  return hasImport;
}

// Add useTranslation import if not present
function addUseTranslationImport(ast) {
  let added = false;
  
  traverse(ast, {
    Program(path) {
      const body = path.node.body;
      let lastImportIndex = -1;
      
      // Find the last import statement
      body.forEach((node, index) => {
        if (t.isImportDeclaration(node)) {
          lastImportIndex = index;
        }
      });
      
      // Create the import statement
      const importDeclaration = t.importDeclaration(
        [t.importSpecifier(t.identifier('useTranslation'), t.identifier('useTranslation'))],
        t.stringLiteral('react-i18next')
      );
      
      // Insert after the last import
      body.splice(lastImportIndex + 1, 0, importDeclaration);
      added = true;
      path.stop();
    }
  });
  
  return added;
}

// Add const { t } = useTranslation() to the component
function addTranslationHook(ast, componentName) {
  let added = false;
  
  traverse(ast, {
    // For functional components
    FunctionDeclaration(path) {
      if (path.node.id && path.node.id.name === componentName) {
        addHookToFunction(path);
        added = true;
      }
    },
    VariableDeclarator(path) {
      if (
        path.node.id.name === componentName &&
        (t.isArrowFunctionExpression(path.node.init) || t.isFunctionExpression(path.node.init))
      ) {
        const funcPath = path.get('init');
        addHookToFunction(funcPath);
        added = true;
      }
    }
  });
  
  function addHookToFunction(funcPath) {
    const body = funcPath.node.body;
    if (t.isBlockStatement(body)) {
      const hookCall = t.variableDeclaration('const', [
        t.variableDeclarator(
          t.objectPattern([t.objectProperty(t.identifier('t'), t.identifier('t'))]),
          t.callExpression(t.identifier('useTranslation'), [t.stringLiteral('common')])
        )
      ]);
      
      // Insert at the beginning of the function body
      body.body.unshift(hookCall);
    }
  }
  
  return added;
}

// Replace strings with t() calls
function replaceStringsWithTranslations(ast, stringToKey) {
  let replacements = 0;
  
  traverse(ast, {
    // JSX Text
    JSXText(path) {
      const value = path.node.value.trim();
      const key = stringToKey.get(value);
      
      if (key) {
        // Replace with {t('key')}
        const jsxExpressionContainer = t.jsxExpressionContainer(
          t.callExpression(t.identifier('t'), [t.stringLiteral(key)])
        );
        path.replaceWith(jsxExpressionContainer);
        replacements++;
      }
    },
    
    // String literals in JSX attributes
    JSXAttribute(path) {
      if (t.isStringLiteral(path.node.value)) {
        const value = path.node.value.value;
        const key = stringToKey.get(value);
        
        if (key) {
          // Skip certain attributes
          const attrName = path.node.name.name;
          if (['className', 'id', 'href', 'src', 'type', 'name'].includes(attrName)) {
            return;
          }
          
          // Replace with {t('key')}
          const jsxExpressionContainer = t.jsxExpressionContainer(
            t.callExpression(t.identifier('t'), [t.stringLiteral(key)])
          );
          path.node.value = jsxExpressionContainer;
          replacements++;
        }
      }
    },
    
    // String literals in JS
    StringLiteral(path) {
      // Skip imports and certain contexts
      if (path.parent.type === 'ImportDeclaration') return;
      if (path.parent.type === 'CallExpression' && path.parent.callee.name === 'require') return;
      
      const value = path.node.value;
      const key = stringToKey.get(value);
      
      if (key) {
        // Check if it's in a user-facing context
        const parent = path.parent;
        const isUserFacing = 
          parent.type === 'CallExpression' && 
          ['toast', 'alert', 'confirm', 'setError'].some(
            fn => parent.callee.name?.includes(fn) || 
                  parent.callee.property?.name?.includes(fn)
          );
        
        if (isUserFacing || parent.type === 'JSXExpressionContainer') {
          // Replace with t('key')
          const tCall = t.callExpression(t.identifier('t'), [t.stringLiteral(key)]);
          path.replaceWith(tCall);
          replacements++;
        }
      }
    }
  });
  
  return replacements;
}

// Process a single file
async function processFile(filePath, stringToKey) {
  console.log(`Processing: ${filePath}`);
  
  try {
    const code = await fs.readFile(filePath, 'utf8');
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
    
    // Extract component name from filename
    const componentName = path.basename(filePath, path.extname(filePath));
    
    // Check if useTranslation is already imported
    if (!hasUseTranslation(ast)) {
      addUseTranslationImport(ast);
    }
    
    // Add translation hook if not present
    let needsHook = false;
    traverse(ast, {
      CallExpression(path) {
        if (path.node.callee.name === 't') {
          needsHook = true;
          path.stop();
        }
      }
    });
    
    // Replace strings
    const replacements = replaceStringsWithTranslations(ast, stringToKey);
    
    if (replacements > 0) {
      // Add hook if we made replacements and it's needed
      if (needsHook) {
        addTranslationHook(ast, componentName);
      }
      
      // Generate new code
      const { code: newCode } = generate(ast, {
        retainLines: true,
        retainFunctionParens: true,
      });
      
      // Write back to file
      await fs.writeFile(filePath, newCode);
      console.log(`  ✓ Replaced ${replacements} strings`);
      return replacements;
    } else {
      console.log(`  - No strings to replace`);
      return 0;
    }
  } catch (error) {
    console.error(`  ✗ Error: ${error.message}`);
    return 0;
  }
}

// Main execution
async function main() {
  console.log('Loading extracted data...\n');
  const { stringToKey, fileMapping } = await loadExtractedData();
  
  console.log(`Found ${stringToKey.size} unique strings to replace\n`);
  
  let totalReplacements = 0;
  let filesProcessed = 0;
  
  // Process each file
  for (const [relativePath, keys] of Object.entries(fileMapping)) {
    const fullPath = path.join(__dirname, '../src/components', relativePath);
    const replacements = await processFile(fullPath, stringToKey);
    
    if (replacements > 0) {
      totalReplacements += replacements;
      filesProcessed++;
    }
  }
  
  console.log(`\nRefactoring complete!`);
  console.log(`- Files processed: ${filesProcessed}`);
  console.log(`- Total replacements: ${totalReplacements}`);
  console.log(`\nNext steps:`);
  console.log(`1. Review the changes in your components`);
  console.log(`2. Merge extracted-strings.json into your main translation files`);
  console.log(`3. Test that everything works correctly`);
}

// Run the script
main().catch(console.error);
