#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Language mapping for accurate translations
const LANGUAGE_MAP = {
  'cs': 'Czech',
  'bg': 'Bulgarian', 
  'cy': 'Welsh',
  'ga': 'Irish',
  'hu': 'Hungarian',
  'is': 'Icelandic',
  'mt': 'Maltese',
  'sq': 'Albanian',
  'tr': 'Turkish',
  'el': 'Greek',
  'me': 'Montenegrin',
  'mk': 'Macedonian',
  'ro': 'Romanian',
  'sr': 'Serbian',
  'da': 'Danish',
  'et': 'Estonian',
  'fi': 'Finnish',
  'hr': 'Croatian',
  'lt': 'Lithuanian',
  'lv': 'Latvian',
  'sl': 'Slovenian',
  'nl': 'Dutch',
  'no': 'Norwegian',
  'sv': 'Swedish',
  'uk': 'Ukrainian',
  'es': 'Spanish',
  'fr': 'French',
  'it': 'Italian',
  'pl': 'Polish',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'de': 'German',
  'sk': 'Slovak'
};

// Translation functions for each language
const TRANSLATORS = {
  'cs': (text) => translateToCzech(text),
  'bg': (text) => translateToBulgarian(text),
  'cy': (text) => translateToWelsh(text),
  'ga': (text) => translateToIrish(text),
  'hu': (text) => translateToHungarian(text),
  'is': (text) => translateToIcelandic(text),
  'mt': (text) => translateToMaltese(text),
  'sq': (text) => translateToAlbanian(text),
  'tr': (text) => translateToTurkish(text),
  'el': (text) => translateToGreek(text),
  'me': (text) => translateToMontenegrin(text),
  'mk': (text) => translateToMacedonian(text),
  'ro': (text) => translateToRomanian(text),
  'sr': (text) => translateToSerbian(text),
  'da': (text) => translateToDanish(text),
  'et': (text) => translateToEstonian(text),
  'fi': (text) => translateToFinnish(text),
  'hr': (text) => translateToCroatian(text),
  'lt': (text) => translateToLithuanian(text),
  'lv': (text) => translateToLatvian(text),
  'sl': (text) => translateToSlovenian(text),
  'nl': (text) => translateToDutch(text),
  'no': (text) => translateToNorwegian(text),
  'sv': (text) => translateToSwedish(text),
  'uk': (text) => translateToUkrainian(text),
  'es': (text) => translateToSpanish(text),
  'fr': (text) => translateToFrench(text),
  'it': (text) => translateToItalian(text),
  'pl': (text) => translateToPolish(text),
  'pt': (text) => translateToPortuguese(text),
  'ru': (text) => translateToRussian(text),
  'de': (text) => translateToGerman(text),
  'sk': (text) => translateToSlovak(text)
};

