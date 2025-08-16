# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

LegacyGuard Heritage Vault is a digital legacy management platform built with React, TypeScript, and modern web technologies. The application focuses on secure document storage, family emergency planning, and respectful digital legacy management.

## Common Development Commands

### Development
```bash
# Start development server
npm run dev

# Start with respectful onboarding flow
npm run dev:respectful

# Start backend (NestJS)
npm run dev:backend

# Start frontend only
npm run dev:frontend
```

### Building & Production
```bash
# Build for production
npm run build

# Build for development mode
npm run build:dev

# Preview production build
npm run preview

# Docker operations
npm run docker:build
npm run docker:run
npm run docker:stop
```

### Testing
```bash
# Run unit tests
npm test
npm run test:run      # Single run
npm run test:watch    # Watch mode
npm run test:coverage # With coverage

# Run E2E tests
npm run test:e2e           # Playwright tests
npm run test:e2e:ui        # With UI
npm run test:e2e:headed    # Headed mode
npm run test:e2e:debug     # Debug mode

# Cypress E2E tests
npm run e2e:open           # Open Cypress
npm run e2e:run           # Run headless
npm run e2e:run:smoke     # Smoke tests only

# Test specific features
npm run test:will          # Will system tests
npm run test:error-logging # Error logging tests
```

### Code Quality & Validation
```bash
# Linting
npm run lint

# Type checking
npm run typecheck:strict      # Strict mode
npm run typecheck:strict-plus # Extra strict

# Run all checks (CI)
npm run ci
npm run check:all

# Individual checks
npm run check:cycles    # Check for circular dependencies
npm run check:exports   # Validate exports
npm run check:imports   # Check import patterns
npm run check:console   # Find console statements
npm run check:secrets   # Check for exposed secrets
npm run check:size      # Bundle size guard
npm run check:img       # Image optimization check
npm run check:init      # Initial chunk size check
npm run check:only      # Find .only() in tests
```

### Code Language Requirements

**Important**: The entire codebase must be implemented in English only. 

Internationalization will be handled through a future modular file structure with optimized file sizes (100-800 lines per JSON file). See `src/internationalization/README.md` for the planned approach.

### Database & Migrations
```bash
# Run migrations
npm run migrate
npm run migrate:prod

# Backup wills
npm run backup
npm run backup:prod
```

## High-Level Architecture

### Frontend Structure
```
src/
├── app/                    # Next.js-style API routes
│   ├── api/               # Backend API endpoints
│   └── consultations/     # Legal consultation flows
├── features/              # Feature-based modules
│   ├── assets-vault/      # Document storage & management
│   ├── dashboard/         # Main dashboard views
│   ├── digital-heritage/  # Legacy planning features
│   ├── family-circle/     # Trusted people management
│   ├── legal-consultations/
│   ├── legacy-briefing/   # Survivor's manual
│   ├── subscriptions/     # Payment & billing
│   ├── time-capsule/      # Future messages
│   └── will-generator/    # Will creation system
├── services/              # Business logic services
│   ├── HeartbeatService   # Activity tracking
│   ├── ReminderService    # Task reminders
│   ├── PreferencesService # User preferences
│   └── adapters/          # External service adapters
├── internationalization/  # Future i18n implementation (see README)
├── components/           # Shared UI components
├── hooks/               # Custom React hooks
├── pages/               # Route components
├── providers/           # Context providers
└── utils/               # Utility functions
```

### Key Technologies & Integrations

- **Authentication**: Clerk (clerk.com) for user management
- **Database**: Supabase for real-time data sync
- **Payments**: Stripe for subscriptions
- **State Management**: React Query (TanStack Query)
- **Styling**: Tailwind CSS with Radix UI components
- **Forms**: React Hook Form with Zod validation
- **i18n**: Currently English-only, future modular implementation planned
- **Feature Flags**: GrowthBook for gradual rollouts
- **AI/OCR**: OpenAI API and Tesseract.js for document processing

### Service Architecture Pattern

The application uses a service-oriented architecture with adapter pattern for external integrations:

