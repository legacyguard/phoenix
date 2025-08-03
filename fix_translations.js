const fs = require('fs');
const path = require('path');

// Translation mappings for technical terms
const translations = {
  'Test Environment Only': {
    'bg': 'Само за тестова среда',
    'cs': 'Pouze pro testovací prostředí',
    'da': 'Kun for testmiljø',
    'el': 'Μόνο για περιβάλλον δοκιμών',
    'et': 'Ainult testkeskkond',
    'fi': 'Vain testiympäristö',
    'ga': 'Amháin don timpeallacht tástála',
    'hr': 'Samo za testno okruženje',
    'hu': 'Csak tesztkörnyezet',
    'is': 'Aðeins fyrir prófunarumhverfi',
    'lt': 'Tik testavimo aplinkai',
    'lv': 'Tikai testēšanas videi',
    'me': 'Samo za testno okruženje',
    'mk': 'Само за тестна средина',
    'mt': 'Biss għall-ambjent tat-test',
    'nl': 'Alleen voor testomgeving',
    'no': 'Kun for testmiljø',
    'pl': 'Tylko dla środowiska testowego',
    'pt': 'Apenas para ambiente de teste',
    'ro': 'Doar pentru mediu de test',
    'ru': 'Только для тестовой среды',
    'sl': 'Samo za testno okolje',
    'sq': 'Vetëm për mjedisin e testimit',
    'sr': 'Само за тестно окружење',
    'sv': 'Endast för testmiljö',
    'tr': 'Sadece test ortamı için',
    'uk': 'Тільки для тестового середовища'
  },
  'This page is for testing the error logging system. Remove this route before deploying to production.': {
    'bg': 'Тази страница е за тестване на системата за регистриране на грешки. Премахнете този маршрут преди да го разположите в продукция.',
    'cs': 'Tato stránka slouží k testování systému logování chyb. Odstraňte tuto trasu před nasazením do produkce.',
    'da': 'Denne side er til test af fejlprotokollering. Fjern denne rute før du udruller til produktion.',
    'el': 'Αυτή η σελίδα είναι για τη δοκιμή του συστήματος καταγραφής σφαλμάτων. Αφαιρέστε αυτή τη διαδρομή πριν από την ανάπτυξη στην παραγωγή.',
    'et': 'See leht on veateate süsteemi testimiseks. Eemaldage see marsruut enne tootmiskeskkonda juurutamist.',
    'fi': 'Tämä sivu on virheiden kirjaamisen testaamiseen. Poista tämä reitti ennen tuotantoon viemistä.',
    'ga': 'Tá an leathanach seo chun an córas logála earráidí a thástáil. Bain an bealach seo sula ndéanann tú é a chur i bhfeidhm sa táirgeacht.',
    'hr': 'Ova stranica je za testiranje sustava za bilježenje grešaka. Uklonite ovu rutu prije implementacije u produkciju.',
    'hu': 'Ez az oldal a hibanaplózási rendszer tesztelésére szolgál. Távolítsa el ezt az útvonalat a termelési környezetbe való telepítés előtt.',
    'is': 'Þessi síða er til að prófa villuskráningarkerfið. Fjarlægðu þessa leið áður en þú setur í framleiðslu.',
    'lt': 'Šis puslapis skirtas klaidų registravimo sistemos testavimui. Pašalinkite šį maršrutą prieš diegiant į gamybą.',
    'lv': 'Šī lapa ir paredzēta kļūdu reģistrēšanas sistēmas testēšanai. Noņemiet šo maršrutu pirms izvietošanas ražošanā.',
    'me': 'Ova stranica je za testiranje sustava za bilježenje grešaka. Uklonite ovu rutu prije implementacije u produkciju.',
    'mk': 'Оваа страница е за тестирање на системот за евидентирање грешки. Отстранете ја оваа рута пред да се постави во производство.',
    'mt': 'Din il-paġna hija għat-test tas-sistema ta\' reġistrazzjoni ta\' żbalji. Neħħi din ir-rotta qabel ma tdeploy fil-produzzjoni.',
    'nl': 'Deze pagina is voor het testen van het foutlogboekingssysteem. Verwijder deze route voordat u naar productie implementeert.',
    'no': 'Denne siden er for testing av feilloggingssystemet. Fjern denne ruten før du ruller ut til produksjon.',
    'pl': 'Ta strona służy do testowania systemu logowania błędów. Usuń tę trasę przed wdrożeniem do produkcji.',
    'pt': 'Esta página é para testar o sistema de registro de erros. Remova esta rota antes de implantar na produção.',
    'ro': 'Această pagină este pentru testarea sistemului de înregistrare a erorilor. Eliminați această rută înainte de a implementa în producție.',
    'ru': 'Эта страница предназначена для тестирования системы логирования ошибок. Удалите этот маршрут перед развертыванием в продакшене.',
    'sl': 'Ta stran je za testiranje sistema za beleženje napak. Odstranite to pot pred uvajanjem v produkcijo.',
    'sq': 'Kjo faqe është për testimin e sistemit të regjistrimit të gabimeve. Hiqni këtë rrugë para se të vendosni në prodhim.',
    'sr': 'Ова страница је за тестирање система за бележење грешака. Уклоните ову руту пре имплементације у продукцију.',
    'sv': 'Denna sida är för att testa felregistreringssystemet. Ta bort denna rutt innan du distribuerar till produktion.',
    'tr': 'Bu sayfa hata günlüğü sistemini test etmek içindir. Üretime dağıtmadan önce bu rotayı kaldırın.',
    'uk': 'Ця сторінка призначена для тестування системи логування помилок. Видаліть цей маршрут перед розгортанням у продакшні.'
  },
  'User Agent:': {
    'bg': 'Потребителски агент:',
    'cs': 'Uživatelský agent:',
    'da': 'Bruger-agent:',
    'el': 'Πράκτορας χρήστη:',
    'et': 'Kasutaja agent:',
    'fi': 'Käyttäjäagentti:',
    'ga': 'Gníomhaire úsáideora:',
    'hr': 'Korisnički agent:',
    'hu': 'Felhasználói ügynök:',
    'is': 'Notendaþjónn:',
    'lt': 'Vartotojo agentas:',
    'lv': 'Lietotāja aģents:',
    'me': 'Korisnički agent:',
    'mk': 'Кориснички агент:',
    'mt': 'Aġent tal-utent:',
    'nl': 'Gebruikersagent:',
    'no': 'Bruker-agent:',
    'pl': 'Agent użytkownika:',
    'pt': 'Agente do usuário:',
    'ro': 'Agent utilizator:',
    'ru': 'Пользовательский агент:',
    'sl': 'Uporabniški agent:',
    'sq': 'Agjenti i përdoruesit:',
    'sr': 'Кориснички агент:',
    'sv': 'Användaragent:',
    'tr': 'Kullanıcı aracısı:',
    'uk': 'Агент користувача:'
  },
  'Viewport:': {
    'bg': 'Област на изгледа:',
    'cs': 'Oblast zobrazení:',
    'da': 'Visningsområde:',
    'el': 'Περιοχή προβολής:',
    'et': 'Vaateala:',
    'fi': 'Näkymäalue:',
    'ga': 'Limistéar amhairc:',
    'hr': 'Područje prikaza:',
    'hu': 'Nézeti terület:',
    'is': 'Sýnarsvæði:',
    'lt': 'Rodymo sritis:',
    'lv': 'Skata laukums:',
    'me': 'Područje prikaza:',
    'mk': 'Подрачје на приказ:',
    'mt': 'Żona tal-wiri:',
    'nl': 'Weergavegebied:',
    'no': 'Visningsområde:',
    'pl': 'Obszar widoku:',
    'pt': 'Área de visualização:',
    'ro': 'Zona de vizualizare:',
    'ru': 'Область просмотра:',
    'sl': 'Območje pogleda:',
    'sq': 'Zona e pamjes:',
    'sr': 'Подручје приказа:',
    'sv': 'Visningsområde:',
    'tr': 'Görünüm alanı:',
    'uk': 'Область перегляду:'
  }
};

