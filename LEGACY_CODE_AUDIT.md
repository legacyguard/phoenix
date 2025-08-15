# Audit a Plán Čistenia Legacy Kódu

**Dátum auditu:** 15. August 2025  
**Stav:** Kritický - vyžaduje okamžité čistenie

## 📊 Súhrn
- **Celkový počet legacy súborov identifikovaných:** ~200+
- **Kritické problémy:** 38 hooks, 14 contexts, 50+ services
- **Odhadovaný technický dlh:** Vysoký

---

## 1. Správa stavu (Hooks & Contexts) 🔴 KRITICKÉ

### Hooks (38 súborov v `src/hooks/`)

#### ZACHOVAŤ (E2E testing):
- **`src/hooks/useAuth.ts`**
  - **Akcia:** `ZACHOVAŤ` (dočasne)
  - **Odôvodnenie:** Obsahuje E2E mock logiku pre testovanie. Po migrácii testov na nový systém vymazať.

#### VYMAZAŤ (nahradené Clerk funkcionalitou):
- **`src/hooks/useUserSettings.ts`**
- **`src/hooks/useUserPlan.ts`**
- **`src/hooks/useSubscription.ts`**
  - **Akcia:** `DELETE`
  - **Odôvodnenie:** Užívateľské dáta a plány sú teraz v Clerk user metadata

#### VYMAZAŤ (patriace k vymazaným komponentom):
- **`src/hooks/useAcknowledgmentManager.ts`**
- **`src/hooks/useDocuments.ts`**
- **`src/hooks/useExecutorTasks.ts`**
- **`src/hooks/useLifeEventTracking.ts`**
- **`src/hooks/useProfessionalProgress.ts`**
- **`src/hooks/useAssistant.ts`**
- **`src/hooks/useEmpatheticError.ts`**
- **`src/hooks/useGenderedTranslation.ts`**
- **`src/hooks/useLocalOCR.ts`**
- **`src/hooks/useUXMetrics.ts`**
- **`src/hooks/useUsageNudge.ts`**
- **`src/hooks/useUserJourney.ts`**
  - **Akcia:** `DELETE`
  - **Odôvodnenie:** Patrili k vymazaným komponentom

#### REFAKTOROVAŤ (modernizovať):
- **`src/hooks/useFeatureFlag.ts`** & **`src/hooks/useFeatureFlags.ts`**
  - **Akcia:** `REFACTOR`
  - **Odôvodnenie:** Zlúčiť do jedného a integrovať s Clerk public metadata

### Contexts (14 súborov v `src/contexts/`)

#### VYMAZAŤ (všetky nahradené):
- **`src/contexts/AuthContext.tsx`** - prázdny shim
- **`src/contexts/AssistantContext.tsx`** - starý assistant
- **`src/contexts/SubscriptionContext.tsx`** & súvisiace súbory - nahradené Clerk
- **`src/contexts/CountryContext.tsx`** & **`src/contexts/CountryContextContext.tsx`** (duplikácia!)
- **`src/contexts/ThemeContext.tsx`** & **`src/contexts/ThemeContextContext.tsx`** (duplikácia!)
- **`src/contexts/ErrorContext.tsx`** - starý error handling
- **`src/contexts/GrowthBookContext.tsx`** - A/B testing, nepotrebné
  - **Akcia:** `DELETE ALL`
  - **Odôvodnenie:** Všetky nahradené modernými riešeniami alebo Clerk

---

## 2. Routovanie 🟡 STREDNÁ PRIORITA

### App.tsx problémy:
- **Problém 1:** Import `ProtectedRoute` komponentu (riadok 10)
  - **Akcia:** `DELETE`
  - **Odôvodnenie:** Používa sa len na jednom mieste, nahradiť priamo `<SignedIn>`

- **Problém 2:** Importy neexistujúcich stránok
  - Skontrolovať všetky importy stránok (riadky 6-22)
  - **Akcia:** `VERIFY & CLEAN`

- **Problém 3:** Legacy services (riadky 24-32)
  - `MigrationService`, `KeyService`, `HeartbeatService`, atď.
  - **Akcia:** `EVALUATE`
  - **Odôvodnenie:** Možno sú stále potrebné pre šifrovanie, ale treba prehodnotiť

- **Problém 4:** UnlockModal a passphrase logika
  - **Akcia:** `EVALUATE`
  - **Odôvodnenie:** Ak je šifrovanie core feature, ponechať. Inak vymazať.

---

## 3. Pomocné funkcie (lib & utils) 🟠 VYSOKÁ PRIORITA

### `src/lib/` (15 súborov)

#### VYMAZAŤ:
- **`src/lib/supabase.ts`** & **`src/lib/supabase-server.ts`**
  - **Akcia:** `DELETE`
  - **Odôvodnenie:** Ak používate iné backend riešenie

