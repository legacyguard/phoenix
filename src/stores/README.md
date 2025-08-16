# Zustand Store Integrácia - Phoenix

Tento dokument popisuje integráciu Zustand knižnice pre správu globálneho stavu v aplikácii Phoenix.

## Prehľad

Pred integráciou Zustand:
- Stav aplikácie bol roztrúsený po rôznych komponentoch
- Každý komponent mal vlastný `useState` pre lokálne dáta
- Synchronizácia dát medzi komponentmi bola zložitá
- Potenciálne chyby pri správe stavu

Po integrácii Zustand:
- **Centrálny store** pre všetky dáta aplikácie
- **Automatické prekreslenie** komponentov pri zmene stavu
- **Jednotné API** pre správu stavu
- **Predvídateľný tok dát** v aplikácii

## Architektúra

```
┌─────────────────────────────────────────────────────────────┐
│                    React Komponenty                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │MyPossessions│ │MyLovedOnes  │ │Important    │          │
│  │AssetList    │ │PeopleList   │ │Papers       │          │
│  │             │ │             │ │DocumentList │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Zustand Store                            │
│  ┌─────────────┐ ┌─────────────────────────────────────┐    │
│  │useAssetStore│ │         usePeopleStore              │    │
│  │  • assets  │ │  • people[], isLoading, error       │    │
│  │  • actions │ │  • fetchPeople, addPerson...        │    │
│  │  • computed│ │  • getPeopleByRole, searchPeople... │    │
│  └─────────────┘ └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              useDocumentStore                       │    │
│  │  • documents[], isLoading, error                   │    │
│  │  • fetchDocuments, addDocument...                  │    │
│  │  • getExpiringDocuments, searchDocuments...        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              StorageService + Services                      │
│  • Perzistencia dát v localStorage                         │
│  • CRUD operácie pre assets, people a documents           │
│  • Error handling a logging                                │
└─────────────────────────────────────────────────────────────┘
```

## Kľúčové Komponenty

### 1. Asset Store (`src/stores/assetStore.ts`)

Zustand store pre správu asset stavu:

```typescript
import { useAssetStore } from '@/stores/assetStore';

// Použitie v komponente
const { assets, isLoading, fetchAssets, addAsset } = useAssetStore();

// Automatické prekreslenie pri zmene stavu
useEffect(() => {
  fetchAssets();
}, [fetchAssets]);
```

**Vlastnosti:**
- **State Management** - centrálne uloženie všetkých asset dát
- **Actions** - metódy pre CRUD operácie
- **Computed Values** - odvodené hodnoty (celková hodnota, filtrovanie)
- **Error Handling** - konzistentné ošetrenie chýb
- **Loading States** - indikátory načítavania

### 2. People Store (`src/stores/peopleStore.ts`)

Zustand store pre správu people stavu:

```typescript
import { usePeopleStore } from '@/stores/peopleStore';

// Použitie v komponente
const { people, isLoading, fetchPeople, addPerson } = usePeopleStore();

// Automatické prekreslenie pri zmene stavu
useEffect(() => {
  fetchPeople();
}, [fetchPeople]);
```

**Vlastnosti:**
- **State Management** - centrálne uloženie všetkých people dát
- **Actions** - metódy pre CRUD operácie
- **Computed Values** - filtrovanie podľa role, vzťahu, vyhľadávanie
- **Asset Integration** - ľudia s prístupom k assets a dokumentom
- **Error Handling** - konzistentné ošetrenie chýb

### 3. Document Store (`src/stores/documentStore.ts`)

Zustand store pre správu document stavu:

```typescript
import { useDocumentStore } from '@/stores/documentStore';

// Použitie v komponente
const { documents, isLoading, fetchDocuments, addDocument } = useDocumentStore();

// Automatické prekreslenie pri zmene stavu
useEffect(() => {
  fetchDocuments();
}, [fetchDocuments]);
```

