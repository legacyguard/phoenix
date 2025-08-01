
# Analýza problémov aktuálnej LegacyGuard aplikácie

## Aktuálny stav aplikácie

### Pozitívne aspekty
1. **Solídna technická architektúra**: React + TypeScript, dobrá štruktúra komponentov
2. **Multijazyčnosť**: Podpora viacerých európskych jazykov
3. **Bezpečnosť**: Clerk autentifikácia, Supabase backend
4. **Modulárnosť**: Dobre rozdelené komponenty (assets, guardians, documents, will)

### Kritické problémy vzhľadom na "Painful Problems"

## 1. CHAOS A NEISTOTA PO ODIŠIELOM

### Aktuálny problém:
- Aplikácia je stále príliš **technická a fragmentovaná**
- Používateľ musí manuálne pridávať každý dokument, asset, guardian osobne
- **Žiadna automatizácia** rozpoznávania dokumentov
- **Žiadne inteligentné prepojenia** medzi dokumentmi a majetkom
- Rodina stále nebude vedieť "kde čo nájsť" - aplikácia len ukladá, ale nevytvára **holistický obraz**

### Dôsledky:
- Používateľ musí byť "expert" na organizáciu svojho dedičstva
- Vysoká pravdepodobnosť, že niečo dôležité zabudne
- Rodina stále bude musieť "hľadať" informácie v aplikácii

## 2. STRACH ZO STRATY KONTROLY A SÚKROMIA

### Aktuálny problém:
- Aplikácia **ukladá všetko do cloudu** (Supabase)
- Používateľ nemá pocit kontroly nad svojimi dátami
- **Žiadne lokálne spracovanie** citlivých dokumentov
- Chýba "privacy mode" alebo možnosť lokálneho spracovania

### Dôsledky:
- Používatelia s vysokými požiadavkami na súkromie aplikáciu nebudú používať
- Nedôvera v cloudové riešenia

## 3. PROKRASTINÁCIA A ZLOŽITOSŤ

### Aktuálny problém:
- **Onboarding je stále príliš technický** - pýta sa na "guardians", "assets", "beneficiaries"
- Používateľ musí **premýšľať v kategóriach aplikácie**, nie vo svojom prirodzenom myslení
- **Žiadne postupné odhaľovanie** - všetko naraz
- Chýba **emocionálna motivácia** - prečo to robiť práve teraz

### Dôsledky:
- Vysoká pravdepodobnosť opustenia aplikácie po registrácii
- Používateľ sa cíti zahltený množstvom úloh

## Konkrétne nedostatky v kóde

### Dashboard.tsx
- Príliš technické pojmy: "Asset Inventory", "Guardian Network"
- Chýba emocionálny kontext - prečo je to dôležité
- Žiadne automatické rozpoznávanie potrieb používateľa

### OnboardingWizard.tsx
- Pýta sa technické otázky namiesto životných situácií
- Chýba personalizácia na základe veku, rodinného stavu, majetku

### StrategicSummary.tsx
- Dobrý koncept, ale stále príliš abstraktný
- Chýbajú konkrétne scenáre: "Čo sa stane, ak zajtra..."

### Landing.tsx
- Komunikuje "features" namiesto "benefits"
- Chýba emocionálne prepojenie na painful problems