// Translation functions (simplified for now - will be expanded)
function translateToCzech(text) {
  // Czech translations
  const translations = {
    'Welcome Back': 'Vítejte zpět',
    'Sign in to your LegacyGuard account': 'Přihlaste se ke svému účtu LegacyGuard',
    'Email Address': 'E-mailová adresa',
    'Password': 'Heslo',
    'Enter your email address': 'Zadejte svou e-mailovou adresu',
    'Enter your password': 'Zadejte své heslo',
    'Sign In': 'Přihlásit se',
    'Forgot your password?': 'Zapomněli jste heslo?',
    'Don\'t have an account?': 'Nemáte účet?',
    'Create an account': 'Vytvořit účet',
    'Remember me': 'Zapamatovat si mě',
    'Signing in...': 'Přihlašování...',
    'Invalid email or password': 'Neplatný e-mail nebo heslo',
    'Account temporarily locked. Please try again later.': 'Účet je dočasně uzamčen. Zkuste to prosím později.',
    'Too many login attempts. Please wait before trying again.': 'Příliš mnoho pokusů o přihlášení. Před dalším pokusem prosím počkejte.',
    'Create Your Account': 'Vytvořte si účet',
    'Start protecting your family\'s future today': 'Začněte chránit budoucnost své rodiny ještě dnes',
    'First Name': 'Jméno',
    'Last Name': 'Příjmení',
    'Confirm Password': 'Potvrďte heslo',
    'Enter your first name': 'Zadejte své jméno',
    'Enter your last name': 'Zadejte své příjmení',
    'Create a strong password': 'Vytvořte silné heslo',
    'Confirm your password': 'Potvrďte své heslo',
    'Already have an account?': 'Už máte účet?',
    'Sign in': 'Přihlásit se',
    'Creating account...': 'Vytváření účtu...',
    'By creating an account, you agree to our': 'Vytvořením účtu souhlasíte s našimi',
    'Terms of Service': 'Podmínkami služby',
    'and': 'a',
    'Privacy Policy': 'Zásadami ochrany osobních údajů',
    'An account with this email already exists': 'Účet s tímto e-mailem již existuje',
    'Password must be at least 8 characters with uppercase, lowercase, and numbers': 'Heslo musí mít alespoň 8 znaků a obsahovat velká, malá písmena a číslice',
    'Passwords do not match': 'Hesla se neshodují',
    'Password Required': 'Je vyžadováno heslo',
    'This application is protected. Please enter the access password to continue.': 'Tato aplikace je chráněna. Pro pokračování zadejte prosím přístupové heslo.',
    'Enter password': 'Zadejte heslo',
    'Access Application': 'Vstoupit do aplikace',
    'Loading...': 'Načítání...',
    'Logout': 'Odhlásit se',
    'Incorrect password': 'Nesprávné heslo',
    'Verify Your Email': 'Ověřte svůj e-mail',
    'We\'ve sent a verification link to your email address': 'Na vaši e-mailovou adresu jsme zaslali ověřovací odkaz',
    'Please check your email and click the verification link to activate your account.': 'Zkontrolujte prosím svůj e-mail a klikněte na ověřovací odkaz pro aktivaci vašeho účtu.',
    'Resend verification email': 'Znovu odeslat ověřovací e-mail',
    'Verification email sent': 'Ověřovací e-mail byl odeslán',
    'Change email address': 'Změnit e-mailovou adresu',
    'Verifying...': 'Ověřování...',
    'Email verified successfully': 'E-mail byl úspěšně ověřen',
    'Verification failed. Please try again.': 'Ověření se nezdařilo. Zkuste to prosím znovu.',
    'Verification link has expired. Please request a new one.': 'Platnost ověřovacího odkazu vypršela. Požádejte prosím o nový.',
    'Reset Your Password': 'Obnovte své heslo',
    'Enter your email address and we\'ll send you a reset link': 'Zadejte svou e-mailovou adresu a my vám zašleme odkaz pro obnovení hesla',
    'Send Reset Link': 'Odeslat odkaz pro obnovení',
    'Back to Login': 'Zpět na přihlášení',
    'Password reset email sent': 'E-mail pro obnovení hesla byl odeslán',
    'No account found with this email address': 'S touto e-mailovou adresou nebyl nalezen žádný účet',
    'Reset link has expired. Please request a new one.': 'Platnost odkazu pro obnovení vypršela. Požádejte prosím o nový.',
    'Password reset successfully': 'Heslo bylo úspěšně obnoveno',
    'Certifications': 'Certifikace',
    'Compliance': 'Soulad s předpisy',
    'Features': 'Funkce',
    'Action1': 'Akce1',
    'Action2': 'Akce2',
    'Action3': 'Akce3',
    'Details': 'Podrobnosti',
    'Device': 'Zařízení',
    'Headline': 'Nadpis',
    'Location': 'Místo',
    'Message': 'Zpráva',
    'Not you': 'To nejste vy',
    'Support contact': 'Kontakt na podporu',
    'Time': 'Čas',
    'Was you': 'Byli jste to vy',
    'Section subtitle': 'Podtitulek sekce',
    'Section title': 'Název sekce',
    'Subtitle': 'Podtitulek',
    'Title': 'Název'
  };
  
  return translations[text] || text;
}

