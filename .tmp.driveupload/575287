
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getCurrentCountryConfig } from '@/config/countries';

interface CountryContextType {
  selectedCountryCode: string;
  setSelectedCountryCode: (countryCode: string) => void;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export const useCountry = () => {
  const context = useContext(CountryContext);
  if (context === undefined) {
    throw new Error('useCountry must be used within a CountryProvider');
  }
  return context;
};

interface CountryProviderProps {
  children: ReactNode;
}

export const CountryProvider: React.FC<CountryProviderProps> = ({ children }) => {
  // Get the initial country code safely - defer to useEffect for safety
  const [selectedCountryCode, setSelectedCountryCode] = useState('DE');

  // Use effect to set the correct country based on domain
  React.useEffect(() => {
     
    try {
      const currentConfig = getCurrentCountryConfig();
      setSelectedCountryCode(currentConfig.code);
    } catch (error) {
      // Failed to get country config, using default
      setSelectedCountryCode('DE');
    }
  }, []);

  return (
    <CountryContext.Provider value={{ selectedCountryCode, setSelectedCountryCode }}>
      {children}
    </CountryContext.Provider>
  );
};
