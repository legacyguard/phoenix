import type { DocumentPattern, DocumentType } from './ocr.types';

// Czech/Slovak document patterns for local detection
export const documentPatterns: Record<DocumentType, DocumentPattern> = {
  insurance_policy: {
    type: 'insurance_policy',
    patterns: [
      // Czech patterns
      { regex: /pojistn\s+smlouva/i, weight: 10, language: 'cs' },
      { regex: /pojistnk/i, weight: 8, language: 'cs' },
      { regex: /pojitn/i, weight: 8, language: 'cs' },
      { regex: /pojistn\s+plnn/i, weight: 7, language: 'cs' },
      { regex: /pojistn\s+stka/i, weight: 7, language: 'cs' },
      { regex: /potek\s+pojitn/i, weight: 6, language: 'cs' },
      { regex: /konec\s+pojitn/i, weight: 6, language: 'cs' },
      // Slovak patterns
      { regex: /poistn\s+zmluva/i, weight: 10, language: 'sk' },
      { regex: /poistnk/i, weight: 8, language: 'sk' },
      { regex: /poisten/i, weight: 8, language: 'sk' },
      { regex: /poistn\s+plnenie/i, weight: 7, language: 'sk' },
      // Common insurance terms
      { regex: /\d{10,15}/, weight: 3 }, // Policy numbers
      { regex: /premium|prmie/i, weight: 5 },
    ],
    requiredMatches: 3,
    confidenceThreshold: 0.7,
  },

  bank_statement: {
    type: 'bank_statement',
    patterns: [
      // Czech patterns
      { regex: /vpis\s+z\s+tu/i, weight: 10, language: 'cs' },
      { regex: /bankovn\s+vpis/i, weight: 10, language: 'cs' },
      { regex: /slo\s+tu/i, weight: 8, language: 'cs' },
      { regex: /zstatek/i, weight: 7, language: 'cs' },
      { regex: /pjmy/i, weight: 6, language: 'cs' },
      { regex: /vdaje/i, weight: 6, language: 'cs' },
      // Slovak patterns
      { regex: /vpis\s+z\s+tu/i, weight: 10, language: 'sk' },
      { regex: /bankov\s+vpis/i, weight: 10, language: 'sk' },
      { regex: /slo\s+tu/i, weight: 8, language: 'sk' },
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
      { regex: /list\s+vlastnictv/i, weight: 10, language: 'cs' },
      { regex: /vpis\s+z\s+katastru\s+nemovitost/i, weight: 10, language: 'cs' },
      { regex: /katastrln\s+zem/i, weight: 8, language: 'cs' },
      { regex: /parcela/i, weight: 7, language: 'cs' },
      { regex: /vlastnick\s+prvo/i, weight: 8, language: 'cs' },
      { regex: /spoluvlastnick\s+podl/i, weight: 7, language: 'cs' },
      // Slovak patterns
      { regex: /list\s+vlastnctva/i, weight: 10, language: 'sk' },
      { regex: /vpis\s+z\s+katastra\s+nehnutenost/i, weight: 10, language: 'sk' },
      { regex: /katastrlne\s+zemie/i, weight: 8, language: 'sk' },
      // Common patterns
      { regex: /LV\s*\.\s*\d+/i, weight: 9 }, // LV number
      { regex: /\\d+\/\\d+/, weight: 5 }, // Ownership fraction
    ],
    requiredMatches: 3,
    confidenceThreshold: 0.8,
  },

  identity_card: {
    type: 'identity_card',
    patterns: [
      // Czech patterns
      { regex: /obansk\s+prkaz/i, weight: 10, language: 'cs' },
      { regex: /esk\s+republika/i, weight: 8, language: 'cs' },
      { regex: /jmno\s+a\s+pjmen/i, weight: 7, language: 'cs' },
      { regex: /datum\s+narozen/i, weight: 7, language: 'cs' },
      { regex: /rodn\s+slo/i, weight: 8, language: 'cs' },
      { regex: /platnost\s+do/i, weight: 6, language: 'cs' },
      // Slovak patterns
      { regex: /obiansky\s+preukaz/i, weight: 10, language: 'sk' },
      { regex: /slovensk\s+republika/i, weight: 8, language: 'sk' },
      { regex: /meno\s+a\s+priezvisko/i, weight: 7, language: 'sk' },
      { regex: /dtum\s+narodenia/i, weight: 7, language: 'sk' },
      { regex: /rodn\s+slo/i, weight: 8, language: 'sk' },
      // ID number pattern
      { regex: /\d{6}/\d{3,4}/, weight: 9 }, // Birth number format
      { regex: /[A-Z]{2}\d{6}/, weight: 8 }, // ID card number
    ],
    requiredMatches: 4,
    confidenceThreshold: 0.85,
  },

  passport: {
    type: 'passport',
    patterns: [
      // Czech patterns
      { regex: /cestovn\s+pas/i, weight: 10, language: 'cs' },
      { regex: /pas\s+esk\s+republiky/i, weight: 10, language: 'cs' },
      // Slovak patterns
      { regex: /cestovn\s+pas/i, weight: 10, language: 'sk' },
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
      { regex: /zv/i, weight: 10, language: 'cs' },
      { regex: /posledn\s+vle/i, weight: 10, language: 'cs' },
      { regex: /zstavitel/i, weight: 8, language: 'cs' },
      { regex: /ddic/i, weight: 7, language: 'cs' },
      { regex: /odkazuji/i, weight: 7, language: 'cs' },
      // Slovak patterns
      { regex: /zvet/i, weight: 10, language: 'sk' },
      { regex: /posledn\s+va/i, weight: 10, language: 'sk' },
      { regex: /poruite/i, weight: 8, language: 'sk' },
      { regex: /dedi/i, weight: 7, language: 'sk' },
      // Common patterns
      { regex: /not|notr/i, weight: 6 },
      { regex: /svdek|svedok/i, weight: 5 },
    ],
    requiredMatches: 3,
    confidenceThreshold: 0.75,
  },

  medical_record: {
    type: 'medical_record',
    patterns: [
      // Czech patterns
      { regex: /zdravotn\s+dokumentace/i, weight: 10, language: 'cs' },
      { regex: /lkask\s+zprva/i, weight: 10, language: 'cs' },
      { regex: /diagnza/i, weight: 8, language: 'cs' },
      { regex: /anamnza/i, weight: 7, language: 'cs' },
      { regex: /vyeten/i, weight: 6, language: 'cs' },
      // Slovak patterns
      { regex: /zdravotn\s+dokumentcia/i, weight: 10, language: 'sk' },
      { regex: /lekrska\s+sprva/i, weight: 10, language: 'sk' },
      { regex: /diagnza/i, weight: 8, language: 'sk' },
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
      { regex: /smluvn\s+strany/i, weight: 8, language: 'cs' },
      { regex: /pedmt\s+smlouvy/i, weight: 7, language: 'cs' },
      { regex: /lnek\s+[IVX\d]+/i, weight: 5, language: 'cs' },
      // Slovak patterns
      { regex: /zmluva/i, weight: 10, language: 'sk' },
      { regex: /zmluvn\s+strany/i, weight: 8, language: 'sk' },
      { regex: /predmet\s+zmluvy/i, weight: 7, language: 'sk' },
      // Common contract terms
      { regex: /IO?\s*:?\s*\d{8}/, weight: 6 }, // Company ID
      { regex: /DI\s*:?\s*\d{10}/, weight: 6 }, // Tax ID
    ],
    requiredMatches: 3,
    confidenceThreshold: 0.65,
  },

  invoice: {
    type: 'invoice',
    patterns: [
      // Czech patterns
      { regex: /faktura/i, weight: 10, language: 'cs' },
      { regex: /daov\s+doklad/i, weight: 10, language: 'cs' },
      { regex: /variabiln\s+symbol/i, weight: 8, language: 'cs' },
      { regex: /datum\s+splatnosti/i, weight: 7, language: 'cs' },
      { regex: /celkem\s+k\s+hrad/i, weight: 8, language: 'cs' },
      // Slovak patterns
      { regex: /faktra/i, weight: 10, language: 'sk' },
      { regex: /daov\s+doklad/i, weight: 10, language: 'sk' },
      { regex: /variabiln\s+symbol/i, weight: 8, language: 'sk' },
      // Common invoice patterns
      { regex: /DPH\s*\d{1,2}\s*%/, weight: 7 }, // VAT
      { regex: /I\s*DPH/, weight: 6 }, // VAT ID
      { regex: /\d+[,\.]\d{2}\s*(K|CZK||EUR)/, weight: 6 }, // Amount with currency
    ],
    requiredMatches: 3,
    confidenceThreshold: 0.75,
  },

  receipt: {
    type: 'receipt',
    patterns: [
      // Czech patterns
      { regex: /tenka/i, weight: 10, language: 'cs' },
      { regex: /paragon/i, weight: 10, language: 'cs' },
      { regex: /prodejn\s+doklad/i, weight: 9, language: 'cs' },
      // Slovak patterns
      { regex: /tenka/i, weight: 10, language: 'sk' },
      { regex: /pokladnin\s+doklad/i, weight: 9, language: 'sk' },
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
    /esk|esk|esk/i,
    /praha/i,
    /oban/i,
    /prkaz/i,
    /msto/i,
  ];

  const slovakIndicators = [
    /slovensk|slovensk|slovensk/i,
    /bratislava/i,
    /oban/i,
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
