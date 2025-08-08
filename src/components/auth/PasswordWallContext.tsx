import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PasswordWallContextType {
  isPasswordWallAuthenticated: boolean;
  setPasswordWallAuthenticated: (authenticated: boolean) => void;
}

const PasswordWallContext = createContext<PasswordWallContextType | undefined>(undefined);

export const usePasswordWall = () => {
  const context = useContext(PasswordWallContext);
  if (context === undefined) {
    throw new Error('usePasswordWall must be used within a PasswordWallProvider');
  }
  return context;
};

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
