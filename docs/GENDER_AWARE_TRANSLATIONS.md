# Gender-Aware Translation System

## Overview

The gender-aware translation system allows the application to provide grammatically correct translations when gender-specific forms are required by the language. This system supports masculine, feminine, and neutral/inclusive forms for languages that require gender-specific grammar (like Czech, Polish, etc.).

**Important**: Gender-aware translations should only be used when grammatically necessary, not just because it's possible to make them gender-specific.

## Features

- **Gender Context Management**: Centralized gender preference management for grammatically necessary cases
- **Automatic Key Suffixing**: Translation keys are automatically suffixed with gender when needed
- **Fallback System**: Falls back to base keys if gendered keys don't exist
- **Local Storage**: Gender preferences are persisted in localStorage
- **Multi-language Support**: Works with languages that require gender-specific grammar
- **React Hooks**: Easy-to-use React hooks for gender-aware translations
- **Grammatical Necessity**: Only applies gender-specific forms when required by language grammar

## Architecture

### 1. Gender Context System (`src/i18n/gender-context.ts`)

The core of the system is the `GenderContextManager` class that handles:

- Gender preference storage and retrieval
- Translation key generation with gender suffixes
- Language-specific gender formatting
- Utility functions for common translation patterns

### 2. Translation File Structure

Translation files include gender-specific keys only when grammatically necessary:

```json
{
  "welcome": {
    "title": "Welcome back!"
  },
  "grammaticallyRequired": {
    "userAction": "User action",
    "userAction_masculine": "Uživatel provedl akci",
    "userAction_feminine": "Uživatelka provedla akci",
    "userAction_neutral": "Uživatel/ka provedl/a akci"
  }
}
```

**Note**: In the example above, "Welcome back!" doesn't need gender-specific forms in English or Czech, but "userAction" might need different verb forms in Czech based on gender.

### 3. React Integration

The system provides React hooks and utilities for easy integration:

- `useGenderContext()`: Hook for accessing gender context
- `getGenderedTranslation()`: Utility for getting gendered translations
- `getGenderedKey()`: Utility for generating gendered keys

## Usage

### Basic Usage

```typescript
import { useTranslation } from 'react-i18next';
import { getGenderedTranslation } from '../i18n/gender-context';

const MyComponent = () => {
  const { t } = useTranslation('dashboard');
  
  // Get gendered translation with fallback
  const welcomeMessage = getGenderedTranslation(t, 'welcome.title');
  
  return <h1>{welcomeMessage}</h1>;
};
```

### Using the Gender Context Hook

```typescript
import { useGenderContext } from '../i18n/gender-context';

const MyComponent = () => {
  const { gender, setGender, getGenderedKey } = useGenderContext();
  
  const handleGenderChange = (newGender: 'masculine' | 'feminine' | 'neutral') => {
    setGender(newGender);
  };
  
  return (
    <div>
      <p>Current gender: {gender}</p>
      <p>Translation key: {getGenderedKey('welcome.title')}</p>
    </div>
  );
};
```

### Settings Component

```typescript
import { GenderPreferenceSettings } from '../components/settings/GenderPreferenceSettings';

const SettingsPage = () => {
  return (
    <div>
      <GenderPreferenceSettings />
    </div>
  );
};
```

## Translation File Structure

### English (en/settings.json)

```json
{
  "genderPreference": {
    "title": "Gender Preferences",
    "description": "Choose how you'd like the application to address you in messages and notifications",
    "selectLabel": "Preferred Gender Form",
    "options": {
      "neutral": "Neutral/Inclusive",
      "masculine": "Masculine",
      "feminine": "Feminine"
    },
    "save": "Save Gender Preference",
    "saving": "Saving...",
    "saveSuccess": "Gender preference saved successfully",
    "saveError": "Failed to save gender preference"
  }
}
```

### Czech (cs/settings.json)

```json
{
  "genderPreference": {
    "title": "Genderové preference",
    "description": "Vyberte si, jak vás má aplikace oslovovat ve zprávách a oznámeních",
    "selectLabel": "Preferovaná genderová forma",
    "options": {
      "neutral": "Neutrální/Inkluzivní",
      "masculine": "Mužská",
      "feminine": "Ženská"
    },
    "save": "Uložit genderovou preferenci",
    "saving": "Ukládání...",
    "saveSuccess": "Genderová preference byla úspěšně uložena",
    "saveError": "Nepodařilo se uložit genderovou preferenci"
  }
}
```

