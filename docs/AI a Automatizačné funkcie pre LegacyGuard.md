# AI a Automatizačné funkcie pre LegacyGuard

## Vízia: Od manuálnej práce k inteligentnému asistentovi

### Aktuálny stav:

- Používateľ musí manuálne pridávať každý dokument
- Musí sám kategorizovať a označovať
- Musí si sám pamätať na expirácie
- Žiadne automatické prepojenia medzi dokumentmi a majetkom

### Cieľový stav:

- Aplikácia automaticky rozpozná typ dokumentu
- Sama navrhne kategórie a súvislosti
- Proaktívne upozorňuje na riziká a príležitosti
- Inteligentne prepája informácie

## 1. Automatické rozpoznávanie dokumentov (Document AI)

### Technická implementácia:

```typescript
interface DocumentAI {
  analyzeDocument(file: File): Promise<DocumentAnalysis>;
  extractMetadata(analysis: DocumentAnalysis): DocumentMetadata;
  suggestCategories(metadata: DocumentMetadata): string[];
  detectExpirationDates(analysis: DocumentAnalysis): Date[];
  findRelatedAssets(metadata: DocumentMetadata): string[];
}

interface DocumentAnalysis {
  documentType:
    | "insurance"
    | "bank_statement"
    | "property_deed"
    | "will"
    | "id_document"
    | "contract"
    | "medical"
    | "tax"
    | "other";
  confidence: number;
  extractedText: string;
  keyFields: {
    contractNumber?: string;
    expirationDate?: Date;
    issuer?: string;
    beneficiary?: string;
    amount?: number;
    currency?: string;
    propertyAddress?: string;
    accountNumber?: string;
  };
  suggestedActions: string[];
  relatedDocuments: string[];
}
```

### Konkrétne rozpoznávanie:

#### Poistné zmluvy:

- Automatické rozpoznanie typu poistenia (životné, úrazové, majetkové)
- Extrahovanie čísla zmluvy, sumy, beneficiárov
- Detekcia dátumu expirácie
- Návrh: "Pridať do kategórie 'Ochrana rodiny'"

#### Bankovské dokumenty:

- Rozpoznanie typu účtu (bežný, sporový, investičný)
- Extrahovanie čísla účtu, banky, zostatku
- Detekcia oprávnených osôb
- Návrh: "Pridať manželku ako oprávnenú osobu?"

#### Nehnuteľnosti:

- Rozpoznanie typu nehnuteľnosti (byt, dom, pozemok)
- Extrahovanie adresy, výmery, hodnoty
- Detekcia spoluvlastníkov
- Návrh: "Pridať súvisiace dokumenty (energetický certifikát, poistenie)"

#### Zdravotné dokumenty:

- Rozpoznanie typu (lekárska správa, recept, poistenie)
- Extrahovanie diagnóz, liekov, lekárov
- Detekcia dôležitých zdravotných informácií
- Návrh: "Pridať do núdzových informácií pre rodinu"

### Implementácia s OpenAI API:

```typescript
class DocumentAnalyzer {
  async analyzeDocument(imageData: string): Promise<DocumentAnalysis> {
    const prompt = `
    Analyzuj tento dokument a vráť JSON s nasledujúcimi informáciami:
    - documentType: typ dokumentu
    - keyFields: kľúčové polia (čísla, dátumy, sumy)
    - expirationDate: dátum expirácie ak existuje
    - suggestedCategory: navrhovaná kategória
    - importanceLevel: kritický/dôležitý/referenčný
    - suggestedActions: čo by mal používateľ urobiť
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${imageData}` },
            },
          ],
        },
      ],
    });

    return JSON.parse(response.choices[0].message.content);
  }
}
```

## 2. Inteligentná kontrola expirácie a notifikácie

### Proaktívne monitorovanie:

```typescript
interface ExpirationMonitor {
  checkExpirations(): Promise<ExpirationAlert[]>;
  scheduleReminders(document: Document): void;
  generateRenewalInstructions(document: Document): RenewalGuide;
}

interface ExpirationAlert {
  documentId: string;
  documentName: string;
  expirationDate: Date;
  daysUntilExpiration: number;
  severity: "critical" | "warning" | "info";
  actionRequired: string;
  consequences: string;
  renewalSteps: string[];
  estimatedTime: number; // minúty
  estimatedCost?: number;
}
```

### Inteligentné notifikácie:

#### Poistné zmluvy:

- 90 dní pred expirációu: "Čas na porovnanie ponúk"
- 30 dní: "Urgentne obnovte poistenie"
- Po expirácii: "KRITICKÉ: Vaša rodina nie je chránená!"

#### Doklady totožnosti:

- 6 mesiacov pred expirációu: "Obnovte si doklady v pokoji"
- 1 mesiac: "Môžete mať problémy s cestovaním"

#### Zmluvy a licencie:

