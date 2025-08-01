// Shim for AuthContext - redirects to Clerk
import { useUser } from '@clerk/clerk-react';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
