import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to recursively get all keys from a nested object
function getAllKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Function to get value by nested key
function getNestedValue(obj, key) {
  const keys = key.split('.');
  let current = obj;
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return undefined;
    }
  }
  return current;
}

// Function to set nested value
function setNestedValue(obj, key, value) {
  const keys = key.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!(k in current) || typeof current[k] !== 'object') {
      current[k] = {};
    }
    current = current[k];
  }
  
  current[keys[keys.length - 1]] = value;
}

// Function to generate French translation suggestions
function generateFrenchSuggestion(englishText) {
  // This is a simple template - in practice, you'd want to use a proper translation service
  // For now, we'll provide placeholders that need manual translation
  
  if (typeof englishText !== 'string') {
    return englishText;
  }
  
  // Common patterns that can be auto-translated
  const commonTranslations = {
    'Notes': 'Notes',
    'Contacts': 'Contacts', 
    'Messages': 'Messages',
    'Settings': 'Paramètres',
    'Dashboard': 'Tableau de bord',
    'Help': 'Aide',
    'Save': 'Enregistrer',
    'Cancel': 'Annuler',
    'Edit': 'Modifier',
    'Delete': 'Supprimer',
    'Add': 'Ajouter',
    'Update': 'Mettre à jour',
    'Create': 'Créer',
    'Send': 'Envoyer',
    'Confirm': 'Confirmer',
    'Change': 'Changer',
    'Select': 'Sélectionner',
    'Search': 'Rechercher',
    'Refresh': 'Actualiser',
    'Retry': 'Réessayer',
    'Show': 'Afficher',
    'Hide': 'Masquer',
    'Copy': 'Copier',
    'Paste': 'Coller',
    'Upload': 'Télécharger',
    'Download': 'Télécharger',
    'View': 'Voir',
    'More': 'Plus',
    'Less': 'Moins',
    'Details': 'Détails',
    'Info': 'Informations',
    'Success': 'Succès',
    'Error': 'Erreur',
    'Warning': 'Avertissement',
    'Optional': 'Optionnel',
    'Required': 'Requis',
    'Actions': 'Actions',
    'Preferences': 'Préférences',
    'Profile': 'Profil',
    'Logout': 'Déconnexion',
    'Login': 'Connexion',
    'Register': 'S\'inscrire',
    'Menu': 'Menu',
    'Home': 'Accueil',
    'Support': 'Support',
    'Notifications': 'Notifications',
    'Language': 'Langue',
    'Theme': 'Thème',
    'Light': 'Clair',
    'Dark': 'Sombre',
    'System': 'Système',
    'Privacy': 'Confidentialité',
    'Security': 'Sécurité',
    'Legal': 'Légal',
    'Terms': 'Conditions',
    'Accept': 'Accepter',
    'Decline': 'Refuser',
    'Agree': 'Accepter',
    'Disagree': 'Refuser',
    'Loading': 'Chargement...',
    'Saving': 'Enregistrement...',
    'Processing': 'Traitement...',
    'Empty State': 'État vide',
    'No Results': 'Aucun résultat',
    'Try Again': 'Réessayer',
    'Coming Soon': 'Bientôt disponible',
    'New': 'Nouveau',
    'View All': 'Voir tout'
  };
  
  // Check if we have a direct translation
  if (commonTranslations[englishText]) {
    return commonTranslations[englishText];
  }
  
  // For longer text, provide a template
  return `[FR: ${englishText}]`;
}

// Function to analyze and suggest fixes for a file
function analyzeFile(enPath, frPath, filename) {
  console.log(`\n=== Analyzing ${filename} ===`);
  
  try {
    const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));
    const frContent = JSON.parse(fs.readFileSync(frPath, 'utf8'));
    
    const enKeys = getAllKeys(enContent);
    const frKeys = getAllKeys(frContent);
    
    // Find missing keys in French
    const missingInFrench = enKeys.filter(key => !frKeys.includes(key));
    
    // Find identical translations
    const identicalTranslations = [];
    for (const key of frKeys) {
      const enValue = getNestedValue(enContent, key);
      const frValue = getNestedValue(frContent, key);
      if (enValue === frValue && typeof enValue === 'string') {
        identicalTranslations.push({ key, value: enValue });
      }
    }
    
    console.log(`Missing keys: ${missingInFrench.length}`);
    console.log(`Identical translations: ${identicalTranslations.length}`);
    
    // Generate suggestions for missing keys (limit to first 10 for display)
    const suggestions = {};
    const limitedMissing = missingInFrench.slice(0, 10);
    
    for (const key of limitedMissing) {
      const enValue = getNestedValue(enContent, key);
      suggestions[key] = generateFrenchSuggestion(enValue);
    }
    
    return {
      filename,
      missingKeys: missingInFrench,
      identicalTranslations,
      suggestions,
      totalMissing: missingInFrench.length,
      totalIdentical: identicalTranslations.length
    };
    
  } catch (error) {
    console.error(`Error processing ${filename}:`, error.message);
    return { filename, error: error.message };
  }
}

