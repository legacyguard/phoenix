#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const projectRoot = '/Users/luborfedak/Documents/Github/phoenix';
const localesRoot = path.join(projectRoot, 'src/i18n/locales');

const mapping = {
  Vault: {
    bg: 'Сейф', cs: 'Trezor', cy: 'Archif Ddiogel', da: 'Pengeskab', de: 'Tresor', el: 'Χρηματοκιβώτιο', en: 'Vault', es: 'Caja fuerte', et: 'Seif', fi: 'Tallelokero', fr: 'Coffre-fort', ga: 'Taisceadán', hr: 'Sef', hu: 'Széf', is: 'Öryggishólf', it: 'Cassaforte', lt: 'Seifas', lv: 'Seifs', me: 'Sef', mk: 'Сеф', mt: 'Kaxxa Sigura', nl: 'Kluis', no: 'Pengeskap', pl: 'Sejf', pt: 'Cofre', ro: 'Seif', ru: 'Сейф', sk: 'Trezor', sl: 'Trezo', sq: 'Kasafortë', sr: 'Сејф', sv: 'Kassaskåp', tr: 'Kasa', uk: 'Сейф'
  },
  'Trusted Circle': {
    bg: 'Кръг на доверие', cs: 'Důvěryhodný okruh', cy: 'Cylch Ymddiried', da: 'Betroet kreds', de: 'Vertrauenskreis', el: 'Κύκλος εμπιστοσύνης', en: 'Trusted Circle', es: 'Círculo de confianza', et: 'Usaldusring', fi: 'Luotettujen piiri', fr: 'Cercle de confiance', ga: 'Ciorcal Iontaofa', hr: 'Krug povjerenja', hu: 'Bizalmi kör', is: 'Traustahringur', it: 'Cerchia di fiducia', lt: 'Patikimų asmenų ratas', lv: 'Uzticības loks', me: 'Krug povjerenja', mk: 'Круг на доверба', mt: 'Ċirku tal-fiduċja', nl: 'Vertrouwenskring', no: 'Betrodd krets', pl: 'Krąg zaufania', pt: 'Círculo de confiança', ro: 'Cerc de încredere', ru: 'Доверенный круг', sk: 'Kruh dôveryhodných osôb', sl: 'Krog zaupanja', sq: 'Rrethi i besuar', sr: 'Круг поверења', sv: 'Förtroendekrets', tr: 'Güvenilir çevre', uk: 'Коло довіри'
  },
  'Will Generator': {
    bg: 'Генератор на завещание', cs: 'Tvůrce závěti', cy: 'Generadur Ewyllys', da: 'Testamente-generator', de: 'Testament-Generator', el: 'Δημιουργός διαθήκης', en: 'Will Generator', es: 'Generador de testamento', et: 'Testamendi generaator', fi: 'Testamenttigeneraattori', fr: 'Générateur de testament', ga: 'Gineadóir Uacht', hr: 'Generator oporuke', hu: 'Végrendelet-generátor', is: 'Erfðaskrárgerð', it: 'Generatore di testamento', lt: 'Testamento generatorius', lv: 'Testamenta ģenerators', me: 'Generator testamenta', mk: 'Генератор на тестамент', mt: 'Ġeneratur tat-testment', nl: 'Testamentgenerator', no: 'Testamentgenerator', pl: 'Generator testamentu', pt: 'Gerador de testamento', ro: 'Generator de testament', ru: 'Генератор завещания', sk: 'Tvorca závetu', sl: 'Generator oporoke', sq: 'Gjenerator testamenti', sr: 'Генератор тестамента', sv: 'Testamentsgenerator', tr: 'Vasiyetname oluşturucu', uk: 'Генератор заповіту'
  },
  'Legacy Letters': {
    bg: 'Прощални писма', cs: 'Dopisy na rozloučenou', cy: 'Llythyrau Etifeddiaeth', da: 'Afskedsbreve', de: 'Abschiedsbriefe', el: 'Γράμματα αποχαιρετισμού', en: 'Legacy Letters', es: 'Cartas de despedida', et: 'Hüvastijätukirjad', fi: 'Jäähyväiskirjeet', fr: 'Lettres d’adieu', ga: 'Litreacha Oidhreachta', hr: 'Oproštajna pisma', hu: 'Búcsúlevelek', is: 'Kveðjubréf', it: 'Lettere d’addio', lt: 'Atsisveikinimo laiškai', lv: 'Atvadu vēstules', me: 'Oproštajna pisma', mk: 'Прощални писма', mt: "Ittri ta' addiju", nl: 'Afscheidsbrieven', no: 'Avskjedsbrev', pl: 'Listy pożegnalne', pt: 'Cartas de despedida', ro: 'Scrisori de adio', ru: 'Прощальные письма', sk: 'Listy na rozlúčku', sl: 'Pisma slovesa', sq: 'Letra lamtumire', sr: 'Опроштајна писма', sv: 'Avskedsbrev', tr: 'Veda mektupları', uk: 'Прощальні листи'
  }
};

function toLowerForLocale(str, locale) {
  return (str || '').toLocaleLowerCase(locale);
}

const locales = fs.readdirSync(localesRoot).filter(d => fs.statSync(path.join(localesRoot, d)).isDirectory());

let changed = [];
for (const lang of locales) {
  const file = path.join(localesRoot, lang, 'ui-components.json');
  if (!fs.existsSync(file)) continue;
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  json.terms = json.terms || {};

  const vault = mapping['Vault'][lang];
  const trusted = mapping['Trusted Circle'][lang];
  const willGen = mapping['Will Generator'][lang];
  const legacyLetters = mapping['Legacy Letters'][lang];

  if (vault) {
    json.terms.vault = vault;
    json.terms.vaultLower = toLowerForLocale(vault, lang);
  }
  if (trusted) {
    json.terms.trustedCircle = trusted;
    json.terms.trustedCircleLower = toLowerForLocale(trusted, lang);
  }
  if (willGen) {
    json.terms.willGenerator = willGen;
    json.terms.willGeneratorLower = toLowerForLocale(willGen, lang);
  }
  if (legacyLetters) {
    json.terms.legacyLetters = legacyLetters;
    // No lower key in schema for legacyLetters; leave as-is
  }

  fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n', 'utf8');
  changed.push({ lang, file });
}

console.log(JSON.stringify({ ok: true, changedCount: changed.length }));

