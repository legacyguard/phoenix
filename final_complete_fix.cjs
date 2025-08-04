const fs = require('fs');
const path = require('path');

// Final comprehensive translation mappings for all remaining English terms
const translations = {
  'Digital Accounts Shutdown': {
    'no': 'Stengning av digitale kontoer'
  },
  'First Week Tasks': {
    'no': 'Oppgaver for første uke'
  },
  'Log Beneficiary Communication': {
    'no': 'Logg mottakerkommunikasjon'
  },
  'Estate Administration Status': {
    'no': 'Status for boadministrasjon'
  },
  'Update Estate Status': {
    'no': 'Oppdater bo status'
  },
  'Probate Process Initiated': {
    'no': 'Skifteprosess startet'
  },
  'Assets Being Valued': {
    'no': 'Eiendeler blir verdsatt'
  },
  'Debts Being Settled': {
    'no': 'Gjeld blir oppgjort'
  },
  'Ready for Distribution': {
    'no': 'Klar for fordeling'
  },
  'Distribution in Progress': {
    'no': 'Fordeling pågår'
  },
  'Secure Information Access': {
    'no': 'Sikker informasjonstilgang'
  },
  'Enter your password': {
    'no': 'Skriv inn passordet ditt'
  },
  'Recent Executor Communications': {
    'no': 'Nylige bobestyrer kommunikasjoner'
  },
  'Add New Executor': {
    'no': 'Legg til ny bobestyrer'
  },
  'Executor added successfully': {
    'no': 'Bobestyrer lagt til'
  },
  'Executor removed successfully': {
    'no': 'Bobestyrer fjernet'
  },
  'Executor Contact ID': {
    'tr': 'Vasi Vekili İletişim Kimliği'
  },
  'Status and Information': {
    'tr': 'Durum ve Bilgi'
  },
  'No will document': {
    'tr': 'Vasiyet belgesi yok'
  },
  'Save Will Information': {
    'tr': 'Vasiyet Bilgilerini Kaydet'
  },
  'This field is required': {
    'tr': 'Bu alan zorunludur'
  },
  'Bosnia and Herzegovina': {
    'tr': 'Bosna Hersek'
  },
  'Executor and Beneficiaries': {
    'tr': 'Vasi Vekili ve Yararlanıcılar'
  },
  'Review and Generate': {
    'tr': 'İncele ve Oluştur'
  },
  'Sign and Confirm': {
    'tr': 'İmzala ve Onayla'
  },
  'Finalize and Upload': {
    'tr': 'Sonlandır ve Yükle'
  },
  'Traditional Religious Burial': {
    'tr': 'Geleneksel Dini Defin'
  },
  'Simple Cremation Service': {
    'tr': 'Basit Kremasyon Hizmeti'
  },
  'Comprehensive Digital Shutdown': {
    'tr': 'Kapsamlı Dijital Kapatma'
  },
  'Minimal Digital Footprint': {
    'tr': 'Minimal Dijital Ayak İzi'
  },
  'Essential Contacts List': {
    'tr': 'Temel İletişim Listesi'
  },
  'Home Filing System': {
    'tr': 'Ev Dosyalama Sistemi'
  },
  'Letter to Children': {
    'tr': 'Çocuklara Mektup'
  },
  'Letter to Parents': {
    'tr': 'Ebeveynlere Mektup'
  },
  'Business Continuity Plan': {
    'tr': 'İş Sürekliliği Planı'
  },
  'Household Management Guide': {
    'tr': 'Ev Yönetimi Rehberi'
  },
  'Bills Go Unpaid': {
    'tr': 'Faturalar Ödenmez'
  },
  'Business Decisions Stall': {
    'tr': 'İş Kararları Durur'
  },
  'No Will Found': {
    'tr': 'Vasiyet Bulunamadı'
  },
  'Insurance Details Unknown': {
    'tr': 'Sigorta Detayları Bilinmiyor'
  },
  'No will available': {
    'tr': 'Vasiyet mevcut değil'
  },
  'Notify immediate family': {
    'tr': 'Yakın aileyi bilgilendir'
  },
  'Secure physical property': {
    'tr': 'Fiziksel mülkü güvence altına al'
  },
  'Locate the will': {
    'tr': 'Vasiyeti bul'
  },
  'Arrange bill payments': {
    'tr': 'Fatura ödemelerini düzenle'
  },
  'Current Family Vulnerabilities': {
    'tr': 'Mevcut Aile Zafiyetleri'
  },
  'Potential Financial Impact': {
    'tr': 'Potansiyel Finansal Etki'
  },
  'Your Preparedness Blueprint': {
    'tr': 'Hazırlık Planınız'
  },
  'Resolve This Vulnerability': {
    'tr': 'Bu Zafiyeti Çöz'
  },
  'Family Action Plan': {
    'tr': 'Aile Eylem Planı'
  },
  'Stress and worry': {
    'tr': 'Stres ve endişe'
  },
  'Peace and focus': {
    'tr': 'Huzur ve odaklanma'
  },
  'Frustration and helplessness': {
    'tr': 'Hayal kırıklığı ve çaresizlik'
  },
  'Relief and readiness': {
    'tr': 'Rahatlık ve hazırlık'
  },
  'The Sudden Loss': {
    'tr': 'Ani Kayıp'
  },
  'Confusion and regret': {
    'tr': 'Kafa karışıklığı ve pişmanlık'
  },
  'Calm and clarity': {
    'tr': 'Sakinlik ve netlik'
  },
  'After Heritage Vault': {
    'tr': 'Miras Kasası Sonrası'
  },
  'Annual Legacy Review': {
    'tr': 'Yıllık Miras İncelemesi'
  },
  'Review Your Executors': {
    'tr': 'Vasi Vekillerinizi İnceleyin'
  },
  'Review Your Assets': {
    'tr': 'Varlıklarınızı İnceleyin'
  },
  'Review Your Beneficiaries': {
    'tr': 'Yararlanıcılarınızı İnceleyin'
  },
  'Command Roster Review': {
    'tr': 'Komuta Listesi İncelemesi'
  },
  'Emergency contact person': {
    'tr': 'Acil durum iletişim kişisi'
  },
  'Asset Inventory Review': {
    'tr': 'Varlık Envanter İncelemesi'
  },
  'Specific asset beneficiary': {
    'tr': 'Belirli varlık yararlanıcısı'
  },
  'Next Review Due': {
    'tr': 'Sonraki İnceleme Gerekli'
  },
  'Skip for Now': {
    'tr': 'Şimdilik Atla'
  },
  'Annual Review Due': {
    'tr': 'Yıllık İnceleme Gerekli'
  },
  'Annual Review Overdue': {
    'tr': 'Yıllık İnceleme Gecikmiş'
  },
  'Annual Review Completed': {
    'tr': 'Yıllık İnceleme Tamamlandı'
  },
  'Changes saved successfully': {
    'tr': 'Değişiklikler başarıyla kaydedildi'
  },
  'Error saving changes': {
    'tr': 'Değişiklikleri kaydetme hatası'
  },
  'List Emergency Contacts': {
    'tr': 'Acil Durum İletişimlerini Listele'
  },
  'Document Insurance Policies': {
    'tr': 'Sigorta Poliçelerini Belgelendir'
  },
  'Secure Digital Assets': {
    'tr': 'Dijital Varlıkları Güvence Altına Al'
  },
  'Organize Legal Documents': {
    'tr': 'Yasal Belgeleri Düzenle'
  },
  'Write Family Instructions': {
    'tr': 'Aile Talimatları Yaz'
  },
  'Start This Step': {
    'tr': 'Bu Adımı Başlat'
  },
  'Show Me How': {
    'tr': 'Nasıl Yapılacağını Göster'
  },
  'Mark as Complete': {
    'tr': 'Tamamlandı Olarak İşaretle'
  },
  'Skip for Now': {
    'tr': 'Şimdilik Atla'
  },
  'Estimated Time Remaining': {
    'tr': 'Tahmini Kalan Süre'
  },
  'Accurate Time Estimates': {
    'tr': 'Doğru Zaman Tahminleri'
  },
  'Clear Difficulty Levels': {
    'tr': 'Net Zorluk Seviyeleri'
  },
  'Skip for Now': {
    'tr': 'Şimdilik Atla'
  },
  'Photograph your passport': {
    'tr': 'Pasaportunuzun fotoğrafını çekin'
  },
  'Organize medical history': {
    'tr': 'Tıbbi geçmişi düzenleyin'
  },
  'List current medications': {
    'tr': 'Mevcut ilaçları listeleyin'
  },
  'Total Time Spent': {
    'tr': 'Toplam Harcanan Süre'
  },
  'Next Recommended Task': {
    'tr': 'Sonraki Önerilen Görev'
  },
  'Story saved successfully': {
    'tr': 'Hikaye başarıyla kaydedildi'
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
    const langDir = path.join(localesDir, langCode);
    const files = fs.readdirSync(langDir, { withFileTypes: true })
      .filter(dirent => dirent.isFile() && dirent.name.endsWith('.json'))
      .map(dirent => dirent.name);

    for (const file of files) {
      const filePath = path.join(langDir, file);
      if (fixFile(filePath, langCode)) {
        totalFixed++;
      }
    }
  }

  console.log(`\n✅ Final complete fix: Updated ${totalFixed} language files`);
}

processDirectory(); 