function translateToGerman(text) {
  // German translations
  const translations = {
    'Welcome Back': 'Willkommen zurück',
    'Sign in to your LegacyGuard account': 'Melden Sie sich bei Ihrem LegacyGuard-Konto an',
    'Email Address': 'E-Mail-Adresse',
    'Password': 'Passwort',
    'Enter your email address': 'Geben Sie Ihre E-Mail-Adresse ein',
    'Enter your password': 'Geben Sie Ihr Passwort ein',
    'Sign In': 'Anmelden',
    'Forgot your password?': 'Passwort vergessen?',
    'Don\'t have an account?': 'Haben Sie kein Konto?',
    'Create an account': 'Konto erstellen',
    'Remember me': 'Angemeldet bleiben',
    'Signing in...': 'Anmeldung läuft...',
    'Invalid email or password': 'Ungültige E-Mail oder Passwort',
    'Account temporarily locked. Please try again later.': 'Konto vorübergehend gesperrt. Bitte versuchen Sie es später erneut.',
    'Too many login attempts. Please wait before trying again.': 'Zu viele Anmeldeversuche. Bitte warten Sie, bevor Sie es erneut versuchen.',
    'Create Your Account': 'Konto erstellen',
    'Start protecting your family\'s future today': 'Beginnen Sie heute mit dem Schutz der Zukunft Ihrer Familie',
    'First Name': 'Vorname',
    'Last Name': 'Nachname',
    'Confirm Password': 'Passwort bestätigen',
    'Enter your first name': 'Geben Sie Ihren Vornamen ein',
    'Enter your last name': 'Geben Sie Ihren Nachnamen ein',
    'Create a strong password': 'Erstellen Sie ein sicheres Passwort',
    'Confirm your password': 'Bestätigen Sie Ihr Passwort',
    'Already have an account?': 'Haben Sie bereits ein Konto?',
    'Sign in': 'Anmelden',
    'Creating account...': 'Konto wird erstellt...',
    'By creating an account, you agree to our': 'Durch die Erstellung eines Kontos stimmen Sie unseren zu',
    'Terms of Service': 'Nutzungsbedingungen',
    'and': 'und',
    'Privacy Policy': 'Datenschutzrichtlinie',
    'An account with this email already exists': 'Ein Konto mit dieser E-Mail existiert bereits',
    'Password must be at least 8 characters with uppercase, lowercase, and numbers': 'Das Passwort muss mindestens 8 Zeichen mit Groß-, Kleinbuchstaben und Zahlen enthalten',
    'Passwords do not match': 'Passwörter stimmen nicht überein',
    'Password Required': 'Passwort erforderlich',
    'This application is protected. Please enter the access password to continue.': 'Diese Anwendung ist geschützt. Bitte geben Sie das Zugangspasswort ein, um fortzufahren.',
    'Enter password': 'Passwort eingeben',
    'Access Application': 'Anwendung zugreifen',
    'Loading...': 'Lädt...',
    'Logout': 'Abmelden',
    'Incorrect password': 'Falsches Passwort',
    'Verify Your Email': 'E-Mail bestätigen',
    'We\'ve sent a verification link to your email address': 'Wir haben einen Bestätigungslink an Ihre E-Mail-Adresse gesendet',
    'Please check your email and click the verification link to activate your account.': 'Bitte überprüfen Sie Ihre E-Mails und klicken Sie auf den Bestätigungslink, um Ihr Konto zu aktivieren.',
    'Resend verification email': 'Bestätigungs-E-Mail erneut senden',
    'Verification email sent': 'Bestätigungs-E-Mail gesendet',
    'Change email address': 'E-Mail-Adresse ändern',
    'Verifying...': 'Wird bestätigt...',
    'Email verified successfully': 'E-Mail erfolgreich bestätigt',
    'Verification failed. Please try again.': 'Bestätigung fehlgeschlagen. Bitte versuchen Sie es erneut.',
    'Verification link has expired. Please request a new one.': 'Der Bestätigungslink ist abgelaufen. Bitte fordern Sie einen neuen an.',
    'Reset Your Password': 'Passwort zurücksetzen',
    'Enter your email address and we\'ll send you a reset link': 'Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Reset-Link',
    'Send Reset Link': 'Reset-Link senden',
    'Back to Login': 'Zurück zur Anmeldung',
    'Password reset email sent': 'E-Mail zum Zurücksetzen des Passworts gesendet',
    'No account found with this email address': 'Kein Konto mit dieser E-Mail-Adresse gefunden',
    'Reset link has expired. Please request a new one.': 'Der Reset-Link ist abgelaufen. Bitte fordern Sie einen neuen an.',
    'Password reset successfully': 'Passwort erfolgreich zurückgesetzt',
    'Certifications': 'Zertifizierungen',
    'Compliance': 'Compliance',
    'Features': 'Funktionen',
    'Action1': 'Aktion1',
    'Action2': 'Aktion2',
    'Action3': 'Aktion3',
    'Details': 'Details',
    'Device': 'Gerät',
    'Headline': 'Überschrift',
    'Location': 'Standort',
    'Message': 'Nachricht',
    'Not you': 'Nicht Sie',
    'Support contact': 'Support-Kontakt',
    'Time': 'Zeit',
    'Was you': 'War das Sie',
    'Section subtitle': 'Abschnitt-Untertitel',
    'Section title': 'Abschnitt-Titel',
    'Subtitle': 'Untertitel',
    'Title': 'Titel'
  };
  
  return translations[text] || text;
}