- **`src/lib/server-i18n.ts`**
  - **Akcia:** `DELETE`
  - **Odôvodnenie:** SSR i18n nie je potrebné pre SPA

#### REFAKTOROVAŤ:
- **`src/lib/api/client.ts`**
  - **Akcia:** `REFACTOR`
  - **Odôvodnenie:** Zjednotiť všetky API volania pod jeden axios klient

### `src/utils/` (27 súborov)

#### VYMAZAŤ (špecifické pre staré komponenty):
- **`src/utils/documentCategories.ts`**
- **`src/utils/taskCategories.ts`**
- **`src/utils/willRequirements.ts`**
- **`src/utils/reminderUtils.ts`**
- **`src/utils/analyticsHelpers.ts`**
  - **Akcia:** `DELETE`
  - **Odôvodnenie:** Patrili k vymazaným features

#### ZACHOVAŤ & REFAKTOROVAŤ:
- **`src/utils/dateFormatters.ts`**
- **`src/utils/currency.ts`**
- **`src/utils/constants.ts`**
  - **Akcia:** `REFACTOR`
  - **Odôvodnenie:** Generické utility, ale treba vyčistiť od legacy konštánt

---

## 4. Typy 🟡 STREDNÁ PRIORITA

### `src/types/` (10 súborov)

#### VYMAZAŤ:
- **`src/types/onboarding.ts`**
- **`src/types/sharing.ts`**
- **`src/types/timeCapsule.ts`**
- **`src/types/will.ts`**
- **`src/types/willSync.ts`**
- **`src/types/document-ai.ts`**
  - **Akcia:** `DELETE`
  - **Odôvodnenie:** Typy pre vymazané features

#### REFAKTOROVAŤ:
- **`src/types/index.ts`**
  - **Akcia:** `REFACTOR`
  - **Odôvodnenie:** Vyčistiť od legacy typov, ponechať len core typy

---

## 5. Services & API 🔴 KRITICKÉ

### `src/services/` (50+ súborov!)

#### KATEGÓRIE NA VYMAZANIE:

**Legacy Features (DELETE ALL):**
- `AcknowledgmentTriggers.ts`
- `BehavioralNudges.ts`
- `DocumentAIService.ts`
- `DocumentMetadataService.ts`
- `LegalConsultationService.ts`
- `LifeEventService.ts`
- `LifeMilestoneTriggers.ts`
- `LivingLegacy.ts`
- `NudgeService.ts`
- `PlaybookService.ts`
- `ProfessionalProgressService.ts`
- `ProgressService.ts`
- `ReminderService.ts`
- `VaultService.ts`
- `WillTemplateService.ts`

**Auth & Subscription (DELETE):**
- `authService.ts` - nahradené Clerk
- `SubscriptionService.ts` - nahradené Clerk metadata
- `StripePaymentService.ts` - ak nepoužívate Stripe

**ZACHOVAŤ (možno potrebné):**
- `EncryptionService.ts` - ak používate lokálne šifrovanie
- `KeyService.ts` - ak používate passphrase
- `LocalDataAdapter.ts` - ak používate localStorage
- `CloudSyncService.ts` - ak synchronizujete dáta

---

## 🎯 Akčný plán (prioritizovaný)

### Fáza 1: Okamžité vymazanie (1 deň)
1. **Vymazať všetky contexts** v `src/contexts/` (14 súborov)
2. **Vymazať legacy hooks** v `src/hooks/` (~30 súborov)
3. **Vymazať legacy services** v `src/services/` (~30 súborov)
4. **Vymazať typy** pre vymazané features (~8 súborov)

### Fáza 2: Refaktoring (2-3 dni)
1. **Vyčistiť App.tsx** od nepoužívaných importov
2. **Zjednotiť API client** v `src/lib/api/`
3. **Vyčistiť utils** od legacy funkcií
4. **Aktualizovať types/index.ts**

### Fáza 3: Validácia (1 deň)
1. **Spustiť build** a opraviť chyby
2. **Spustiť testy** a aktualizovať/vymazať staré
3. **Manuálne testovanie** základných flows

---

## 📈 Očakávané výsledky

- **Redukcia kódu:** -70% súborov
- **Zlepšenie build času:** -40%
- **Zníženie bundle size:** -50%
- **Zlepšenie maintainability:** 10x

## ⚠️ Riziká

1. **Šifrovanie/Passphrase:** Ak je to core feature, opatrne s KeyService
2. **E2E testy:** Môžu sa pokaziť po vymazaní mock logiky
3. **Hidden dependencies:** Niektoré services môžu byť používané nepriamo

## ✅ Odporúčanie

**ZAČAŤ OKAMŽITE** s Fázou 1. Projekt má extrémne vysoký technický dlh. Každý deň odkladu zvyšuje riziko a komplikuje budúci vývoj.
