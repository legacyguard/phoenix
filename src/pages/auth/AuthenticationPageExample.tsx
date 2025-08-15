import React from 'react';
import { AuthenticationPage } from './AuthenticationPage';

export const AuthenticationPageExample: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header s informáciami */}
      <div className="bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-card-foreground">
            Phoenix - Autentifikačná Stránka
          </h1>
          <p className="text-muted-foreground mt-2">
            Demonštrácia prihlasovacej a registračnej stránky s našimi UI komponentmi
          </p>
        </div>
      </div>

      {/* Hlavný obsah - AuthenticationPage */}
      <AuthenticationPage />
    </div>
  );
};

export default AuthenticationPageExample;
