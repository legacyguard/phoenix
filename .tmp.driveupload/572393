'use client';

import React from 'react';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { CountryLanguageModal } from '@/components/modals/CountryLanguageModal';

interface GeoLocationProviderProps {
  children: React.ReactNode;
}

export function GeoLocationProvider({ children }: GeoLocationProviderProps) {
  const {
    showModal,
    detectedCountry,
    detectedLanguage,
    handleModalClose,
    handleModalConfirm,
  } = useGeoLocation();

  // Only show modal if explicitly needed (e.g., user manually triggers location detection)
  // The automatic detection is now handled in CountryContext
  return (
    <>
      {children}
      {/* Modal is only shown when explicitly needed, not automatically */}
      {showModal && (
        <CountryLanguageModal
          isOpen={showModal}
          onClose={handleModalClose}
          detectedCountry={detectedCountry}
          detectedLanguage={detectedLanguage}
          onConfirm={handleModalConfirm}
        />
      )}
    </>
  );
}
