'use client';

import { Select } from '@mantine/core';
import { SupportedLanguage, getAllLanguages } from '@/lib/i18n';

interface LanguageSelectorProps {
  value: SupportedLanguage;
  onChange: (value: SupportedLanguage) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const languages = getAllLanguages();

  const data = languages.map((lang) => ({
    value: lang.code,
    label: `${lang.nativeName} (${lang.name})`,
  }));

  return (
    <Select
      value={value}
      onChange={(val) => onChange(val as SupportedLanguage)}
      data={data}
      size="sm"
      styles={(theme) => ({
        input: {
          borderColor: theme.colors.blue[6],
        },
      })}
    />
  );
}