1. **Services** (`src/services/`): Core business logic, offline-first with localStorage
2. **Adapters** (`src/services/adapters/`): Swappable backends (localStorage vs Supabase)
3. **API Routes** (`src/app/api/`): Server-side endpoints for secure operations
4. **Features** (`src/features/`): Self-contained feature modules with components, services, and types

### Important Development Principles

#### Never Do
- **NO gamification**: No scores, percentages, achievements, or progress bars
- **NO comparisons**: Never compare users with others
- **NO pressure tactics**: Respectful, non-pushy user experience

#### Always Do
- **Privacy-first**: Local encryption, minimal data collection
- **Respectful UX**: Soft language, accessible design, quiet hours support
- **Offline-first**: Core functionality works without internet
- **Progressive enhancement**: Mobile-responsive, PWA-ready

### Testing Strategy

1. **Unit Tests** (Vitest): Services, utilities, and components
2. **Integration Tests**: API routes and feature flows
3. **E2E Tests** (Playwright/Cypress): Critical user journeys
4. **Visual Regression**: Screenshots for UI consistency

### Environment Configuration

Key environment variables (see `.env.example`):
- `VITE_CLERK_PUBLISHABLE_KEY`: Clerk authentication
- `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`: Database
- `STRIPE_SECRET_KEY` & `STRIPE_WEBHOOK_SECRET`: Payments
- `OPENAI_API_KEY`: AI features
- `GROWTHBOOK_API_KEY`: Feature flags

### Docker Support

The project includes Docker configuration for containerized deployment:
- Main app container with Nginx
- PostgreSQL database
- Redis cache
- Health checks and auto-restart

### CI/CD Pipeline

GitHub Actions workflows handle:
- Testing and linting on PR
- Bundle size monitoring
- Automated deployments
- OpenAPI schema generation for backend

### Mobile Integration

The web app is designed to work alongside a mobile app:
- Mobile app serves as primary heartbeat source
- Web reads heartbeat from shared Supabase
- Cross-device sync for preferences and data
- Responsive design for mobile browsers

### Localization Standards

- **UI Labels**: Sentence case ("Trusted person", not "Trusted Person")
- **Headings**: Title case
- **Terminology**: "Trusted Circle" (replaces "Trusted People")
- **Placeholders**: Minimal, neutral text
- **Translations**: 33+ languages with audit tools

### Multi-Domain Deployment Strategy

The application is deployed across 39 European country-specific domains with tailored legal frameworks and pricing:

#### Tier 1 Markets (€19/month) - 29 countries
- Western & Central Europe: `.de`, `.fr`, `.es`, `.it`, `.nl`, `.be`, `.ch`, `.at`, `.uk`, etc.
- Each domain loads only relevant 4-5 languages for that country
- Example: `legacyguard.cz` offers Czech, Slovak, English, German, Ukrainian

#### Tier 2 Markets (€14/month) - 10 countries
- Eastern Europe & Balkans: `.ro`, `.bg`, `.hr`, `.rs`, `.al`, `.mk`, `.me`, `.md`, `.ua`, `.ba`
- Competitive pricing for emerging markets

#### Language Matrix Implementation
- **33+ languages** total across all domains
- **Domain-based loading**: Each domain loads only its relevant languages (4-5 per country)
- **Smart detection**: Geolocation + browser language + user preference
- **Legal terminology**: Country-specific legal terms in each supported language
- **Fallback hierarchy**: User preference → Device language → Domain default → English

#### Country-Specific Legal Requirements
Each domain includes:
- Localized legal document templates (wills, powers of attorney)
- Country-specific inheritance tax calculations
- Integration with national notary systems where required
- Compliance with regional laws (e.g., French forced heirship, Swiss cantonal variations)

#### Geolocation & Domain Routing
- **Automatic domain assignment**: Users are redirected to country-specific domains:
  - `legacyguard.cz` for Czech Republic
  - `legacyguard.pl` for Poland
  - `legacyguard.eu` for Germany (exception)
  - Based on IP geolocation and browser language
- **Browser language detection**: `navigator.language` determines initial language within domain

#### Implementation Notes for Developers
- Check domain with `window.location.hostname` to determine active market
- Load appropriate language bundle based on domain configuration
- Use country-specific legal validation rules
- Apply correct pricing tier based on domain
- Ensure legal templates match the domain's jurisdiction

