/* E2E wrapper injected */
import React from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n/index";
import App from "./App.tsx";
import { AuthSyncProvider } from "./components/auth/AuthSyncProvider";
import { validateSecurityConfig } from "./utils/security";
import { E2EErrorBoundary } from './test/E2EErrorBoundary';
import E2EShell from './test/E2EShell';
import E2EAppProbe from './test/E2EAppProbe';
import "./index.css";

// Initialize security configuration
validateSecurityConfig();

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Allow E2E to run without a real Clerk key when a browser-side Clerk stub is present
const hasBrowserClerkStub = typeof window !== 'undefined' && !!(window as any).Clerk;
const isE2E = import.meta.env.VITE_E2E === 'true';

try {
  const __root = document.getElementById("root");
  if (!__root) { (window as any).__MOUNT_OK__ = false; throw new Error('Root element not found'); }
  const __start = performance.now();

  const withClerkProvider = !!PUBLISHABLE_KEY && !hasBrowserClerkStub;

  const appNode = (
    <I18nextProvider i18n={i18n}>
      {withClerkProvider ? (
        <ClerkProvider
          publishableKey={PUBLISHABLE_KEY}
          afterSignOutUrl="/"
          fallbackRedirectUrl="/dashboard"
          signInUrl="/login"
          signUpUrl="/register"
        >
          <AuthSyncProvider>
            <App />
          </AuthSyncProvider>
        </ClerkProvider>
      ) : (
        <AuthSyncProvider>
          <App />
        </AuthSyncProvider>
      )}
    </I18nextProvider>
  );

  const node = (isE2E && import.meta.env.VITE_E2E_FORCE_SHELL) ? (
    <E2EShell />
  ) : (
    <E2EErrorBoundary>
      <E2EAppProbe>
        <React.StrictMode>{appNode}</React.StrictMode>
      </E2EAppProbe>
    </E2EErrorBoundary>
  );

  createRoot(__root).render(node);
  (window as any).__MOUNT_OK__ = true;
  (window as any).__MOUNT_T0__ = __start;
  console?.log?.('[MOUNT] ok in', Math.round(performance.now()-__start),'ms', '(withClerkProvider=', withClerkProvider, ')');
} catch (error) {
  console.error("Error in main.tsx:", error);
  document.body.innerHTML =
    "<h1>Error loading app</h1><pre>" + error + "</pre>";
}