**Vlastnosti:**
- **State Management** - centrálne uloženie všetkých document dát
- **Actions** - metódy pre CRUD operácie s podporou súborov
- **Computed Values** - filtrovanie podľa kategórie, statusu, expiračných dátumov
- **File Management** - správa priložených súborov
- **Advanced Filtering** - vyhľadávanie, filtrovanie podľa osoby, tagov

### 4. Zod Validácia (`src/lib/validators/documents.ts`)

Robustná validácia formulárov pomocou Zod:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDocumentSchema, AddDocumentData } from '@/lib/validators/documents';

const {
  register,
  handleSubmit,
  formState: { errors },
  reset
} = useForm<AddDocumentData>({
  resolver: zodResolver(addDocumentSchema),
  defaultValues: {
    name: '',
    category: 'personal',
    status: 'active'
  }
});
```

**Vlastnosti:**
- **Type Safety** - TypeScript integrácia s Zod schémami
- **Runtime Validation** - validácia dát počas behu aplikácie
- **Custom Rules** - pokročilé validačné pravidlá (dátumy, súbory)
- **Error Messages** - lokalizované chybové správy
- **Form Integration** - integrácia s react-hook-form

## Store API

#### Asset Store State
```typescript
interface AssetStoreState {
  assets: Asset[];           // Zoznam všetkých assets
  isLoading: boolean;        // Indikátor načítavania
  error: string | null;      // Chybové správy
  selectedAsset: Asset | null; // Aktuálne vybraný asset
}
```

#### People Store State
```typescript
interface PeopleStoreState {
  people: Person[];          // Zoznam všetkých ľudí
  isLoading: boolean;        // Indikátor načítavania
  error: string | null;      // Chybové správy
  selectedPerson: Person | null; // Aktuálne vybraná osoba
}
```

#### Document Store State
```typescript
interface DocumentStoreState {
  documents: Document[];     // Zoznam všetkých dokumentov
  isLoading: boolean;        // Indikátor načítavania
  error: string | null;      // Chybové správy
  selectedDocument: Document | null; // Aktuálne vybraný dokument
}
```

#### Actions
```typescript
// CRUD operácie
fetchAssets: () => Promise<void>;      // Načítanie assets
addAsset: (data: AssetFormData) => Promise<void>;     // Pridanie nového asset
updateAsset: (id: string, updates: Partial<Asset>) => Promise<void>; // Aktualizácia
deleteAsset: (id: string) => Promise<void>;           // Odstránenie

fetchPeople: () => Promise<void>;      // Načítanie people
addPerson: (data: PersonFormData) => Promise<void>;   // Pridanie novej osoby
updatePerson: (id: string, updates: Partial<Person>) => Promise<void>; // Aktualizácia
deletePerson: (id: string) => Promise<void>;          // Odstránenie

fetchDocuments: () => Promise<void>;   // Načítanie documents
addDocument: (data: DocumentFormData, file?: File) => Promise<void>; // Pridanie s súborom
updateDocument: (id: string, updates: Partial<Document>, file?: File) => Promise<void>; // Aktualizácia
deleteDocument: (id: string) => Promise<void>;        // Odstránenie

// UI actions
selectAsset: (asset: Asset | null) => void;           // Výber asset
selectPerson: (person: Person | null) => void;        // Výber osoby
selectDocument: (document: Document | null) => void;  // Výber dokumentu
clearError: () => void;                               // Vyčistenie chyby
```

#### Computed Values
```typescript
// Asset computed values
getAssetById: (id: string) => Asset | null;
getAssetsByCategory: (category: string) => Asset[];
getAssetsNeedingAttention: () => Asset[];
getTotalAssetValue: () => number;
searchAssets: (query: string) => Asset[];

// People computed values
getPersonById: (id: string) => Person | null;
getPeopleByRole: (role: PersonRole) => Person[];
getPeopleByRelationship: (relationship: PersonRelationship) => Person[];
searchPeople: (query: string) => Person[];
getPeopleWithAccessToAsset: (assetId: string) => Person[];
getPeopleWithSharedDocuments: (documentId: string) => Person[];