### Core Application Goals

#### Primary Goal: Last Will Creation
- Generate legally valid wills compliant with each country's laws
- Templates available in `/docs/Will/` for each jurisdiction
- Support both holographic (handwritten) and witnessed formats
- Country-specific legal requirements and validations

#### Dead-Man-Switch System
- **Activation trigger**: User inactivity for configured period (30, 90, or 180 days)
- **Notification system**: Progressive alerts before activation
- **Inheritance structure**: Manages beneficiary access upon activation
- **Grace period**: Configurable buffer time after initial trigger
- **Integration**: Works with HeartbeatService for activity tracking

#### Additional Features (from Features.md)
- **Heritage Vault**: Secure document storage with encryption
- **Guardian Network**: Trusted helpers for emergency access
- **Survivor's Manual**: Essential information compilation
- **Family Hub**: Family preparedness scoring and emergency protocols
- **Time Capsule**: Video messages for future viewing
- **Legacy Letters**: Sealed messages for specific individuals
- **Will Generator**: Step-by-step will creation with validation
- **Asset Management**: Comprehensive asset tracking and allocation

### Development Workflow

1. Create feature branch from `main`
2. Implement with tests
3. Run `npm run ci` to validate
4. Check bundle size impact
5. Test with E2E for critical paths
6. Submit PR with description

### Performance Targets

- Initial bundle: < 200KB gzipped
- Lighthouse score: > 90 all metrics
- Time to interactive: < 3s on 3G
- Code splitting per feature module

### Security Considerations

- CSP headers configured
- Secret redaction in logs
- Encrypted localStorage for sensitive data
- Secure cookie handling
- CORS properly configured

## Quick Debugging

```bash
# Reset all local data (development only)
# Available through Settings > Developer Tools

# Check environment variables
node -e "require('./src/utils/env-check.ts')"

# View bundle analysis
npm run build && open bundle-stats.html

# Run specific test file
npm test -- path/to/test.file

# Debug E2E test
npm run test:e2e:debug
```

## Life Inventory Dashboard Concept

### Core Problem Understanding

The application addresses three critical user pain points:

1. **Chaos and Uncertainty After Death**: "When I die, my family will be stressed and grieving. They'll have to search for bank passwords, property contracts, insurance policies, accountant contacts. It will be hell for them and I want to spare them this pain."

2. **Fear of Losing Control and Privacy**: "I want all sensitive information in one place, but I don't trust Google, Facebook or any cloud. I'm also afraid that if I write it on paper, someone will find it or it will get lost."

3. **Procrastination and Complexity**: "I know I should deal with wills and insurance, but it's so complex, expensive and unpleasant that I keep putting it off. I need someone to guide me through it like a small child, otherwise I'll never do it."

### UX Philosophy: From "Tool" to "Personal Assistant"

Users don't come to use a "will creation tool". They come to take "inventory of their life" and the application is their discrete and efficient assistant.

### Onboarding Strategy & Flow

**Critical**: Users need to be properly prepared and guided to understand:
- Why they will receive questions
- How these questions will help them
- Trust-building through empathetic explanation of the painful problems we're solving

The onboarding must be emotionally intelligent and highly persuasive while remaining sensitive to the serious nature of the topics.

#### Onboarding Flow Structure

1. **Pre-Onboarding Screen**: Sensitively explains why we ask 2 basic questions and their benefits
2. **EmotionalOnboarding.tsx**: Life-focused wizard with questions:
   - "What is most important for you to preserve for your loved ones?" (open question for motivation discovery)
   - "Who should have access to this information if something happens to you?" (trusted persons/heirs identification)
3. **LifeInventoryDashboard.tsx**: Pre-populated dashboard based on user's answers, showing:
   - Current status of life areas
   - Recommended actions with priorities
   - 5-minute micro-tasks for easy completion

### Key Components to Implement

#### 1. Dashboard.tsx - Life Inventory Dashboard
```typescript
interface LifeArea {
  id: string;
  title: string; // e.g., "Váš domov a majetky" (Your home and assets)
  icon: React.ReactNode;
  status: "complete" | "needs_attention" | "critical";
  items: LifeItem[];
  nextAction: string;
  whyImportant: string;
  scenario: string; // "What if something happens to you tomorrow?"
}
```