// Priority level translations
const priorityTranslations = {
  'High': {
    'bg': 'Високо',
    'cs': 'Vysoká',
    'da': 'Høj',
    'el': 'Υψηλή',
    'et': 'Kõrge',
    'fi': 'Korkea',
    'ga': 'Ard',
    'hr': 'Visoko',
    'hu': 'Magas',
    'is': 'Há',
    'lt': 'Aukštas',
    'lv': 'Augsts',
    'me': 'Visoko',
    'mk': 'Високо',
    'mt': 'Għoli',
    'nl': 'Hoog',
    'no': 'Høy',
    'pl': 'Wysoki',
    'pt': 'Alto',
    'ro': 'Ridicat',
    'ru': 'Высокий',
    'sl': 'Visok',
    'sq': 'I lartë',
    'sr': 'Високо',
    'sv': 'Hög',
    'tr': 'Yüksek',
    'uk': 'Високий'
  },
  'Medium': {
    'bg': 'Средно',
    'cs': 'Střední',
    'da': 'Medium',
    'el': 'Μεσαία',
    'et': 'Keskmine',
    'fi': 'Keskitaso',
    'ga': 'Measartha',
    'hr': 'Srednje',
    'hu': 'Közepes',
    'is': 'Miðlungs',
    'lt': 'Vidutinis',
    'lv': 'Vidējs',
    'me': 'Srednje',
    'mk': 'Средно',
    'mt': 'Medju',
    'nl': 'Gemiddeld',
    'no': 'Medium',
    'pl': 'Średni',
    'pt': 'Médio',
    'ro': 'Mediu',
    'ru': 'Средний',
    'sl': 'Srednji',
    'sq': 'Mesatar',
    'sr': 'Средње',
    'sv': 'Medel',
    'tr': 'Orta',
    'uk': 'Середній'
  },
  'Low': {
    'bg': 'Ниско',
    'cs': 'Nízká',
    'da': 'Lav',
    'el': 'Χαμηλή',
    'et': 'Madal',
    'fi': 'Matala',
    'ga': 'Íseal',
    'hr': 'Nisko',
    'hu': 'Alacsony',
    'is': 'Lágt',
    'lt': 'Žemas',
    'lv': 'Zems',
    'me': 'Nisko',
    'mk': 'Ниско',
    'mt': 'Baxx',
    'nl': 'Laag',
    'no': 'Lav',
    'pl': 'Niski',
    'pt': 'Baixo',
    'ro': 'Scăzut',
    'ru': 'Низкий',
    'sl': 'Nizek',
    'sq': 'I ulët',
    'sr': 'Ниско',
    'sv': 'Låg',
    'tr': 'Düşük',
    'uk': 'Низький'
  }
};