// Document computed values
getDocumentById: (id: string) => Document | null;
getDocumentsByCategory: (category: DocumentCategory) => Document[];
getExpiringDocuments: () => Document[];
getExpiredDocuments: () => Document[];
searchDocuments: (query: string) => Document[];
getDocumentsByPerson: (personId: string) => Document[];
getDocumentsByStatus: (status: DocumentStatus) => Document[];
```

### 5. Selectors

Pre lepší výkon a čitateľnosť:

```typescript
// Asset selectors
export const useAssets = () => useAssetStore((state) => state.assets);
export const useAssetLoading = () => useAssetStore((state) => state.isLoading);
export const useAssetError = () => useAssetStore((state) => state.error);
export const useSelectedAsset = () => useAssetStore((state) => state.selectedAsset);

// People selectors
export const usePeople = () => usePeopleStore((state) => state.people);
export const usePeopleLoading = () => usePeopleStore((state) => state.isLoading);
export const usePeopleError = () => usePeopleStore((state) => state.error);
export const useSelectedPerson = () => usePeopleStore((state) => state.selectedPerson);

// Document selectors
export const useDocuments = () => useDocumentStore((state) => state.documents);
export const useDocumentLoading = () => useDocumentStore((state) => state.isLoading);
export const useDocumentError = () => useDocumentStore((state) => state.error);
export const useSelectedDocument = () => useDocumentStore((state) => state.selectedDocument);
```

## Zod Validácia

### Základné Schémy

```typescript
// Document validation schema
export const documentSchema = z.object({
  name: z.string()
    .min(3, { message: "Document name must be at least 3 characters long." })
    .max(100, { message: "Document name cannot exceed 100 characters." })
    .trim(),
  
  category: z.enum(['personal', 'financial', 'legal', 'medical', 'property', 'education', 'other'], {
    required_error: "Please select a document category.",
    invalid_type_error: "Please select a valid document category."
  }),
  
  issueDate: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, { message: "Please enter a valid issue date." }),
  
  expiryDate: z.string()
    .optional()
    .refine((date) => {
      if (!date) return true;
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, { message: "Please enter a valid expiry date." }),
});
```

### Pokročilé Validačné Pravidlá

```typescript
// Custom validation: expiry date must be after issue date
}).refine((data) => {
  if (data.expiryDate && data.issueDate) {
    const expiryDate = new Date(data.expiryDate);
    const issueDate = new Date(data.issueDate);
    return expiryDate > issueDate;
  }
  return true;
}, {
  message: "Expiry date must be after issue date.",
  path: ["expiryDate"]
});

// File validation
export const addDocumentSchema = documentSchema.extend({
  file: z.instanceof(File)
    .optional()
    .refine((file) => {
      if (!file) return true;
      const maxSize = 10 * 1024 * 1024; // 10MB
      return file.size <= maxSize;
    }, { message: "File size must be less than 10MB." })
    .refine((file) => {
      if (!file) return true;
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      return allowedTypes.includes(file.type);
    }, { message: "File type not supported." }),
});
```

### Použitie v React Hook Form

```typescript
const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
  reset,
  setValue,
  watch
} = useForm<AddDocumentData>({
  resolver: zodResolver(addDocumentSchema),
  defaultValues: {
    name: '',
    category: 'personal',
    status: 'active'
  }
});

