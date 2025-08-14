**1. Úvod**

Aplikácia je React + TypeScript web (PWA-ready) s modulárnou architektúrou a supabase backendom pre bezpečnú synchronizáciu vybraných funkcií naprieč zariadeniami (web, mobil). Mobilná aplikácia je primárnym zdrojom heartbeatu (prítomnosti používateľa); web z neho číta a prispôsobuje správanie (presence banner, deadman switch).

-   Cieľové platformy: web (desktop/mobile browser), natívna mobilná app (budúca integrácia).

-   Vzťah medzi webom a mobilom:

-   Web: funguje offline s localStorage; voliteľne číta heartbeat zo Supabase.

-   Mobil: zapisuje heartbeat do Supabase (touch('mobile')), web ho číta a rešpektuje.

-   Hlavné moduly:

-   Služby v src/services/\* (ReminderService, ExpirationSnoozeService, PreferencesService, HeartbeatService, DebugService).

-   UI stránky v src/pages/\* (Dashboard, Vault, DocumentAnalysis, Settings, Onboarding).

-   Adaptéry v src/services/adapters/\* (SupabaseHeartbeatAdapter).

-   Utilitky v src/utils/\* (quiet hours, expiration).

**2. Architektúra projektu**

-   Adresáre:

-   src/services: aplikačná logika a integrácie (každá funkčnosť samostatná služba).

-   src/services/adapters: adapter pattern pre výmeniteľné backends (napr. Supabase).

-   src/pages: view vrstvy (Dashboard, Vault, Settings, ...).

-   src/components: malé UI prvky (Toast).

-   src/utils: čisté funkcie (čas, kategorizácia, quiet hours).

-   Servisná vs UI logika:

-   UI (React) volá služby; žiadna business logika v komponentoch okrem lepidla.

-   Adapter pattern:

-   Heartbeat používa adapter pre localStorage alebo Supabase; výmena jediným volaním.

-   Typy a konštanty:

-   Typy definované v službách; kľúče localStorage sú centralizované vo vlastných službách.

**3. Hlavné služby**

**3.1 ReminderService**

-   Súbor: src/services/ReminderService.ts

-   Účel: plánovanie pripomienok k úlohám (in-app banner na due).

-   Dáta:

-   type Reminder:

-   id: string

-   title: string (väzba na task.title)

-   dueAt: string (ISO)

-   repeat?: 'none' \| 'weekly' \| 'monthly'

-   snoozedUntil?: string (ISO)

-   createdAt: string (ISO)

-   API:

-   list(): Reminder[]

-   saveAll(reminders: Reminder[])

-   add(r: Omit\<Reminder, 'id' \| 'createdAt'\>): Reminder

-   update(id: string, patch: Partial\<Reminder\>): void

-   remove(id: string): void

-   Ukladanie: localStorage['taskReminders_v1'].

Príklad:

ts

import { ReminderService } from '@/services/ReminderService';

const rec = ReminderService.add({

title: 'Vytvoriť inventár',

dueAt: new Date(Date.now() + 24\*60\*60\*1000).toISOString(),

repeat: 'none',

});

Poznámka (best practice): pri ukladaní dátumu ukladať aj tzOffset; pri čítaní prevádzať na lokálny čas (pozri sekciu 5).

**3.2 ExpirationSnoozeService**

-   Súbor: src/services/ExpirationSnoozeService.ts

-   Účel: používateľ môže “odložiť” expiračné upozornenie dokumentu na X dní.

-   API:

-   list(): { docId: string; snoozedUntil: string }[]

-   set(docId: string, untilISO: string): void

-   get(docId: string): string \| null

-   Integrácia s Dashboardom:

-   Pri výpočte expiringDocs sa zohľadní snoozedUntil; ak je v budúcnosti, dokument sa nezobrazí.

-   UI ponúka tlačidlá “Pripomenúť o 7 dní / 30 dní” (okamžite odstráni položku z UI).

**3.3 HeartbeatService**

-   Súbor: src/services/HeartbeatService.ts

-   Účel: evidovať poslednú aktivitu (presence); rešpektuje quiet hours a deadman switch.

-   Debounce: touch() je debounced (default 5s), aby sa minimalizovali zápisy (záťaž, súkromie).

-   Ukladanie tzOffset: pri touch() ukladá tzOffset: number (minutes).

-   Adaptéry:

-   LocalStorageHeartbeatAdapter (default, offline):

-   Ukladá JSON { ts, source, tzOffset } do localStorage['lastActiveAt_v1'].

-   SupabaseHeartbeatAdapter (pripravený v src/services/adapters/SupabaseHeartbeatAdapter.ts):

-   touch(source) vkladá riadok do heartbeat_events (user_id, source, touched_at).