The Dashboard serves as the showcase of the project, directly addressing users' painful problems through life inventory visualization.

#### 2. ScenarioPlanner.tsx (new component)
- Interactive "What if..." scenarios
- Visualization of family impact
- Concrete resolution steps
- Emotional connection to consequences

#### 3. MicroTaskEngine.tsx (new component)
- Breaks large tasks into 5-minute steps
- Gamification WITHOUT trivialization (remember: serious topics)
- Progressive disclosure of complexity
- Respectful achievement system

#### 4. OnboardingWizard.tsx - Emotional Onboarding
- Life questions instead of technical ones
- Personalization based on family situation
- Emotional connection to painful problems
- Trust-building through empathy

### Partnership & Legal Authority

The project is developed in partnership with a law firm that:
- Serves as the professional guarantor
- Is mentioned on the landing page
- Provides recommendations for personal consultations with inheritance law experts

### Implementation Guidelines

1. **Always remember**: This is NOT a game or casual app. It deals with death, family, and legacy.
2. **Language**: Use respectful, empathetic language that acknowledges the emotional weight
3. **Motivation**: Focus on protecting loved ones, not completing tasks
4. **Progress**: Show progress through life areas covered, not percentages or scores
5. **Scenarios**: Make consequences tangible and personal, not abstract

### Design System & Marketing Content

#### Visual Design (from Design Manual v1)
- **Typography**: Inter Bold (headings), Inter Medium (subheadings), Inter Regular (body), Georgia Italic (emotional)
- **Color Palette**:
  - Light mode: `#FAF8F5` (bg), `#6B4F3B` (primary), `#A68C6D` (secondary)
  - Dark mode: `#1C1C1C` (bg), `#CDB89F` (primary), `#8A6F57` (secondary)
- **Components**: Soft shadows, rounded corners, earth tones
- **Animations**: Gentle transitions (300ms ease-in-out)

#### Marketing Language (from MARKETING_CONTENT_SYSTEM.md)
- **Target Audience**: Middle-aged and older adults (40+)
- **Value Proposition**: Peace of mind through organization
- **Tone**: Formal, respectful, culturally sensitive
- **Content Strategy**: Lead with problems, not features

### Privacy-First Architecture

#### Data Processing Modes (from privacy-first.md)
- **Local-only**: All sensitive data stays local (encrypted)
- **Hybrid**: Selected categories sync to cloud
- **Full sync**: All categories sync (encrypted)

#### Security Implementation
- **Encryption**: AES-GCM with random IV
- **Key Management**: PBKDF2 (100k+ iterations)
- **Auto-lock**: After 15min inactivity (configurable)
- **Export Control**: Requires unlocked session

### Advanced Features

#### Real-Time Progress System
- **ProgressService**: Non-gamified progress tracking
- **Reassuring Updates**: Confirm user's actions and explain future benefits
- **Behavioral Insights**: Track progress without scores or percentages

#### Time Capsule System
- **Video Messages**: Record and store for future viewing
- **Emotional Content**: Share important life memories
- **Access Control**: Time-based or event-based unlocking

#### Document Management
- **Inline Editing**: Real-time metadata updates
- **Smart Validation**: Context-aware field validation
- **AI Document Intelligence**: Automatic classification and metadata extraction
- **OCR Integration**: Text extraction from scanned documents

#### Guardian's Network
- **Guardian's Playbook**: Comprehensive manual for survivors
- **Access Management**: Role-based permissions system
- **Family Communication Hub**: Coordinated access and updates
- **Preparedness Score**: Family readiness assessment

#### Smart Notifications
- **Behavioral Nudges**: Intelligent reminders
- **Context Awareness**: Time and situation-appropriate alerts
- **Progressive Disclosure**: Gradual feature introduction

## Additional Resources

- Feature Flags: `docs/feature-flags.md`
- Migration Guide: `docs/migration-guide-respectful-onboarding.md`
- Rollback Procedures: `docs/rollback-procedures.md`
- Developer Guide: `docs/DEVELOPER_GUIDE.md`
- Deployment: `deployment/DEPLOYMENT_CHECKLIST.md`
