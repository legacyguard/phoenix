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
}

export const PasswordWallProvider: React.FC<PasswordWallProviderProps> = ({ children }) => {
  const [isPasswordWallAuthenticated, setPasswordWallAuthenticated] = useState(false);

  return (
    <PasswordWallContext.Provider value={{
      isPasswordWallAuthenticated,
      setPasswordWallAuthenticated
    }}>
      {children}
    </PasswordWallContext.Provider>
  );
};
