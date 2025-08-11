import { createContext } from 'react';

export interface PasswordWallContextType {
  isPasswordWallAuthenticated: boolean;
  setPasswordWallAuthenticated: (authenticated: boolean) => void;
}

export const PasswordWallContext = createContext<PasswordWallContextType | undefined>(undefined);
