const fs = require("fs");
const path = require("path");

// Define the missing landing translations for each language
const landingTranslations = {
  en: {
    mainTitle: "Simple Pricing for Complete Family Protection",
    mainSubtitle: "Choose the plan that fits your family's needs",
    starter: {
      name: "Starter",
      price: "Free",
      description: "Perfect for getting started with family protection",
      limits: {
        storage: "1GB",
        guardians: "2",
      },
      features: {
        documents: "Document storage",
        playbook: "Family playbook",
        support: "Email support",
      },
      button: "Get Started Free",
    },
    premium: {
      name: "Premium",
      price: "€9.99",
      period: "per month",
      description: "Complete family protection with advanced features",
      limits: {
        storage: "10GB",
        guardians: "Unlimited",
      },
      features: {
        manual: "Digital legacy manual",
        support: "Priority support",
      },
      button: "Start Premium Trial",
      badge: "Most Popular",
    },
    enterprise: {
      name: "Enterprise",
      price: "Contact Us",
      description: "Custom solutions for complex family situations",
      limits: {
        storage: "Unlimited",
        guardians: "Unlimited",
      },
      features: {
        guardians: "Unlimited guardians",
        legal: "Legal consultation",
        support: "Dedicated support",
      },
      button: "Contact Sales",
    },
    pricing: {
      mostPopular: "Most Popular",
    },
    errors: {
      checkoutFailed: "Checkout failed. Please try again.",
    },
    devMode: {
      title: "Developer Mode",
      successMessage: "Premium access granted successfully!",
      errorMessage: "Failed to grant premium access.",
      button: {
        grant: "Grant Premium Access",
        granting: "Granting...",
      },
      description: "This feature is only available in development mode.",
    },
    title: "Pricing",
    freePlan: {
      name: "Free Plan",
      description: "Perfect for getting started",
      features: {
        will: "Basic will template",
        guardians: "Guardian designation",
        assets: "Asset tracking",
        support: "Community support",
      },
      price: "Free Forever",
    },
    premiumPlan: {
      name: "Premium Plan",
      description: "Complete family protection",
      features: {
        will: "Advanced will builder",
        guardians: "Unlimited guardians",
        assets: "Comprehensive asset tracking",
        encryption: "Enhanced encryption",
        access: "Emergency access",
        support: "Priority support",
        history: "Version history",
        templates: "Legal templates",
      },
      price: "€9.99/month",
      upgradeButton: "Upgrade to Premium",
    },
  },
  sk: {
    mainTitle: "Jednoduché cenové ponuky pre kompletnú ochranu rodiny",
    mainSubtitle: "Vyberte si plán, ktorý vyhovuje potrebám vašej rodiny",
    starter: {
      name: "Základný",
      price: "Zadarmo",
      description: "Perfektné na začatie ochrany rodiny",
      limits: {
        storage: "1GB",
        guardians: "2",
      },
      features: {
        documents: "Uložisko dokumentov",
        playbook: "Rodinný playbook",
        support: "Emailová podpora",
      },
      button: "Začať zadarmo",
    },
    premium: {
      name: "Premium",
      price: "€9.99",
      period: "mesačne",
      description: "Kompletná ochrana rodiny s pokročilými funkciami",
      limits: {
        storage: "10GB",
        guardians: "Neobmedzene",
      },
      features: {
        manual: "Digitálny legacy manuál",
        support: "Prioritná podpora",
      },
      button: "Začať premium skúšobnú dobu",
      badge: "Najpopulárnejší",
    },
    enterprise: {
      name: "Enterprise",
      price: "Kontaktujte nás",
      description: "Vlastné riešenia pre zložité rodinné situácie",
      limits: {
        storage: "Neobmedzene",
        guardians: "Neobmedzene",
      },
      features: {
        guardians: "Neobmedzené opatrovníctvo",
        legal: "Právne konzultácie",
        support: "Dedikovaná podpora",
      },
      button: "Kontaktovať predaj",
    },
    pricing: {
      mostPopular: "Najpopulárnejší",
    },
    errors: {
      checkoutFailed: "Platba zlyhala. Skúste to znova.",
    },
    devMode: {
      title: "Vývojársky režim",
      successMessage: "Premium prístup bol úspešne udelený!",
      errorMessage: "Nepodarilo sa udeliť premium prístup.",
      button: {
        grant: "Udelit premium prístup",
        granting: "Udeluje sa...",
      },
      description: "Táto funkcia je dostupná len vo vývojárskom režime.",
    },
    title: "Cenové ponuky",
    freePlan: {
      name: "Zadarmo plán",
      description: "Perfektné na začatie",
      features: {
        will: "Základná závetná šablóna",
        guardians: "Určenie opatrovníka",
        assets: "Sledovanie majetku",
        support: "Komunitná podpora",
      },
      price: "Zadarmo navždy",
    },
    premiumPlan: {
      name: "Premium plán",
      description: "Kompletná ochrana rodiny",
      features: {
        will: "Pokročilý závetný nástroj",
        guardians: "Neobmedzené opatrovníctvo",
        assets: "Komplexné sledovanie majetku",
        encryption: "Rozšírené šifrovanie",
        access: "Núdzový prístup",
        support: "Prioritná podpora",
        history: "História verzií",
        templates: "Právne šablóny",
      },
      price: "€9.99/mesiac",
      upgradeButton: "Upgradovať na Premium",
    },
  },
  cs: {
    mainTitle: "Jednoduché cenové nabídky pro kompletní ochranu rodiny",
    mainSubtitle: "Vyberte si plán, který vyhovuje potřebám vaší rodiny",
    starter: {
      name: "Základní",
      price: "Zdarma",
      description: "Perfektní na začátek ochrany rodiny",
      limits: {
        storage: "1GB",
        guardians: "2",
      },
      features: {
        documents: "Úložiště dokumentů",
        playbook: "Rodinný playbook",
        support: "Emailová podpora",
      },
      button: "Začít zdarma",
    },
    premium: {
      name: "Premium",
      price: "€9.99",
      period: "měsíčně",
      description: "Kompletní ochrana rodiny s pokročilými funkcemi",
      limits: {
        storage: "10GB",
        guardians: "Neomezeně",
      },
      features: {
        manual: "Digitální legacy manuál",
        support: "Prioritní podpora",
      },
      button: "Začít premium zkušební dobu",
      badge: "Nejpopulárnější",
    },
    enterprise: {
      name: "Enterprise",
      price: "Kontaktujte nás",
      description: "Vlastní řešení pro složité rodinné situace",
      limits: {
        storage: "Neomezeně",
        guardians: "Neomezeně",
      },
      features: {
        guardians: "Neomezené opatrovnictví",
        legal: "Právní konzultace",
        support: "Dedikovaná podpora",
      },
      button: "Kontaktovat prodej",
    },
    pricing: {
      mostPopular: "Nejpopulárnější",
    },
    errors: {
      checkoutFailed: "Platba selhala. Zkuste to znovu.",
    },
    devMode: {
      title: "Vývojářský režim",
      successMessage: "Premium přístup byl úspěšně udělen!",
      errorMessage: "Nepodařilo se udělit premium přístup.",
      button: {
        grant: "Udělit premium přístup",
        granting: "Uděluje se...",
      },
      description: "Tato funkce je dostupná pouze ve vývojářském režimu.",
    },
    title: "Cenové nabídky",
    freePlan: {
      name: "Zdarma plán",
      description: "Perfektní na začátek",
      features: {
        will: "Základní závětná šablóna",
        guardians: "Určení opatrovníka",
        assets: "Sledování majetku",
        support: "Komunitní podpora",
      },
      price: "Zdarma navždy",
    },
    premiumPlan: {
      name: "Premium plán",
      description: "Kompletní ochrana rodiny",
      features: {
        will: "Pokročilý závětný nástroj",
        guardians: "Neomezené opatrovnictví",
        assets: "Komplexní sledování majetku",
        encryption: "Rozšířené šifrování",
        access: "Nouzový přístup",
        support: "Prioritní podpora",
        history: "Historie verzí",
        templates: "Právní šablóny",
      },
      price: "€9.99/měsíc",
      upgradeButton: "Upgradovat na Premium",
    },
  },
};

