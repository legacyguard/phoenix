#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');

// Define the errorBoundary translations
const errorBoundaryTranslations = {
  en: {
    errorBoundary: {
      title: "Something went wrong",
      description: "We encountered an unexpected error. Don't worry, your data is safe.",
      errorId: "Error ID",
      tryAgain: "Try again",
      reloadPage: "Reload page",
      goToHomepage: "Go to homepage",
      helpText: "If this problem persists, please contact support with the error ID above.",
      technicalDetails: "Technical details",
      stackTrace: "Stack trace",
      componentStack: "Component stack",
      show: "Show details",
      hide: "Hide details"
    }
  },
  sk: {
    errorBoundary: {
      title: "Niečo sa pokazilo",
      description: "Vyskytla sa neočakávaná chyba. Nebojte sa, vaše údaje sú v bezpečí.",
      errorId: "ID chyby",
      tryAgain: "Skúsiť znova",
      reloadPage: "Obnoviť stránku",
      goToHomepage: "Prejsť na domovskú stránku",
      helpText: "Ak problém pretrváva, kontaktujte podporu s ID chyby uvedeným vyššie.",
      technicalDetails: "Technické detaily",
      stackTrace: "Zásobník volaní",
      componentStack: "Zásobník komponentov",
      show: "Zobraziť detaily",
      hide: "Skryť detaily"
    }
  },
  cs: {
    errorBoundary: {
      title: "Něco se pokazilo",
      description: "Došlo k neočekávané chybě. Nebojte se, vaše data jsou v bezpečí.",
      errorId: "ID chyby",
      tryAgain: "Zkusit znovu",
      reloadPage: "Obnovit stránku",
      goToHomepage: "Přejít na domovskou stránku",
      helpText: "Pokud problém přetrvává, kontaktujte podporu s ID chyby uvedeným výše.",
      technicalDetails: "Technické detaily",
      stackTrace: "Zásobník volání",
      componentStack: "Zásobník komponent",
      show: "Zobrazit detaily",
      hide: "Skrýt detaily"
    }
  }
};

// Function to add errorBoundary translations to ui-common.json
async function addErrorBoundaryTranslations() {
  console.log('🔧 Adding errorBoundary translations...\n');
  
  const languages = fs.readdirSync(LOCALES_DIR)
    .filter(dir => {
      const stats = fs.statSync(path.join(LOCALES_DIR, dir));
      return stats.isDirectory() && !dir.startsWith('.');
    });
  
  for (const lang of languages) {
    const uiCommonPath = path.join(LOCALES_DIR, lang, 'ui-common.json');
    
    try {
      let content = {};
      
      // Read existing content
      if (fs.existsSync(uiCommonPath)) {
        const fileContent = fs.readFileSync(uiCommonPath, 'utf8');
        content = JSON.parse(fileContent);
      }
      
      // Get translations for this language or use English as fallback
      const translations = errorBoundaryTranslations[lang] || errorBoundaryTranslations.en;
      
      // If not English and no translation exists, mark for translation
      if (lang !== 'en' && !errorBoundaryTranslations[lang]) {
        Object.keys(translations.errorBoundary).forEach(key => {
          if (typeof translations.errorBoundary[key] === 'string') {
            translations.errorBoundary[key] = `[TRANSLATE] ${translations.errorBoundary[key]}`;
          }
        });
      }
      
      // Merge with existing content
      content = {
        ...content,
        ...translations
      };
      
      // Write back
      fs.writeFileSync(uiCommonPath, JSON.stringify(content, null, 2), 'utf8');
      console.log(`✅ Updated ${lang}/ui-common.json`);
      
    } catch (error) {
      console.error(`❌ Error updating ${lang}/ui-common.json:`, error.message);
    }
  }
  
  console.log('\n✨ ErrorBoundary translations added successfully!');
}

// Run the script
addErrorBoundaryTranslations().catch(console.error);