## When to Use Gender-Aware Translations

### Grammatically Necessary Cases

Gender-aware translations should only be used when the language requires different grammatical forms:

**Czech Examples:**
```json
{
  "userActions": {
    "userLoggedIn": "Uživatel se přihlásil",
    "userLoggedIn_masculine": "Uživatel se přihlásil",
    "userLoggedIn_feminine": "Uživatelka se přihlásila",
    "userLoggedIn_neutral": "Uživatel/ka se přihlásil/a"
  }
}
```

**English Examples:**
```json
{
  "userActions": {
    "userLoggedIn": "User logged in"
  }
}
```

### Not Grammatically Necessary

Simple greetings, notifications, and most UI text don't need gender-specific forms:

```json
{
  "welcome": {
    "title": "Welcome back!"
  },
  "notifications": {
    "success": {
      "assetAdded": "Asset added successfully"
    }
  }
}
```

## API Reference

### GenderContextManager

#### Methods

- `getGender()`: Returns current gender preference
- `setGender(gender)`: Sets gender preference and saves to localStorage
- `getGenderSuffix(key)`: Returns gender suffix for current language
- `getGenderedKey(baseKey)`: Returns gendered translation key
- `formatGenderedText(text, gender)`: Formats text based on gender

### React Hooks

#### useGenderContext()

Returns an object with:
- `gender`: Current gender preference
- `setGender`: Function to set gender preference
- `getGenderSuffix`: Function to get gender suffix
- `getGenderedKey`: Function to get gendered key
- `formatGenderedText`: Function to format gendered text

### Utility Functions

#### getGenderedTranslation(t, baseKey, fallbackKey?)

- `t`: Translation function from react-i18next
- `baseKey`: Base translation key
- `fallbackKey`: Optional fallback key

Returns the gendered translation with fallback support.

#### getGenderedKey(baseKey)

Returns the gendered translation key for the current gender preference.

#### hasGenderedKey(t, baseKey)

Checks if a gendered translation key exists.

## Best Practices

### 1. Always Provide Fallbacks

```typescript
// Good: Provides fallback
const message = getGenderedTranslation(t, 'welcome.title', 'welcome.generic');

// Bad: No fallback
const message = t(getGenderedKey('welcome.title'));
```

### 2. Use Consistent Naming

```json
{
  "welcome": {
    "title": "Welcome back!",
    "title_masculine": "Welcome back, sir!",
    "title_feminine": "Welcome back, ma'am!",
    "title_neutral": "Welcome back!"
  }
}
```

### 3. Test All Gender Variants

Always test your translations with all three gender options to ensure they work correctly.

### 4. Consider Cultural Context

Different languages and cultures may have different gender conventions. Ensure translations are culturally appropriate.

## Migration Guide

### Adding Gender Support to Existing Translations

1. **Identify translatable strings** that should be gender-aware
2. **Add gender-specific keys** to translation files
3. **Update components** to use `getGenderedTranslation()`
4. **Test** with all gender options

### Example Migration

Before:
```typescript
const welcomeMessage = t('welcome.title');
```

After:
```typescript
const welcomeMessage = getGenderedTranslation(t, 'welcome.title');
```

## Troubleshooting

### Common Issues

1. **Translation key not found**: Ensure the gendered key exists in the translation file
2. **Fallback not working**: Check that the base key exists
3. **Gender preference not saving**: Check localStorage permissions
4. **Language not switching**: Ensure the gender context is updated when language changes

### Debug Tools

Use the `GenderAwareExample` component to test and debug gender-aware translations:

```typescript
import { GenderAwareExample } from '../components/GenderAwareExample';

// Add to your development page
<GenderAwareExample />
```

## Future Enhancements

- **More Languages**: Support for additional gendered languages
- **Dynamic Gender Detection**: Automatic gender detection from user profiles
- **Context-Aware Gender**: Different gender forms based on context
- **Advanced Formatting**: More sophisticated gender-specific text formatting
- **Analytics**: Track gender preference usage for optimization

## Support

For questions or issues with the gender-aware translation system, refer to:
- Translation file examples in `src/i18n/locales/`
- Component examples in `src/components/`
- Test cases in the example component 