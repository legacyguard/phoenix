import React from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { Toaster } from 'sonner';
import App from './App';
import "./index.css";


const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Allow E2E to run without a real Clerk key when a browser-side Clerk stub is present
const hasBrowserClerkStub = typeof window !== 'undefined' && !!(window as any).Clerk;
const isE2E = import.meta.env.VITE_E2E === 'true';

// Clerk appearance configuration for our premium design
const clerkAppearance = {
  baseTheme: 'dark' as const,
  variables: {
    colorPrimary: '#CDB89F',
    colorBackground: '#1C1C1C',
    colorInputBackground: '#303030',
    colorText: '#F2F2F2',
    colorTextSecondary: '#AAAAAA',
    colorTextOnPrimaryBackground: '#1C1C1C',
    colorDanger: '#DC2626',
    borderRadius: '0.75rem',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
};

// Main app initialization
const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

const rootElement = createRoot(root);

// Render app with or without Clerk based on environment
if (PUBLISHABLE_KEY && !isE2E && !hasBrowserClerkStub) {
  rootElement.render(
    <React.StrictMode>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        appearance={clerkAppearance}
        afterSignOutUrl="/"
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
      >
        <App />
        <Toaster />
      </ClerkProvider>
    </React.StrictMode>
  );
} else {
  // E2E or development mode without Clerk
  rootElement.render(
    <React.StrictMode>
      <App />
      <Toaster />
    </React.StrictMode>
  );
}
