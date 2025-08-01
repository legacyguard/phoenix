// Shim for AuthContext - redirects to Clerk
import { useUser } from '@clerk/clerk-react';

export const useAuth = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  return { user, isLoaded, isSignedIn };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
