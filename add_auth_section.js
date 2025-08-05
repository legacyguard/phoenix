const fs = require('fs');
const path = require('path');

// Language-specific translations for auth section
const authTranslations = {
  'sl': {
    "incorrectPassword": "Napačno geslo",
    "protectedApplication": "Zaščitena aplikacija",
    "protectedApplicationDesc": "Ta aplikacija je zaščitena z geslom. Prosimo, vnesite geslo za nadaljevanje.",
    "password": "Geslo",
    "enterPassword": "Vnesite geslo",
    "accessApplication": "Dostop do aplikacije",
    "logout": "Odjava"
  },
  'pl': {
    "incorrectPassword": "Nieprawidłowe hasło",
    "protectedApplication": "Chroniona aplikacja",
    "protectedApplicationDesc": "Ta aplikacja jest chroniona hasłem. Proszę wprowadzić hasło, aby kontynuować.",
    "password": "Hasło",
    "enterPassword": "Wprowadź hasło",
    "accessApplication": "Dostęp do aplikacji",
    "logout": "Wyloguj"
  },
  'sq': {
    "incorrectPassword": "Fjalëkalim i gabuar",
    "protectedApplication": "Aplikacion i mbrojtur",
    "protectedApplicationDesc": "Ky aplikacion është i mbrojtur me fjalëkalim. Ju lutemi vendosni fjalëkalimin për të vazhduar.",
    "password": "Fjalëkalim",
    "enterPassword": "Vendosni fjalëkalimin",
    "accessApplication": "Akses në aplikacion",
    "logout": "Dilni"
  },
  'sv': {
    "incorrectPassword": "Felaktigt lösenord",
    "protectedApplication": "Skyddad applikation",
    "protectedApplicationDesc": "Denna applikation är lösenordsskyddad. Ange lösenord för att fortsätta.",
    "password": "Lösenord",
    "enterPassword": "Ange lösenord",
    "accessApplication": "Åtkomst till applikation",
    "logout": "Logga ut"
  },
  'ga': {
    "incorrectPassword": "Pasfhocal mícheart",
    "protectedApplication": "Feidhmchlár cosanta",
    "protectedApplicationDesc": "Tá an feidhmchlár seo cosanta le pasfhocal. Cuir isteach an pasfhocal le leanúint ar aghaidh.",
    "password": "Pasfhocal",
    "enterPassword": "Cuir isteach pasfhocal",
    "accessApplication": "Rochtain ar fheidhmchlár",
    "logout": "Logáil amach"
  },
  'mt': {
    "incorrectPassword": "Password mhix korretta",
    "protectedApplication": "Applikazzjoni protetta",
    "protectedApplicationDesc": "Din l-applikazzjoni hija protetta b'password. Jekk jogħġbok daħħal il-password biex tkompli.",
    "password": "Password",
    "enterPassword": "Daħħal il-password",
    "accessApplication": "Aċċess għall-applikazzjoni",
    "logout": "Oħroġ"
  },
  'da': {
    "incorrectPassword": "Forkert adgangskode",
    "protectedApplication": "Beskyttet applikation",
    "protectedApplicationDesc": "Denne applikation er beskyttet med adgangskode. Indtast venligst adgangskoden for at fortsætte.",
    "password": "Adgangskode",
    "enterPassword": "Indtast adgangskode",
    "accessApplication": "Adgang til applikation",
    "logout": "Log ud"
  },
  'no': {
    "incorrectPassword": "Feil passord",
    "protectedApplication": "Beskyttet applikasjon",
    "protectedApplicationDesc": "Denne applikasjonen er beskyttet med passord. Vennligst skriv inn passordet for å fortsette.",
    "password": "Passord",
    "enterPassword": "Skriv inn passord",
    "accessApplication": "Tilgang til applikasjon",
    "logout": "Logg ut"
  },
  'el': {
    "incorrectPassword": "Λάθος κωδικός πρόσβασης",
    "protectedApplication": "Προστατευμένη εφαρμογή",
    "protectedApplicationDesc": "Αυτή η εφαρμογή προστατεύεται με κωδικό πρόσβασης. Παρακαλώ εισάγετε τον κωδικό πρόσβασης για να συνεχίσετε.",
    "password": "Κωδικός πρόσβασης",
    "enterPassword": "Εισάγετε κωδικό πρόσβασης",
    "accessApplication": "Πρόσβαση στην εφαρμογή",
    "logout": "Αποσύνδεση"
  },
  'lv': {
    "incorrectPassword": "Nepareiza parole",
    "protectedApplication": "Aizsargāta lietotne",
    "protectedApplicationDesc": "Šī lietotne ir aizsargāta ar paroli. Lūdzu, ievadiet paroli, lai turpinātu.",
    "password": "Parole",
    "enterPassword": "Ievadiet paroli",
    "accessApplication": "Piekļuve lietotnei",
    "logout": "Izrakstīties"
  },
  'it': {
    "incorrectPassword": "Password non corretta",
    "protectedApplication": "Applicazione protetta",
    "protectedApplicationDesc": "Questa applicazione è protetta da password. Inserisci la password per continuare.",
    "password": "Password",
    "enterPassword": "Inserisci password",
    "accessApplication": "Accedi all'applicazione",
    "logout": "Disconnetti"
  },
  'is': {
    "incorrectPassword": "Rangt lykilorð",
    "protectedApplication": "Varin forrit",
    "protectedApplicationDesc": "Þetta forrit er varið með lykilorði. Vinsamlegast sláðu inn lykilorðið til að halda áfram.",
    "password": "Lykilorð",
    "enterPassword": "Sláðu inn lykilorð",
    "accessApplication": "Aðgangur að forriti",
    "logout": "Útskrá"
  },
  'ru': {
    "incorrectPassword": "Неверный пароль",
    "protectedApplication": "Защищенное приложение",
    "protectedApplicationDesc": "Это приложение защищено паролем. Пожалуйста, введите пароль для продолжения.",
    "password": "Пароль",
    "enterPassword": "Введите пароль",
    "accessApplication": "Доступ к приложению",
    "logout": "Выйти"
  },
  'pt': {
    "incorrectPassword": "Senha incorreta",
    "protectedApplication": "Aplicação protegida",
    "protectedApplicationDesc": "Esta aplicação é protegida por senha. Por favor, digite a senha para continuar.",
    "password": "Senha",
    "enterPassword": "Digite a senha",
    "accessApplication": "Acessar aplicação",
    "logout": "Sair"
  },
  'sr': {
    "incorrectPassword": "Pogrešna lozinka",
    "protectedApplication": "Zaštićena aplikacija",
    "protectedApplicationDesc": "Ova aplikacija je zaštićena lozinkom. Molimo unesite lozinku za nastavak.",
    "password": "Lozinka",
    "enterPassword": "Unesite lozinku",
    "accessApplication": "Pristup aplikaciji",
    "logout": "Odjavi se"
  },
  'mk': {
    "incorrectPassword": "Погрешна лозинка",
    "protectedApplication": "Заштитена апликација",
    "protectedApplicationDesc": "Оваа апликација е заштитена со лозинка. Ве молиме внесете ја лозинката за да продолжите.",
    "password": "Лозинка",
    "enterPassword": "Внесете лозинка",
    "accessApplication": "Пристап до апликација",
    "logout": "Одјави се"
  },
  'me': {
    "incorrectPassword": "Pogrešna lozinka",
    "protectedApplication": "Zaštićena aplikacija",
    "protectedApplicationDesc": "Ova aplikacija je zaštićena lozinkom. Molimo unesite lozinku za nastavak.",
    "password": "Lozinka",
    "enterPassword": "Unesite lozinku",
    "accessApplication": "Pristup aplikaciji",
    "logout": "Odjavi se"
  },
  'hr': {
    "incorrectPassword": "Pogrešna lozinka",
    "protectedApplication": "Zaštićena aplikacija",
    "protectedApplicationDesc": "Ova aplikacija je zaštićena lozinkom. Molimo unesite lozinku za nastavak.",
    "password": "Lozinka",
    "enterPassword": "Unesite lozinku",
    "accessApplication": "Pristup aplikaciji",
    "logout": "Odjavi se"
  },
  'hu': {
    "incorrectPassword": "Helytelen jelszó",
    "protectedApplication": "Védett alkalmazás",
    "protectedApplicationDesc": "Ez az alkalmazás jelszóval védett. Kérjük, adja meg a jelszót a folytatáshoz.",
    "password": "Jelszó",
    "enterPassword": "Adja meg a jelszót",
    "accessApplication": "Alkalmazás elérése",
    "logout": "Kijelentkezés"
  },
  'nl': {
    "incorrectPassword": "Onjuist wachtwoord",
    "protectedApplication": "Beveiligde applicatie",
    "protectedApplicationDesc": "Deze applicatie is beveiligd met een wachtwoord. Voer het wachtwoord in om door te gaan.",
    "password": "Wachtwoord",
    "enterPassword": "Voer wachtwoord in",
    "accessApplication": "Toegang tot applicatie",
    "logout": "Uitloggen"
  },
  'bg': {
    "incorrectPassword": "Грешна парола",
    "protectedApplication": "Защитено приложение",
    "protectedApplicationDesc": "Това приложение е защитено с парола. Моля, въведете паролата, за да продължите.",
    "password": "Парола",
    "enterPassword": "Въведете парола",
    "accessApplication": "Достъп до приложението",
    "logout": "Изход"
  },
  'de': {
    "incorrectPassword": "Falsches Passwort",
    "protectedApplication": "Geschützte Anwendung",
    "protectedApplicationDesc": "Diese Anwendung ist passwortgeschützt. Bitte geben Sie das Passwort ein, um fortzufahren.",
    "password": "Passwort",
    "enterPassword": "Passwort eingeben",
    "accessApplication": "Anwendung zugreifen",
    "logout": "Abmelden"
  },
  'fi': {
    "incorrectPassword": "Väärä salasana",
    "protectedApplication": "Suojattu sovellus",
    "protectedApplicationDesc": "Tämä sovellus on salasanalla suojattu. Syötä salasana jatkaaksesi.",
    "password": "Salasana",
    "enterPassword": "Syötä salasana",
    "accessApplication": "Käyttöoikeus sovellukseen",
    "logout": "Kirjaudu ulos"
  },
  'fr': {
    "incorrectPassword": "Mot de passe incorrect",
    "protectedApplication": "Application protégée",
    "protectedApplicationDesc": "Cette application est protégée par mot de passe. Veuillez saisir le mot de passe pour continuer.",
    "password": "Mot de passe",
    "enterPassword": "Saisir le mot de passe",
    "accessApplication": "Accéder à l'application",
    "logout": "Se déconnecter"
  },
  'es': {
    "incorrectPassword": "Contraseña incorrecta",
    "protectedApplication": "Aplicación protegida",
    "protectedApplicationDesc": "Esta aplicación está protegida con contraseña. Por favor, introduzca la contraseña para continuar.",
    "password": "Contraseña",
    "enterPassword": "Introducir contraseña",
    "accessApplication": "Acceder a la aplicación",
    "logout": "Cerrar sesión"
  },
  'et': {
    "incorrectPassword": "Vale parool",
    "protectedApplication": "Kaitstud rakendus",
    "protectedApplicationDesc": "See rakendus on parooliga kaitstud. Palun sisestage parool jätkamiseks.",
    "password": "Parool",
    "enterPassword": "Sisesta parool",
    "accessApplication": "Rakendusele juurdepääs",
    "logout": "Logi välja"
  },
  'lt': {
    "incorrectPassword": "Neteisingas slaptažodis",
    "protectedApplication": "Apsaugota programa",
    "protectedApplicationDesc": "Ši programa apsaugota slaptažodžiu. Įveskite slaptažodį, kad tęstumėte.",
    "password": "Slaptažodis",
    "enterPassword": "Įveskite slaptažodį",
    "accessApplication": "Prieiga prie programos",
    "logout": "Atsijungti"
  },
  'cy': {
    "incorrectPassword": "Cyfrinair anghywir",
    "protectedApplication": "Cais diogel",
    "protectedApplicationDesc": "Mae'r cais hwn wedi'i ddiogelu â chyfrinair. Rhowch y cyfrinair i barhau.",
    "password": "Cyfrinair",
    "enterPassword": "Rhowch y cyfrinair",
    "accessApplication": "Mynediad i'r cais",
    "logout": "Allgofnodi"
  },
  'tr': {
    "incorrectPassword": "Yanlış şifre",
    "protectedApplication": "Korumalı uygulama",
    "protectedApplicationDesc": "Bu uygulama şifre ile korunmaktadır. Devam etmek için lütfen şifreyi girin.",
    "password": "Şifre",
    "enterPassword": "Şifre girin",
    "accessApplication": "Uygulamaya erişim",
    "logout": "Çıkış yap"
  }
};