// Task status translations
const taskStatusTranslations = {
  'Available': {
    'bg': 'Наличен',
    'cs': 'Dostupné',
    'da': 'Tilgængelig',
    'el': 'Διαθέσιμο',
    'et': 'Saadaval',
    'fi': 'Saatavilla',
    'ga': 'Ar fáil',
    'hr': 'Dostupno',
    'hu': 'Elérhető',
    'is': 'Í boði',
    'lt': 'Prieinama',
    'lv': 'Pieejams',
    'me': 'Dostupno',
    'mk': 'Достапно',
    'mt': 'Disponibbli',
    'nl': 'Beschikbaar',
    'no': 'Tilgjengelig',
    'pl': 'Dostępne',
    'pt': 'Disponível',
    'ro': 'Disponibil',
    'ru': 'Доступно',
    'sl': 'Na voljo',
    'sq': 'I disponueshëm',
    'sr': 'Доступно',
    'sv': 'Tillgänglig',
    'tr': 'Mevcut',
    'uk': 'Доступно'
  },
  'In Progress': {
    'bg': 'В процес',
    'cs': 'Probíhá',
    'da': 'I gang',
    'el': 'Σε εξέλιξη',
    'et': 'Pooleli',
    'fi': 'Kesken',
    'ga': 'Ar siúl',
    'hr': 'U tijeku',
    'hu': 'Folyamatban',
    'is': 'Í gangi',
    'lt': 'Vykdoma',
    'lv': 'Procesā',
    'me': 'U tijeku',
    'mk': 'Во тек',
    'mt': 'Fil-progress',
    'nl': 'In uitvoering',
    'no': 'Under arbeid',
    'pl': 'W toku',
    'pt': 'Em andamento',
    'ro': 'În curs',
    'ru': 'В процессе',
    'sl': 'V teku',
    'sq': 'Në proces',
    'sr': 'У току',
    'sv': 'Pågående',
    'tr': 'Devam ediyor',
    'uk': 'У процесі'
  },
  'Completed': {
    'bg': 'Завършено',
    'cs': 'Dokončeno',
    'da': 'Gennemført',
    'el': 'Ολοκληρωμένο',
    'et': 'Lõpetatud',
    'fi': 'Valmis',
    'ga': 'Críochnaithe',
    'hr': 'Završeno',
    'hu': 'Befejezett',
    'is': 'Lokið',
    'lt': 'Baigta',
    'lv': 'Pabeigts',
    'me': 'Završeno',
    'mk': 'Завршено',
    'mt': 'Imtella',
    'nl': 'Voltooid',
    'no': 'Fullført',
    'pl': 'Zakończone',
    'pt': 'Concluído',
    'ro': 'Finalizat',
    'ru': 'Завершено',
    'sl': 'Dokončano',
    'sq': 'Përfunduar',
    'sr': 'Завршено',
    'sv': 'Slutfört',
    'tr': 'Tamamlandı',
    'uk': 'Завершено'
  },
  'Skipped': {
    'bg': 'Пропуснато',
    'cs': 'Přeskočeno',
    'da': 'Sprunget over',
    'el': 'Παραλείφθηκε',
    'et': 'Vahele jäetud',
    'fi': 'Ohitettu',
    'ga': 'Scipeáilte',
    'hr': 'Preskočeno',
    'hu': 'Kihagyott',
    'is': 'Sleppt',
    'lt': 'Praleista',
    'lv': 'Izlaists',
    'me': 'Preskočeno',
    'mk': 'Прескокнато',
    'mt': 'Maqbula',
    'nl': 'Overgeslagen',
    'no': 'Hoppet over',
    'pl': 'Pominięte',
    'pt': 'Ignorado',
    'ro': 'Sărit',
    'ru': 'Пропущено',
    'sl': 'Preskočeno',
    'sq': 'Anashkruar',
    'sr': 'Прескочено',
    'sv': 'Överhoppat',
    'tr': 'Atlandı',
    'uk': 'Пропущено'
  }
};

