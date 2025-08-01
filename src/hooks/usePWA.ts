// src/hooks/usePWA.ts

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  isUpdateAvailable: boolean;
  installPrompt: Record<string, unknown>;
}

interface PWAHook extends PWAState {
  installApp: () => Promise<void>;
  updateApp: () => void;
  checkForUpdates: () => Promise<void>;
  cacheCriticalData: (userId: string) => Promise<void>;
}

export function usePWA(): PWAHook {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOffline: !navigator.onLine,
    isUpdateAvailable: false,
    installPrompt: null,
  });

  // Check if app is already installed
  useEffect(() => {
     
    // Check if running as installed PWA
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as Navigator & { standalone?: boolean }).standalone
      || document.referrer.includes('android-app://');
    
    setState(prev => ({ ...prev, isInstalled }));
  }, []);

  // Handle install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setState(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: e,
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Handle app installed event
  useEffect(() => {
    const handleAppInstalled = () => {
      setState(prev => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
        installPrompt: null,
      }));
      toast.success('LegacyGuard installed successfully!');
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOffline: false }));
      toast.success('You are back online');
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOffline: true }));
      toast.info('You are offline. Critical data is still available.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Register service worker and handle updates
  useEffect(() => {
     
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      
      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Check every hour

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setState(prev => ({ ...prev, isUpdateAvailable: true }));
              toast.info('A new version of LegacyGuard is available!', {
                action: {
                  label: 'Update',
                  onClick: () => updateApp(),
                },
                duration: Infinity,
              });
            }
          });
        }
      });

      // Handle controller change (new service worker activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  // Install app function
  const installApp = useCallback(async () => {
    if (!state.installPrompt) return;

    try {
      const result = await state.installPrompt.prompt();
      
      if (result.outcome === 'accepted') {
        toast.success('Installing LegacyGuard...');
      } else {
        toast.info('Installation cancelled');
      }
    } catch (error) {
      console.error('Error installing app:', error);
      toast.error('Failed to install app');
    }
  }, [state.installPrompt]);

  // Update app function
  const updateApp = useCallback(() => {
     
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
  }, []);

  // Check for updates manually
  const checkForUpdates = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          toast.info('Checking for updates...');
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    }
  }, []);

  // Cache critical data for offline access
  const cacheCriticalData = useCallback(async (userId: string) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_CRITICAL_DATA',
          userId,
        });
        toast.success('Critical data cached for offline access');
      } catch (error) {
        console.error('Error caching critical data:', error);
        toast.error('Failed to cache data for offline access');
      }
    }
  }, []);

  return {
    ...state,
    installApp,
    updateApp,
    checkForUpdates,
    cacheCriticalData,
  };
}
