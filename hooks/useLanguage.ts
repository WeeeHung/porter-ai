'use client';

import { useState, useEffect } from 'react';
import { SupportedLanguage, detectBrowserLanguage } from '@/lib/i18n';

const LANGUAGE_STORAGE_KEY = 'porter-ai-language';

export function useLanguage() {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load language from localStorage or detect from browser
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as SupportedLanguage;
    const initialLanguage = stored || detectBrowserLanguage();
    setLanguageState(initialLanguage);
    setIsLoading(false);
  }, []);

  const setLanguage = (newLanguage: SupportedLanguage) => {
    setLanguageState(newLanguage);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);
  };

  return {
    language,
    setLanguage,
    isLoading,
  };
}

