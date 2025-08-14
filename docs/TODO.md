# Phoenix Project: Comprehensive To-Do List

This document tracks all major tasks required to build, launch, and grow the Phoenix application. It is organized by development phase and cross-functional areas.

---

## 🏛️ Phase 0: Foundation & Architecture

*The goal of this phase is to set up a robust, scalable, and secure foundation for the entire project.*

-   [X] **Project Setup:**
    -   [X] Initialize a monorepo (e.g., using pnpm workspaces or Nx).
    -   [X] Set up the folder structure: `/apps/frontend`, `/apps/backend`, `/apps/ai-service`, `/packages/types`.
    -   [ ] Configure shared TypeScript configurations and linting rules (ESLint, Prettier) across the monorepo.
-   [X] **Documentation:**
    -   [X] Finalize and commit `db-schema.md`.
    -   [X] Finalize and commit `api-schema.md`.
    -   [X] Finalize and commit `component-library.md`.
    -   [X] This `TODO.md` file is created and committed.
-   [X] **Backend (NestJS) Setup:**
    -   [X] Initialize the NestJS application in `/apps/backend`.
    -   [X] Integrate Prisma ORM and connect it to a PostgreSQL database.
    -   [X] Generate the initial Prisma schema from `db-schema.md`.
    -   [X] Set up environment variable management (e.g., using `@nestjs/config`).
-   [ ] **Frontend (React) Setup:**
    -   [ ] Move the existing React app into `/apps/frontend`.
    -   [ ] Ensure it works correctly within the monorepo setup.
    -   [ ] Configure it to import from the shared `/packages/types` directory.

---

## 🚀 Phase 1: Core MVP (Minimum Viable Product)

*The goal of this phase is to launch a functional version with core features that users can start using.*

-   [X] **Backend Development:**
    -   [X] Implement User Authentication (`/api/auth/register`, `/api/auth/login`) with JWT.
    -   [X] Implement CRUD API for Assets (`/api/assets`).
    -   [ ] Implement CRUD API for Guardians (`/api/guardians`).
    -   [X] Implement basic API for Document metadata (`/api/documents`).
    -   [ ] Implement User Settings API, including Heart-Beat protocol settings.
    -   [X] Write unit and integration tests for all API endpoints.
-   [ ] **Frontend Development:**
    -   [ ] Create core atomic components from `component-library.md` (Button, Input, Card).
    -   [ ] Build the main `AppLayout` with sidebar navigation.
    -   [ ] Implement the registration and login pages, connecting them to the backend API.
    -   [ ] Build the "Life Inventory Dashboard" to display assets and guardians fetched from the API.
    -   [ ] Create forms for adding/editing assets and guardians.
    -   [ ] Implement the user onboarding flow ("OnboardingWizard").
    -   [ ] Build the "Guardian's Playbook" page (statically for now).
-   [ ] **Deployment & DevOps:**
    -   [ ] Set up a staging/development environment.
    -   [ ] Configure a CI/CD pipeline (e.g., using GitHub Actions) to automatically build and test the code on push.
    -   [ ] Choose a cloud provider (e.g., Vercel for Frontend, Render/Heroku for Backend) and deploy the first version.

---

## 🧠 Phase 2: Intelligence & Monetization

*The goal of this phase is to introduce premium AI features and start generating revenue.*

-   [ ] **AI Service (Python/FastAPI) Setup:**
    -   [ ] Initialize the FastAPI application in `/apps/ai-service`.
    -   [ ] Set up secure communication between the main Backend and the AI Service.
    -   [ ] Manage API keys (OpenAI, etc.) securely using environment variables.
-   [ ] **AI Feature Development:**
    -   [ ] **AI Document Intelligence (Premium):**
        -   [ ] Integrate an OCR library/service.
        -   [ ] Build the `/api/ai/process-document` endpoint.
        -   [ ] Implement logic to call OpenAI API for classification and metadata extraction.
        -   [ ] Update the frontend to display extracted metadata and classification badges.
    -   [ ] **Time Capsule & Story Generator (Premium):**
        -   [ ] Build the `/api/ai/generate-story` endpoint.
        -   [ ] Integrate Whisper API for speech-to-text if voice input is supported.
        -   [ ] Create the "Time Capsule" UI on the frontend for users to create messages.
