import React from 'react'
import { createRoot } from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n/index'
import App from './App.tsx'
import PasswordWall from './components/PasswordWall'
import './index.css'

// Import our mock provider instead of the real Clerk
import { ClerkProvider } from './test-utils/MockClerkProvider'

// Check if we're in test mode by looking for mock state
const getMockState = () => {
  if (typeof window !== 'undefined' && (window as any).__MOCK_CLERK_STATE__) {
    return (window as any).__MOCK_CLERK_STATE__;
  }
  return { user: null, isSignedIn: false };
};

try {
  const root = document.getElementById('root');
  
  if (root) {
    const { user, isSignedIn } = getMockState();
    
    createRoot(root).render(
      <React.StrictMode>
        <I18nextProvider i18n={i18n}>
          <PasswordWall>
            <ClerkProvider 
              publishableKey="pk_test_mock"
              afterSignOutUrl="/"
              afterSignInUrl="/dashboard"
              afterSignUpUrl="/dashboard"
              signInUrl="/login"
              signUpUrl="/register"
              user={user}
              isSignedIn={isSignedIn}
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
  console.error('Error in main.test.tsx:', error);
  document.body.innerHTML = '<h1>Error loading app</h1><pre>' + error + '</pre>';
}