const onSubmit = async (data: AddDocumentData) => {
  try {
    await addDocument(data, selectedFile);
    toast.success('Document uploaded successfully');
    reset();
    onClose();
  } catch (error) {
    toast.error('Failed to upload document');
  }
};
```

## Použitie v Komponentoch

### Pred Refaktoringom

```typescript
// DocumentList.tsx
export function DocumentList({ onEdit, refreshTrigger }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDocuments = async () => {
      setIsLoading(true);
      try {
        const loadedDocuments = await getDocuments();
        setDocuments(loadedDocuments);
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, [refreshTrigger]);
}

// ImportantPapersPage.tsx
export function ImportantPapersPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDocumentAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setIsAddDialogOpen(false);
  };

  return (
    <DocumentList refreshTrigger={refreshTrigger} />
  );
}
```

### Po Refaktoringu

```typescript
// DocumentList.tsx
export function DocumentList({ onEdit }: DocumentListProps) {
  // Use Zustand store instead of local state
  const documents = useDocuments();
  const isLoading = useDocumentLoading();
  const { fetchDocuments, deleteDocument } = useDocumentStore();

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Automatické prekreslenie pri zmene documents
  const filteredDocuments = useMemo(() => {
    // Filtrovanie a triedenie
  }, [documents, searchTerm, filterCategory, sortBy, sortOrder]);
}

// ImportantPapersPage.tsx
export function ImportantPapersPage() {
  const { fetchDocuments } = useDocumentStore();

  const handleDocumentAdded = () => {
    fetchDocuments(); // Refresh documents from store
    setIsAddDialogOpen(false);
  };

  return (
    <DocumentList /> // Žiadny refreshTrigger potrebný
  );
}
```

### Zod Validácia v Formulároch

```typescript
// AddDocumentDialog.tsx
export function AddDocumentDialog({ isOpen, onClose, onDocumentAdded }: AddDocumentDialogProps) {
  const { addDocument } = useDocumentStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<AddDocumentData>({
    resolver: zodResolver(addDocumentSchema),
    defaultValues: {
      name: '',
      category: 'personal',
      status: 'active'
    }
  });

  const onSubmit = async (data: AddDocumentData) => {
    try {
      await addDocument(data, selectedFile);
      toast.success('Document uploaded successfully');
      onDocumentAdded();
      reset();
      onClose();
    } catch (error) {
      toast.error('Failed to upload document');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...register('name')}
        className={errors.name ? 'border-red-500' : ''}
      />
      {errors.name && (
        <p className="text-xs text-red-500">{errors.name.message}</p>
      )}
    </form>
  );
}
```

## Výhody Nového Riešenia

### 1. **Centralizovaný Stav**
- Všetky dáta na jednom mieste
- Jednoduché debugovanie a logovanie
- Konzistentný stav v celej aplikácii

### 2. **Automatické Prekreslenie**
- Komponenty sa automaticky aktualizujú pri zmene stavu
- Žiadne manuálne `setState` volania
- Reaktívny UI

### 3. **Robustná Validácia**
- Type-safe formuláre s Zod
- Runtime validácia dát
- Lokalizované chybové správy
- Pokročilé validačné pravidlá

### 4. **Lepší Výkon**
- Selektívne prekreslenie len potrebných komponentov
- Zustand má vstavané optimalizácie
- Menej re-renderov

### 5. **Predvídateľnosť**
- Jednosmerný tok dát
- Jasné rozhranie medzi komponentmi a stavom
- Jednoduché testovanie

### 6. **Developer Experience**
- TypeScript podpora
- DevTools pre debugging
- Jednoduché pridávanie nových stavov
- Zod integrácia pre validáciu

## Migračný Plán

### Fáza 1: ✅ Dokončené
- [x] Inštalácia Zustand
- [x] Vytvorenie asset store
- [x] Refaktoring AssetList komponentu
- [x] Refaktoring AddAssetDialog komponentu
- [x] Refaktoring MyPossessionsPage
- [x] Testy pre asset store

### Fáza 2: ✅ Dokončené
- [x] Vytvorenie people store
- [x] Refaktoring PeopleList komponentu
- [x] Refaktoring AddPersonDialog komponentu
- [x] Refaktoring EditPersonDialog komponentu
- [x] Refaktoring MyLovedOnesPage
- [x] Testy pre people store

### Fáza 3: ✅ Dokončené
- [x] Vytvorenie document store
- [x] Zavedenie Zod validácie
- [x] Refaktoring DocumentList komponentu
- [x] Refaktoring AddDocumentDialog komponentu s react-hook-form
- [x] Refaktoring ImportantPapersPage
- [x] Testy pre document store a Zod validáciu

### Fáza 4: Plánované
- [ ] Vytvorenie ďalších store-ov:
  - `useWillStore` - pre správu testamentov
  - `useUserStore` - pre používateľské nastavenia

### Fáza 5: Budúce
- [ ] Integrácia s React DevTools
- [ ] Persistence plugin pre localStorage
- [ ] Middleware pre logging a analytics
- [ ] Optimistic updates

## Testovanie

### Store Testy

```typescript
import { renderHook, act } from '@testing-library/react';
import { useDocumentStore } from '../documentStore';

