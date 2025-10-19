'use client';

import { Paper, ActionIcon, Popover, Stack, Select, Text } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import { useState } from 'react';
import { useSettings, UserRole } from '@/contexts/SettingsContext';
import { getAllLanguages, SupportedLanguage, t } from '@/lib/i18n';

interface SettingsProps {
  height?: string | number;
}

export function Settings({ height }: SettingsProps) {
  const [opened, setOpened] = useState(false);
  const { settings, setRole, setLanguage } = useSettings();

  const languages = getAllLanguages();
  const languageData = languages.map((lang) => ({
    value: lang.code,
    label: `${lang.nativeName} (${lang.name})`,
  }));

  const roleData = [
    { value: 'top_management', label: t('topManagement', settings.language) },
    { value: 'middle_management', label: t('middleManagement', settings.language) },
    { value: 'frontline_operations', label: t('frontlineOperations', settings.language) },
  ];

  return (
    <Popover 
      opened={opened} 
      onChange={setOpened} 
      position="top" 
      withArrow 
      shadow="xl"
      radius="lg"
    >
      <Popover.Target>
        <Paper
          shadow="lg"
          radius="xl"
          p="xs"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            height: height || 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'height 0.3s ease-in-out',
          }}
        >
          <ActionIcon
            size="lg"
            radius="xl"
            variant="subtle"
            color="blue"
            onClick={() => setOpened(!opened)}
            style={{
              minWidth: '40px',
              minHeight: '40px',
            }}
          >
            <IconSettings size={24} />
          </ActionIcon>
        </Paper>
      </Popover.Target>

      <Popover.Dropdown
        style={{
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '20px',
          minWidth: '280px',
        }}
      >
        <Stack gap="md">
          <Text size="sm" fw={600} c="dimmed">
            {t('userSettings', settings.language)}
          </Text>

          {/* User Role Selector */}
          <Stack gap="xs">
            <Text size="xs" fw={500} c="dimmed">
              {t('yourRole', settings.language)}
            </Text>
            <Select
              value={settings.role}
              onChange={(val) => setRole(val as UserRole)}
              data={roleData}
              size="sm"
              radius="md"
              styles={{
                input: {
                  fontSize: '14px',
                  fontWeight: 500,
                },
              }}
            />
          </Stack>

          {/* Language Selector */}
          <Stack gap="xs">
            <Text size="xs" fw={500} c="dimmed">
              Language
            </Text>
            <Select
              value={settings.language}
              onChange={(val) => setLanguage(val as SupportedLanguage)}
              data={languageData}
              size="sm"
              radius="md"
              searchable
              styles={{
                input: {
                  fontSize: '14px',
                  fontWeight: 500,
                },
              }}
            />
          </Stack>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}

