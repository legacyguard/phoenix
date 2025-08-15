# TODO - Phoenix Projekt

## ✅ Dokončené Úlohy

### UI Komponenty
- [x] **Button komponent** - Prémiový button s variantmi a animáciami
- [x] **Card komponent** - Flexibilný kontajner s 5 sub-komponentmi (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- [x] **Input komponent** - Typovo bezpečný input s Shadcn UI štýlovaním

### Layout Komponenty
- [x] **AppLayout komponent** - Hlavný layout aplikácie s pevnou bočnou navigáciou
  - Sidebar s navigáciou (Dashboard, Assets, Guardians, Settings)
  - Profil používateľa s logout funkcionalitou
  - Responzívny dizajn (sidebar sa skryje na mobile)
  - Používa všetky naše UI komponenty (Button, Card)

### Testovanie
- [x] **Card testy** - 7 testov pre všetky Card sub-komponenty
- [x] **Input testy** - 7 testov pre Input komponent
- [x] **Button testy** - Kompletné testovanie button komponentu
- [x] **AppLayout testy** - 9 testov pre layout funkcionalitu

### Dokumentácia
- [x] **README.md** - Kompletná dokumentácia pre UI komponenty
- [x] **Layout README.md** - Dokumentácia pre layout komponenty
- [x] **Príklady použitia** - Demonštračné súbory s CardInputExample a AppLayoutExample
- [x] **Index exporty** - Centralizované exporty všetkých UI a layout komponentov

## 🔄 Aktuálne Úlohy

### Formulárové Komponenty
- [ ] **Form komponent** - Kompletný formulárový systém s validáciou
- [ ] **Select komponent** - Dropdown výber s vyhľadávaním
- [ ] **Checkbox komponent** - Checkbox s rôznymi stavmi
- [ ] **Radio komponent** - Radio button skupina
- [ ] **Textarea komponent** - Viacriadkový text input

### Navigačné Komponenty
- [ ] **Navigation Menu** - Hlavná navigácia aplikácie
- [ ] **Breadcrumb** - Navigačná cesta
- [ ] **Pagination** - Stránkovanie pre zoznamy

### Feedback Komponenty
- [ ] **Toast** - Notifikácie a správy
- [ ] **Alert** - Upozornenia a chyby
- [ ] **Progress** - Progress bary a indikátory
- [ ] **Skeleton** - Loading stavy

## 📋 Plánované Úlohy

### Pokročilé Komponenty
- [ ] **Data Table** - Tabuľky s filtrovanie a zoraďovaním
- [ ] **Calendar** - Kalendár komponent
- [ ] **Date Picker** - Výber dátumu
- [ ] **Time Picker** - Výber času
- [ ] **File Upload** - Nahrávanie súborov

### Layout Komponenty
- [ ] **Grid System** - Flexibilný grid layout
- [ ] **Container** - Responzívne kontajnery
- [ ] **Divider** - Rozdeľovače obsahu
- [ ] **Spacer** - Priestorové komponenty

### Interaktívne Komponenty
- [ ] **Modal** - Modálne okná
- [ ] **Drawer** - Bočné panely
- [ ] **Popover** - Kontextové informácie
- [ ] **Tooltip** - Nápovedy a tipy

## 🎯 Priorita

### Vysoká Priorita (Tento týždeň)
1. **Form komponent** - Základ pre všetky formuláre
2. **Select komponent** - Nevyhnutný pre formuláre
3. **Toast komponent** - Feedback pre používateľov

### Stredná Priorita (Budúci týždeň)
1. **Alert komponent** - Zobrazovanie chýb a upozornení
2. **Progress komponent** - Loading stavy
3. **Navigation Menu** - Hlavná navigácia

### Nízka Priorita (Neskôr)
1. Pokročilé komponenty (Data Table, Calendar)
2. Layout komponenty
3. Interaktívne komponenty

## 📚 Zdroje a Referencie

- **Shadcn UI** - Základný dizajn systém
- **Tailwind CSS** - Utility-first CSS framework
- **React Aria** - Accessibility komponenty
- **Framer Motion** - Animácie a prechody
- **Lucide React** - Ikony pre navigáciu

## 🔧 Technické Poznámky

- Všetky komponenty používajú `React.forwardRef`
- Typová bezpečnosť s TypeScript
- CSS premenné pre konzistentné farby a veľkosti
- Testovanie s Vitest a React Testing Library
- Modulárna architektúra bez common.json súborov
- Layout komponenty sú pripravené na integráciu s React Router