import { useState, useEffect } from 'react';

interface UserSettings {
  defaultProcessingMode: 'hybrid' | 'local';
}

const SETTINGS_KEY = 'legacyguard_user_settings';

const getStoredSettings = (): UserSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load user settings:', error);
  }
  return {
    defaultProcessingMode: 'hybrid'
  };
};

const saveSettings = (settings: UserSettings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save user settings:', error);
  }
};

export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(getStoredSettings);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const setDefaultProcessingMode = (mode: 'hybrid' | 'local') => {
    setSettings(prev => ({ ...prev, defaultProcessingMode: mode }));
  };

  return {
    defaultProcessingMode: settings.defaultProcessingMode,
    setDefaultProcessingMode
  };
};

