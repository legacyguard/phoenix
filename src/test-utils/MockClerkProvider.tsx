import React, { createContext, useContext, ReactNode } from 'react';
import type { UserResource, SessionResource, OrganizationResource } from '@clerk/types';

// Define mock types that match Clerk's actual types
interface MockUser extends Partial<UserResource> {
  id: string;
  primaryEmailAddress?: {
    emailAddress: string;
    id: string;
  };
  emailAddresses?: Array<{
    emailAddress: string;
    id: string;
  }>;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  imageUrl?: string;
  publicMetadata?: Record<string, any>;
  unsafeMetadata?: Record<string, any>;
}

interface MockSession extends Partial<SessionResource> {
  id: string;
  status: 'active' | 'ended' | 'expired' | 'removed' | 'replaced' | 'unknown';
  lastActiveAt: Date;
  expireAt: Date;
  user?: MockUser;
}

interface MockAuthContextValue {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  sessionId: string | null;
  session: MockSession | null;
  signOut: () => Promise<void>;
  getToken: (options?: any) => Promise<string | null>;
  orgId: string | null;
  orgRole: string | null;
  orgSlug: string | null;
}

interface MockUserContextValue {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: MockUser | null;
}

interface MockClerkProviderProps {
  children: ReactNode;
  user?: MockUser | null;
  isSignedIn?: boolean;
  onSignOut?: () => void;
}

// Create contexts
const MockAuthContext = createContext<MockAuthContextValue | null>(null);
const MockUserContext = createContext<MockUserContextValue | null>(null);
const MockClerkContext = createContext<any | null>(null);

// Mock SignedIn component
export const SignedIn: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useContext(MockAuthContext);
  if (!auth?.isSignedIn) return null;
  return <>{children}</>;
};

// Mock SignedOut component
export const SignedOut: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useContext(MockAuthContext);
  if (auth?.isSignedIn) return null;
  return <>{children}</>;
};

// Mock RedirectToSignIn component
export const RedirectToSignIn: React.FC = () => {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
  return null;
};

// Mock UserButton component
export const UserButton: React.FC<any> = ({ afterSignOutUrl }) => {
  const user = useUser();
  const { signOut } = useAuth();
  
  if (!user?.user) return null;
  
  return (
    <div data-testid="user-menu-button" onClick={() => {
      // In real tests, this would open a menu
      console.log('UserButton clicked');
    }}>
      <img 
        src={user.user.imageUrl || `https://ui-avatars.com/api/?name=${user.user.firstName}+${user.user.lastName}`} 
        alt={user.user.fullName || 'User'} 
        style={{ width: 32, height: 32, borderRadius: '50%' }}
      />
      <button data-testid="sign-out-button" onClick={() => signOut()}>
        Sign Out
      </button>
    </div>
  );
};

// Mock UserProfile component
export const UserProfile: React.FC = () => {
  const user = useUser();
  if (!user?.user) return null;
  
  return (
    <div data-testid="user-profile">
      <h2>User Profile</h2>
      <p>{user.user.fullName}</p>
      <p>{user.user.primaryEmailAddress?.emailAddress}</p>
    </div>
  );
};

// Mock ClerkProvider
export const ClerkProvider: React.FC<MockClerkProviderProps & { 
  publishableKey?: string;
  afterSignInUrl?: string;
  afterSignUpUrl?: string;
  signInUrl?: string;
  signUpUrl?: string;
  afterSignOutUrl?: string;
}> = ({ 
  children, 
  user = null, 
  isSignedIn = false,
  onSignOut,
  ...clerkProps 
}) => {
  const session: MockSession | null = isSignedIn && user ? {
    id: 'test-session-id',
    status: 'active',
    lastActiveAt: new Date(),
    expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    user: user as MockUser
  } : null;

  const mockAuthValue: MockAuthContextValue = {
    isLoaded: true,
    isSignedIn: isSignedIn,
    userId: user?.id || null,
    sessionId: session?.id || null,
    session: session,
    signOut: async () => {
      console.log('Mock signOut called');
      if (onSignOut) {
        onSignOut();
      }
      if (clerkProps.afterSignOutUrl) {
        window.location.href = clerkProps.afterSignOutUrl;
      }
    },
    getToken: async (options?: any) => {
      if (!isSignedIn) return null;
      // Return a mock JWT token
      return 'mock-jwt-token-' + user?.id;
    },
    orgId: null,
    orgRole: null,
    orgSlug: null
  };

  const mockUserValue: MockUserContextValue = {
    isLoaded: true,
    isSignedIn: isSignedIn,
    user: user
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
  if (typeof window !== 'undefined') {
    (window as any).Clerk = mockClerkValue;
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

// Export mock hooks
export const useAuth = () => {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within ClerkProvider');
  }
  return context;
};

export const useUser = () => {
  const context = useContext(MockUserContext);
  if (!context) {
    throw new Error('useUser must be used within ClerkProvider');
  }
  return context;
};

export const useClerk = () => {
  const context = useContext(MockClerkContext);
  if (!context) {
    throw new Error('useClerk must be used within ClerkProvider');
  }
  return context;
};

// Export other commonly used Clerk hooks with mock implementations
export const useSession = () => {
  const auth = useAuth();
  return {
    isLoaded: auth.isLoaded,
    isSignedIn: auth.isSignedIn,
    session: auth.session
  };
};

export const useSessionList = () => {
  const auth = useAuth();
  return {
    isLoaded: auth.isLoaded,
    sessions: auth.session ? [auth.session] : []
  };
};

export const useOrganization = () => {
  return {
    isLoaded: true,
    organization: null,
    membership: null
  };
};

export const useOrganizationList = () => {
  return {
    isLoaded: true,
    organizationList: [],
    userMemberships: {
      count: 0,
      data: []
    }
  };
};

// Create test user factories
export const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => {
  const id = overrides.id || `user_${Math.random().toString(36).substring(7)}`;
  const email = overrides.primaryEmailAddress?.emailAddress || `user-${id}@test.com`;
  const firstName = overrides.firstName || 'Test';
  const lastName = overrides.lastName || 'User';
  
  return {
    id,
    primaryEmailAddress: {
      emailAddress: email,
      id: `email_${Math.random().toString(36).substring(7)}`
    },
    emailAddresses: [{
      emailAddress: email,
      id: `email_${Math.random().toString(36).substring(7)}`
    }],
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    imageUrl: `https://ui-avatars.com/api/?name=${firstName}+${lastName}`,
    publicMetadata: {
      subscriptionTier: 'free',
      isExecutor: false,
      ...overrides.publicMetadata
    },
    unsafeMetadata: {},
    ...overrides
  };
};

// Pre-defined test users
export const mockUsers = {
  freeUser: createMockUser({
    id: 'test-free-user',
    firstName: 'Free',
    lastName: 'User',
    primaryEmailAddress: {
      emailAddress: 'test-free@example.com',
      id: 'email-free'
    },
    publicMetadata: {
      subscriptionTier: 'free',
      isExecutor: false
    }
  }),
  premiumUser: createMockUser({
    id: 'test-premium-user', 
    firstName: 'Premium',
    lastName: 'User',
    primaryEmailAddress: {
      emailAddress: 'test-premium@example.com',
      id: 'email-premium'
    },
    publicMetadata: {
      subscriptionTier: 'premium',
      isExecutor: true
    }
  })
};