describe('Document Store', () => {
  it('should fetch documents successfully', async () => {
    const { result } = renderHook(() => useDocumentStore());
    
    await act(async () => {
      await result.current.fetchDocuments();
    });
    
    expect(result.current.documents).toEqual(mockDocuments);
    expect(result.current.isLoading).toBe(false);
  });
});
```

### Komponent Testy

```typescript
import { render, screen } from '@testing-library/react';
import { AddDocumentDialog } from './AddDocumentDialog';

// Mock store
vi.mock('@/stores/documentStore', () => ({
  useDocumentStore: () => ({
    addDocument: vi.fn(),
  }),
}));

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: vi.fn(),
    handleSubmit: vi.fn(),
    formState: { errors: {} },
    reset: vi.fn(),
  }),
}));
```

### Zod Validácia Testy

```typescript
import { validateDocument, safeValidateDocument } from '@/lib/validators/documents';

describe('Document Validation', () => {
  it('should validate valid document data', () => {
    const validData = {
      name: 'Test Document',
      category: 'personal',
    };
    
    const result = validateDocument(validData);
    expect(result).toEqual(validData);
  });

  it('should reject invalid document data', () => {
    const invalidData = {
      name: 'ab', // Too short
      category: 'invalid-category',
    };
    
    expect(() => validateDocument(invalidData)).toThrow();
  });

  it('should provide safe validation', () => {
    const invalidData = { name: 'ab' };
    
    const result = safeValidateDocument(invalidData);
    expect(result.success).toBe(false);
    expect(result.errors).toContain('Document name must be at least 3 characters long.');
  });
});
```

## Best Practices

### 1. **Používajte Selectory**
```typescript
// ✅ Dobré - selektívne prekreslenie
const documents = useDocuments();
const isLoading = useDocumentLoading();

// ❌ Zlé - celý store, môže spôsobiť nepotrebné re-rendery
const { documents, isLoading } = useDocumentStore();
```

### 2. **Actions v useEffect**
```typescript
// ✅ Dobré - volanie action v useEffect
useEffect(() => {
  fetchDocuments();
}, [fetchDocuments]);

// ❌ Zlé - volanie action priamo v render
const documents = useDocumentStore().fetchDocuments();
```

### 3. **Zod Validácia**
```typescript
// ✅ Dobré - použitie Zod schém
const {
  register,
  handleSubmit,
  formState: { errors }
} = useForm<DocumentFormData>({
  resolver: zodResolver(documentSchema)
});

// ❌ Zlé - manuálna validácia
const validateForm = () => {
  if (!formData.name.trim()) return false;
  // ... more validation
};
```

### 4. **Error Handling**
```typescript
// ✅ Dobré - použitie error state zo store
const error = useDocumentError();
const { clearError } = useDocumentStore();

if (error) {
  return <ErrorAlert error={error} onDismiss={clearError} />;
}
```

## Ďalšie Kroky

1. **Rozšírenie store-ov** pre ďalšie entity
2. **Implementácia persistence** pre offline podporu
3. **Pridanie middleware** pre logging a analytics
4. **Optimizácia výkonu** s React.memo a useMemo
5. **Rozšírenie Zod validácie** na všetky formuláre

## Kontakt

Pre otázky alebo návrhy na vylepšenie kontaktujte vývojový tím.
