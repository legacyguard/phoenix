#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// German translations for auth.json
const GERMAN_TRANSLATIONS = {
  "login": {
    "title": "Willkommen zurück",
    "subtitle": "Melden Sie sich bei Ihrem LegacyGuard-Konto an",
    "email": "E-Mail-Adresse",
    "password": "Passwort",
    "emailPlaceholder": "Geben Sie Ihre E-Mail-Adresse ein",
    "passwordPlaceholder": "Geben Sie Ihr Passwort ein",
    "signIn": "Anmelden",
    "forgotPassword": "Passwort vergessen?",
    "noAccount": "Haben Sie kein Konto?",
    "createAccount": "Konto erstellen",
    "rememberMe": "Angemeldet bleiben",
    "signingIn": "Anmeldung läuft...",
    "invalidCredentials": "Ungültige E-Mail oder Passwort",
    "accountLocked": "Konto vorübergehend gesperrt. Bitte versuchen Sie es später erneut.",
    "tooManyAttempts": "Zu viele Anmeldeversuche. Bitte warten Sie, bevor Sie es erneut versuchen."
  },
  "register": {
    "title": "Konto erstellen",
    "subtitle": "Beginnen Sie heute mit dem Schutz der Zukunft Ihrer Familie",
    "firstName": "Vorname",
    "lastName": "Nachname",
    "email": "E-Mail-Adresse",
    "password": "Passwort",
    "confirmPassword": "Passwort bestätigen",
    "firstNamePlaceholder": "Geben Sie Ihren Vornamen ein",
    "lastNamePlaceholder": "Geben Sie Ihren Nachnamen ein",
    "emailPlaceholder": "Geben Sie Ihre E-Mail-Adresse ein",
    "passwordPlaceholder": "Erstellen Sie ein sicheres Passwort",
    "confirmPasswordPlaceholder": "Bestätigen Sie Ihr Passwort",
    "createAccount": "Konto erstellen",
    "alreadyHaveAccount": "Haben Sie bereits ein Konto?",
    "signIn": "Anmelden",
    "creatingAccount": "Konto wird erstellt...",
    "termsAgreement": "Durch die Erstellung eines Kontos stimmen Sie unseren zu",
    "termsOfService": "Nutzungsbedingungen",
    "and": "und",
    "privacyPolicy": "Datenschutzrichtlinie",
    "emailExists": "Ein Konto mit dieser E-Mail existiert bereits",
    "weakPassword": "Das Passwort muss mindestens 8 Zeichen mit Groß-, Kleinbuchstaben und Zahlen enthalten",
    "passwordsDoNotMatch": "Passwörter stimmen nicht überein"
  },
  "passwordWall": {
    "title": "Passwort erforderlich",
    "description": "Diese Anwendung ist geschützt. Bitte geben Sie das Zugangspasswort ein, um fortzufahren.",
    "password": "Passwort",
    "enterPassword": "Passwort eingeben",
    "accessApplication": "Anwendung zugreifen",
    "loading": "Lädt...",
    "logout": "Abmelden",
    "incorrectPassword": "Falsches Passwort"
  },
  "verification": {
    "title": "E-Mail bestätigen",
    "subtitle": "Wir haben einen Bestätigungslink an Ihre E-Mail-Adresse gesendet",
    "instructions": "Bitte überprüfen Sie Ihre E-Mails und klicken Sie auf den Bestätigungslink, um Ihr Konto zu aktivieren.",
    "resendEmail": "Bestätigungs-E-Mail erneut senden",
    "emailSent": "Bestätigungs-E-Mail gesendet",
    "changeEmail": "E-Mail-Adresse ändern",
    "verifying": "Wird bestätigt...",
    "verified": "E-Mail erfolgreich bestätigt",
    "verificationFailed": "Bestätigung fehlgeschlagen. Bitte versuchen Sie es erneut.",
    "linkExpired": "Der Bestätigungslink ist abgelaufen. Bitte fordern Sie einen neuen an."
  },
  "resetPassword": {
    "title": "Passwort zurücksetzen",
    "subtitle": "Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Reset-Link",
    "email": "E-Mail-Adresse",
    "emailPlaceholder": "Geben Sie Ihre E-Mail-Adresse ein",
    "sendResetLink": "Reset-Link senden",
    "backToLogin": "Zurück zur Anmeldung",
    "emailSent": "E-Mail zum Zurücksetzen des Passworts gesendet",
    "emailNotFound": "Kein Konto mit dieser E-Mail-Adresse gefunden",
    "resetLinkExpired": "Der Reset-Link ist abgelaufen. Bitte fordern Sie einen neuen an.",
    "passwordResetSuccess": "Passwort erfolgreich zurückgesetzt"
  },
  "security": {
    "certifications": "Zertifizierungen",
    "compliance": "Compliance",
    "features": "Funktionen",
    "loginAlert": {
      "action1": "Aktion1",
      "action2": "Aktion2",
      "action3": "Aktion3",
      "details": "Details",
      "device": "Gerät",
      "headline": "Überschrift",
      "location": "Standort",
      "message": "Nachricht",
      "notYou": "Nicht Sie",
      "supportContact": "Support-Kontakt",
      "time": "Zeit",
      "wasYou": "War das Sie"
    },
    "sectionSubtitle": "Abschnitt-Untertitel",
    "sectionTitle": "Abschnitt-Titel",
    "subtitle": "Untertitel",
    "title": "Titel"
  }
};

function main() {
  const targetPath = path.join(__dirname, '../src/i18n/locales/de/auth.json');
  
  try {
    // Write the German translations
    fs.writeFileSync(targetPath, JSON.stringify(GERMAN_TRANSLATIONS, null, 2), 'utf8');
    console.log('✓ Successfully created German auth.json translations');
  } catch (error) {
    console.error('✗ Error creating German auth.json:', error.message);
  }
}

if (require.main === module) {
  main();
}
