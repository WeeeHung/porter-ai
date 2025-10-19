'use client';

import { useState, useRef, useCallback } from 'react';
import { isRecordingSupported, getAudioConstraints, createAudioElement } from '@/lib/voice/audioUtils';
import { useSettings } from '@/contexts/SettingsContext';

export function useVoice() {
  const { settings } = useSettings();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = useCallback(async () => {
    if (!isRecordingSupported()) {
      setError('Recording is not supported in this browser');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(getAudioConstraints());
      const mediaRecorder = new MediaRecorder(stream);

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please check microphone permissions.');
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
        
        setIsRecording(false);
        setIsTranscribing(true);

        try {
          // Transcribe audio with current language
          const formData = new FormData();
          formData.append('audio', audioBlob);
          formData.append('language', settings.language);

          const response = await fetch('/api/voice/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Failed to transcribe audio');
          }

          const data = await response.json();
          resolve(data.text);
        } catch (err) {
          console.error('Error transcribing audio:', err);
          setError('Failed to transcribe audio');
          resolve(null);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.stop();
    });
  }, [settings.language]);

  const speak = useCallback(async (text: string) => {
    try {
      setIsPlaying(true);
      setError(null);

      // Always use the latest language from context
      const response = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, language: settings.language }),
      });

      if (!response.ok) {
        throw new Error('Failed to synthesize speech');
      }

      // Stream the audio response for faster playback
      // The browser will handle streaming automatically when we create a blob URL
      const audioBlob = await response.blob();
      const audio = createAudioElement(audioBlob);

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onerror = () => {
        setError('Failed to play audio');
        setIsPlaying(false);
      };

      audioElementRef.current = audio;
      await audio.play();
    } catch (err) {
      console.error('Error speaking:', err);
      setError('Failed to synthesize speech');
      setIsPlaying(false);
    }
  }, [settings.language]); // Include settings.language to ensure fresh values

  const stopSpeaking = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  return {
    isRecording,
    isPlaying,
    isTranscribing,
    error,
    startRecording,
    stopRecording,
    speak,
    stopSpeaking,
  };
}

