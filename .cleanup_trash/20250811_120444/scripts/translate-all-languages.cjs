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

// Comprehensive translation dictionaries for major languages
const TRANSLATION_DICTIONARIES = {
  'fr': {
    // French translations
    'Welcome Back': 'Bon retour',
    'Sign in to your LegacyGuard account': 'Connectez-vous à votre compte LegacyGuard',
    'Email Address': 'Adresse e-mail',
    'Password': 'Mot de passe',
    'Enter your email address': 'Entrez votre adresse e-mail',
    'Enter your password': 'Entrez votre mot de passe',
    'Sign In': 'Se connecter',
    'Forgot your password?': 'Mot de passe oublié ?',
    'Don\'t have an account?': 'Vous n\'avez pas de compte ?',
    'Create an account': 'Créer un compte',
    'Remember me': 'Se souvenir de moi',
    'Signing in...': 'Connexion en cours...',
    'Invalid email or password': 'E-mail ou mot de passe invalide',
    'Account temporarily locked. Please try again later.': 'Compte temporairement verrouillé. Veuillez réessayer plus tard.',
    'Too many login attempts. Please wait before trying again.': 'Trop de tentatives de connexion. Veuillez attendre avant de réessayer.',
    'Create Your Account': 'Créez votre compte',
    'Start protecting your family\'s future today': 'Commencez à protéger l\'avenir de votre famille dès aujourd\'hui',
    'First Name': 'Prénom',
    'Last Name': 'Nom de famille',
    'Confirm Password': 'Confirmer le mot de passe',
    'Enter your first name': 'Entrez votre prénom',
    'Enter your last name': 'Entrez votre nom de famille',
    'Create a strong password': 'Créez un mot de passe fort',
    'Confirm your password': 'Confirmez votre mot de passe',
    'Already have an account?': 'Vous avez déjà un compte ?',
    'Sign in': 'Se connecter',
    'Creating account...': 'Création du compte...',
    'By creating an account, you agree to our': 'En créant un compte, vous acceptez nos',
    'Terms of Service': 'Conditions d\'utilisation',
    'and': 'et',
    'Privacy Policy': 'Politique de confidentialité',
    'An account with this email already exists': 'Un compte avec cet e-mail existe déjà',
    'Password must be at least 8 characters with uppercase, lowercase, and numbers': 'Le mot de passe doit contenir au moins 8 caractères avec majuscules, minuscules et chiffres',
    'Passwords do not match': 'Les mots de passe ne correspondent pas',
    'Password Required': 'Mot de passe requis',
    'This application is protected. Please enter the access password to continue.': 'Cette application est protégée. Veuillez entrer le mot de passe d\'accès pour continuer.',
    'Enter password': 'Entrez le mot de passe',
    'Access Application': 'Accéder à l\'application',
    'Loading...': 'Chargement...',
    'Logout': 'Se déconnecter',
    'Incorrect password': 'Mot de passe incorrect',
    'Verify Your Email': 'Vérifiez votre e-mail',
    'We\'ve sent a verification link to your email address': 'Nous avons envoyé un lien de vérification à votre adresse e-mail',
    'Please check your email and click the verification link to activate your account.': 'Veuillez vérifier votre e-mail et cliquer sur le lien de vérification pour activer votre compte.',
    'Resend verification email': 'Renvoyer l\'e-mail de vérification',
    'Verification email sent': 'E-mail de vérification envoyé',
    'Change email address': 'Changer l\'adresse e-mail',
    'Verifying...': 'Vérification...',
    'Email verified successfully': 'E-mail vérifié avec succès',
    'Verification failed. Please try again.': 'La vérification a échoué. Veuillez réessayer.',
    'Verification link has expired. Please request a new one.': 'Le lien de vérification a expiré. Veuillez en demander un nouveau.',
    'Reset Your Password': 'Réinitialisez votre mot de passe',
    'Enter your email address and we\'ll send you a reset link': 'Entrez votre adresse e-mail et nous vous enverrons un lien de réinitialisation',
    'Send Reset Link': 'Envoyer le lien de réinitialisation',
    'Back to Login': 'Retour à la connexion',
    'Password reset email sent': 'E-mail de réinitialisation du mot de passe envoyé',
    'No account found with this email address': 'Aucun compte trouvé avec cette adresse e-mail',
    'Reset link has expired. Please request a new one.': 'Le lien de réinitialisation a expiré. Veuillez en demander un nouveau.',
    'Password reset successfully': 'Mot de passe réinitialisé avec succès',
    'Certifications': 'Certifications',
    'Compliance': 'Conformité',
    'Features': 'Fonctionnalités',
    'Action1': 'Action1',
    'Action2': 'Action2',
    'Action3': 'Action3',
    'Details': 'Détails',
    'Device': 'Appareil',
    'Headline': 'Titre',
    'Location': 'Emplacement',
    'Message': 'Message',
    'Not you': 'Pas vous',
    'Support contact': 'Contact support',
    'Time': 'Heure',
    'Was you': 'Était-ce vous',
    'Section subtitle': 'Sous-titre de section',
    'Section title': 'Titre de section',
    'Subtitle': 'Sous-titre',
    'Title': 'Titre',
    // Dashboard translations
    'Dashboard': 'Tableau de bord',
    'Overview': 'Aperçu',
    'Welcome': 'Bienvenue',
    'Settings': 'Paramètres',
    'Profile': 'Profil',
    'Save': 'Enregistrer',
    'Cancel': 'Annuler',
    'Delete': 'Supprimer',
    'Edit': 'Modifier',
    'Add': 'Ajouter',
    'Remove': 'Supprimer',
    'Search': 'Rechercher',
    'Filter': 'Filtrer',
    'Sort': 'Trier',
    'Export': 'Exporter',
    'Import': 'Importer',
    'Download': 'Télécharger',
    'Upload': 'Téléverser',
    'View': 'Voir',
    'Close': 'Fermer',
    'Next': 'Suivant',
    'Previous': 'Précédent',
    'Submit': 'Soumettre',
    'Reset': 'Réinitialiser',
    'Confirm': 'Confirmer',
    'Yes': 'Oui',
    'No': 'Non',
    'OK': 'OK',
    'Error': 'Erreur',
    'Success': 'Succès',
    'Warning': 'Avertissement',
    'Info': 'Info',
    'Please wait': 'Veuillez patienter',
    'Processing': 'Traitement...',
    'Complete': 'Terminé',
    'Incomplete': 'Incomplet',
    'Active': 'Actif',
    'Inactive': 'Inactif',
    'Enabled': 'Activé',
    'Disabled': 'Désactivé',
    'On': 'Activé',
    'Off': 'Désactivé',
    'True': 'Vrai',
    'False': 'Faux',
    'Required': 'Requis',
    'Optional': 'Optionnel',
    'Default': 'Par défaut',
    'Custom': 'Personnalisé',
    'All': 'Tous',
    'None': 'Aucun',
    'Other': 'Autre',
    'Unknown': 'Inconnu',
    'N/A': 'N/A',
    'Today': 'Aujourd\'hui',
    'Yesterday': 'Hier',
    'Tomorrow': 'Demain',
    'This week': 'Cette semaine',
    'Last week': 'La semaine dernière',
    'Next week': 'La semaine prochaine',
    'This month': 'Ce mois',
    'Last month': 'Le mois dernier',
    'Next month': 'Le mois prochain',
    'This year': 'Cette année',
    'Last year': 'L\'année dernière',
    'Next year': 'L\'année prochaine',
    'January': 'Janvier',
    'February': 'Février',
    'March': 'Mars',
    'April': 'Avril',
    'May': 'Mai',
    'June': 'Juin',
    'July': 'Juillet',
    'August': 'Août',
    'September': 'Septembre',
    'October': 'Octobre',
    'November': 'Novembre',
    'December': 'Décembre',
    'Monday': 'Lundi',
    'Tuesday': 'Mardi',
    'Wednesday': 'Mercredi',
    'Thursday': 'Jeudi',
    'Friday': 'Vendredi',
    'Saturday': 'Samedi',
    'Sunday': 'Dimanche'
  },
  'it': {
    // Italian translations
    'Welcome Back': 'Bentornato',
    'Sign in to your LegacyGuard account': 'Accedi al tuo account LegacyGuard',
    'Email Address': 'Indirizzo email',
    'Password': 'Password',
    'Enter your email address': 'Inserisci il tuo indirizzo email',
    'Enter your password': 'Inserisci la tua password',
    'Sign In': 'Accedi',
    'Forgot your password?': 'Password dimenticata?',
    'Don\'t have an account?': 'Non hai un account?',
    'Create an account': 'Crea un account',
    'Remember me': 'Ricordami',
    'Signing in...': 'Accesso in corso...',
    'Invalid email or password': 'Email o password non validi',
    'Account temporarily locked. Please try again later.': 'Account temporaneamente bloccato. Riprova più tardi.',
    'Too many login attempts. Please wait before trying again.': 'Troppi tentativi di accesso. Attendi prima di riprovare.',
    'Create Your Account': 'Crea il tuo account',
    'Start protecting your family\'s future today': 'Inizia a proteggere il futuro della tua famiglia oggi',
    'First Name': 'Nome',
    'Last Name': 'Cognome',
    'Confirm Password': 'Conferma password',
    'Enter your first name': 'Inserisci il tuo nome',
    'Enter your last name': 'Inserisci il tuo cognome',
    'Create a strong password': 'Crea una password forte',
    'Confirm your password': 'Conferma la tua password',
    'Already have an account?': 'Hai già un account?',
    'Sign in': 'Accedi',
    'Creating account...': 'Creazione account...',
    'By creating an account, you agree to our': 'Creando un account, accetti i nostri',
    'Terms of Service': 'Termini di servizio',
    'and': 'e',
    'Privacy Policy': 'Informativa sulla privacy',
    'An account with this email already exists': 'Un account con questa email esiste già',
    'Password must be at least 8 characters with uppercase, lowercase, and numbers': 'La password deve contenere almeno 8 caratteri con maiuscole, minuscole e numeri',
    'Passwords do not match': 'Le password non corrispondono',
    'Password Required': 'Password richiesta',
    'This application is protected. Please enter the access password to continue.': 'Questa applicazione è protetta. Inserisci la password di accesso per continuare.',
    'Enter password': 'Inserisci la password',
    'Access Application': 'Accedi all\'applicazione',
    'Loading...': 'Caricamento...',
    'Logout': 'Disconnetti',
    'Incorrect password': 'Password errata',
    'Verify Your Email': 'Verifica la tua email',
    'We\'ve sent a verification link to your email address': 'Abbiamo inviato un link di verifica al tuo indirizzo email',
    'Please check your email and click the verification link to activate your account.': 'Controlla la tua email e clicca sul link di verifica per attivare il tuo account.',
    'Resend verification email': 'Rinvia email di verifica',
    'Verification email sent': 'Email di verifica inviata',
    'Change email address': 'Cambia indirizzo email',
    'Verifying...': 'Verifica...',
    'Email verified successfully': 'Email verificata con successo',
    'Verification failed. Please try again.': 'Verifica fallita. Riprova.',
    'Verification link has expired. Please request a new one.': 'Il link di verifica è scaduto. Richiedine uno nuovo.',
    'Reset Your Password': 'Reimposta la tua password',
    'Enter your email address and we\'ll send you a reset link': 'Inserisci il tuo indirizzo email e ti invieremo un link di reimpostazione',
    'Send Reset Link': 'Invia link di reimpostazione',
    'Back to Login': 'Torna al login',
    'Password reset email sent': 'Email di reimpostazione password inviata',
    'No account found with this email address': 'Nessun account trovato con questo indirizzo email',
    'Reset link has expired. Please request a new one.': 'Il link di reimpostazione è scaduto. Richiedine uno nuovo.',
    'Password reset successfully': 'Password reimpostata con successo',
    'Certifications': 'Certificazioni',
    'Compliance': 'Conformità',
    'Features': 'Funzionalità',
    'Action1': 'Azione1',
    'Action2': 'Azione2',
    'Action3': 'Azione3',
    'Details': 'Dettagli',
    'Device': 'Dispositivo',
    'Headline': 'Titolo',
    'Location': 'Posizione',
    'Message': 'Messaggio',
    'Not you': 'Non sei tu',
    'Support contact': 'Contatto supporto',
    'Time': 'Ora',
    'Was you': 'Eri tu',
    'Section subtitle': 'Sottotitolo sezione',
    'Section title': 'Titolo sezione',
    'Subtitle': 'Sottotitolo',
    'Title': 'Titolo',
    // Dashboard translations
    'Dashboard': 'Dashboard',
    'Overview': 'Panoramica',
    'Welcome': 'Benvenuto',
    'Settings': 'Impostazioni',
    'Profile': 'Profilo',
    'Save': 'Salva',
    'Cancel': 'Annulla',
    'Delete': 'Elimina',
    'Edit': 'Modifica',
    'Add': 'Aggiungi',
    'Remove': 'Rimuovi',
    'Search': 'Cerca',
    'Filter': 'Filtra',
    'Sort': 'Ordina',
    'Export': 'Esporta',
    'Import': 'Importa',
    'Download': 'Scarica',
    'Upload': 'Carica',
    'View': 'Visualizza',
    'Close': 'Chiudi',
    'Next': 'Avanti',
    'Previous': 'Precedente',
    'Submit': 'Invia',
    'Reset': 'Reimposta',
    'Confirm': 'Conferma',
    'Yes': 'Sì',
    'No': 'No',
    'OK': 'OK',
    'Error': 'Errore',
    'Success': 'Successo',
    'Warning': 'Avviso',
    'Info': 'Info',
    'Please wait': 'Attendi',
    'Processing': 'Elaborazione...',
    'Complete': 'Completo',
    'Incomplete': 'Incompleto',
    'Active': 'Attivo',
    'Inactive': 'Inattivo',
    'Enabled': 'Abilitato',
    'Disabled': 'Disabilitato',
    'On': 'Attivo',
    'Off': 'Disattivo',
    'True': 'Vero',
    'False': 'Falso',
    'Required': 'Richiesto',
    'Optional': 'Opzionale',
    'Default': 'Predefinito',
    'Custom': 'Personalizzato',
    'All': 'Tutti',
    'None': 'Nessuno',
    'Other': 'Altro',
    'Unknown': 'Sconosciuto',
    'N/A': 'N/A',
    'Today': 'Oggi',
    'Yesterday': 'Ieri',
    'Tomorrow': 'Domani',
    'This week': 'Questa settimana',
    'Last week': 'La settimana scorsa',
    'Next week': 'La prossima settimana',
    'This month': 'Questo mese',
    'Last month': 'Il mese scorso',
    'Next month': 'Il prossimo mese',
    'This year': 'Quest\'anno',
    'Last year': 'L\'anno scorso',
    'Next year': 'L\'anno prossimo',
    'January': 'Gennaio',
    'February': 'Febbraio',
    'March': 'Marzo',
    'April': 'Aprile',
    'May': 'Maggio',
    'June': 'Giugno',
    'July': 'Luglio',
    'August': 'Agosto',
    'September': 'Settembre',
    'October': 'Ottobre',
    'November': 'Novembre',
    'December': 'Dicembre',
    'Monday': 'Lunedì',
    'Tuesday': 'Martedì',
    'Wednesday': 'Mercoledì',
    'Thursday': 'Giovedì',
    'Friday': 'Venerdì',
    'Saturday': 'Sabato',
    'Sunday': 'Domenica'
  }
};

