import type { DocumentPattern, DocumentType } from './ocr.types';

// Czech/Slovak document patterns for local detection
export const documentPatterns: Record<DocumentType, DocumentPattern> = {
  insurance_policy: {
    type: 'insurance_policy',
    patterns: [
      // Czech patterns
      { regex: /pojistná\s+smlouva/i, weight: 10, language: 'cs' },
      { regex: /pojistník/i, weight: 8, language: 'cs' },
      { regex: /pojištěný/i, weight: 8, language: 'cs' },
      { regex: /pojistné\s+plnění/i, weight: 7, language: 'cs' },
      { regex: /pojistná\s+částka/i, weight: 7, language: 'cs' },
      { regex: /počátek\s+pojištění/i, weight: 6, language: 'cs' },
      { regex: /konec\s+pojištění/i, weight: 6, language: 'cs' },
      // Slovak patterns
      { regex: /poistná\s+zmluva/i, weight: 10, language: 'sk' },
      { regex: /poistník/i, weight: 8, language: 'sk' },
      { regex: /poistený/i, weight: 8, language: 'sk' },
      { regex: /poistné\s+plnenie/i, weight: 7, language: 'sk' },
      // Common insurance terms
      { regex: /\d{10,15}/, weight: 3 }, // Policy numbers
      { regex: /premium|prémie/i, weight: 5 },
    ],
    requiredMatches: 3,
    confidenceThreshold: 0.7,
  },

  bank_statement: {
    type: 'bank_statement',
    patterns: [
      // Czech patterns
      { regex: /výpis\s+z\s+účtu/i, weight: 10, language: 'cs' },
      { regex: /bankovní\s+výpis/i, weight: 10, language: 'cs' },
      { regex: /číslo\s+účtu/i, weight: 8, language: 'cs' },
      { regex: /zůstatek/i, weight: 7, language: 'cs' },
      { regex: /příjmy/i, weight: 6, language: 'cs' },
      { regex: /výdaje/i, weight: 6, language: 'cs' },
      // Slovak patterns
      { regex: /výpis\s+z\s+účtu/i, weight: 10, language: 'sk' },
      { regex: /bankový\s+výpis/i, weight: 10, language: 'sk' },
      { regex: /číslo\s+účtu/i, weight: 8, language: 'sk' },
      { regex: /zostatok/i, weight: 7, language: 'sk' },
      // IBAN patterns
      { regex: /[A-Z]{2}\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}/i, weight: 8 },
      // Transaction patterns
      { regex: /\d{1,2}\.\d{1,2}\.\d{4}.*[+-]?\d+[,\.]\d{2}/, weight: 5 },
    ],
    requiredMatches: 3,
    confidenceThreshold: 0.75,
  },

  property_deed: {
    type: 'property_deed',
    patterns: [
      // Czech patterns
      { regex: /list\s+vlastnictví/i, weight: 10, language: 'cs' },
      { regex: /výpis\s+z\s+katastru\s+nemovitostí/i, weight: 10, language: 'cs' },
      { regex: /katastrální\s+území/i, weight: 8, language: 'cs' },
      { regex: /parcela/i, weight: 7, language: 'cs' },
      { regex: /vlastnické\s+právo/i, weight: 8, language: 'cs' },
      { regex: /spoluvlastnický\s+podíl/i, weight: 7, language: 'cs' },
      // Slovak patterns
      { regex: /list\s+vlastníctva/i, weight: 10, language: 'sk' },
      { regex: /výpis\s+z\s+katastra\s+nehnuteľností/i, weight: 10, language: 'sk' },
      { regex: /katastrálne\s+územie/i, weight: 8, language: 'sk' },
      // Common patterns
      { regex: /LV\s*č\.\s*\d+/i, weight: 9 }, // LV number
      { regex: /\d+\/\d+/, weight: 5 }, // Ownership fraction
    ],
    requiredMatches: 3,
    confidenceThreshold: 0.8,
  },

  identity_card: {
    type: 'identity_card',
    patterns: [
      // Czech patterns
      { regex: /občanský\s+průkaz/i, weight: 10, language: 'cs' },
      { regex: /česká\s+republika/i, weight: 8, language: 'cs' },
      { regex: /jméno\s+a\s+příjmení/i, weight: 7, language: 'cs' },
      { regex: /datum\s+narození/i, weight: 7, language: 'cs' },
      { regex: /rodné\s+číslo/i, weight: 8, language: 'cs' },
      { regex: /platnost\s+do/i, weight: 6, language: 'cs' },
      // Slovak patterns
      { regex: /občiansky\s+preukaz/i, weight: 10, language: 'sk' },
      { regex: /slovenská\s+republika/i, weight: 8, language: 'sk' },
      { regex: /meno\s+a\s+priezvisko/i, weight: 7, language: 'sk' },
      { regex: /dátum\s+narodenia/i, weight: 7, language: 'sk' },
      { regex: /rodné\s+číslo/i, weight: 8, language: 'sk' },
      // ID number pattern
      { regex: /\d{6}\/\d{3,4}/, weight: 9 }, // Birth number format
      { regex: /[A-Z]{2}\d{6}/, weight: 8 }, // ID card number
    ],
    requiredMatches: 4,
    confidenceThreshold: 0.85,
  },

  passport: {
    type: 'passport',
    patterns: [
      // Czech patterns
      { regex: /cestovní\s+pas/i, weight: 10, language: 'cs' },
      { regex: /pas\s+české\s+republiky/i, weight: 10, language: 'cs' },
      // Slovak patterns
      { regex: /cestovný\s+pas/i, weight: 10, language: 'sk' },
      { regex: /pas\s+slovenskej\s+republiky/i, weight: 10, language: 'sk' },
      // Common passport patterns
      { regex: /passport/i, weight: 9 },
      { regex: /[A-Z]{1,2}\d{6,8}/, weight: 8 }, // Passport number
      { regex: /MRZ/, weight: 7 }, // Machine Readable Zone
      { regex: /P<[A-Z]{3}/, weight: 9 }, // MRZ passport indicator
    ],
    requiredMatches: 2,
    confidenceThreshold: 0.8,
  },

  will: {
    type: 'will',
    patterns: [
      // Czech patterns
      { regex: /závěť/i, weight: 10, language: 'cs' },
      { regex: /poslední\s+vůle/i, weight: 10, language: 'cs' },
      { regex: /zůstavitel/i, weight: 8, language: 'cs' },
      { regex: /dědic/i, weight: 7, language: 'cs' },
      { regex: /odkazuji/i, weight: 7, language: 'cs' },
      // Slovak patterns
      { regex: /závet/i, weight: 10, language: 'sk' },
      { regex: /posledná\s+vôľa/i, weight: 10, language: 'sk' },
      { regex: /poručiteľ/i, weight: 8, language: 'sk' },
      { regex: /dedič/i, weight: 7, language: 'sk' },
      // Common patterns
      { regex: /notář|notár/i, weight: 6 },
      { regex: /svědek|svedok/i, weight: 5 },
    ],
    requiredMatches: 3,
    confidenceThreshold: 0.75,
  },

  medical_record: {
    type: 'medical_record',
    patterns: [
      // Czech patterns
      { regex: /zdravotní\s+dokumentace/i, weight: 10, language: 'cs' },
      { regex: /lékařská\s+zpráva/i, weight: 10, language: 'cs' },
      { regex: /diagnóza/i, weight: 8, language: 'cs' },
      { regex: /anamnéza/i, weight: 7, language: 'cs' },
      { regex: /vyšetření/i, weight: 6, language: 'cs' },
      // Slovak patterns
      { regex: /zdravotná\s+dokumentácia/i, weight: 10, language: 'sk' },
      { regex: /lekárska\s+správa/i, weight: 10, language: 'sk' },
      { regex: /diagnóza/i, weight: 8, language: 'sk' },
      // Medical codes
      { regex: /ICD-?\d{1,2}/, weight: 7 },
      { regex: /MKN-?\d{1,2}/, weight: 7 }, // Czech ICD
    ],
    requiredMatches: 3,
    confidenceThreshold: 0.7,
  },

  contract: {
    type: 'contract',
    patterns: [
      // Czech patterns
      { regex: /smlouva/i, weight: 10, language: 'cs' },
      { regex: /smluvní\s+strany/i, weight: 8, language: 'cs' },
      { regex: /předmět\s+smlouvy/i, weight: 7, language: 'cs' },
      { regex: /článek\s+[IVX\d]+/i, weight: 5, language: 'cs' },
      // Slovak patterns
      { regex: /zmluva/i, weight: 10, language: 'sk' },
      { regex: /zmluvné\s+strany/i, weight: 8, language: 'sk' },
      { regex: /predmet\s+zmluvy/i, weight: 7, language: 'sk' },
      // Common contract terms
      { regex: /IČO?\s*:?\s*\d{8}/, weight: 6 }, // Company ID
      { regex: /DIČ\s*:?\s*\d{10}/, weight: 6 }, // Tax ID
    ],
    requiredMatches: 3,
    confidenceThreshold: 0.65,
  },

  invoice: {
    type: 'invoice',
    patterns: [
      // Czech patterns
      { regex: /faktura/i, weight: 10, language: 'cs' },
      { regex: /daňový\s+doklad/i, weight: 10, language: 'cs' },
      { regex: /variabilní\s+symbol/i, weight: 8, language: 'cs' },
      { regex: /datum\s+splatnosti/i, weight: 7, language: 'cs' },
      { regex: /celkem\s+k\s+úhradě/i, weight: 8, language: 'cs' },
      // Slovak patterns
      { regex: /faktúra/i, weight: 10, language: 'sk' },
      { regex: /daňový\s+doklad/i, weight: 10, language: 'sk' },
      { regex: /variabilný\s+symbol/i, weight: 8, language: 'sk' },
      // Common invoice patterns
      { regex: /DPH\s*\d{1,2}\s*%/, weight: 7 }, // VAT
      { regex: /IČ\s*DPH/, weight: 6 }, // VAT ID
      { regex: /\d+[,\.]\d{2}\s*(Kč|CZK|€|EUR)/, weight: 6 }, // Amount with currency
    ],
    requiredMatches: 3,
    confidenceThreshold: 0.75,
  },

  receipt: {
    type: 'receipt',
    patterns: [
      // Czech patterns
      { regex: /účtenka/i, weight: 10, language: 'cs' },
      { regex: /paragon/i, weight: 10, language: 'cs' },
      { regex: /prodejní\s+doklad/i, weight: 9, language: 'cs' },
      // Slovak patterns
      { regex: /účtenka/i, weight: 10, language: 'sk' },
      { regex: /pokladničný\s+doklad/i, weight: 9, language: 'sk' },
      // Common receipt patterns
      { regex: /EET/, weight: 8 }, // Czech electronic evidence
      { regex: /FIK\s*:/, weight: 9 }, // Fiscal ID
      { regex: /BKP\s*:/, weight: 8 }, // Security code
      { regex: /celkem\s*:?\s*\d+[,\.]\d{2}/, weight: 7 },
    ],
    requiredMatches: 2,
    confidenceThreshold: 0.7,
  },

  unknown: {
    type: 'unknown',
    patterns: [],
    requiredMatches: 0,
    confidenceThreshold: 0,
  },
};

// Helper function to detect document language
export function detectLanguageFromText(text: string): 'cs' | 'sk' | 'en' | 'other' {
  const czechIndicators = [
    /český|česká|české/i,
    /praha/i,
    /občan/i,
    /průkaz/i,
    /město/i,
  ];

  const slovakIndicators = [
    /slovenský|slovenská|slovenské/i,
    /bratislava/i,
    /občan/i,
    /preukaz/i,
    /mesto/i,
  ];

  const englishIndicators = [
    /the|and|of|to|in/i,
    /document|certificate|statement/i,
  ];

  let czechScore = 0;
  let slovakScore = 0;
  let englishScore = 0;

  czechIndicators.forEach(pattern => {
    if (pattern.test(text)) czechScore++;
  });

  slovakIndicators.forEach(pattern => {
    if (pattern.test(text)) slovakScore++;
  });

  englishIndicators.forEach(pattern => {
    if (pattern.test(text)) englishScore++;
  });

  if (czechScore > slovakScore && czechScore > englishScore) return 'cs';
  if (slovakScore > czechScore && slovakScore > englishScore) return 'sk';
  if (englishScore > 0) return 'en';
  
  return 'other';
}
