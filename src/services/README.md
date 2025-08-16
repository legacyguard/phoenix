# Centrálna Servisná Vrstva - Phoenix

Tento dokument popisuje novú centrálnu servisnú vrstvu, ktorá zjednocuje prístup k dátam v aplikácii Phoenix.

## Prehľad

Pred refaktoringom boli dáta roztrúsené po celej aplikácii:
- Priamy prístup k `localStorage` v rôznych službách
- Rôzne formáty kľúčov (`legacyguard_*`, `phoenix-*`)
- Duplicitná logika pre prácu s JSON serializáciou
- Chyby pri práci s localStorage neboli konzistentne ošetrené

Po refaktoringu máme:
- **Jednotné API** pre všetky dátové operácie
- **Centralizované kľúče** pre localStorage
- **Konzistentné ošetrenie chýb** a logging
- **Príprava na budúcu integráciu** s reálnym back-endom

## Architektúra

```
┌─────────────────────────────────────────────────────────────┐
│                    Aplikácia (React)                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Špecializované Služby                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │assetService │ │peopleService│ │willService  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              StorageService (Centrálna Vrstva)              │
│  • get<T>(key): T | null                                   │
│  • set<T>(key, value): void                                │
│  • remove(key): void                                        │
│  • has(key): boolean                                        │
│  • getKeys(pattern?): string[]                              │
│  • clear(): void                                            │
│  • getSize(): number                                        │
│  • migrateLegacyData(): void                                │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    localStorage                              │
│  • phoenix-assets                                           │
│  • phoenix-people                                           │
│  • phoenix-wills                                            │
│  • phoenix-preferences                                      │
│  • ...                                                      │
└─────────────────────────────────────────────────────────────┘
```

## Kľúčové Komponenty

### 1. StorageService (`src/services/storageService.ts`)

Generická služba, ktorá abstrahuje všetky operácie s localStorage:

```typescript
import { storageService } from '@/services/storageService';

// Získanie dát s typovou bezpečnosťou
const assets = storageService.get<Asset[]>('assets');

// Uloženie dát
storageService.set('assets', updatedAssets);

// Odstránenie dát
storageService.remove('assets');

// Kontrola existencie
if (storageService.has('assets')) {
  // ...
}
```

**Vlastnosti:**
- **Typová bezpečnosť** - generické metódy s TypeScript
- **Automatické prefixovanie** - všetky kľúče majú prefix `phoenix-`
- **Error handling** - konzistentné ošetrenie chýb
- **Logging** - voliteľné logovanie operácií
- **Migrácia** - automatická migrácia z legacy kľúčov

### 2. Storage Keys (`src/config/storageKeys.ts`)

Centralizované konštanty pre všetky localStorage kľúče:

```typescript
import { storageKeys } from '@/config/storageKeys';

// Namiesto:
// localStorage.getItem('legacyguard_assets')

// Používame:
storageService.get(storageKeys.assets);
```

**Výhody:**
- **Bez preklepov** - TypeScript kontroluje existenciu kľúčov
- **Jednoduchá zmena** - všetky kľúče na jednom mieste
- **Konzistencia** - rovnaký formát pre všetky kľúče
- **Backward compatibility** - podpora pre legacy kľúče

### 3. Refaktorované Služby

Všetky existujúce služby boli refaktorované:

```typescript
// PRED refaktoringom:
const data = localStorage.getItem('legacyguard_assets');
const assets = data ? JSON.parse(data) : [];
localStorage.setItem('legacyguard_assets', JSON.stringify(updatedAssets));

// PO refaktoringom:
import { storageService } from './storageService';
import { storageKeys } from '@/config/storageKeys';

const assets = storageService.get<Asset[]>(storageKeys.assets) || [];
storageService.set(storageKeys.assets, updatedAssets);
```

## Použitie

### Základné Použitie

```typescript
import { storageService } from '@/services/storageService';
import { storageKeys } from '@/config/storageKeys';

// Uloženie dát
storageService.set(storageKeys.assets, assets);

// Získanie dát
const assets = storageService.get<Asset[]>(storageKeys.assets);

// Kontrola existencie
if (storageService.has(storageKeys.assets)) {
  // ...
}
```

### Vlastná Konfigurácia

```typescript
import { StorageService } from '@/services/storageService';

const customStorage = new StorageService({
  prefix: 'custom',
  enableLogging: true,
  enableMigration: false,
});

customStorage.set('key', 'value');
```

### Migrácia Legacy Dát

```typescript
// Automatická migrácia pri inicializácii
storageService.migrateLegacyData();

// Alebo manuálna migrácia
import { migrateStorageKey } from '@/config/storageKeys';

migrateStorageKey('legacyguard_assets', 'phoenix-assets');
```

## Migračný Plán

### Fáza 1: ✅ Dokončené
- [x] Vytvorenie StorageService
- [x] Centralizácia storage kľúčov
- [x] Refaktoring assetService
- [x] Refaktoring peopleService
- [x] Refaktoring willService
- [x] Testy pre StorageService

### Fáza 2: Plánované
- [ ] Refaktoring documentService
- [ ] Refaktoring PreferencesService
- [ ] Refaktoring KeyService
- [ ] Refaktoring ostatných služieb

### Fáza 3: Budúce
- [ ] Integrácia s reálnym API
- [ ] Cachovanie a offline podpora
- [ ] Synchronizácia dát
- [ ] Backup a restore funkcionalita

## Výhody Nového Riešenia

### 1. **Modularita**
- Jednotné API pre všetky dátové operácie
- Jednoduchá výmena implementácie (localStorage → API)

### 2. **Typová Bezpečnosť**
- TypeScript generické metódy
- Kompilátor kontroluje správnosť typov

### 3. **Error Handling**
- Konzistentné ošetrenie chýb
- Centralizované logovanie

### 4. **Maintainability**
- Všetky kľúče na jednom mieste
- Jednoduché pridávanie nových služieb

### 5. **Testing**
- Jednoduché mockovanie StorageService
- Izolované testovanie služieb

## Príklady Refaktoringu

### Pred Refaktoringom

```typescript
// assetService.ts
const STORAGE_KEY = 'legacyguard_assets';

const initializeStorage = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockAssets));
  }
};

export const getAssets = async (): Promise<Asset[]> => {
  initializeStorage();
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const assets = data ? JSON.parse(data) : [];
    return assets;
  } catch (error) {
    console.error('Error loading assets:', error);
    return [];
  }
};
```

### Po Refaktoringu

```typescript
// assetService.ts
import { storageService } from './storageService';
import { storageKeys } from '@/config/storageKeys';

const initializeStorage = () => {
  const existing = storageService.get<Asset[]>(storageKeys.assets);
  if (!existing) {
    storageService.set(storageKeys.assets, mockAssets);
  }
};

export const getAssets = async (): Promise<Asset[]> => {
  initializeStorage();
  
  try {
    const assets = storageService.get<Asset[]>(storageKeys.assets) || [];
    return assets;
  } catch (error) {
    console.error('Error loading assets:', error);
    return [];
  }
};
```

## Ďalšie Kroky

1. **Dokončiť refaktoring** všetkých existujúcich služieb
2. **Pridať testy** pre refaktorované služby
3. **Implementovať cachovanie** a offline podporu
4. **Príprava na API integráciu** - vytvoriť abstrakciu pre HTTP požiadavky

## Kontakt

Pre otázky alebo návrhy na vylepšenie kontaktujte vývojový tím.