// Placeholder functions for other languages (to be expanded)
function translateToBulgarian(text) { return text; }
function translateToWelsh(text) { return text; }
function translateToIrish(text) { return text; }
function translateToHungarian(text) { return text; }
function translateToIcelandic(text) { return text; }
function translateToMaltese(text) { return text; }
function translateToAlbanian(text) { return text; }
function translateToTurkish(text) { return text; }
function translateToGreek(text) { return text; }
function translateToMontenegrin(text) { return text; }
function translateToMacedonian(text) { return text; }
function translateToRomanian(text) { return text; }
function translateToSerbian(text) { return text; }
function translateToDanish(text) { return text; }
function translateToEstonian(text) { return text; }
function translateToFinnish(text) { return text; }
function translateToCroatian(text) { return text; }
function translateToLithuanian(text) { return text; }
function translateToLatvian(text) { return text; }
function translateToSlovenian(text) { return text; }
function translateToDutch(text) { return text; }
function translateToNorwegian(text) { return text; }
function translateToSwedish(text) { return text; }
function translateToUkrainian(text) { return text; }
function translateToSpanish(text) { return text; }
function translateToFrench(text) { return text; }
function translateToItalian(text) { return text; }
function translateToPolish(text) { return text; }
function translateToPortuguese(text) { return text; }
function translateToRussian(text) { return text; }
function translateToSlovak(text) { return text; }

// Main translation function
function translateObject(obj, language) {
  const translator = TRANSLATORS[language];
  if (!translator) {
    console.error(`No translator found for language: ${language}`);
    return obj;
  }

  const translated = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      translated[key] = translator(value);
    } else if (typeof value === 'object' && value !== null) {
      translated[key] = translateObject(value, language);
    } else {
      translated[key] = value;
    }
  }
  
  return translated;
}

// Main execution function
function main() {
  const localesPath = path.join(__dirname, '../src/i18n/locales');
  const englishPath = path.join(localesPath, 'en');
  
  // Get all English files
  const englishFiles = fs.readdirSync(englishPath)
    .filter(file => file.endsWith('.json'))
    .map(file => file.replace('.json', ''));
  
  console.log('English files found:', englishFiles);
  
  // Get all language directories
  const languages = fs.readdirSync(localesPath)
    .filter(dir => fs.statSync(path.join(localesPath, dir)).isDirectory())
    .filter(dir => dir !== 'en');
  
  console.log('Languages to translate:', languages);
  
  // Process each language
  for (const language of languages) {
    console.log(`\nProcessing language: ${language} (${LANGUAGE_MAP[language]})`);
    
    const languagePath = path.join(localesPath, language);
    
    // Process each English file
    for (const file of englishFiles) {
      const englishFilePath = path.join(englishPath, `${file}.json`);
      const targetFilePath = path.join(languagePath, `${file}.json`);
      
      try {
        // Read English file
        const englishContent = JSON.parse(fs.readFileSync(englishFilePath, 'utf8'));
        
        // Check if target file exists
        let existingContent = {};
        if (fs.existsSync(targetFilePath)) {
          try {
            existingContent = JSON.parse(fs.readFileSync(targetFilePath, 'utf8'));
          } catch (e) {
            console.warn(`Warning: Could not parse existing ${targetFilePath}`);
          }
        }
        
        // Merge and translate
        const mergedContent = { ...existingContent };
        const translatedContent = translateObject(englishContent, language);
        
        // Merge translated content with existing content
        Object.assign(mergedContent, translatedContent);
        
        // Write back to file
        fs.writeFileSync(targetFilePath, JSON.stringify(mergedContent, null, 2), 'utf8');
        
        console.log(`  ✓ Translated ${file}.json`);
        
      } catch (error) {
        console.error(`  ✗ Error processing ${file}.json for ${language}:`, error.message);
      }
    }
  }
  
  console.log('\nTranslation process completed!');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { translateObject, TRANSLATORS, LANGUAGE_MAP };
