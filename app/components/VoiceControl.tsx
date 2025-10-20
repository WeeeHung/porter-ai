'use client';

import { ActionIcon, Tooltip } from '@mantine/core';
import { IconMicrophone, IconMicrophoneOff, IconVolume } from '@tabler/icons-react';
import { useVoice } from '@/hooks/useVoice';

interface VoiceControlProps {
  language: string;
  onTranscription: (text: string) => void;
}

export function VoiceControl({ language, onTranscription }: VoiceControlProps) {
  const { isRecording, isTranscribing, startRecording, stopRecording } = useVoice();

  const handleMicClick = async () => {
    if (isRecording) {
      const text = await stopRecording();
      if (text) {
        onTranscription(text);
      }
    } else {
      await startRecording();
    }
  };

  return (
    <Tooltip label={isRecording ? 'Stop recording' : 'Start recording'}>
      <ActionIcon
        size="lg"
        variant={isRecording ? 'filled' : 'light'}
        color={isRecording ? 'red' : 'blue'}
        onClick={handleMicClick}
        loading={isTranscribing}
      >
        {isRecording ? <IconMicrophoneOff size={20} /> : <IconMicrophone size={20} />}
      </ActionIcon>
    </Tooltip>
  );
}

