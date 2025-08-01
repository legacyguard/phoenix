import React from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n/index'
import App from './App.tsx'
import PasswordWall from './components/PasswordWall'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key")
}

try {
  const root = document.getElementById('root');
  
  if (root) {
    createRoot(root).render(
      <React.StrictMode>
        <I18nextProvider i18n={i18n}>
          <PasswordWall>
            <ClerkProvider 
              publishableKey={PUBLISHABLE_KEY} 
              afterSignOutUrl="/"
              afterSignInUrl="/dashboard"
              afterSignUpUrl="/dashboard"
              signInUrl="/login"
              signUpUrl="/register"
            >
              <App />
            </ClerkProvider>
          </PasswordWall>
        </I18nextProvider>
      </React.StrictMode>
    );
  } else {
    console.error('Root element not found!');
  }
} catch (error) {
  console.error('Error in main.tsx:', error);
  document.body.innerHTML = '<h1>Error loading app</h1><pre>' + error + '</pre>';
}
