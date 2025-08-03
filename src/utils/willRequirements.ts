// Will Requirements by Country - Configuration for will generation
export interface WillRequirements {
  formalities: {
    witnesses: number;
    notarization: boolean;
    handwritten?: boolean;
  };
  template: string;
  executionSteps: string[];
  specialRequirements: string[];
}

export const WILL_REQUIREMENTS: Record<string, WillRequirements> = {
  SK: {
    formalities: {
      witnesses: 2,
      notarization: false,
      handwritten: true,
    },
    template: `
ZÁVET

Ja, {testatorName}, narodený/á dňa {dateOfBirth}, s bydliskom {address}, 
pri plnom vedomí a zdravom rozume, týmto ustanovujem svoj posledný závet.

Dátum: {date}
Podpis: ___________________
    `,
    executionSteps: [
      'Submit will to probate court',
      'Notify all beneficiaries',
      'Inventory assets',
      'Pay debts and taxes',
      'Distribute remaining assets',
    ],
    specialRequirements: ['Must be handwritten', 'Requires two witnesses'],
  },
  CZ: {
    formalities: {
      witnesses: 2,
      notarization: false,
    },
    template: `
ZÁVĚŤ

Já, {testatorName}, narozený/á dne {dateOfBirth}, s bydlištěm {address}, 
při plném vědomí a zdravém rozumu, tímto ustanovuji svou poslední závěť.

Datum: {date}
Podpis: ___________________
    `,
    executionSteps: [
      'Submit will to probate court',
      'Notify all beneficiaries',
      'Inventory assets',
      'Pay debts and taxes',
      'Distribute remaining assets',
    ],
    specialRequirements: ['Requires two witnesses'],
  },
  US: {
    formalities: {
      witnesses: 2,
      notarization: true,
    },
    template: `
LAST WILL AND TESTAMENT

I, {testatorName}, born on {dateOfBirth}, residing at {address}, 
being of sound mind and disposing memory, do hereby make this my Last Will and Testament.

Date: {date}
Signature: ___________________
    `,
    executionSteps: [
      'File will with probate court',
      'Notify all beneficiaries',
      'Inventory assets',
      'Pay debts and taxes',
      'Distribute remaining assets',
    ],
    specialRequirements: ['Requires notarization', 'Two witnesses required'],
  },
  GB: {
    formalities: {
      witnesses: 2,
      notarization: false,
    },
    template: `
LAST WILL AND TESTAMENT

I, {testatorName}, born on {dateOfBirth}, of {address}, 
being of sound mind, do hereby make this my Last Will and Testament.

Date: {date}
Signature: ___________________
    `,
    executionSteps: [
      'Apply for probate',
      'Notify all beneficiaries',
      'Inventory assets',
      'Pay debts and taxes',
      'Distribute remaining assets',
    ],
    specialRequirements: ['Two witnesses required'],
  },
  DE: {
    formalities: {
      witnesses: 2,
      notarization: true,
    },
    template: `
TESTAMENT

Ich, {testatorName}, geboren am {dateOfBirth}, wohnhaft in {address}, 
verfüge bei klarem Verstand hiermit über meinen letzten Willen.

Datum: {date}
Unterschrift: ___________________
    `,
    executionSteps: [
      'Submit will to probate court',
      'Notify all beneficiaries',
      'Inventory assets',
      'Pay debts and taxes',
      'Distribute remaining assets',
    ],
    specialRequirements: ['Requires notarization', 'Two witnesses required'],
  },
  FR: {
    formalities: {
      witnesses: 2,
      notarization: true,
    },
    template: `
TESTAMENT

Je, {testatorName}, né(e) le {dateOfBirth}, demeurant à {address}, 
sain(e) d'esprit, établis par les présentes mon testament.

Date: {date}
Signature: ___________________
    `,
    executionSteps: [
      'Submit will to probate court',
      'Notify all beneficiaries',
      'Inventory assets',
      'Pay debts and taxes',
      'Distribute remaining assets',
    ],
    specialRequirements: ['Requires notarization', 'Two witnesses required'],
  },
  ES: {
    formalities: {
      witnesses: 2,
      notarization: true,
    },
    template: `
TESTAMENTO

Yo, {testatorName}, nacido/a el {dateOfBirth}, con domicilio en {address}, 
en pleno uso de mis facultades mentales, otorgo este mi testamento.

Fecha: {date}
Firma: ___________________
    `,
    executionSteps: [
      'Presentar testamento al juzgado',
      'Notificar a todos los beneficiarios',
      'Inventariar bienes',
      'Pagar deudas e impuestos',
      'Distribuir bienes restantes',
    ],
    specialRequirements: ['Requiere notarización', 'Se requieren dos testigos'],
  },
  IT: {
    formalities: {
      witnesses: 2,
      notarization: true,
    },
    template: `
TESTAMENTO

Io, {testatorName}, nato/a il {dateOfBirth}, residente in {address}, 
nel pieno delle mie facoltà mentali, dispongo quanto segue.

Data: {date}
Firma: ___________________
    `,
    executionSteps: [
      'Depositare il testamento presso il notaio',
      'Notificare tutti i beneficiari',
      'Inventariare i beni',
      'Pagare debiti e tasse',
      'Distribuire i beni rimanenti',
    ],
    specialRequirements: ['Richiede notarizzazione', 'Richiesti due testimoni'],
  },
  PL: {
    formalities: {
      witnesses: 2,
      notarization: false,
      handwritten: true,
    },
    template: `
TESTAMENT

Ja, {testatorName}, urodzony/a dnia {dateOfBirth}, zamieszkały/a w {address}, 
będąc w pełni władz umysłowych, sporządzam niniejszy testament.

Data: {date}
Podpis: ___________________
    `,
    executionSteps: [
      'Złożyć testament w sądzie spadkowym',
      'Powiadomić wszystkich beneficjentów',
      'Sporządzić spis inwentarza',
      'Spłacić długi i podatki',
      'Rozdzielić pozostały majątek',
    ],
    specialRequirements: ['Testament musi być napisany odręcznie', 'Wymagani dwaj świadkowie'],
  },
  NL: {
    formalities: {
      witnesses: 2,
      notarization: true,
    },
    template: `
TESTAMENT

Ik, {testatorName}, geboren op {dateOfBirth}, wonende te {address}, 
bij mijn volle verstand, maak hierbij mijn testament op.

Datum: {date}
Handtekening: ___________________
    `,
    executionSteps: [
      'Testament indienen bij de rechtbank',
      'Alle begunstigden informeren',
      'Inventarisatie van bezittingen',
      'Schulden en belastingen betalen',
      'Resterende bezittingen verdelen',
    ],
    specialRequirements: ['Vereist notariële akte', 'Twee getuigen vereist'],
  },
  AT: {
    formalities: {
      witnesses: 3,
      notarization: true,
    },
    template: `
TESTAMENT

Ich, {testatorName}, geboren am {dateOfBirth}, wohnhaft in {address}, 
verfüge bei klarem Verstand hiermit über meinen letzten Willen.

Datum: {date}
Unterschrift: ___________________
    `,
    executionSteps: [
      'Testament beim Verlassenschaftsgericht einreichen',
      'Alle Begünstigten benachrichtigen',
      'Vermögen inventarisieren',
      'Schulden und Steuern bezahlen',
      'Verbleibendes Vermögen verteilen',
    ],
    specialRequirements: ['Erfordert Notarisierung', 'Drei Zeugen erforderlich'],
  },
  CH: {
    formalities: {
      witnesses: 2,
      notarization: false,
      handwritten: true,
    },
    template: `
TESTAMENT

Ich, {testatorName}, geboren am {dateOfBirth}, wohnhaft in {address}, 
verfüge bei klarem Verstand wie folgt über meinen Nachlass.

Datum: {date}
Unterschrift: ___________________
    `,
    executionSteps: [
      'Testament bei der zuständigen Behörde hinterlegen',
      'Erben benachrichtigen',
      'Erbschaftsinventar erstellen',
      'Schulden und Steuern begleichen',
      'Nachlass verteilen',
    ],
    specialRequirements: ['Muss vollständig handschriftlich verfasst sein', 'Zwei Zeugen erforderlich'],
  },
  BE: {
    formalities: {
      witnesses: 2,
      notarization: true,
    },
    template: `
TESTAMENT / TESTAMENT

Ik/Je, {testatorName}, geboren op/né(e) le {dateOfBirth}, wonende te/demeurant à {address}, 
bij mijn volle verstand/sain(e) d'esprit, maak dit testament op/établis ce testament.

Datum/Date: {date}
Handtekening/Signature: ___________________
    `,
    executionSteps: [
      'Testament indienen bij de rechtbank / Déposer le testament au tribunal',
      'Begunstigden informeren / Informer les bénéficiaires',
      'Inventaris opmaken / Faire l\'inventaire',
      'Schulden en belastingen betalen / Payer dettes et impôts',
      'Nalatenschap verdelen / Distribuer l\'héritage',
    ],
    specialRequirements: ['Vereist notariële akte / Acte notarié requis', 'Twee getuigen / Deux témoins'],
  },
};
