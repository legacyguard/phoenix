# Privacy-first architecture – local processing & transparency

## Režimy
- Local-only: Všetky citlivé dáta zostávajú len lokálne (šifrované). Žiadne volania na Supabase pre tieto kategórie.
- Hybrid: Synchronizované sú len vybrané kategórie (napr. tasks), ostatné zostávajú lokálne.
- Full sync: Synchronizované sú všetky kategórie (tasks, documents, reminders, preferences). Vždy len šifrované payloady.

## Kontrolný checklist
- Pri Local-only nevznikajú žiadne Supabase volania pre kategórie tasks/documents/reminders/preferences.
- Pri Hybrid (napr. len tasks) sa tasks ukladajú šifrovane do Supabase tabuľky `encrypted_items`; ostatné kategórie len do lokálneho úložiska.
- Ikony pri položkách zodpovedajú preferenciám:
  - ☁️: prefs.cloudSyncEnabled && príslušný sync flag je true
  - 🔒: inak
- Export lokálnych dát vytvorí dešifrovaný JSON z LocalDataAdapter + EncryptionService.decryptObject.
- Audit log zaznamenáva create/update/sync udalosti s kategóriou a kľúčom.
- Linter a TypeScript prejdú.
- Read path používa encrypted first, fallback legacy.
- Po MIGRATION_FLAG=1 sa nové čítania berú zo šifrovaného úložiska.

## Poznámky
- MasterKey je dočasne v localStorage (`masterKey_v1`); neskôr nahradiť secure storage.
- AES-GCM používa náhodný IV pre každé šifrovanie.
- PBKDF2 iterácie min 100k; zvyšovať podľa potreby.
- Do cloudu nikdy neposielame dešifrované dáta.
- Pri migráciách zvýšiť `SecurePayload.version` a `EncryptedPayload.version`.

## Session & Locking
- Auto-lock po neaktivite (predvolene 15 min; nastaviteľné v Preferences). Pri lock sa DEK vymaže z pamäte.
- Unlock modal sa zobrazí pri potrebe prístupu k šifrovaným dátam a pri štarte, ak je nastavený wrapped DEK.
- Pri sign-out sa DEK purge-ne z pamäte a zastaví cloud sync interval.

## Export gating
- Export lokálnych dát prebieha len pri odomknutej session (DEK v pamäti). V opačnom prípade sa zobrazí Unlock modal.

## Cloud sync lifecycle
- Po úspešnom unlock sa okamžite spustí synchronizácia a následne periodický interval (10 min).
- Po lock sa interval zastaví a naplánované syncy sa zrušia.