// Translation function
function translateText(text, language) {
  const dictionary = TRANSLATION_DICTIONARIES[language];
  if (!dictionary) {
    // For languages without dictionaries, return the original text
    return text;
  }
  
  return dictionary[text] || text;
}

// Recursive translation function for objects
function translateObject(obj, language) {
  if (typeof obj === 'string') {
    return translateText(obj, language);
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const translated = {};
    for (const [key, value] of Object.entries(obj)) {
      translated[key] = translateObject(value, language);
    }
    return translated;
  }
  
  return obj;
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
        
        // Translate content
        const translatedContent = translateObject(englishContent, language);
        
        // Merge with existing content (existing content takes precedence)
        const mergedContent = { ...translatedContent, ...existingContent };
        
        // Write back to file
        fs.writeFileSync(targetFilePath, JSON.stringify(mergedContent, null, 2), 'utf8');
        
        console.log(`  ✓ Translated ${file}.json`);
        
      } catch (error) {
        console.error(`  ✗ Error processing ${file}.json for ${language}:`, error.message);
      }
    }
  }
  
  console.log('\nTranslation process completed!');
  console.log('\nNote: Only French (fr) and Italian (it) have comprehensive translations.');
  console.log('Other languages will retain English text where translations are not available.');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { translateObject, TRANSLATION_DICTIONARIES, LANGUAGE_MAP };