- Automatická detekcia výpovedných lehôt
- Kalkulácia optimálneho času na výpoveď
- Návrhy lepších alternatív

### Kontextové notifikácie:

#### Na základe lokácie:

- V zahraničí: "Potrebujete cestovné poistenie?"
- Pri banke: "Aktualizujte oprávnené osoby na účte"
- U lekára: "Aktualizujte zdravotné informácie pre rodinu"

#### Na základe životných udalostí:

- Svadba: "Aktualizujte beneficiárov všetkých poistiek"
- Narodenie dieťaťa: "Potrebujete životné poistenie a testament"
- Zmena práce: "Aktualizujte pracovné benefity"
- Kúpa nehnuteľnosti: "Potrebujete poistenie a testament"

## 3. Inteligentné prepojenia a odporúčania

### Automatické prepojenia:

```typescript
interface SmartConnections {
  findRelatedDocuments(document: Document): Document[];
  suggestMissingDocuments(userProfile: UserProfile): MissingDocument[];
  detectInconsistencies(documents: Document[]): Inconsistency[];
  generateCompletionSuggestions(userProfile: UserProfile): Suggestion[];
}

interface MissingDocument {
  type: string;
  reason: string;
  importance: "critical" | "recommended" | "optional";
  whereToGet: string;
  estimatedTime: number;
  consequences: string;
}
```

### Príklady inteligentných prepojení:

#### Nehnuteľnosť → Súvisiace dokumenty:

- Vlastnícky list → Navrhne: energetický certifikát, poistenie, hypotéka
- Hypotéka → Navrhne: životné poistenie, testament
- Poistenie nehnuteľnosti → Navrhne: inventár majetku, fotodokumentácia

#### Rodina → Potrebné dokumenty:

- Manželstvo → Navrhne: spoločný testament, zdravotné plnovmocenstvo
- Deti → Navrhne: opatrovníctvo, životné poistenie, vzdelávací fond
- Podnikanie → Navrhne: business continuity plán, kľúčové zmluvy

### AI-powered odporúčania:

#### Analýza rizík:

```typescript
const riskAnalysis = {
  "Nemáte životné poistenie": {
    probability: 0.95,
    impact: "critical",
    message: "Ak sa vám niečo stane, vaša rodina bude mať finančné problémy",
    solution: "Získajte životné poistenie vo výške 5x ročný príjem",
    timeToResolve: "30 minút online",
  },
  "Manželka nemá prístup k investičnému účtu": {
    probability: 0.87,
    impact: "high",
    message: "V prípade vašej neschopnosti nebude môcť spravovať investície",
    solution: "Pridajte ju ako oprávnenú osobu alebo vytvorte plnovmocenstvo",
    timeToResolve: "1 návšteva banky",
  },
};
```

#### Personalizované odporúčania:

- Na základe veku: "Vo vašom veku 45 rokov je dôležité..."
- Na základe majetku: "Pri vašom majetku odporúčame..."
- Na základe rodiny: "S dvoma deťmi potrebujete..."
- Na základe krajiny: "V SR je povinné..."

## 4. Lokálne spracovanie pre súkromie

### Hybrid prístup:

```typescript
interface PrivacyFirstAI {
  // Lokálne spracovanie citlivých dát
  analyzeLocally(document: File): Promise<BasicAnalysis>;

  // Cloudové spracovanie len anonymizovaných metadát
  getRecommendations(
    anonymizedProfile: AnonymizedProfile,
  ): Promise<Recommendation[]>;

  // Používateľ kontroluje, čo sa posiela do cloudu
  getUserConsent(dataType: string): boolean;
}
```

### Lokálne AI funkcie:

- OCR rozpoznávanie textu
- Základná kategorizácia dokumentov
- Detekcia dátumov a čísel
- Anonymizácia pred poslaním do cloudu

### Cloudové AI funkcie (len s povolením):

- Komplexná analýza rizík
- Porovnanie s podobnými profilmi
- Aktuálne právne odporúčania
- Optimalizácia portfólia

## 5. Implementačné priority

### Fáza 1 - Základné rozpoznávanie (1-2 mesiace):

1. OCR pre extrahovanie textu z dokumentov
2. Rozpoznávanie základných typov dokumentov
3. Automatická detekcia dátumov expirácie
4. Jednoduché kategorizovanie

### Fáza 2 - Inteligentné prepojenia (2-3 mesiace):

1. Prepojenie dokumentov s majetkom
2. Detekcia chýbajúcich dokumentov
3. Základné notifikácie o expirácii
4. Kontextové odporúčania

### Fáza 3 - Pokročilá AI (3-4 mesiace):

1. Analýza rizík a scenárov
2. Personalizované odporúčania
3. Prediktívne notifikácie
4. Optimalizácia na základe správania

### Fáza 4 - Lokálne spracovanie (4-6 mesiacov):

1. Lokálne AI modely
2. Anonymizácia dát
3. Používateľská kontrola súkromia
4. Offline funkcionality
