const fs = require('fs');
const path = require('path');

// Define the notfound translations for each language
const notfoundTranslations = {
  'en': {
    "title": "Page Not Found",
    "description": "The page you're looking for doesn't exist or has been moved.",
    "goHome": "Go Home",
    "goBack": "Go Back"
  },
  'sk': {
    "title": "Stránka nenájdená",
    "description": "Stránka, ktorú hľadáte, neexistuje alebo bola presunutá.",
    "goHome": "Ísť domov",
    "goBack": "Späť"
  },
  'cs': {
    "title": "Stránka nenalezena",
    "description": "Stránka, kterou hledáte, neexistuje nebo byla přesunuta.",
    "goHome": "Jít domů",
    "goBack": "Zpět"
  },
  'de': {
    "title": "Seite nicht gefunden",
    "description": "Die gesuchte Seite existiert nicht oder wurde verschoben.",
    "goHome": "Zur Startseite",
    "goBack": "Zurück"
  },
  'fr': {
    "title": "Page non trouvée",
    "description": "La page que vous recherchez n'existe pas ou a été déplacée.",
    "goHome": "Accueil",
    "goBack": "Retour"
  },
  'es': {
    "title": "Página no encontrada",
    "description": "La página que buscas no existe o ha sido movida.",
    "goHome": "Ir al inicio",
    "goBack": "Volver"
  },
  'it': {
    "title": "Pagina non trovata",
    "description": "La pagina che stai cercando non esiste o è stata spostata.",
    "goHome": "Vai alla home",
    "goBack": "Indietro"
  },
  'pl': {
    "title": "Strona nie została znaleziona",
    "description": "Strona, której szukasz, nie istnieje lub została przeniesiona.",
    "goHome": "Idź do strony głównej",
    "goBack": "Wstecz"
  },
  'ru': {
    "title": "Страница не найдена",
    "description": "Страница, которую вы ищете, не существует или была перемещена.",
    "goHome": "На главную",
    "goBack": "Назад"
  },
  'uk': {
    "title": "Сторінку не знайдено",
    "description": "Сторінка, яку ви шукаєте, не існує або була переміщена.",
    "goHome": "На головну",
    "goBack": "Назад"
  },
  'bg': {
    "title": "Страницата не е намерена",
    "description": "Страницата, която търсите, не съществува или е преместена.",
    "goHome": "Към началната страница",
    "goBack": "Назад"
  },
  'hr': {
    "title": "Stranica nije pronađena",
    "description": "Stranica koju tražite ne postoji ili je premještena.",
    "goHome": "Idi na početnu",
    "goBack": "Natrag"
  },
  'sl': {
    "title": "Stran ni najdena",
    "description": "Stran, ki jo iščete, ne obstaja ali je bila premaknjena.",
    "goHome": "Pojdi na domačo stran",
    "goBack": "Nazaj"
  },
  'sr': {
    "title": "Страница није пронађена",
    "description": "Страница коју тражите не постоји или је премештена.",
    "goHome": "Иди на почетну",
    "goBack": "Назад"
  },
  'mk': {
    "title": "Страницата не е пронајдена",
    "description": "Страницата што ја барате не постои или е преместена.",
    "goHome": "Оди на почетна",
    "goBack": "Назад"
  },
  'sq': {
    "title": "Faqja nuk u gjet",
    "description": "Faqja që po kërkoni nuk ekziston ose është zhvendosur.",
    "goHome": "Shko në shtëpi",
    "goBack": "Kthehu"
  },
  'bs': {
    "title": "Stranica nije pronađena",
    "description": "Stranica koju tražite ne postoji ili je premještena.",
    "goHome": "Idi na početnu",
    "goBack": "Nazad"
  },
  'me': {
    "title": "Stranica nije pronađena",
    "description": "Stranica koju tražite ne postoji ili je premještena.",
    "goHome": "Idi na početnu",
    "goBack": "Nazad"
  },
  'cnr': {
    "title": "Stranica nije pronađena",
    "description": "Stranica koju tražite ne postoji ili je premještena.",
    "goHome": "Idi na početnu",
    "goBack": "Nazad"
  },
  'da': {
    "title": "Side ikke fundet",
    "description": "Siden du leder efter eksisterer ikke eller er blevet flyttet.",
    "goHome": "Gå til startside",
    "goBack": "Tilbage"
  },
  'sv': {
    "title": "Sidan hittades inte",
    "description": "Sidan du letar efter finns inte eller har flyttats.",
    "goHome": "Gå till startsidan",
    "goBack": "Tillbaka"
  },
  'no': {
    "title": "Side ikke funnet",
    "description": "Siden du leter etter eksisterer ikke eller er flyttet.",
    "goHome": "Gå til hjemmeside",
    "goBack": "Tilbake"
  },
  'fi': {
    "title": "Sivua ei löytynyt",
    "description": "Etsimääsi sivua ei ole olemassa tai se on siirretty.",
    "goHome": "Mene etusivulle",
    "goBack": "Takaisin"
  },
  'is': {
    "title": "Síða fannst ekki",
    "description": "Síðan sem þú ert að leita að er ekki til eða hefur verið flutt.",
    "goHome": "Fara á forsíðu",
    "goBack": "Til baka"
  },
  'fo': {
    "title": "Síða fannst ikki",
    "description": "Síðan tú leitar eftir er ikki til ella er flutt.",
    "goHome": "Fara til forsíðu",
    "goBack": "Aftur"
  },
  'et': {
    "title": "Lehte ei leitud",
    "description": "Otsitav leht pole olemas või on teisaldatud.",
    "goHome": "Mine avalehele",
    "goBack": "Tagasi"
  },
  'lv': {
    "title": "Lapa nav atrasta",
    "description": "Meklētā lapa neeksistē vai ir pārvietota.",
    "goHome": "Iet uz sākumlapu",
    "goBack": "Atpakaļ"
  },
  'lt': {
    "title": "Puslapis nerastas",
    "description": "Ieškomas puslapio nėra arba jis buvo perkeltas.",
    "goHome": "Eiti į pagrindinį puslapį",
    "goBack": "Atgal"
  },
  'hu': {
    "title": "Az oldal nem található",
    "description": "A keresett oldal nem létezik vagy áthelyezésre került.",
    "goHome": "Ugrás a főoldalra",
    "goBack": "Vissza"
  },
  'ro': {
    "title": "Pagina nu a fost găsită",
    "description": "Pagina pe care o căutați nu există sau a fost mutată.",
    "goHome": "Mergi la pagina principală",
    "goBack": "Înapoi"
  },
  'bg': {
    "title": "Страницата не е намерена",
    "description": "Страницата, която търсите, не съществува или е преместена.",
    "goHome": "Към началната страница",
    "goBack": "Назад"
  },
  'el': {
    "title": "Η σελίδα δεν βρέθηκε",
    "description": "Η σελίδα που αναζητάτε δεν υπάρχει ή έχει μετακινηθεί.",
    "goHome": "Μετάβαση στην αρχική σελίδα",
    "goBack": "Πίσω"
  },
  'tr': {
    "title": "Sayfa bulunamadı",
    "description": "Aradığınız sayfa mevcut değil veya taşınmış.",
    "goHome": "Ana sayfaya git",
    "goBack": "Geri"
  },
  'he': {
    "title": "הדף לא נמצא",
    "description": "הדף שאתה מחפש לא קיים או הועבר.",
    "goHome": "עבור לדף הבית",
    "goBack": "חזור"
  },
  'ar': {
    "title": "الصفحة غير موجودة",
    "description": "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
    "goHome": "اذهب إلى الصفحة الرئيسية",
    "goBack": "رجوع"
  },
  'fa': {
    "title": "صفحه پیدا نشد",
    "description": "صفحه‌ای که به دنبال آن هستید وجود ندارد یا منتقل شده است.",
    "goHome": "برو به صفحه اصلی",
    "goBack": "بازگشت"
  },
  'ur': {
    "title": "صفحہ نہیں ملا",
    "description": "صفحہ جسے آپ تلاش کر رہے ہیں موجود نہیں ہے یا منتقل کر دیا گیا ہے۔",
    "goHome": "ہوم پیج پر جائیں",
    "goBack": "واپس"
  },
  'hi': {
    "title": "पृष्ठ नहीं मिला",
    "description": "जिस पृष्ठ की आप खोज रहे हैं वह मौजूद नहीं है या स्थानांतरित कर दिया गया है।",
    "goHome": "होम पेज पर जाएं",
    "goBack": "वापस"
  },
  'bn': {
    "title": "পৃষ্ঠা পাওয়া যায়নি",
    "description": "আপনি যে পৃষ্ঠাটি খুঁজছেন তা বিদ্যমান নেই বা সরানো হয়েছে।",
    "goHome": "হোম পেজে যান",
    "goBack": "ফিরে যান"
  },
  'ta': {
    "title": "பக்கம் கிடைக்கவில்லை",
    "description": "நீங்கள் தேடும் பக்கம் இல்லை அல்லது நகர்த்தப்பட்டுள்ளது.",
    "goHome": "முகப்பு பக்கத்திற்கு செல்லுங்கள்",
    "goBack": "திரும்பு"
  },
  'te': {
    "title": "పేజీ కనుగొనబడలేదు",
    "description": "మీరు వెతుకుతున్న పేజీ ఉంది లేదా తరలించబడింది.",
    "goHome": "హోమ్ పేజీకి వెళ్లండి",
    "goBack": "తిరిగి వెళ్లండి"
  },
  'ml': {
    "title": "പേജ് കണ്ടെത്തിയില്ല",
    "description": "നിങ്ങൾ തിരയുന്ന പേജ് നിലവിലില്ല അല്ലെങ്കിൽ മാറ്റി വച്ചിരിക്കുന്നു.",
    "goHome": "ഹോം പേജിലേക്ക് പോകുക",
    "goBack": "തിരികെ"
  },
  'kn': {
    "title": "ಪುಟ ಕಂಡುಬಂದಿಲ್ಲ",
    "description": "ನೀವು ಹುಡುಕುತ್ತಿರುವ ಪುಟ ಅಸ್ತಿತ್ವದಲ್ಲಿಲ್ಲ ಅಥವಾ ಸ್ಥಳಾಂತರಿಸಲಾಗಿದೆ.",
    "goHome": "ಮುಖ್ಯ ಪುಟಕ್ಕೆ ಹೋಗಿ",
    "goBack": "ಹಿಂದೆ"
  },
  'gu': {
    "title": "પેજ મળ્યો નથી",
    "description": "તમે જે પેજ શોધી રહ્યા છો તે અસ્તિત્વમાં નથી અથવા સ્થાનાંતરિત કરવામાં આવ્યો છે.",
    "goHome": "હોમ પેજ પર જાઓ",
    "goBack": "પાછળ"
  },
  'pa': {
    "title": "ਪੇਜ ਨਹੀਂ ਮਿਲਿਆ",
    "description": "ਤੁਸੀਂ ਜਿਸ ਪੇਜ ਦੀ ਭਾਲ ਕਰ ਰਹੇ ਹੋ ਉਹ ਮੌਜੂਦ ਨਹੀਂ ਹੈ ਜਾਂ ਸਥਾਨਾਂਤਰਿਤ ਕੀਤਾ ਗਿਆ ਹੈ।",
    "goHome": "ਹੋਮ ਪੇਜ ਤੇ ਜਾਓ",
    "goBack": "ਪਿੱਛੇ"
  },
  'or': {
    "title": "ପେଜ ମିଳିଲା ନାହିଁ",
    "description": "ଆପଣ ଯେଉଁ ପେଜ ଖୋଜୁଛନ୍ତି ତାହା ବିଦ୍ୟମାନ ନାହିଁ କିମ୍ବା ସ୍ଥାନାନ୍ତରିତ ହୋଇଛି।",
    "goHome": "ହୋମ ପେଜକୁ ଯାଆନ୍ତୁ",
    "goBack": "ପଛକୁ"
  },
  'as': {
    "title": "পৃষ্ঠা পোৱা নগ'ল",
    "description": "আপুনি যি পৃষ্ঠা বিচাৰি আছে সি বিদ্যমান নাই বা স্থানান্তৰ কৰা হৈছে।",
    "goHome": "মূল পৃষ্ঠালৈ যাওক",
    "goBack": "পিছলৈ"
  },
  'mr': {
    "title": "पृष्ठ सापडले नाही",
    "description": "आपण ज्या पृष्ठाचा शोध घेत आहात ते अस्तित्वात नाही किंवा स्थानांतरित केले गेले आहे.",
    "goHome": "मुख्य पृष्ठावर जा",
    "goBack": "मागे"
  },
  'ne': {
    "title": "पृष्ठ फेला परेन",
    "description": "तपाईंले खोजिरहनुभएको पृष्ठ अवस्थित छैन वा सारिएको छ।",
    "goHome": "गृह पृष्ठमा जानुहोस्",
    "goBack": "फिर्ता"
  },
  'si': {
    "title": "පිටුව හමු නොවීය",
    "description": "ඔබ සොයන පිටුව නොපවතී හෝ ගෙනයා ඇත.",
    "goHome": "මුල් පිටුවට යන්න",
    "goBack": "ආපසු"
  },
  'my': {
    "title": "စာမျက်နှာ မတွေ့ရှိ",
    "description": "သင်ရှာဖွေနေသော စာမျက်နှာမှာ မရှိပါ သို့မဟုတ် ရွှေ့ပြောင်းထားပါသည်။",
    "goHome": "ပင်မစာမျက်နှာသို့ သွားရန်",
    "goBack": "ပြန်သွား"
  },
  'km': {
    "title": "រកមិនឃើញទំព័រ",
    "description": "ទំព័រដែលអ្នកកំពុងស្វែងរកមិនមាន ឬត្រូវបានផ្លាស់ទី។",
    "goHome": "ទៅទំព័រដើម",
    "goBack": "ត្រឡប់ក្រោយ"
  },
  'th': {
    "title": "ไม่พบหน้า",
    "description": "หน้าที่คุณกำลังค้นหาไม่มีอยู่หรือถูกย้าย",
    "goHome": "ไปหน้าแรก",
    "goBack": "กลับ"
  },
  'vi': {
    "title": "Không tìm thấy trang",
    "description": "Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.",
    "goHome": "Về trang chủ",
    "goBack": "Quay lại"
  },
  'ko': {
    "title": "페이지를 찾을 수 없습니다",
    "description": "찾고 계신 페이지가 존재하지 않거나 이동되었습니다.",
    "goHome": "홈페이지로 이동",
    "goBack": "뒤로"
  },
  'ja': {
    "title": "ページが見つかりません",
    "description": "お探しのページは存在しないか、移動されました。",
    "goHome": "ホームページに移動",
    "goBack": "戻る"
  },
  'zh': {
    "title": "页面未找到",
    "description": "您要查找的页面不存在或已被移动。",
    "goHome": "转到首页",
    "goBack": "返回"
  },
  'zh-TW': {
    "title": "找不到頁面",
    "description": "您要查找的頁面不存在或已被移動。",
    "goHome": "前往首頁",
    "goBack": "返回"
  },
  'zh-HK': {
    "title": "找不到頁面",
    "description": "您要查找的頁面不存在或已被移動。",
    "goHome": "前往首頁",
    "goBack": "返回"
  },
  'cy': {
    "title": "Heb ddod o hyd i'r dudalen",
    "description": "Nid yw'r dudalen rydych yn chwilio amdani yn bodoli neu mae wedi'i symud.",
    "goHome": "Mynd i'r dudalen gartref",
    "goBack": "Nôl"
  },
  'ga': {
    "title": "Níor aimsíodh an leathanach",
    "description": "Níl an leathanach atá tú ag lorg ann nó tá sé bogtha.",
    "goHome": "Téigh go dtí an leathanach baile",
    "goBack": "Ar ais"
  },
  'mt': {
    "title": "Il-paġna ma nstabitx",
    "description": "Il-paġna li qed tfittex ma teżistix jew ġiet imċaqalqa.",
    "goHome": "Mur għall-paġna ewlenija",
    "goBack": "Lura"
  }
};