-   [ ] **Monetization:**
    -   [ ] Choose and integrate a payment provider (e.g., Stripe).
    -   [ ] Create the subscription plan logic in the `Plan` model.
    -   [ ] Implement API middleware to check for "premium" status before allowing access to AI endpoints.
    -   [ ] Build the "Upgrade to Premium" page/flow on the frontend.

---

## ⚖️ Phase 3: Legal & Advanced Planning

*The goal of this phase is to tackle the complex legal aspects and become a true legacy planning tool.*

-   [ ] **Knowledge Base Development:**
    -   [ ] Research and structure the legal requirements for wills/inheritance for the first 2 target countries (e.g., Slovakia, Germany).
    -   [ ] Create the initial version of the "Knowledge Base" (e.g., as structured Markdown or JSON files).
-   [ ] **Will Generator 2.0 (Premium):**
    -   [ ] Enhance the AI Service to use RAG (Retrieval-Augmented Generation) with the new Knowledge Base.
    -   [ ] Upgrade the multi-step will generator form on the frontend.
    -   [ ] Implement real-time validation and suggestions based on the user's country.
    -   [ ] Add a very prominent legal disclaimer about the need for a lawyer's review.
-   [ ] **Advanced Features:**
    -   [ ] **Document Relationship Intelligence:** Implement backend logic to suggest links between documents and assets.
    -   **Expiration Monitoring:** Create a scheduled job (cron job) to check for expiring documents and send notifications.

---

## 🌐 Phase 4: Ecosystem & Community

*The goal of this phase is to expand the platform's reach and functionality, creating a full ecosystem.*

-   [ ] **Family Communication Hub:**
    -   [ ] Implement the login flow for Guardians.
    -   [ ] Build the Guardian-facing dashboard, showing only the information they have permission to see.
    -   [ ] Implement the "Preparedness Score" for Guardians.
-   [ ] **Dead Man's Switch & Heart-Beat Protocol:**
    -   [ ] Implement the scheduled job for the Heart-Beat check-in.
    -   [ ] Develop the notification logic (email, push) for check-ins.
    -   [ ] Build the secure mechanism for activating the switch and releasing information to the designated executor. **(Requires extensive testing).**
-   [ ] **Mobile Application:**
    -   [ ] Plan the architecture for the mobile app (e.g., React Native).
    -   [ ] Develop the document scanning feature using the phone's camera.
    -   [ ] Ensure the mobile app reuses the existing backend API.
-   [ ] **Localization & Expansion:**
    -   [ ] Implement an internationalization (i18n) framework in the frontend (e.g., `i18next`).
    -   [ ] Add language packs for the next 5-10 languages.
    -   [ ] Expand the legal Knowledge Base with 5-10 new countries.

---

## ✅ Cross-Functional Tasks (Ongoing)

*These tasks are not tied to a single phase and must be considered throughout the project.*

-   [ ] **Security:**
    -   [ ] Conduct regular dependency security scans.
    -   [ ] Implement rate limiting and other protections against abuse.
    -   [ ] Ensure all data is encrypted at rest and in transit.
    -   [ ] Plan for a third-party security audit before a major public launch.
-   [ ] **Legal & Compliance:**
    -   [ ] Draft a comprehensive Privacy Policy and Terms of Service.
    -   [ ] Ensure GDPR compliance for all EU users.
    -   [ ] Consult with lawyers in target countries to validate the Knowledge Base.
-   [ ] **UI/UX:**
    -   [ ] Conduct user testing sessions with target personas.
    -   [ ] Ensure the application is fully responsive and accessible (WCAG).
-   [ ] **Marketing & Launch:**
    -   [ ] Create a landing page for pre-launch sign-ups.
    -   [ ] Define the pricing strategy for the premium plan.
    -   [ ] Prepare launch materials (blog posts, social media announcements).
-   [ ] **polishing Pre-Launch Polish & Security:**
    -   [ ] Implement Refresh Token strategy for long-lived user sessions.
    -   [ ] Implement Email Confirmation flow for new user registrations.
    -   [ ] Implement Roles Guard for admin-only functionalities.
    -   [ ] Conduct a full security review of all dependencies and configurations.