# Phoenix Project - Component Library

This document outlines the primary React components used in the Phoenix frontend. The goal is to create a reusable, consistent, and maintainable UI. All components should be built with TypeScript and styled with Tailwind CSS.

---

## 1. Core / Atomic Components

These are the basic building blocks of our UI.

### `Button`
-   **Description:** A versatile button component.
-   **Props:**
    -   `variant: 'primary' | 'secondary' | 'danger' | 'ghost'` (default: 'primary')
    -   `size: 'sm' | 'md' | 'lg'` (default: 'md')
    -   `onClick: () => void`
    -   `children: React.ReactNode`
    -   `isLoading?: boolean` (shows a spinner)
    -   `disabled?: boolean`

### `Input`
-   **Description:** A styled input field with a label.
-   **Props:**
    -   `label: string`
    -   `type: 'text' | 'email' | 'password' | 'number'` (default: 'text')
    -   `placeholder?: string`
    -   `value: string`
    -   `onChange: (e: React.ChangeEvent<HTMLInputElement>) => void`
    -   `error?: string` (displays an error message)

### `Card`
-   **Description:** A container with a shadow and rounded corners for grouping content.
-   **Props:**
    -   `children: React.ReactNode`
    -   `className?: string` (for additional styling)
    -   `onClick?: () => void`

### `Badge`
-   **Description:** A small badge for displaying status or tags.
-   **Props:**
    -   `colorScheme: 'green' | 'blue' | 'red' | 'gray'`
    -   `children: React.ReactNode`

---

## 2. Composite Components

These components are built from atomic components and have more specific functions.

### `AssetCard`
-   **Description:** Displays a summary of a single asset on the dashboard.
-   **Props:**
    -   `asset: Asset` (type imported from the shared `types` package)
    -   `onEdit: (assetId: string) => void`
    -   `onDelete: (assetId: string) => void`
-   **Composition:** Uses `Card`, `Badge` (for asset type), and `Button` (for actions).

### `GuardianCard`
-   **Description:** Displays information about a trusted guardian.
-   **Props:**
    -   `guardian: Guardian` (type imported from the shared `types` package)
    -   `onPermissionsChange: (guardianId: string) => void`
-   **Composition:** Uses `Card`, `Badge` (for status), and `Button`.

### `DocumentRow`
-   **Description:** A row in a table displaying a document's information.
-   **Props:**
    -   `document: Document` (type imported from the shared `types` package)
    -   `onPreview: (documentId: string) => void`
    -   `onAnalyze: (documentId: string) => void` (triggers AI analysis)

---

## 3. Layout Components

These components define the overall structure of the pages.

### `AppLayout`
-   **Description:** The main application layout, including the sidebar navigation and a main content area.
-   **Props:**
    -   `children: React.ReactNode`
-   **Composition:** Contains a `Sidebar` component and a main content wrapper.

### `DashboardLayout`
-   **Description:** A specific layout for dashboard pages, often with a header showing stats or a welcome message.
-   **Props:**
    -   `title: string`
    -   `children: React.ReactNode`
-   **Composition:** Uses `AppLayout` and adds a page-specific header.

### `OnboardingWizard`
-   **Description:** A multi-step wizard component for guiding new users.
-   **Props:**
    -   `steps: { title: string; content: React.ReactNode }[]`
    -   `onComplete: () => void`
-   **Composition:** Manages state for the current step and uses `Button` components for navigation.
