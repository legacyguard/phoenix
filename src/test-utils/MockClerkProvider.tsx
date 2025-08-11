/* eslint-disable react-refresh/only-export-components */
import type React, { ReactNode } from "react";
import type { MockUser } from "./mockClerkHelpers";
import {
  MockSession,
  MockAuthContextValue,
  MockUserContextValue,
  MockAuthContext,
  MockUserContext,
  MockClerkContext,
} from "./mockClerkContexts";

interface MockClerkProviderProps {
  children: ReactNode;
  user?: MockUser | null;
  isSignedIn?: boolean;
  onSignOut?: () => void;
}

// Mock ClerkProvider
export const ClerkProvider: React.FC<
  MockClerkProviderProps & {
    publishableKey?: string;
    fallbackRedirectUrl?: string;
    signInUrl?: string;
    signUpUrl?: string;
    afterSignOutUrl?: string;
  }
> = ({
  children,
  user = null,
  isSignedIn = false,
  onSignOut,
  ...clerkProps
}) => {
  const session: MockSession | null =
    isSignedIn && user
      ? {
          id: "test-session-id",
          status: "active",
          lastActiveAt: new Date(),
          expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          user: user as MockUser,
        }
      : null;

  const mockAuthValue: MockAuthContextValue = {
    isLoaded: true,
    isSignedIn: isSignedIn,
    userId: user?.id || null,
    sessionId: session?.id || null,
    session: session,
    signOut: async () => {
      console.log("Mock signOut called");
      if (onSignOut) {
        onSignOut();
      }
      if (clerkProps.afterSignOutUrl) {
        window.location.href = clerkProps.afterSignOutUrl;
      }
    },
    getToken: async (options?: Record<string, unknown>) => {
      if (!isSignedIn) return null;
      // Return a mock JWT token
      return "mock-jwt-token-" + user?.id;
    },
    orgId: null,
    orgRole: null,
    orgSlug: null,
  };

  const mockUserValue: MockUserContextValue = {
    isLoaded: true,
    isSignedIn: isSignedIn,
    user: user,
  };

  const mockClerkValue = {
    loaded: true,
    session: session,
    user: user,
    isSignedIn: () => isSignedIn,
    signOut: mockAuthValue.signOut,
    // Add other Clerk singleton methods as needed
  };

  // Also set on window for components that might access Clerk directly
  if (typeof window !== "undefined") {
    (window as { Clerk?: Record<string, unknown> }).Clerk = mockClerkValue;
  }

  return (
    <MockClerkContext.Provider value={mockClerkValue}>
      <MockAuthContext.Provider value={mockAuthValue}>
        <MockUserContext.Provider value={mockUserValue}>
          {children}
        </MockUserContext.Provider>
      </MockAuthContext.Provider>
    </MockClerkContext.Provider>
  );
};

// Re-export everything from separate files for backward compatibility
export { createMockUser, mockUsers } from "./mockClerkHelpers";
export {
  useAuth,
  useUser,
  useClerk,
  useSession,
  useSessionList,
  useOrganization,
  useOrganizationList,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  UserButton,
  UserProfile,
} from "./mockClerkExports";