// Files that need auth section added
const filesToUpdate = [
  'src/i18n/locales/sl/ui.json',
  'src/i18n/locales/pl/ui.json',
  'src/i18n/locales/sq/ui.json',
  'src/i18n/locales/sv/ui.json',
  'src/i18n/locales/ga/ui.json',
  'src/i18n/locales/mt/ui.json',
  'src/i18n/locales/da/ui.json',
  'src/i18n/locales/no/ui.json',
  'src/i18n/locales/el/ui.json',
  'src/i18n/locales/lv/ui.json',
  'src/i18n/locales/it/ui.json',
  'src/i18n/locales/is/ui.json',
  'src/i18n/locales/ru/ui.json',
  'src/i18n/locales/pt/ui.json',
  'src/i18n/locales/sr/ui.json',
  'src/i18n/locales/mk/ui.json',
  'src/i18n/locales/me/ui.json',
  'src/i18n/locales/hr/ui.json',
  'src/i18n/locales/hu/ui.json',
  'src/i18n/locales/nl/ui.json',
  'src/i18n/locales/bg/ui.json',
  'src/i18n/locales/de/ui.json',
  'src/i18n/locales/fi/ui.json',
  'src/i18n/locales/fr/ui.json',
  'src/i18n/locales/es/ui.json',
  'src/i18n/locales/et/ui.json',
  'src/i18n/locales/lt/ui.json',
  'src/i18n/locales/cy/ui.json',
  'src/i18n/locales/tr/ui.json'
];

function addAuthSection(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Extract language code from file path
    const langCode = path.basename(path.dirname(filePath));
    
    // Get translations for this language
    const translations = authTranslations[langCode];
    if (!translations) {
      console.log(`No translations found for language: ${langCode}`);
      return;
    }
    
    // Find the common section and add auth
    if (data.common) {
      data.common.auth = translations;
    } else {
      console.log(`No common section found in ${filePath}`);
      return;
    }
    
    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Added auth section to ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Process all files
console.log('Adding auth section to language files...\n');

filesToUpdate.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    addAuthSection(filePath);
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log('\n✅ Completed adding auth sections to all language files!'); 