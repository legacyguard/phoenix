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
};