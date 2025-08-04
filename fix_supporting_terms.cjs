const fs = require('fs');
const path = require('path');

// Translation mappings for supporting terms
const translations = {
  'Data We Collect': {
    'lt': 'Duomenys, kuriuos renkame',
    'mt': 'Id-data li niġbru',
    'sq': 'Të dhënat që mbledhim',
    'ru': 'Данные, которые мы собираем'
  },
  'Request data deletion': {
    'lt': 'Prašyti duomenų ištrynimo',
    'mt': 'Talba għat-tħassir tad-data',
    'sq': 'Kërko fshirjen e të dhënave',
    'ru': 'Запросить удаление данных'
  },
  'Remember your preferences': {
    'lt': 'Prisiminti jūsų nuostatas',
    'mt': 'Ftakar preferenzi tiegħek',
    'sq': 'Mbani mend preferencat tuaja',
    'ru': 'Запоминать ваши предпочтения'
  },
  'Feature usage statistics': {
    'lt': 'Funkcijų naudojimo statistika',
    'mt': 'Statistika tal-użu tal-karatteristiċi',
    'sq': 'Statistikat e përdorimit të veçorive',
    'ru': 'Статистика использования функций'
  },
  'Site performance metrics': {
    'lt': 'Svetainės veikimo metrika',
    'mt': 'Metriki tal-prestazzjoni tas-sit',
    'sq': 'Metrikat e performancës së faqes',
    'ru': 'Метрики производительности сайта'
  },
  'Consent given on': {
    'lt': 'Sutikimas suteiktas',
    'mt': 'Kunsens mogħti fuq',
    'sq': 'Pëlqimi i dhënë më',
    'ru': 'Согласие дано'
  },
  'Withdraw All Consent': {
    'lt': 'Atšaukti visą sutikimą',
    'mt': 'Irritira l-Kunsens Kollu',
    'sq': 'Tërhiq të gjithë pëlqimin',
    'ru': 'Отозвать все согласия'
  },
  'Default Document Processing': {
    'lt': 'Numatytasis dokumentų apdorojimas',
    'mt': 'Ipproċessar tad-dokumenti Default',
    'sq': 'Përpunimi i paracaktuar i dokumenteve',
    'ru': 'Обработка документов по умолчанию'
  },
  'Automatic Data Deletion': {
    'lt': 'Automatinis duomenų ištrynimas',
    'mt': 'Tħassir Awtomatiku tad-Data',
    'sq': 'Fshirja automatike e të dhënave',
    'ru': 'Автоматическое удаление данных'
  },
  'AI Assistant Features': {
    'lt': 'AI asistento funkcijos',
    'mt': 'Karatteristiċi tal-Assistent AI',
    'sq': 'Veçoritë e Asistentit AI',
    'ru': 'Функции ИИ-ассистента'
  },
  'Save Privacy Settings': {
    'lt': 'Išsaugoti privatumo nustatymus',
    'mt': 'Isalva l-Isettings tal-Privatezza',
    'sq': 'Ruaj cilësimet e privatësisë',
    'ru': 'Сохранить настройки конфиденциальности'
  },
  'Error loading settings': {
    'lt': 'Klaida įkeliant nustatymus',
    'mt': 'Żball fl-igħabbiar tal-settings',
    'sq': 'Gabim në ngarkimin e cilësimeve',
    'ru': 'Ошибка загрузки настроек'
  },
  'Error saving settings': {
    'lt': 'Klaida išsaugant nustatymus',
    'mt': 'Żball fis-salvazzjoni tal-settings',
    'sq': 'Gabim në ruajtjen e cilësimeve',
    'ru': 'Ошибка сохранения настроек'
  },
  'Enhanced with AI': {
    'lt': 'Patobulinta su AI',
    'mt': 'Mtejjeb bl-AI',
    'sq': 'Përmirësuar me AI',
    'ru': 'Улучшено с помощью ИИ'
  },
  'All processing local': {
    'lt': 'Visi apdorojimai vietiniai',
    'mt': 'Ipproċessar kollu lokali',
    'sq': 'Të gjitha përpunimet lokale',
    'ru': 'Вся обработка локальная'
  },
  'AI assistance enabled': {
    'lt': 'AI pagalba įjungta',
    'mt': 'Assistenza AI ppermettiet',
    'sq': 'Ndihma AI e aktivizuar',
    'ru': 'Помощь ИИ включена'
  },
  'Local Processing Active': {
    'lt': 'Vietinis apdorojimas aktyvus',
    'mt': 'Ipproċessar Lokali Attiv',
    'sq': 'Përpunimi lokal aktiv',
    'ru': 'Локальная обработка активна'
  },
  'Cloud Processing Active': {
    'lt': 'Debesų apdorojimas aktyvus',
    'mt': 'Ipproċessar tas-Sħaba Attiv',
    'sq': 'Përpunimi në re aktive',
    'ru': 'Облачная обработка активна'
  },
  'Local processing mode': {
    'lt': 'Vietinio apdorojimo režimas',
    'mt': 'Modalità ta\' ipproċessar lokali',
    'sq': 'Modaliteti i përpunimit lokal',
    'ru': 'Режим локальной обработки'
  },
  'Cloud processing mode': {
    'lt': 'Debesų apdorojimo režimas',
    'mt': 'Modalità ta\' ipproċessar tas-sħaba',
    'sq': 'Modaliteti i përpunimit në re',
    'ru': 'Режим облачной обработки'
  },
  'Secure Cloud Storage': {
    'lt': 'Saugus debesų saugykla',
    'mt': 'Ħażna tas-Sħaba Sigura',
    'sq': 'Depozitim i sigurt në re',
    'ru': 'Безопасное облачное хранилище'
  },
  'European Data Centers': {
    'lt': 'Europos duomenų centrai',
    'mt': 'Ċentri tad-Data Ewropej',
    'sq': 'Qendrat e të dhënave evropiane',
    'ru': 'Европейские центры обработки данных'
  }
};

function fixFile(filePath, langCode) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

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
    .filter(name => name !== '_backup_original_common' && name !== 'en');

  let totalFixed = 0;

  for (const langCode of languageDirs) {
    const authFilePath = path.join(localesDir, langCode, 'auth.json');
    
    if (fs.existsSync(authFilePath)) {
      if (fixFile(authFilePath, langCode)) {
        totalFixed++;
      }
    }
  }

  console.log(`\n✅ Fixed supporting terms in ${totalFixed} language files`);
}

processDirectory(); 