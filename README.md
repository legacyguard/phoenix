# LegacyGuard Heritage Vault

A comprehensive digital legacy management platform built with React, TypeScript, and modern web technologies.

## Features

- **Heritage Vault**: Secure document storage and management
- **Guardian Network**: Trusted helpers for emergency access
- **Survivor's Manual**: Essential information for loved ones
- **Multi-language Support**: Available in 32+ languages
- **Privacy-First**: End-to-end encryption and GDPR compliance

## Documentation

- Feature Flags: docs/feature-flags.md
- Migration Guide (Respectful Onboarding): docs/migration-guide-respectful-onboarding.md
- Rollback Procedures: docs/rollback-procedures.md

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Running the Application

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Translation Management

The application supports 32+ languages. To audit translation completeness:

```bash
# Run translation audit
npm run audit-translations
```

This will:

- Compare all language files against the English master file
- Identify missing translation keys
- Generate a comprehensive report with statistics
- Provide recommendations for translation priorities

The audit script (`audit-translations.js`) recursively traverses nested JSON objects to find all translation keys and provides:

- ✅ Complete translations (100%)
- ⚠️ Needs attention (≤10 missing keys)
- ❌ Incomplete (>10 missing keys)
- Missing files or parse errors

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run E2E tests
- `npm run audit-translations` - Audit translation completeness

## Project Structure

```
src/
├── app/                 # API routes
├── components/          # React components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── i18n/               # Internationalization
│   └── locales/        # Translation files
├── pages/              # Page components
├── services/           # API services
├── types/              # TypeScript types
└── utils/              # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
