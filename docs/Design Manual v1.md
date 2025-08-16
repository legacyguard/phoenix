# LegacyGuard – Design Manual v1

Prémiový a dôveryhodný dizajn inšpirovaný Apple estetikou, so svetlým aj tmavým režimom v zemitých farbách. Vhodný pre použitie so Shadcn UI a Tailwind CSS.

---

## 1. Typografia

| Typ           | Font        | Veľkosť       | Použitie                            |
|---------------|-------------|----------------|-------------------------------------|
| Nadpisy       | Inter Bold  | 28px – 40px    | Onboarding, názvy sekcií            |
| Podnadpisy    | Inter Medium| 20px – 24px    | Misie, hlavičky                     |
| Bežný text    | Inter Regular | 16px – 18px  | Formuláre, obsah, sprievodca        |
| Sekundárny    | Georgia Italic | 16px        | Emotívne odkazy, citácie            |

---

## 2. Farebná paleta

### Svetlý režim

| Názov          | Hex        | Použitie                       |
|----------------|------------|--------------------------------|
| Pozadie        | `#FAF8F5`  | Hlavné pozadie                 |
| Primárna       | `#6B4F3B`  | Texty, tlačidlá, akcenty       |
| Sekundárna     | `#A68C6D`  | Karty, ikony, výplne           |
| CTA akcent     | `#8A5E3B`  | Tlačidlá, dôležité prvky       |
| Text           | `#1C1C1C`  | Hlavný text                    |
| Sekundárny text| `#5F5F5F`  | Pomocné informácie             |

### Tmavý režim

| Názov          | Hex        | Použitie                       |
|----------------|------------|--------------------------------|
| Pozadie        | `#1C1C1C`  | Hlavné pozadie                 |
| Primárna       | `#CDB89F`  | Texty, ikony                   |
| Sekundárna     | `#8A6F57`  | Karty, výplne, komponenty      |
| CTA akcent     | `#D6A574`  | Tlačidlá, dôležité prvky       |
| Text           | `#F2F2F2`  | Hlavný text                    |
| Sekundárny text| `#AAAAAA`  | Pomocné informácie             |

---

## 3. Komponenty

### Card

- `rounded-md`, `shadow-sm`, `bg-background`
- Použitie: misie, profilové záznamy, kroky

### Button

- Varianty: `default`, `outline`, `ghost`, `earth`
- Pravidlá: max. 2 tlačidlá na obrazovke, CTA vždy výraznejší

### Sheet / Drawer

- Použitie: onboarding, výzvy, AI sprievodca
- Vždy s ikonou a ilustráciou pre jednoduché pochopenie

### Tooltip

- Delay 300ms, `bg-neutral-700`, jemné zaoblenie
- Použitie: doplňujúce info, nie hlavnú navigáciu

### Badge

- Varianty: `default`, `earthy`, `neutral`
- Použitie: stav misie, typ dokumentu

### Input

- `shadow-inner`, `rounded-md`, `text-sm`, `px-4`, `py-3`
- Prehľadný a ľahko čitateľný

---

## 4. Ikony a ilustrácie

- Zdroj: [Lucide](https://lucide.dev), [Undraw](https://undraw.co), [Icons8](https://icons8.com/illustrations)
- Štýl: minimalistický, zaoblený, zemité tóny, bez textu

---

## 5. Animácie a prechody

- Všeobecné: `transition-all duration-300 ease-in-out`
- CTA: jemné zmeny farby/tieňa
- Modálne okná: `slide-in`, `fade`

---

## 6. Svetlý / Tmavý mód

- Prepínač v nastaveniach aj onboarding
- Farby vždy v zemitých odtieňoch, žiadne výrazné neónové alebo sýte farby
- Tmavý mód má byť rovnako čitateľný a harmonický

---

## 7. UX pravidlá

- Navigácia: max. 5 hlavných sekcií
- Texty: stručné, empatické, ľudsky formulované
- CTA: jasné, ale nie nátlakové ("Začať misiu", "Zabezpečiť dokument")
- Prvky: konzistentné rozmery, paddingy, rovnaké rozostupy

---

## 8. Extra odporúčania

- Vždy testuj s používateľmi (aspoň 3 rôzne osoby)
- Iteruj texty aj UI podľa spätnej väzby
- Nezahlcuj – každá obrazovka má mať 1 jasný cieľ
- Ponechaj si priestor pre AI rozšírenia (avatar, dialog, analýza)

---

*V prípade potreby môžeme pripraviť aj Figma komponenty alebo light/dark preview obrazoviek.*