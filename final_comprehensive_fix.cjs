const fs = require('fs');
const path = require('path');

// Comprehensive translation mappings for all remaining English terms
const translations = {
  'Your Trusted Circle': {
    'me': 'Vaš krug poverenja',
    'hu': 'Az Ön megbízható köre',
    'tr': 'Güvenilir Çevreniz',
    'lt': 'Jūsų patikimasis ratas',
    'es': 'Su Círculo de Confianza'
  },
  'Create New Message': {
    'me': 'Kreiraj novu poruku',
    'hu': 'Új üzenet létrehozása',
    'tr': 'Yeni Mesaj Oluştur',
    'lt': 'Sukurti naują žinutę',
    'es': 'Crear Nuevo Mensaje'
  },
  'Date not set': {
    'me': 'Datum nije postavljen',
    'hu': 'Dátum nincs beállítva',
    'tr': 'Tarih ayarlanmamış',
    'lt': 'Data nenustatyta',
    'es': 'Fecha no establecida'
  },
  'Premium subscription required': {
    'me': 'Potrebna je premium pretplata',
    'hu': 'Prémium előfizetés szükséges',
    'tr': 'Premium abonelik gerekli',
    'lt': 'Reikalinga premium prenumerata',
    'es': 'Se requiere suscripción premium',
    'fr': 'Abonnement premium requis',
    'et': 'Premium tellimus on vajalik',
    'de': 'Premium-Abonnement erforderlich',
    'fi': 'Premium-tilaus vaaditaan'
  },
  'The LegacyGuard Team': {
    'me': 'LegacyGuard tim',
    'hu': 'A LegacyGuard csapat',
    'tr': 'LegacyGuard Ekibi',
    'lt': 'LegacyGuard komanda',
    'es': 'El Equipo de LegacyGuard'
  },
  'Sleep Better Tonight': {
    'me': 'Spavaj bolje večeras',
    'hu': 'Aludj jobban ma este',
    'tr': 'Bu Gece Daha İyi Uyu',
    'lt': 'Geriau miegok šį vakarą',
    'es': 'Duerme Mejor Esta Noche'
  },
  'No Frantic Searching': {
    'me': 'Bez mahnitog traženja',
    'hu': 'Nincs kétségbeesett keresés',
    'tr': 'Çılgınca Arama Yok',
    'lt': 'Nėra panikos paieškos',
    'es': 'Sin Búsquedas Frenéticas'
  },
  'Your Trusted Helpers': {
    'fr': 'Vos Aides de Confiance'
  },
  'Terms of Service': {
    'fr': 'Conditions de Service'
  },
  'Mark as Renewed': {
    'fr': 'Marquer comme Renouvelé',
    'de': 'Als erneuert markieren',
    'fi': 'Merkitse uusituksi'
  },
  'Contact Us': {
    'lt': 'Susisiekite su Mumis',
    'de': 'Kontaktieren Sie uns'
  },
  'Help and Support': {
    'lt': 'Pagalba ir Palaikymas'
  },
  'Help & Support': {
    'fr': 'Aide et Support',
    'et': 'Abi ja tugi',
    'fi': 'Ohje ja tuki'
  },
  'Guardian Network': {
    'es': 'Red de Guardianes'
  },
  'Help Center': {
    'es': 'Centro de Ayuda'
  },
  'European Families': {
    'et': 'Loodud Euroopa peredele'
  },
  'GDPR Compliant': {
    'fi': 'Rakennettu eurooppalaisilla perhearvoilla'
  },
  'No Time Capsules Yet': {
    'et': 'Ajakapsleid pole veel',
    'de': 'Noch keine Zeitkapseln'
  },
  'Successfully Deleted': {
    'et': 'Ajakapsel edukalt kustutatud',
    'fi': 'Aikakapseli poistettu onnistuneesti'
  },
  'Your Final Wishes': {
    'et': 'Teie viimased soovid',
    'fi': 'Viimeiset toiveesi'
  },
  'Secure Cloud Storage': {
    'et': 'Turvaline pilvesalvestus',
    'fi': 'Turvallinen pilvitallennus'
  },
  'Personal Stories': {
    'et': 'Isiklikud lood'
  },
  'View Demo': {
    'et': 'Vaata demo'
  },
  'No Hectic Searching': {
    'de': 'Kein hektisches Suchen'
  },
  'Network of Trusted People': {
    'de': 'Netzwerk von Vertrauenspersonen'
  },
  'Time-Locked Access': {
    'de': 'Zeitlich gesperrter Zugriff'
  },
  'Renewal Instructions': {
    'de': 'Anweisungen zur Erneuerung',
    'me': 'Uputstva za obnovu',
    'lt': 'Atnaujinimo Instrukcijos'
  },
  'Expires Soon': {
    'lt': 'Greitai baigsis galiojimas'
  },
  'Expired': {
    'lt': 'Nustojo galioti'
  },
  'Alert Center': {
    'me': 'Centar za upozorenja',
    'hr': 'Centar za upozorenja'
  },
  'Accepted Responsibility': {
    'hr': 'Prihvatio je odgovornost',
    'cy': 'Wedi derbyn cyfrifoldeb'
  },
  'Create New Message': {
    'hr': 'Stvori novu poruku',
    'de': 'Neue Nachricht erstellen',
    'fi': 'Luo uusi viesti'
  },
  'Date Not Set': {
    'hr': 'Datum nije postavljen',
    'de': 'Datum nicht gesetzt'
  },
  'People You Trust': {
    'hr': 'Ljudi kojima vjerujete'
  },
  'Sleep Better Tonight': {
    'hr': 'Spavaj bolje večeras'
  },
  'No Frantic Searching': {
    'hr': 'Bez mahnitog traženja'
  },
  'Renewal Instructions': {
    'hr': 'Upute za obnovu'
  },
  'Your Trusted Circle': {
    'cy': 'Eich cylch ymddiried'
  },
  'Create New Message': {
    'cy': 'Creu neges newydd'
  },
  'No Messages Yet': {
    'cy': 'Dim negeseuon eto'
  },
  'Legacy Briefing': {
    'cy': 'Briffio etifeddiaeth'
  },
  'No Recipients': {
    'cy': 'Dim derbynwyr'
  },
  'Text Message': {
    'cy': 'Neges destun'
  },
  'Photo Message': {
    'cy': 'Neges ffotograff'
  },
  'Video Message': {
    'cy': 'Neges fideo'
  },
  'Audio Message': {
    'cy': 'Neges sain'
  },
  'Password Weak': {
    'cy': 'Cyfrinair gwan'
  },
  'Password Strong': {
    'cy': 'Cyfrinair cryf'
  },
  'Select Option': {
    'cy': 'Dewiswch opsiwn'
  },
  'Confirm Delete': {
    'cy': 'Cadarnhau dileu'
  },
  'Confirm Action': {
    'cy': 'Cadarnhau gweithred'
  },
  'Per Page': {
    'cy': 'fesul tudalen'
  },
  'Current Page': {
    'cy': 'Tudalen gyfredol'
  },
  'Total Pages': {
    'cy': 'Cyfanswm tudalennau'
  },
  'First Page': {
    'cy': 'Tudalen gyntaf'
  },
  'Last Page': {
    'cy': 'Tudalen olaf'
  },
  'Date Range': {
    'cy': 'Ystod dyddiad'
  },
  'Main Content': {
    'cy': 'Cynnwys prif'
  },
  'Needs Attention': {
    'cy': 'Angen sylw'
  }
};

function fixFile(filePath, langCode) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix each English term
    for (const [englishTerm, langTranslations] of Object.entries(translations)) {
      if (langTranslations[langCode]) {
        const regex = new RegExp(`"([^"]*)"\\s*:\\s*"${englishTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, `"$1": "${langTranslations[langCode]}"`);
          modified = true;
          console.log(`Fixed "${englishTerm}" → "${langTranslations[langCode]}" in ${filePath}`);
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory() {
  const localesDir = path.join(__dirname, 'src', 'i18n', 'locales');
  
  if (!fs.existsSync(localesDir)) {
    console.error('Locales directory not found');
    return;
  }

  const languageDirs = fs.readdirSync(localesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(name => name !== '_backup_original_common' && name !== 'en'); // Skip backup and English

  let totalFixed = 0;

  for (const langCode of languageDirs) {
    const uiFilePath = path.join(localesDir, langCode, 'ui.json');
    
    if (fs.existsSync(uiFilePath)) {
      if (fixFile(uiFilePath, langCode)) {
        totalFixed++;
      }
    }
  }

  console.log(`\n✅ Final comprehensive fix: Updated ${totalFixed} language files`);
}

processDirectory(); 