
# Nový UX prístup: Od "Nástroja na závet" k "Asistentovi pre inventúru života"

## Filozofická zmena

### PRED: Technický nástroj
- "Vytvorte si závet"
- "Pridajte guardians"
- "Organizujte assets"
- Používateľ = expert na dedičstvo

### PO: Osobný asistent
- "Spravme si inventúru vašeho života"
- "Postarajme sa o vašich blízkych"
- "Pripravme všetko pre pokoj v duši"
- Aplikácia = expert, používateľ = človek s bežnými starosťami

## Nová komunikačná stratégia

### 1. Zmena terminológie

| STARÉ (technické) | NOVÉ (ľudské) |
|-------------------|---------------|
| "Assets" | "Čo vlastníte a je vám drahé" |
| "Guardians" | "Ľudia, ktorým dôverujete" |
| "Beneficiaries" | "Tí, o ktorých sa chcete postarať" |
| "Documents" | "Dôležité papiere" |
| "Will generation" | "Vaše posledné želania" |
| "Legacy planning" | "Starostlivosť o budúcnosť" |

### 2. Nový onboarding flow

#### Aktuálny problém:
```
1. Pridajte assets
2. Pridajte guardians  
3. Pridajte beneficiaries
4. Nahrajte dokumenty
```

#### Nový prístup - "Životné scenáre":
```
1. "Predstavte si, že zajtra..." (emocionálny hook)
2. "Povedzte nám o svojom živote" (prirodzené otázky)
3. "Ukážeme vám, čo potrebujete pripraviť" (personalizované odporúčania)
4. "Spolu to zvládneme krok za krokom" (postupné plnenie)
```

### 3. Nové otázky v onboardingu

#### Namiesto technických otázok:
- "Koľko assets máte?"
- "Kto budú vaši guardians?"

#### Kladieme životné otázky:
- "Máte deti?" → automaticky navrhne guardian pre deti
- "Vlastníte dom?" → automaticky navrhne kategórie dokumentov
- "Máte podnikanie?" → navrhne business continuity plán
- "Žijete s partnerom?" → navrhne spoločné vs. osobné majetky
- "Máte starých rodičov?" → navrhne zdravotné plnovmocenstvo

## Nový dashboard koncept

### Aktuálny dashboard:
- Technické piliere (Secure, Organize, Transfer)
- Abstraktné metriky (Security Score 78%)
- Zoznamy úloh

### Nový "Life Inventory Dashboard":

#### 1. Hlavný pohľad: "Váš životný obraz"
```
🏠 Váš domov a majetky
   ✅ Byt v Bratislave (dokumenty kompletné)
   ⚠️  Chata na Orave (chýba poistenie)
   
👨‍👩‍👧‍👦 Vaša rodina
   ✅ Manželka Mária (má prístup k účtom)
   ⚠️  Syn Peter (16) (potrebuje opatrovníka)
   
💰 Vaše financie
   ✅ Hlavný účet VÚB (manželka má prístup)
   ❌ Investičný účet (nikto nemá prístup!)
   
📄 Dôležité papiere
   ✅ Občiansky preukaz, pas
   ⚠️  Poistné zmluvy (expirujú za 3 mesiace)
```

#### 2. Inteligentné scenáre namiesto abstraktných úloh:
```
❗ "Čo ak sa vám zajtra niečo stane?"
   → Vaša manželka nebude môcť pristúpiť k investičnému účtu
   → Riešenie: Pridajte ju ako oprávnenú osobu (5 minút)

⚠️  "Čo ak budete 3 mesiace v nemocnici?"
   → Nikto nebude môcť platiť účty za chatu
   → Riešenie: Nastavte trvalé príkazy (10 minút)

💡 "Čo ak sa budete chcieť presťahovať?"
   → Budete potrebovať všetky dokumenty k nehnuteľnostiam
   → Riešenie: Naskenujte ich teraz (15 minút)
```

### 3. "Asistent pre pokojný spánok"
Namiesto "Security Score" → "Pokojný spánok index"
- "Môžete spať pokojne na 87%"
- "Ešte 2 kroky a budete mať úplný pokoj"

## Nová navigácia

### Aktuálna navigácia:
- Dashboard
- Assets  
- Documents
- Guardians
- Will
- Vault

### Nová navigácia:
- **Môj životný obraz** (hlavný dashboard)
- **Čo vlastním** (assets, ale ľudsky)
- **Moji blízki** (guardians + beneficiaries spolu)
- **Dôležité papiere** (documents s inteligentným triedením)
- **Moje želania** (will, ale emocionálne)
- **Núdzové situácie** (scenáre "čo ak")

