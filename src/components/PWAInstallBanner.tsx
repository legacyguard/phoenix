// src/components/PWAInstallBanner.tsx

import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import { useTranslation } from "react-i18next";

export function PWAInstallBanner() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const { t } = useTranslation('ui');
  const [isDismissed, setIsDismissed] = useState(false);

  // Check if banner was previously dismissed
  useEffect(() => {
     
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  // Don't show if already installed, not installable, or dismissed
  if (!isInstallable || isInstalled || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleInstall = async () => {
    await installApp();
    setIsDismissed(true);
  };

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          aria-label={t("pwaInstallBanner.dismiss")}>

          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Smartphone className="h-6 w-6 text-purple-600" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{t("pwaInstallBanner.installLegacyGuard")}</h3>
            <p className="text-sm text-gray-600 mb-3">{t("pwaInstallBanner.accessFamilyInformation")}</p>

            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-4">
              <Shield className="h-4 w-4" />
              <span>{t("pwaInstallBanner.secureOfflineAccess")}</span>
              <span className="text-gray-300">•</span>
              <Download className="h-4 w-4" />
              <span>{t("pwaInstallBanner.quickAccessFromHomeScreen")}</span>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleInstall}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700">{t("pwaInstallBanner.installNow")}</Button>
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="outline">{t("pwaInstallBanner.maybeLater")}</Button>
            </div>
          </div>
        </div>
      </div>
    </div>);

}