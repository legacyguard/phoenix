# Internationalization (i18n)

This directory is reserved for the future implementation of our internationalization and localization framework.

## Strategy

- We will use a library like `i18next` with `react-i18next`.
- Translations will be structured modularly, based on features (e.g., `dashboard.json`, `onboarding.json`).
- The primary development language is English (en).
- Each translation file should be optimized for size: 100-800 lines per JSON file.
- Modular structure will ensure maintainability and performance.

## Implementation Postponed

**Note:** Full implementation is postponed until the core functionality and English copy are finalized to avoid premature complexity.

## Future Structure Example

```
src/internationalization/
├── locales/
│   ├── en/
│   │   ├── common.json
│   │   ├── dashboard.json
│   │   ├── onboarding.json
│   │   └── tasks.json
│   └── [other-languages]/
├── config.ts
└── hooks/
    └── useTranslation.ts
```

## Principles

1. **English First**: All development happens in English
2. **Modular Files**: Each feature has its own translation file
3. **Size Optimization**: 100-800 lines per JSON file
4. **Privacy-First**: No external translation services for sensitive content
5. **Progressive Loading**: Load only needed translations
