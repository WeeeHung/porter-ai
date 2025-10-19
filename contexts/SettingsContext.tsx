'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupportedLanguage, detectBrowserLanguage } from '@/lib/i18n';

export type UserRole = 'top_management' | 'middle_management' | 'frontline_operations';

export interface UserSettings {
  role: UserRole;
  language: SupportedLanguage;
}

interface SettingsContextType {
  settings: UserSettings;
  setRole: (role: UserRole) => void;
  setLanguage: (language: SupportedLanguage) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  isLoading: boolean;
}

const SETTINGS_STORAGE_KEY = 'porter-ai-settings';

const DEFAULT_SETTINGS: UserSettings = {
  role: 'frontline_operations',
  language: 'en',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load settings from localStorage
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      try {
        const parsedSettings = JSON.parse(stored) as UserSettings;
        setSettingsState(parsedSettings);
      } catch (error) {
        console.error('Failed to parse stored settings:', error);
        // Fallback to default with browser language detection
        const browserLanguage = detectBrowserLanguage();
        const initialSettings = { ...DEFAULT_SETTINGS, language: browserLanguage };
        setSettingsState(initialSettings);
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(initialSettings));
      }
    } else {
      // Initialize with browser language detection
      const browserLanguage = detectBrowserLanguage();
      const initialSettings = { ...DEFAULT_SETTINGS, language: browserLanguage };
      setSettingsState(initialSettings);
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(initialSettings));
    }
    setIsLoading(false);
  }, []);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettingsState((prev) => {
      const updatedSettings = { ...prev, ...newSettings };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
      return updatedSettings;
    });
  };

  const setRole = (role: UserRole) => {
    updateSettings({ role });
  };

  const setLanguage = (language: SupportedLanguage) => {
    updateSettings({ language });
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setRole,
        setLanguage,
        updateSettings,
        isLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

