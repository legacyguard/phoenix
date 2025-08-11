import { useContext } from 'react';
import { PasswordWallContext } from './PasswordWallContext';

export const usePasswordWall = () => {
  const context = useContext(PasswordWallContext);
  if (context === undefined) {
    throw new Error('usePasswordWall must be used within a PasswordWallProvider');
  }
  return context;
};
