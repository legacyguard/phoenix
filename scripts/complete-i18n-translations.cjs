#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/i18n/locales');

// Read English translations as the source of truth
function getEnglishTranslations() {
  const enDir = path.join(LOCALES_DIR, 'en');
  const translations = {};
  
  if (fs.existsSync(enDir)) {
    const files = fs.readdirSync(enDir).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      const namespace = file.replace('.json', '');
      const filePath = path.join(enDir, file);
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        // Only include if it has actual content
        if (Object.keys(data).length > 0 && !data._needs_translation) {
          translations[namespace] = data;
        }
      } catch (e) {
        console.error(`Error reading ${filePath}:`, e.message);
      }
    }
  }
  
  return translations;
}

// Deep merge objects, preserving existing translations
function deepMerge(target, source, markAsNeeded = false) {
  const result = { ...target };
  
  for (const key in source) {
    if (key.startsWith('_')) continue; // Skip metadata fields
    
    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      if (typeof result[key] === 'object' && result[key] !== null && !Array.isArray(result[key])) {
        result[key] = deepMerge(result[key], source[key], markAsNeeded);
      } else if (!result[key]) {
        // Key is missing entirely
        if (markAsNeeded) {
          result[key] = addTranslationMarker(source[key]);
        } else {
          result[key] = source[key];
        }
      }
    } else if (!result.hasOwnProperty(key)) {
      // Key is missing
      if (markAsNeeded) {
        result[key] = `[TRANSLATE] ${source[key]}`;
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
}

// Add translation marker to nested objects
function addTranslationMarker(obj) {
  if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
    const result = {};
    for (const key in obj) {
      result[key] = addTranslationMarker(obj[key]);
    }
    return result;
  } else if (typeof obj === 'string') {
    return `[TRANSLATE] ${obj}`;
  }
  return obj;
}

// Get all language codes
function getAllLanguages() {
  return fs.readdirSync(LOCALES_DIR)
    .filter(dir => {
      const stats = fs.statSync(path.join(LOCALES_DIR, dir));
      return stats.isDirectory() && !dir.startsWith('.');
    });
}

// Main function to complete translations
async function completeTranslations() {
  console.log('🔄 Starting translation completion process...\n');
  
  // Get English translations as source
  const englishTranslations = getEnglishTranslations();
  
  if (Object.keys(englishTranslations).length === 0) {
    console.error('❌ No English translations found!');
    return;
  }
  
  console.log(`📚 Found ${Object.keys(englishTranslations).length} English namespaces:`, 
    Object.keys(englishTranslations).join(', '));
  
  const languages = getAllLanguages();
  const stats = {
    updated: 0,
    created: 0,
    keysAdded: 0
  };
  
  for (const lang of languages) {
    if (lang === 'en') continue; // Skip English itself
    
    console.log(`\n🌍 Processing ${lang}...`);
    const langDir = path.join(LOCALES_DIR, lang);
    
    // Process each namespace
    for (const [namespace, enContent] of Object.entries(englishTranslations)) {
      const filePath = path.join(langDir, `${namespace}.json`);
      let currentContent = {};
      let fileExists = false;
      
      // Read existing content if file exists
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          currentContent = JSON.parse(content);
          fileExists = true;
          
          // Remove metadata fields for comparison
          delete currentContent._needs_translation;
          delete currentContent._copied_from;
          delete currentContent._date;
        } catch (e) {
          console.error(`  ⚠️  Error reading ${namespace}.json:`, e.message);
          currentContent = {};
        }
      }
      
      // Count keys before merge
      const keysBefore = countKeys(currentContent);
      
      // Merge with English, marking new translations
      const merged = deepMerge(currentContent, enContent, lang !== 'en');
      
      // Count keys after merge
      const keysAfter = countKeys(merged);
      const keysAdded = keysAfter - keysBefore;
      
      // Write the file
      fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf8');
      
      if (!fileExists) {
        console.log(`  ✅ Created ${namespace}.json (${keysAfter} keys)`);
        stats.created++;
      } else if (keysAdded > 0) {
        console.log(`  📝 Updated ${namespace}.json (+${keysAdded} keys)`);
        stats.updated++;
        stats.keysAdded += keysAdded;
      } else {
        console.log(`  ✓ ${namespace}.json is complete`);
      }
    }
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('✨ TRANSLATION COMPLETION SUMMARY');
  console.log('='.repeat(60));
  console.log(`📁 Files created: ${stats.created}`);
  console.log(`📝 Files updated: ${stats.updated}`);
  console.log(`🔑 Keys added: ${stats.keysAdded}`);
  
  console.log('\n📌 NEXT STEPS:');
  console.log('1. Search for "[TRANSLATE]" markers in non-English files');
  console.log('2. Replace them with proper translations');
  console.log('3. Test the application with different languages');
  console.log('4. Consider using a translation service for bulk translation');
}

// Count total keys in an object (recursive)
function countKeys(obj, count = 0) {
  for (const key in obj) {
    if (key.startsWith('_')) continue; // Skip metadata
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      count = countKeys(obj[key], count);
    } else {
      count++;
    }
  }
  return count;
}

