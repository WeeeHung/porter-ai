'use client';

import { useState } from 'react';
import { Group, TextInput, ActionIcon, Paper } from '@mantine/core';
import { IconMicrophone, IconMicrophoneOff, IconBrandGithubCopilot, IconActivity } from '@tabler/icons-react';
import { useVoice } from '@/hooks/useVoice';
import { useSettings } from '@/contexts/SettingsContext';
import { t } from '@/lib/i18n';
import { Settings } from './Settings';

interface FloatingInputBarProps {
  onSendMessage: (message: string) => void;
  onTranscription: (text: string) => void;
  onStopAudio?: () => void;
  isAISpeaking: boolean;
  isActivityCollapsed: boolean;
  onToggleActivity: () => void;
}

export function FloatingInputBar({ 
  onSendMessage, 
  onTranscription,
  onStopAudio,
  isAISpeaking,
  isActivityCollapsed,
  onToggleActivity
}: FloatingInputBarProps) {
  const [inputValue, setInputValue] = useState('');
  const { settings } = useSettings();
  const { isRecording, startRecording, stopRecording } = useVoice();

  const handleMicClick = async () => {
    if (isRecording) {
      const text = await stopRecording();
      if (text) {
        onTranscription(text);
      }
    } else {
      // Stop any playing audio before starting recording
      onStopAudio?.();
      await startRecording();
    }
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      // Stop any playing audio before sending message
      onStopAudio?.();
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Group
      gap="md"
      align="center"
      style={{
        position: 'fixed',
        bottom: '40px',
        left: isActivityCollapsed ? '50%' : 'calc(50% - 175px)',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        transition: 'left 0.3s ease-in-out',
      }}
    >
      {/* Settings Icon */}
      <Settings height={isActivityCollapsed ? '64px' : '56px'} />

      {/* Main Input Bar */}
      <Paper
        shadow="xl"
        radius="xl"
        p="md"
        style={{
          width: isActivityCollapsed ? 'min(500px, 70vw)' : 'min(450px, 60vw)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          height: isActivityCollapsed ? '64px' : '56px',
          display: 'flex',
          alignItems: 'center',
          transition: 'width 0.3s ease-in-out, height 0.3s ease-in-out',
        }}
      >
        <Group gap="md" align="center" style={{ width: '100%' }}>
          {/* AI Speaking Indicator Button */}
          <ActionIcon
            size={isActivityCollapsed ? 'xl' : 'lg'}
            radius="xl"
            variant={isAISpeaking ? 'filled' : 'light'}
            color={isAISpeaking ? 'green' : 'gray'}
            onClick={onStopAudio}
            style={{
              minWidth: isActivityCollapsed ? '48px' : '42px',
              minHeight: isActivityCollapsed ? '48px' : '42px',
              boxShadow: isAISpeaking 
                ? '0 0 20px rgba(34, 139, 230, 0.4)' 
                : '0 4px 12px rgba(0, 0, 0, 0.1)',
              animation: isAISpeaking ? 'pulse 2s ease-in-out infinite' : 'none',
              transition: 'min-width 0.3s ease-in-out, min-height 0.3s ease-in-out',
            }}
          >
            <IconBrandGithubCopilot size={isActivityCollapsed ? 24 : 20} />
          </ActionIcon>

          {/* Microphone Button */}
          <ActionIcon
            size={isActivityCollapsed ? 'xl' : 'lg'}
            radius="xl"
            variant={isRecording ? 'filled' : 'light'}
            color={isRecording ? 'red' : 'blue'}
            onClick={handleMicClick}
            style={{
              minWidth: isActivityCollapsed ? '48px' : '42px',
              minHeight: isActivityCollapsed ? '48px' : '42px',
              boxShadow: isRecording 
                ? '0 0 20px rgba(255, 0, 0, 0.3)' 
                : '0 4px 12px rgba(0, 0, 0, 0.1)',
              transition: 'min-width 0.3s ease-in-out, min-height 0.3s ease-in-out',
            }}
          >
            {isRecording ? (
              <IconMicrophoneOff size={isActivityCollapsed ? 24 : 20} />
            ) : (
              <IconMicrophone size={isActivityCollapsed ? 24 : 20} />
            )}
          </ActionIcon>

          {/* Text Input */}
          <TextInput
            key={settings.language} // Force re-render on language change
            placeholder={t('askQuestion', settings.language)}
            value={inputValue}
            onChange={(e) => setInputValue(e.currentTarget.value)}
            onKeyPress={handleKeyPress}
            style={{ flex: 1 }}
            size="lg"
            radius="xl"
            styles={{
              input: {
                border: 'none',
                background: 'transparent',
                fontSize: '16px',
                '&:focus': {
                  border: 'none',
                  boxShadow: 'none',
                },
              },
            }}
          />
        </Group>
      </Paper>

      {/* Activity Toggle Button */}
      <Paper
        shadow="xl"
        radius="xl"
        p={0}
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          height: isActivityCollapsed ? '64px' : '56px',
          width: isActivityCollapsed ? '64px' : '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'width 0.3s ease-in-out, height 0.3s ease-in-out',
        }}
      >
        <ActionIcon
          size={isActivityCollapsed ? 'xl' : 'lg'}
          radius="xl"
          variant={isActivityCollapsed ? 'light' : 'filled'}
          color="blue"
          onClick={onToggleActivity}
          style={{
            minWidth: isActivityCollapsed ? '48px' : '42px',
            minHeight: isActivityCollapsed ? '48px' : '42px',
            transition: 'min-width 0.3s ease-in-out, min-height 0.3s ease-in-out',
          }}
        >
          <IconActivity size={isActivityCollapsed ? 24 : 20} />
        </ActionIcon>
      </Paper>
    </Group>
  );
}
