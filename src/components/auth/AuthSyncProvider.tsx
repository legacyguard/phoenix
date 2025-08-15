import React, { useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { authService } from "@/services/authService";

interface AuthSyncProviderProps {
  children: React.ReactNode;
}

export const AuthSyncProvider: React.FC<AuthSyncProviderProps> = ({
  children,
}) => {
  // In E2E/browser-mock mode, skip Clerk hooks entirely to avoid runtime errors
  const hasBrowserClerkStub = typeof window !== 'undefined' && !!(window as any).Clerk;
  if (hasBrowserClerkStub) {
    return <>{children}</>;
  }

  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    if (isLoaded && user) {
      // Sync user data with Supabase
      authService.syncUserWithSupabase(user);

      // Set up Supabase session
      authService.getSupabaseToken(getToken);
    }
  }, [user, isLoaded, getToken]);

  return <>{children}</>;
};
