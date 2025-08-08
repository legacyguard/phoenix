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

// Comprehensive translation dictionaries for each language
const TRANSLATION_DICTIONARIES = {
  'de': {
    // German translations
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
    'Title': 'Titel',
    // Dashboard translations
    'Dashboard': 'Dashboard',
    'Overview': 'Übersicht',
    'Welcome': 'Willkommen',
    'Settings': 'Einstellungen',
    'Profile': 'Profil',
    'Logout': 'Abmelden',
    'Save': 'Speichern',
    'Cancel': 'Abbrechen',
    'Delete': 'Löschen',
    'Edit': 'Bearbeiten',
    'Add': 'Hinzufügen',
    'Remove': 'Entfernen',
    'Search': 'Suchen',
    'Filter': 'Filter',
    'Sort': 'Sortieren',
    'Export': 'Exportieren',
    'Import': 'Importieren',
    'Download': 'Herunterladen',
    'Upload': 'Hochladen',
    'View': 'Anzeigen',
    'Close': 'Schließen',
    'Next': 'Weiter',
    'Previous': 'Zurück',
    'Submit': 'Absenden',
    'Reset': 'Zurücksetzen',
    'Confirm': 'Bestätigen',
    'Yes': 'Ja',
    'No': 'Nein',
    'OK': 'OK',
    'Error': 'Fehler',
    'Success': 'Erfolg',
    'Warning': 'Warnung',
    'Info': 'Info',
    'Loading': 'Lädt...',
    'Please wait': 'Bitte warten',
    'Processing': 'Verarbeitung läuft...',
    'Complete': 'Abgeschlossen',
    'Incomplete': 'Unvollständig',
    'Active': 'Aktiv',
    'Inactive': 'Inaktiv',
    'Enabled': 'Aktiviert',
    'Disabled': 'Deaktiviert',
    'On': 'An',
    'Off': 'Aus',
    'True': 'Wahr',
    'False': 'Falsch',
    'Required': 'Erforderlich',
    'Optional': 'Optional',
    'Default': 'Standard',
    'Custom': 'Benutzerdefiniert',
    'All': 'Alle',
    'None': 'Keine',
    'Other': 'Andere',
    'Unknown': 'Unbekannt',
    'N/A': 'N/V',
    'Today': 'Heute',
    'Yesterday': 'Gestern',
    'Tomorrow': 'Morgen',
    'This week': 'Diese Woche',
    'Last week': 'Letzte Woche',
    'Next week': 'Nächste Woche',
    'This month': 'Dieser Monat',
    'Last month': 'Letzter Monat',
    'Next month': 'Nächster Monat',
    'This year': 'Dieses Jahr',
    'Last year': 'Letztes Jahr',
    'Next year': 'Nächstes Jahr',
    'January': 'Januar',
    'February': 'Februar',
    'March': 'März',
    'April': 'April',
    'May': 'Mai',
    'June': 'Juni',
    'July': 'Juli',
    'August': 'August',
    'September': 'September',
    'October': 'Oktober',
    'November': 'November',
    'December': 'Dezember',
    'Monday': 'Montag',
    'Tuesday': 'Dienstag',
    'Wednesday': 'Mittwoch',
    'Thursday': 'Donnerstag',
    'Friday': 'Freitag',
    'Saturday': 'Samstag',
    'Sunday': 'Sonntag'
  },
  'es': {
    // Spanish translations
    'Welcome Back': 'Bienvenido de vuelta',
    'Sign in to your LegacyGuard account': 'Inicia sesión en tu cuenta LegacyGuard',
    'Email Address': 'Dirección de correo electrónico',
    'Password': 'Contraseña',
    'Enter your email address': 'Ingresa tu dirección de correo electrónico',
    'Enter your password': 'Ingresa tu contraseña',
    'Sign In': 'Iniciar sesión',
    'Forgot your password?': '¿Olvidaste tu contraseña?',
    'Don\'t have an account?': '¿No tienes una cuenta?',
    'Create an account': 'Crear una cuenta',
    'Remember me': 'Recordarme',
    'Signing in...': 'Iniciando sesión...',
    'Invalid email or password': 'Correo electrónico o contraseña inválidos',
    'Account temporarily locked. Please try again later.': 'Cuenta bloqueada temporalmente. Por favor, inténtalo más tarde.',
    'Too many login attempts. Please wait before trying again.': 'Demasiados intentos de inicio de sesión. Por favor, espera antes de intentar de nuevo.',
    'Create Your Account': 'Crea tu cuenta',
    'Start protecting your family\'s future today': 'Comienza a proteger el futuro de tu familia hoy',
    'First Name': 'Nombre',
    'Last Name': 'Apellido',
    'Confirm Password': 'Confirmar contraseña',
    'Enter your first name': 'Ingresa tu nombre',
    'Enter your last name': 'Ingresa tu apellido',
    'Create a strong password': 'Crea una contraseña segura',
    'Confirm your password': 'Confirma tu contraseña',
    'Already have an account?': '¿Ya tienes una cuenta?',
    'Sign in': 'Iniciar sesión',
    'Creating account...': 'Creando cuenta...',
    'By creating an account, you agree to our': 'Al crear una cuenta, aceptas nuestros',
    'Terms of Service': 'Términos de servicio',
    'and': 'y',
    'Privacy Policy': 'Política de privacidad',
    'An account with this email already exists': 'Ya existe una cuenta con este correo electrónico',
    'Password must be at least 8 characters with uppercase, lowercase, and numbers': 'La contraseña debe tener al menos 8 caracteres con mayúsculas, minúsculas y números',
    'Passwords do not match': 'Las contraseñas no coinciden',
    'Password Required': 'Contraseña requerida',
    'This application is protected. Please enter the access password to continue.': 'Esta aplicación está protegida. Por favor, ingresa la contraseña de acceso para continuar.',
    'Enter password': 'Ingresa la contraseña',
    'Access Application': 'Acceder a la aplicación',
    'Loading...': 'Cargando...',
    'Logout': 'Cerrar sesión',
    'Incorrect password': 'Contraseña incorrecta',
    'Verify Your Email': 'Verifica tu correo electrónico',
    'We\'ve sent a verification link to your email address': 'Hemos enviado un enlace de verificación a tu dirección de correo electrónico',
    'Please check your email and click the verification link to activate your account.': 'Por favor, revisa tu correo electrónico y haz clic en el enlace de verificación para activar tu cuenta.',
    'Resend verification email': 'Reenviar correo de verificación',
    'Verification email sent': 'Correo de verificación enviado',
    'Change email address': 'Cambiar dirección de correo electrónico',
    'Verifying...': 'Verificando...',
    'Email verified successfully': 'Correo electrónico verificado exitosamente',
    'Verification failed. Please try again.': 'La verificación falló. Por favor, inténtalo de nuevo.',
    'Verification link has expired. Please request a new one.': 'El enlace de verificación ha expirado. Por favor, solicita uno nuevo.',
    'Reset Your Password': 'Restablece tu contraseña',
    'Enter your email address and we\'ll send you a reset link': 'Ingresa tu dirección de correo electrónico y te enviaremos un enlace de restablecimiento',
    'Send Reset Link': 'Enviar enlace de restablecimiento',
    'Back to Login': 'Volver al inicio de sesión',
    'Password reset email sent': 'Correo de restablecimiento de contraseña enviado',
    'No account found with this email address': 'No se encontró ninguna cuenta con esta dirección de correo electrónico',
    'Reset link has expired. Please request a new one.': 'El enlace de restablecimiento ha expirado. Por favor, solicita uno nuevo.',
    'Password reset successfully': 'Contraseña restablecida exitosamente',
    'Certifications': 'Certificaciones',
    'Compliance': 'Cumplimiento',
    'Features': 'Características',
    'Action1': 'Acción1',
    'Action2': 'Acción2',
    'Action3': 'Acción3',
    'Details': 'Detalles',
    'Device': 'Dispositivo',
    'Headline': 'Título',
    'Location': 'Ubicación',
    'Message': 'Mensaje',
    'Not you': 'No eres tú',
    'Support contact': 'Contacto de soporte',
    'Time': 'Tiempo',
    'Was you': '¿Eras tú?',
    'Section subtitle': 'Subtítulo de sección',
    'Section title': 'Título de sección',
    'Subtitle': 'Subtítulo',
    'Title': 'Título',
    // Dashboard translations
    'Dashboard': 'Panel de control',
    'Overview': 'Resumen',
    'Welcome': 'Bienvenido',
    'Settings': 'Configuración',
    'Profile': 'Perfil',
    'Save': 'Guardar',
    'Cancel': 'Cancelar',
    'Delete': 'Eliminar',
    'Edit': 'Editar',
    'Add': 'Agregar',
    'Remove': 'Eliminar',
    'Search': 'Buscar',
    'Filter': 'Filtrar',
    'Sort': 'Ordenar',
    'Export': 'Exportar',
    'Import': 'Importar',
    'Download': 'Descargar',
    'Upload': 'Subir',
    'View': 'Ver',
    'Close': 'Cerrar',
    'Next': 'Siguiente',
    'Previous': 'Anterior',
    'Submit': 'Enviar',
    'Reset': 'Restablecer',
    'Confirm': 'Confirmar',
    'Yes': 'Sí',
    'No': 'No',
    'OK': 'OK',
    'Error': 'Error',
    'Success': 'Éxito',
    'Warning': 'Advertencia',
    'Info': 'Información',
    'Please wait': 'Por favor espera',
    'Processing': 'Procesando...',
    'Complete': 'Completo',
    'Incomplete': 'Incompleto',
    'Active': 'Activo',
    'Inactive': 'Inactivo',
    'Enabled': 'Habilitado',
    'Disabled': 'Deshabilitado',
    'On': 'Encendido',
    'Off': 'Apagado',
    'True': 'Verdadero',
    'False': 'Falso',
    'Required': 'Requerido',
    'Optional': 'Opcional',
    'Default': 'Predeterminado',
    'Custom': 'Personalizado',
    'All': 'Todos',
    'None': 'Ninguno',
    'Other': 'Otro',
    'Unknown': 'Desconocido',
    'N/A': 'N/A',
    'Today': 'Hoy',
    'Yesterday': 'Ayer',
    'Tomorrow': 'Mañana',
    'This week': 'Esta semana',
    'Last week': 'La semana pasada',
    'Next week': 'La próxima semana',
    'This month': 'Este mes',
    'Last month': 'El mes pasado',
    'Next month': 'El próximo mes',
    'This year': 'Este año',
    'Last year': 'El año pasado',
    'Next year': 'El próximo año',
    'January': 'Enero',
    'February': 'Febrero',
    'March': 'Marzo',
    'April': 'Abril',
    'May': 'Mayo',
    'June': 'Junio',
    'July': 'Julio',
    'August': 'Agosto',
    'September': 'Septiembre',
    'October': 'Octubre',
    'November': 'Noviembre',
    'December': 'Diciembre',
    'Monday': 'Lunes',
    'Tuesday': 'Martes',
    'Wednesday': 'Miércoles',
    'Thursday': 'Jueves',
    'Friday': 'Viernes',
    'Saturday': 'Sábado',
    'Sunday': 'Domingo'
  }
};

// Translation function
function translateText(text, language) {
  const dictionary = TRANSLATION_DICTIONARIES[language];
  if (!dictionary) {
    console.warn(`No translation dictionary found for language: ${language}`);
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
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { translateObject, TRANSLATION_DICTIONARIES, LANGUAGE_MAP };