// Function to generate a fix template
function generateFixTemplate(analysis) {
  if (analysis.error) {
    return `// Error processing ${analysis.filename}: ${analysis.error}`;
  }
  
  let template = `// Fix template for ${analysis.filename}\n`;
  template += `// Missing keys: ${analysis.totalMissing}\n`;
  template += `// Identical translations: ${analysis.totalIdentical}\n\n`;
  
  if (analysis.suggestions && Object.keys(analysis.suggestions).length > 0) {
    template += `// Suggested translations for missing keys:\n`;
    template += `// Add these to the French file:\n\n`;
    
    for (const [key, suggestion] of Object.entries(analysis.suggestions)) {
      template += `// ${key}: ${suggestion}\n`;
    }
    
    template += `\n// Example JSON structure:\n`;
    template += `{\n`;
    
    for (const [key, suggestion] of Object.entries(analysis.suggestions)) {
      const keys = key.split('.');
      let indent = '  ';
      let current = '';
      
      for (let i = 0; i < keys.length - 1; i++) {
        template += `${indent}"${keys[i]}": {\n`;
        indent += '  ';
        current += keys[i] + '.';
      }
      
      template += `${indent}"${keys[keys.length - 1]}": "${suggestion}"`;
      
      for (let i = keys.length - 2; i >= 0; i--) {
        template += '\n' + '  '.repeat(i + 1) + '}';
      }
      template += ',\n';
    }
    
    template += `}\n`;
  }
  
  if (analysis.identicalTranslations && analysis.identicalTranslations.length > 0) {
    template += `\n// Identical translations that need proper French translation:\n`;
    const limitedIdentical = analysis.identicalTranslations.slice(0, 10);
    for (const { key, value } of limitedIdentical) {
      template += `// ${key}: "${value}" -> needs French translation\n`;
    }
  }
  
  return template;
}

// Main function
function generateFixTemplates() {
  const enDir = path.join(__dirname, 'src/i18n/locales/en');
  const frDir = path.join(__dirname, 'src/i18n/locales/fr');
  
  console.log('🔍 Generating French translation fix templates...\n');
  
  try {
    const enFiles = fs.readdirSync(enDir).filter(file => file.endsWith('.json'));
    const results = [];
    
    for (const filename of enFiles) {
      const enPath = path.join(enDir, filename);
      const frPath = path.join(frDir, filename);
      
      if (fs.existsSync(frPath)) {
        const analysis = analyzeFile(enPath, frPath, filename);
        results.push(analysis);
        
        // Generate template for files with issues
        if (analysis.totalMissing > 0 || analysis.totalIdentical > 0) {
          const template = generateFixTemplate(analysis);
          const templatePath = path.join(__dirname, `fix-template-${filename.replace('.json', '.txt')}`);
          fs.writeFileSync(templatePath, template);
          console.log(`📝 Generated template: ${templatePath}`);
        }
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📋 TEMPLATE GENERATION SUMMARY');
    console.log('='.repeat(50));
    
    let totalMissing = 0;
    let totalIdentical = 0;
    
    for (const result of results) {
      if (result.totalMissing) totalMissing += result.totalMissing;
      if (result.totalIdentical) totalIdentical += result.totalIdentical;
    }
    
    console.log(`Total missing keys: ${totalMissing}`);
    console.log(`Total identical translations: ${totalIdentical}`);
    console.log(`Templates generated: ${results.filter(r => r.totalMissing > 0 || r.totalIdentical > 0).length}`);
    
    console.log('\n🚨 Priority files to fix:');
    const priorityFiles = results
      .filter(r => r.totalMissing > 50 || r.totalIdentical > 10)
      .sort((a, b) => (b.totalMissing + b.totalIdentical) - (a.totalMissing + a.totalIdentical));
    
    priorityFiles.forEach(result => {
      console.log(`  - ${result.filename}: ${result.totalMissing} missing, ${result.totalIdentical} identical`);
    });
    
  } catch (error) {
    console.error('❌ Error during template generation:', error.message);
  }
}

// Run the template generation
generateFixTemplates(); 