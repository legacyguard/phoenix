-- Add new countries to will_requirements table

-- Moldova
INSERT INTO will_requirements (country_code, country_name, witness_count, requires_handwriting, requires_notarization, required_clauses, legal_language, signature_requirements) VALUES
(
  'MD',
  'Moldova',
  2,
  false,
  true,
  '["identity", "revocation", "beneficiaries", "date", "signature", "soundMind"]'::jsonb,
  '{
    "title": "Testament",
    "identity": "Eu, subsemnatul/a {name}, născut/ă {birthDate}, domiciliat/ă în {address}",
    "revocation": "Prin prezentul revoc toate testamentele și codicilele mele anterioare.",
    "beneficiaries": "Las moștenire",
    "signature": "Semnătura testatorului",
    "witness": "Martor",
    "date": "Data",
    "soundMind": "declar că sunt în deplinătatea facultăților mintale"
  }'::jsonb,
  'Requires either handwriting by testator OR typed with 2 witnesses and notarization'
);

-- Ukraine
INSERT INTO will_requirements (country_code, country_name, witness_count, requires_handwriting, requires_notarization, required_clauses, legal_language, signature_requirements) VALUES
(
  'UA',
  'Ukraine',
  2,
  false,
  true,
  '["identity", "revocation", "beneficiaries", "date", "signature", "soundMind"]'::jsonb,
  '{
    "title": "Заповіт",
    "identity": "Я, {name}, народжений/а {birthDate}, що проживаю за адресою {address}",
    "revocation": "Цим скасовую всі мої попередні заповіти та додатки до них.",
    "beneficiaries": "Заповідаю",
    "signature": "Підпис заповідача",
    "witness": "Свідок",
    "date": "Дата",
    "soundMind": "заявляю, що перебуваю у здоровому розумі та твердій пам''яті"
  }'::jsonb,
  'Requires notarization by a notary public in Ukraine'
);

-- Serbia
INSERT INTO will_requirements (country_code, country_name, witness_count, requires_handwriting, requires_notarization, required_clauses, legal_language, signature_requirements) VALUES
(
  'RS',
  'Serbia',
  2,
  false,
  false,
  '["identity", "revocation", "beneficiaries", "date", "signature"]'::jsonb,
  '{
    "title": "Testament",
    "identity": "Ja, {name}, rođen/a {birthDate}, sa prebivalištem u {address}",
    "revocation": "Ovim opozivam sve svoje ranije testamente i dodatke.",
    "beneficiaries": "Ostavljam u nasledstvo",
    "signature": "Potpis ostavioca",
    "witness": "Svedok",
    "date": "Datum"
  }'::jsonb,
  'Requires either handwriting by testator OR typed with 2 witnesses present at signing'
);

-- Albania
INSERT INTO will_requirements (country_code, country_name, witness_count, requires_handwriting, requires_notarization, required_clauses, legal_language, signature_requirements) VALUES
(
  'AL',
  'Albania',
  3,
  false,
  true,
  '["identity", "revocation", "beneficiaries", "date", "signature", "soundMind"]'::jsonb,
  '{
    "title": "Testament",
    "identity": "Unë, {name}, i/e lindur më {birthDate}, me banim në {address}",
    "revocation": "Me këtë revokoj të gjitha testamentet dhe kodicilët e mia të mëparshëm.",
    "beneficiaries": "Lë trashëgim",
    "signature": "Nënshkrimi i testatorit",
    "witness": "Dëshmitar",
    "date": "Data",
    "soundMind": "deklaroj se jam në posedim të plotë të aftësive mendore"
  }'::jsonb,
  'Requires notarization and 3 witnesses present at signing'
);

-- North Macedonia
INSERT INTO will_requirements (country_code, country_name, witness_count, requires_handwriting, requires_notarization, required_clauses, legal_language, signature_requirements) VALUES
(
  'MK',
  'North Macedonia',
  2,
  false,
  true,
  '["identity", "revocation", "beneficiaries", "date", "signature", "soundMind"]'::jsonb,
  '{
    "title": "Тестамент",
    "identity": "Јас, {name}, роден/а {birthDate}, со живеалиште на {address}",
    "revocation": "Со ова ги отповикувам сите мои претходни тестаменти и додатоци.",
    "beneficiaries": "Оставам во наследство",
    "signature": "Потпис на оставителот",
    "witness": "Сведок",
    "date": "Датум",
    "soundMind": "изјавувам дека сум при полна свест и разум"
  }'::jsonb,
  'Requires notarization by a notary public'
);

-- Montenegro
INSERT INTO will_requirements (country_code, country_name, witness_count, requires_handwriting, requires_notarization, required_clauses, legal_language, signature_requirements) VALUES
(
  'ME',
  'Montenegro',
  2,
  false,
  false,
  '["identity", "revocation", "beneficiaries", "date", "signature"]'::jsonb,
  '{
    "title": "Testament",
    "identity": "Ja, {name}, rođen/a {birthDate}, sa prebivalištem u {address}",
    "revocation": "Ovim opozivam sve svoje ranije testamente i dodatke.",
    "beneficiaries": "Ostavljam u nasleđe",
    "signature": "Potpis ostavioca",
    "witness": "Svjedok",
    "date": "Datum"
  }'::jsonb,
  'Requires either handwriting by testator OR typed with 2 witnesses present at signing'
);
