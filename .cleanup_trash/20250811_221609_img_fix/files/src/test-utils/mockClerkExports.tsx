/* eslint-disable react-refresh/only-export-components */
import React, { useContext, ReactNode } from "react";
import {
  MockAuthContext,
  MockUserContext,
  MockClerkContext,
} from "./mockClerkContexts";

// Export mock hooks
export const useAuth = () => {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error("useAuth must be used within ClerkProvider");
  }
  return context;
};

export const useUser = () => {
  const context = useContext(MockUserContext);
  if (!context) {
    throw new Error("useUser must be used within ClerkProvider");
  }
  return context;
};

export const useClerk = () => {
  const context = useContext(MockClerkContext);
  if (!context) {
    throw new Error("useClerk must be used within ClerkProvider");
  }
  return context;
};

// Export other commonly used Clerk hooks with mock implementations
export const useSession = () => {
  const auth = useAuth();
  return {
    isLoaded: auth.isLoaded,
    isSignedIn: auth.isSignedIn,
    session: auth.session,
  };
};

export const useSessionList = () => {
  const auth = useAuth();
  return {
    isLoaded: auth.isLoaded,
    sessions: auth.session ? [auth.session] : [],
  };
};

export const useOrganization = () => {
  return {
    isLoaded: true,
    organization: null,
    membership: null,
  };
};

export const useOrganizationList = () => {
  return {
    isLoaded: true,
    organizationList: [],
    userMemberships: {
      count: 0,
      data: [],
    },
  };
};

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
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
  return null;
};

// Mock UserButton component
export const UserButton: React.FC<{ afterSignOutUrl?: string }> = ({
  afterSignOutUrl,
}) => {
  const user = useUser();
  const { signOut } = useAuth();

  if (!user?.user) return null;

  return (
    <div
      data-testid="user-menu-button"
      onClick={() => {
        // In real tests, this would open a menu
        console.log("UserButton clicked");
      }}
    >
      <img
        src={
          user.user.imageUrl ||
          `https://ui-avatars.com/api/?name=${user.user.firstName}+${user.user.lastName}`
        }
        alt={user.user.fullName || "User"}
        style={{ width: 32, height: 32, borderRadius: "50%" }}
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