// Fix specific missing keys for landing page
async function fixLandingPage() {
  console.log('\n🔧 Fixing landing page specific issues...\n');
  
  // Define the complete landing page structure based on component usage
  const landingStructure = {
    "hero": {
      "trustIndicator": "Trusted by families across Europe",
      "headline": "Protect what matters most, for the people who matter most",
      "subheadline": "Organize important documents, share access with your Trusted Circle, and reduce stress for your family.",
      "description": "A private, secure place to prepare your family for life's what-ifs — with clear guidance and calm, supportive language.",
      "primaryCta": "Get started free",
      "secondaryCta": "See a quick demo",
      "secondaryContext": "No credit card required",
      "noCommitment": "No commitment • Private by default • Cancel anytime",
      "trustSignals": {
        "dataOwnership": "You own your data — always",
        "gdprCompliant": "GDPR-compliant and privacy-first",
        "europeanFamilies": "Built for European families"
      },
      "securityBadge": "End-to-end encryption • Zero-knowledge architecture"
    },
    "problems": {
      "sectionTitle": "Life happens without warning",
      "sectionSubtitle": "Don't leave your family searching for answers",
      "problem1": {
        "title": "Important documents scattered everywhere",
        "description": "Papers in drawers, files on computers, accounts you forgot about.",
        "impact": "Hours of searching during the worst possible time"
      },
      "problem2": {
        "title": "No one knows your wishes",
        "description": "Your preferences for care, assets, and family matters remain unspoken.",
        "impact": "Difficult decisions and potential conflicts"
      },
      "problem3": {
        "title": "Digital life locked away",
        "description": "Online accounts, subscriptions, and digital assets become inaccessible.",
        "impact": "Lost memories and ongoing charges"
      }
    },
    "solution": {
      "sectionTitle": "Everything organized, accessible, and secure",
      "sectionSubtitle": "Give your family clarity when they need it most",
      "feature1": {
        "title": "Document vault",
        "description": "Store wills, insurance policies, medical directives, and important papers in one secure place.",
        "benefits": ["Bank-level encryption", "Version history", "Secure sharing"]
      },
      "feature2": {
        "title": "Digital legacy",
        "description": "Manage online accounts, passwords, and digital assets with clear instructions.",
        "benefits": ["Password manager integration", "Account recovery guides", "Subscription management"]
      },
      "feature3": {
        "title": "Family playbook",
        "description": "Create step-by-step guides for your family covering everything from daily routines to emergency contacts.",
        "benefits": ["Custom checklists", "Important contacts", "Care instructions"]
      },
      "feature4": {
        "title": "Trusted Circle",
        "description": "Choose who can access your information and when, with granular privacy controls.",
        "benefits": ["Role-based access", "Emergency protocols", "Activity monitoring"]
      }
    },
    "benefits": {
      "sectionTitle": "Peace of mind for your entire family",
      "sectionSubtitle": "Practical protection that works when you need it"
    },
    "testimonials": {
      "sectionTitle": "Families already finding peace of mind",
      "sectionSubtitle": "Real stories from people who've protected their loved ones"
    },
    "howItWorks": {
      "sectionTitle": "Get started in minutes",
      "sectionSubtitle": "Simple steps to protect your family"
    },
    "faq": {
      "sectionTitle": "Common questions",
      "sectionSubtitle": "Everything you need to know"
    },
    "cta": {
      "finalTitle": "Start protecting your family today",
      "finalSubtitle": "Join thousands of families who sleep better knowing everything is organized",
      "finalDescription": "14-day free trial • No credit card required • Cancel anytime",
      "startTrial": "Start your free trial",
      "noCredit": "No credit card required",
      "fullAccess": "Full access to all features",
      "supportIncluded": "Support included"
    }
  };
  
  // Update English landing.json
  const enLandingPath = path.join(LOCALES_DIR, 'en', 'landing.json');
  fs.writeFileSync(enLandingPath, JSON.stringify(landingStructure, null, 2), 'utf8');
  console.log('✅ Updated English landing.json with complete structure');
  
  // Now update all other languages
  const languages = getAllLanguages();
  
  for (const lang of languages) {
    if (lang === 'en') continue;
    
    const landingPath = path.join(LOCALES_DIR, lang, 'landing.json');
    let currentContent = {};
    
    if (fs.existsSync(landingPath)) {
      try {
        currentContent = JSON.parse(fs.readFileSync(landingPath, 'utf8'));
      } catch (e) {
        console.error(`Error reading ${lang}/landing.json:`, e.message);
      }
    }
    
    // Merge with English structure
    const merged = deepMerge(currentContent, landingStructure, true);
    fs.writeFileSync(landingPath, JSON.stringify(merged, null, 2), 'utf8');
    console.log(`📝 Updated ${lang}/landing.json`);
  }
}

// Run the completion process
(async () => {
  await fixLandingPage();
  await completeTranslations();
})().catch(console.error);