-   getLast() číta posledný riadok pre userId (ORDER BY touched_at DESC LIMIT 1).

-   API:

-   HeartbeatService.setAdapter(adapter: HeartbeatAdapter)

-   HeartbeatService.touch(source?: 'web' \| 'mobile')

-   HeartbeatService.getLast()

Príklad integrácie adaptéra:

ts

import { HeartbeatService } from '@/services/HeartbeatService';

import { SupabaseHeartbeatAdapter } from '@/services/adapters/SupabaseHeartbeatAdapter';

import { supabase } from '@/integrations/supabase/client';

// pri štarte (po prihlásení a dostupnom userId + supabase)

HeartbeatService.setAdapter(new SupabaseHeartbeatAdapter(supabase, userId));

**3.4 PreferencesService**

-   Súbor: src/services/PreferencesService.ts

-   Účel: perzistentné preferencie používateľa pre notifikácie, bannery a režimy.

-   Polia:

-   nudgesEnabled: boolean (default true)

-   expirationBannerEnabled: boolean (default true)

-   completionToastEnabled: boolean (default true)

-   metadataToastsEnabled: boolean (default true)

-   quietHoursEnabled: boolean (default false)

-   quietHoursStart: string (‘22:00’)

-   quietHoursEnd: string (‘07:00’)

-   remindersEnabled: boolean (default true)

-   dailyDigestEnabled: boolean (default false)

-   dailyDigestTime: string (‘09:00’)

-   deadManSwitchEnabled: boolean (default false)

-   inactivityDays: number (default 30)

-   inactivityGraceHours: number (default 12)

-   heartbeatAdapterType: 'local' \| 'supabase' (default 'local')

-   API:

-   get(): AppPreferences (merge s defaultmi + persist)

-   set(patch: Partial\<AppPreferences\>): AppPreferences

**4. UI komponenty**

**4.1 Dashboard**

-   Súbor: src/pages/Dashboard.tsx

-   Zobrazenie reminderov k úlohám:

-   Pod každou úlohou link „Pripomenúť…“ → inline mini-form s predvoľbami (dnes večer / zajtra / o týždeň / vlastný).

-   Uloženie volá ReminderService.add (default zajtra 09:00).

-   Banner na due remindery (mimo quiet hours a ak remindersEnabled):

-   „Pripomienka k úlohe … – Odložiť o deň / Odložiť o týždeň / Označiť ako vybavené“.

-   Expiration banner so snoozovaním:

-   Sekcia „Expiračné upozornenia“ zobrazuje dokumenty s blížiacou sa expiráciou (≤ 180 dní) a nie sú snooznuté.

-   Ovládanie: „Pripomenúť o 7 dní / 30 dní“ → ExpirationSnoozeService.set, okamžité skrytie v UI.

-   Presence banner (deadman switch):

-   Ak deadManSwitchEnabled a inaktivita ≥ (inactivityDays \* 24 + inactivityGraceHours) hodín (a sme mimo quiet hours), zobrazí sa jemný banner „Prosíme o potvrdenie…“.

-   Tlačidlo „Potvrdiť“ → HeartbeatService.touch('web'), skrytie bannera.

-   Quiet hours: všetky bannery/toasty rešpektujú tiché hodiny (nezobrazia sa v tichom intervale).

-   Completion toast:

-   Pri prechode úlohy z nesplnenej na splnenú (a ak completionToastEnabled a nie sme v quiet hours) zobrazí sa neutrálne uistenie (auto-hide \~2.5s).

**4.2 Vault a DocumentAnalysis**

-   Súbory: src/pages/Vault.tsx, src/pages/DocumentAnalysis.tsx

-   Po úspešnom uložení metadát:

-   HeartbeatService.touch('web') (debounced).

-   Ak metadataToastsEnabled a nie sme v quiet hours, zobrazí sa jemný toast (auto-hide).

-   Vault: inline edit metadát s jednoduchou validáciou (povinné polia).

**4.3 Settings**

-   Súbor: src/pages/Settings.tsx

-   Nastavenia:

-   Bannery/toasty (nudges, expiration, completion toast, metadata toast).

-   Quiet hours (zapnutie + start/end s validáciou HH:MM).

-   Reminders enabled, Daily digest (čas HH:MM).

-   Deadman switch: enable + inactivityDays (7–365) + inactivityGraceHours (0–48) s validáciami a chybami (accessible-friendly).

-   Dev-only: „Reset local data“ (DebugService).

-   Budúce: prepínač heartbeatAdapterType (local vs supabase) – odporúčané pridať, keď je dostupný userId a Supabase.

**5. Práca s časom**

-   Ukladanie:

-   Vždy ISO string (new Date().toISOString()).

