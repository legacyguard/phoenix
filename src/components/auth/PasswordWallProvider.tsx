import React, { useState, ReactNode } from 'react';
import { PasswordWallContext } from './PasswordWallContext';

interface PasswordWallProviderProps {
  children: ReactNode;
  onAuthenticationChange?: (authenticated: boolean) => void;
}

export const PasswordWallProvider: React.FC<PasswordWallProviderProps> = ({
  children,
  onAuthenticationChange
}) => {
  const [isPasswordWallAuthenticated, setPasswordWallAuthenticated] = useState(false);

  const handleAuthenticationChange = (authenticated: boolean) => {
    setPasswordWallAuthenticated(authenticated);
    onAuthenticationChange?.(authenticated);
  };

  return (
    <PasswordWallContext.Provider value={{
      isPasswordWallAuthenticated,
      setPasswordWallAuthenticated: handleAuthenticationChange
    }}>
      {children}
    </PasswordWallContext.Provider>
  );
};
