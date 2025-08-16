# End-to-End (E2E) Testing

## Prehľad

Tento adresár obsahuje E2E testy pre LegacyGuard Phoenix aplikáciu. E2E testy simulujú reálneho používateľa a overujú, či všetky časti aplikácie spolu fungujú ako celok.

## Prečo E2E Testy?

Po dosiahnutí 80%+ pokrytia unit testami, E2E testy nám poskytujú:

- **Overenie celku**: Test simuluje reálneho používateľa
- **Integračné testovanie**: Odhalí chyby medzi komponentmi
- **Príprava na backend**: Keď pripojíme reálny backend, budeme mať E2E testy pripravené
- **Najväčšia hodnota**: Úspešný E2E test = aplikácia ako produkt funguje

## Testovacie Scenáre

### 1. Onboarding to Dashboard - Happy Path
**Súbor**: `onboarding-to-dashboard.spec.ts`

**Scenár**: Kompletný tok nového používateľa
- Návšteva úvodnej stránky
- Spustenie registrácie
- Dokončenie story-driven onboardingu
- Overenie dashboardu
- Interakcia s "Next Best Step"
- Overenie MicroTaskEngine

**Kroky**:
1. **Landing Page**: Overenie úvodnej stránky
2. **Onboarding**: Vyplnenie otázok o "krabičke istoty" a "osobe dôvery"
3. **Dashboard**: Overenie personalizovaného dashboardu
4. **Next Best Step**: Kliknutie na CTA a overenie MicroTaskEngine
5. **Life Areas**: Overenie správania životných oblastí
6. **Scenario Planning**: Overenie prístupu k scenárom

## Spustenie E2E Testov

### Predpoklady
1. Aplikácia musí byť spustená na `localhost:4173`
2. Musíte mať nainštalované Playwright závislosti

### Príkazy

```bash
# Spustenie všetkých E2E testov
npm run test:e2e

# Spustenie s UI
npm run test:e2e:ui

# Spustenie v headed móde (viditeľný browser)
npm run test:e2e:headed

# Spustenie v debug móde
npm run test:e2e:debug

# Spustenie konkrétneho testu
npx playwright test onboarding-to-dashboard.spec.ts
```

### Automatické spustenie
E2E testy sa automaticky spustia pomocou:
```bash
npm run preview:e2e  # Spustí aplikáciu na porte 4173
npm run test:e2e     # Spustí testy
```

## Technické Detaily

### Mockovanie Clerku
E2E testy mockujú Clerk autentifikáciu pomocou localStorage:
- `clerk-db`: Simuluje aktívnu session
- `clerk-user-metadata`: Simuluje user metadata

### Selektory
Testy používajú robustné selektory:
- `[data-testid]` atribúty (preferované)
- `[role]` atribúty
- Text content
- CSS triedy (ako fallback)

### Čakanie
Testy používajú:
- `page.waitForURL()` pre navigáciu
- `expect(locator).toBeVisible()` pre elementy
- `waitFor()` pre async operácie

## Údržba a Rozšírenie

### Pridanie Nového Testu
1. Vytvorte nový `.spec.ts` súbor
2. Použite existujúce helper funkcie
3. Pridajte test do README
4. Spustite test lokálne

### Aktualizácia Selektorov
Ak sa zmení UI:
1. Aktualizujte selektory v teste
2. Pridajte `data-testid` atribúty do komponentov
3. Overte, že test stále prechádza

### Debugovanie
Pre debugovanie zlyhávajúcich testov:
```bash
npm run test:e2e:debug
```

## Integrácia s CI/CD

E2E testy sa môžu spustiť v CI/CD pipeline:
```yaml
- name: Run E2E Tests
  run: |
    npm run build:e2e
    npm run preview:e2e &
    sleep 10
    npm run test:e2e
```

## Poznámky

- **Performance**: E2E testy sú pomalšie ako unit testy, ale poskytujú väčšiu hodnotu
- **Flaky Tests**: Ak test zlyháva nekonzistentne, skontrolujte timing a async operácie
- **Mocking**: Používame localStorage mocking pre Clerk, čo je jednoduchšie ako API mocking
- **Browser Support**: Testy bežia na Chromium, Firefox a WebKit