// Function to add missing landing translations to a language file
function addLandingTranslations(langCode) {
  const landingPath = path.join(
    __dirname,
    "..",
    "src",
    "i18n",
    "locales",
    langCode,
    "landing.json",
  );

  if (!fs.existsSync(landingPath)) {
    console.log(`Skipping ${langCode}: landing.json not found`);
    return;
  }

  try {
    const content = fs.readFileSync(landingPath, "utf8");
    const data = JSON.parse(content);

    // Check if mainTitle already exists
    if (data.mainTitle) {
      console.log(`Skipping ${langCode}: mainTitle already exists`);
      return;
    }

    // Add missing translations
    if (landingTranslations[langCode]) {
      Object.assign(data, landingTranslations[langCode]);
    } else {
      // Fallback to English if translation not available
      Object.assign(data, landingTranslations["en"]);
      console.log(`Using English fallback for ${langCode}`);
    }

    // Write back to file
    fs.writeFileSync(landingPath, JSON.stringify(data, null, 2));
    console.log(`✅ Added landing translations to ${langCode}`);
  } catch (error) {
    console.error(`❌ Error processing ${langCode}:`, error.message);
  }
}

// Get all language directories
const localesPath = path.join(__dirname, "..", "src", "i18n", "locales");
const languages = fs.readdirSync(localesPath).filter((dir) => {
  return fs.statSync(path.join(localesPath, dir)).isDirectory();
});

console.log("Adding missing landing translations to all language files...\n");

languages.forEach((langCode) => {
  addLandingTranslations(langCode);
});

console.log("\n✅ Completed adding landing translations!");