// Function to add notfound translations to a language file
function addNotFoundTranslations(langCode) {
  const errorsPath = path.join(__dirname, '..', 'src', 'i18n', 'locales', langCode, 'errors.json');
  
  if (!fs.existsSync(errorsPath)) {
    console.log(`Skipping ${langCode}: errors.json not found`);
    return;
  }

  try {
    const content = fs.readFileSync(errorsPath, 'utf8');
    const data = JSON.parse(content);

    // Check if notfound section already exists
    if (data.notfound) {
      console.log(`Skipping ${langCode}: notfound section already exists`);
      return;
    }

    // Add notfound section
    if (notfoundTranslations[langCode]) {
      data.notfound = notfoundTranslations[langCode];
    } else {
      // Fallback to English if translation not available
      data.notfound = notfoundTranslations['en'];
      console.log(`Using English fallback for ${langCode}`);
    }

    // Write back to file
    fs.writeFileSync(errorsPath, JSON.stringify(data, null, 2));
    console.log(`✅ Added notfound translations to ${langCode}`);
  } catch (error) {
    console.error(`❌ Error processing ${langCode}:`, error.message);
  }
}

// Get all language directories
const localesPath = path.join(__dirname, '..', 'src', 'i18n', 'locales');
const languages = fs.readdirSync(localesPath).filter(dir => {
  return fs.statSync(path.join(localesPath, dir)).isDirectory();
});

console.log('Adding notfound translations to all language files...\n');

languages.forEach(langCode => {
  addNotFoundTranslations(langCode);
});

console.log('\n✅ Completed adding notfound translations!');