-   Ukladať aj tzOffset: number (minutes) spolu s dátumami, aby sa dalo korektne prevádzať naprieč časovými pásmami (heartbeat už ukladá).

-   Zobrazenie:

-   Pri čítaní prepočítavať na lokálny čas používateľa (ak je dostupný offset).

-   Validácia:

-   Form inputy (time/number) majú UI atribúty (min/max), onChange validáciu a chybové hlášky.

**6. Quiet Hours**

-   Súbor: src/utils/quietHours.ts

-   isWithinQuietHours(startHHMM: string, endHHMM: string, now?: Date): boolean

-   Podporuje intervaly cez polnoc (napr. 22:00–07:00).

-   Uplatnenie:

-   Nudge, expiračné bannery, completion toasty, metadata toasty, presence banner, due remindery.

-   Heartbeat touch cez mobil počas quiet hours je validný (mobil môže „žít“ v tichu), ale bannery na webe sa počas quiet hours nezobrazia.

**7. Integrácia s mobilnou aplikáciou**

-   Heartbeat sync (Supabase):

-   Mobil periodicky volá touch('mobile') a zapisuje do heartbeat_events.

-   Web si číta getLast() a aktualizuje prítomnosť, aby zbytočne nevyhadzoval presence banner.

-   Mobil ako hlavný zdroj heartbeatu:

-   Web môže fungovať offline (local adapter), no pri dostupnom pripojení a prihlásenom userId odporúčame prepnúť na Supabase adapter pre cross-device konzistenciu.

-   Budúce rozšírenia:

-   Push notifikácie (FCM/APNs), email/SMS, akcie deadman switch (kontaktovanie Guardianov).

**8. Best Practices**

-   Modularita kódu: každá funkcia v samostatnej službe (src/services/\*). Udržiavajte malé, testovateľné API.

-   Adapter pattern: pri integrácii (Supabase, localStorage) vždy vytvoriť adapter, aby ste prepli backend bez zásahu do UI.

-   Minimalizmus UI: málo klikov, čitateľné texty, bez gamifikácie. Bannery neutrálne, toasty jemné.

-   Quiet hours: konzistentne aplikujte na notifikácie, bannery, toasty.

-   Debounce/throttle: minimalizujte zápisy (heartbeat, autosave). Heartbeat má builtin debounce 5s.

-   Time handling: ISO + tzOffset; pri čítaní prevádzať na lokál; počítať s pohybom naprieč TZ.

-   Validácie: v UI aj logike – rozsahy, formáty (HH:MM), required polia pri metadátach.

-   Preferencie: každá notifikácia má switch v Settings (používateľ musí mať kontrolu).

-   Bezpečné defaulty: remindersEnabled true, quietHours default off, deadManSwitch default off.

-   Snoozovanie: po snooze položku ihneď skryť z UI (zníženie kognitívnej záťaže).

-   Cross-device sync: Supabase adapter udržiava jednotný stav web/mobil.

-   Testovanie: simulovať quiet hours, due reminders, expiračné bannery, heartbeat v debug režime.

-   Debug: DebugService.resetAllLocalData() pre rýchly návrat do čistého stavu.

-   Príprava na mobil: web offline-first; mobil ako primárny heartbeat zdroj.

**9. Debug & Testing**

-   DebugService (src/services/DebugService.ts):

-   resetAllLocalData() vymaže appPreferences, taskReminders_v1, expirationSnooze_v1, lastActiveAt_v1.

-   V Settings je dev-only tlačidlo, ktoré resetne a reloadne.

-   Test scenáre:

-   Quiet hours: nastavte interval zahŕňajúci aktuálny čas; bannery/toasty sa nemajú zobrazovať.

-   Reminders: vytvorte pripomienku s dueAt v minulosti ±5m; banner sa ukáže (ak zapnuté).

-   Expiration: pridajte metadáta s expiráciou ≤ 180 dní; overte snooze (7/30 dní).

-   Heartbeat: rýchle prepínanie route – iba 1 zápis/5s (debounce).

-   Presence banner: nastavte deadManSwitchEnabled, zvýšte inactivityDays na malú hodnotu a testnite mount.

##10. A11y & Unlock Modal

 Nový komponent UnlockModal zaisťuje prístupné a bezpečné odomykanie citlivých dát.

 - Prístupnosť: aria-labelledby, aria-describedby, focus trap, zákaz scrollovania pozadia (body.modal-open), návrat focusu po zavretí.

 - Ovládanie klávesnicou: Escape zavrie modal bez odomknutia, Enter spustí odomknutie.

 - Integrácia: V App.tsx nahrádza pôvodný inline modal.

 - UX gating: V SettingsPrivacy sú všetky sync prepínače automaticky deaktivované, ak sú dáta zamknuté alebo neexistuje passphrase, s jasným textom „Vyžaduje odomknutie (passphrase)“.