## Nové funkcie pre elimináciu prokrastinácie

### 1. "5-minútové víťazstvá"
Namiesto veľkých úloh → mikro-úlohy:
- "Odfotografujte občiansky preukaz" (1 min)
- "Napíšte telefón na vašu banku" (30 sek)
- "Označte jednu dôležitú osobu" (2 min)

### 2. "Životné míľniky ako triggery"
- Narodeniny → "Čas na aktualizáciu"
- Zmena práce → "Aktualizujte beneficiárov"
- Kúpa domu → "Pridajte nové dokumenty"
- Svadba → "Aktualizujte rodinný stav"

### 3. "Emocionálne anchory"
Namiesto abstraktných dôvodov → konkrétne scenáre:
- Ukážka: "Takto bude vyzerať situácia vašej rodiny, ak..."
- Príbehy: "Mária z Košíc si ušetrila 6 mesiacov starostí vďaka..."
- Kalkulačka: "Vaša rodina ušetrí 2500€



## Nové komponenty na implementáciu

### 1. LifeInventoryDashboard.tsx (nahrádza Dashboard.tsx)
```typescript
interface LifeArea {
  id: string;
  title: string; // "Váš domov a majetky"
  icon: React.ReactNode;
  status: 'complete' | 'needs_attention' | 'critical';
  items: LifeItem[];
  nextAction: string;
  whyImportant: string;
  scenario: string; // "Čo ak sa vám zajtra niečo stane?"
}
```

### 2. ScenarioPlanner.tsx (nový komponent)
- Interaktívne scenáre "Čo ak..."
- Vizualizácia dopadov na rodinu
- Konkrétne kroky na riešenie

### 3. MicroTaskEngine.tsx (nový komponent)
- Rozdelenie veľkých úloh na 5-minútové kroky
- Gamifikácia bez trivializovania
- Progresívne odhaľovanie

### 4. EmotionalOnboarding.tsx (nahrádza OnboardingWizard.tsx)
- Životné otázky namiesto technických
- Personalizácia na základe rodinnej situácie
- Emocionálne prepojenie na painful problems

## Zmeny v existujúcich komponentoch

### StrategicSummary.tsx → LifeOverview.tsx
- Zmena z abstraktných "strategic areas" na konkrétne životné oblasti
- Pridanie scenárov "čo ak"
- Vizuálne prepojenie medzi oblasťami

### AssetOverview.tsx → MyPossessions.tsx
- Grupovanie podľa životných kategórií (domov, práca, koníčky)
- Automatické rozpoznávanie súvisiacich dokumentov
- Inteligentné odporúčania na základe typu majetku

### GuardianCard.tsx → TrustedPeople.tsx
- Spojenie guardians a beneficiaries do jedného pohľadu
- Vizualizácia vzťahov a zodpovědností
- Scenáre pre rôzne situácie

## Nová komunikačná stratégia v UI

### Aktuálne hlášky:
- "Asset added successfully"
- "Guardian invitation sent"
- "Document uploaded"

### Nové hlášky:
- "Skvelé! Vaša rodina teraz vie o tomto majetku"
- "Mária dostala pozvánku a bude vám môcť pomôcť"
- "Tento dokument je teraz v bezpečí pre vašich blízkych"

### Nové chybové hlášky:
- Namiesto: "Document upload failed"
- Nové: "Nepodarilo sa nám uložiť dokument. Skúsme to znovu, aby vaša rodina mala všetko potrebné"

## Personalizácia na základe demografických údajov

### Pre mladé páry (25-35):
- Fokus na budúcnosť detí
- Hypotéky a úvery
- Kariérny rast

### Pre stredný vek (35-55):
- Deti a ich vzdelanie
- Podnikanie
- Starnutie rodičov

### Pre seniorov (55+):
- Zdravotné problémy
- Dedičstvo pre deti
- Zjednodušenie záležitostí

## Implementačné priority

### Fáza 1 (kritické):
1. Nový onboarding s životnými otázkami
2. Zmena terminológie v celej aplikácii
3. LifeInventoryDashboard s vizuálnym prehľadom

### Fáza 2 (dôležité):
1. ScenarioPlanner pre "čo ak" situácie
2. MicroTaskEngine pre elimináciu prokrastinácie
3. Inteligentné notifikácie na základe životných míľnikov

### Fáza 3 (rozšírenia):
1. Personalizácia na základe demografických údajov
2. Emocionálne príbehy a testimonials
3. Kalkulačky úspor času a peňazí