function fixFile(filePath, langCode) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix technical terms
    for (const [english, langTranslations] of Object.entries(translations)) {
      if (langTranslations[langCode]) {
        const regex = new RegExp(`"${english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
        if (content.includes(english)) {
          content = content.replace(regex, `"${langTranslations[langCode]}"`);
          modified = true;
        }
      }
    }

    // Fix priority levels
    for (const [english, langTranslations] of Object.entries(priorityTranslations)) {
      if (langTranslations[langCode]) {
        const regex = new RegExp(`"${english}"`, 'g');
        if (content.includes(`"${english}"`)) {
          content = content.replace(regex, `"${langTranslations[langCode]}"`);
          modified = true;
        }
      }
    }

    // Fix task status
    for (const [english, langTranslations] of Object.entries(taskStatusTranslations)) {
      if (langTranslations[langCode]) {
        const regex = new RegExp(`"${english}"`, 'g');
        if (content.includes(`"${english}"`)) {
          content = content.replace(regex, `"${langTranslations[langCode]}"`);
          modified = true;
        }
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function processDirectory() {
  const localesDir = path.join(__dirname, 'src', 'i18n', 'locales');
  
  if (!fs.existsSync(localesDir)) {
    console.error('Locales directory not found');
    return;
  }

  const languages = fs.readdirSync(localesDir)
    .filter(dir => fs.statSync(path.join(localesDir, dir)).isDirectory())
    .filter(dir => dir.length === 2 && /^[a-z]{2}$/.test(dir));

  console.log('Processing languages:', languages);

  for (const lang of languages) {
    const langDir = path.join(localesDir, lang);
    const files = fs.readdirSync(langDir).filter(file => file.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(langDir, file);
      fixFile(filePath, lang);
    }
  }

  console.log('Translation fixes completed!');
}

processDirectory(); 