##11. Index Repair & Data Consistency

 Aby sa predišlo chýbajúcim alebo zastaraným indexom v LocalDataAdapter, bol pridaný mechanizmus obnovy.

 - repairIndex(category): Na štarte aplikácie preiteruje localStorage a obnoví index pre reminders, documents, preferences.

 - Bezpečné mazanie: remove() po odstránení položky vždy uloží aktualizovaný index.

 - Výhoda: Minimalizuje riziko „osirelých“ dát a zvyšuje spoľahlivosť offline úložiska.

##12. Cloud Sync Throttle & In-Flight Guard

 Nový ochranný mechanizmus zabraňuje preťaženiu synchronizácie a zbytočným kolíziám.

 - In-flight kontrola: Každá kategória môže mať len jednu čakajúcu alebo bežiacu sync úlohu naraz.

 - Časová ochrana: Ak od posledného behu kategórie uplynulo menej ako 5 sekúnd, nová sync úloha sa ignoruje.

- Efekt: Znižuje duplicitu requestov, šetrí batériu a optimalizuje prácu s API.

##13. Export Hygiene

 Export mechanizmus bol upravený tak, aby chránil citlivé údaje a dodržiaval zásadu minimálnych práv.

 - Odomknutie vyžadované: Ak nie je DEK v pamäti, spustí sa UnlockModal a export sa vykoná až po úspešnom odomknutí.

 - Cielený export: Exportuje sa iba dešifrovaný obsah kategórií reminders, documents, preferences (a prípadne tasks, ak existuje index).

 - Vynechané kľúče: Neexportujú sa interné kľúče (wrappedDEK_v1, kekSalt_v1, iterCount_v1, deviceId_v1, auditLog_v1, appPreferences legacy, secure_migration_v1_done) a dočasné vzory (heartbeat_*, nudgeBannerClosed_*).

 - Cieľ: Zabrániť úniku kryptografických kľúčov a interných metadát mimo bezpečné prostredie.

**14. Budúce rozšírenia**

-   Repeat logic pre remindery: pri potvrdení due vytvoriť nové dueAt +7/30 dní (zachovať tzOffset).

-   Email/SMS notifikácie: využiť Supabase functions alebo externú službu; rešpektovať preferencie a quiet hours.

-   Banner manager: centrálny orchestration (prioritizácia medzi presence, expiráciami, nudge).

-   Unit testy: pre služby (ReminderService, HeartbeatService debounce, PreferencesService merge).

-   Sync preferencií: ukladanie do Supabase, aby sa prenášali medzi zariadeniami.

-   Heartbeat adapter selection: UI prepínač v Settings pre ‘local’ vs ‘supabase’ (ak user prihlásený a supabase dostupný), a inicializácia adaptéra v App podľa preferencií.

**Kódové úryvky a integrácie**

-   Výber heartbeat adaptéra podľa preferencií (odporúčané doplniť do App init):

    ts

    import { HeartbeatService } from '@/services/HeartbeatService';

    import { SupabaseHeartbeatAdapter } from '@/services/adapters/SupabaseHeartbeatAdapter';

    import { PreferencesService } from '@/services/PreferencesService';

    import { supabase } from '@/integrations/supabase/client';

    import { useUser } from '@clerk/clerk-react';

    function useInitHeartbeatAdapter() {

    const { user } = useUser();

    useEffect(() =\> {

    const prefs = PreferencesService.get();

    if (prefs.heartbeatAdapterType === 'supabase' && user?.id) {

    HeartbeatService.setAdapter(new SupabaseHeartbeatAdapter(supabase, user.id));

    }

    }, [user?.id]);

    }

-   Pridanie tzOffset do pripomienok (odporúčanie):

    ts

    type Reminder = {

    id: string;

    title: string;

    dueAt: string; // ISO

    tzOffset?: number; // minutes

    // ...

    };

    const tzOffset = new Date().getTimezoneOffset();

    ReminderService.add({

    title: 'Zajtra',

    dueAt: new Date().toISOString(),

    tzOffset,

    repeat: 'none',

    });

-   Konverzia dátumu pri čítaní (ak potrebujete vyrenderovať lokálny čas):

    ts

    function toLocal(dateIso: string, sourceTzOffset?: number) {

    const d = new Date(dateIso);

    // ak máte uložený tzOffset, viete kompenzovať rozdiel medzi pôvodným a aktuálnym

    return d.toLocaleString();

    }

Týmto dokument zabezpečuje udržateľnosť, rozšíriteľnosť a konzistentné správanie (quiet hours, debounce, adapter pattern, používateľské preferencie) pre web aj mobil.
