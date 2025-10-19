'use client';

import { useState, useRef, useCallback } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { createAudioElement } from '@/lib/voice/audioUtils';

interface QueuedSentence {
  text: string;
  id: string;
}

/**
 * Hook for streaming text-to-speech with sentence-level queueing
 * Allows TTS to start playing while LLM is still generating text
 */
export function useStreamingVoice() {
  const { settings } = useSettings();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const sentenceQueueRef = useRef<QueuedSentence[]>([]);
  const audioQueueRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isProcessingRef = useRef(false);
  const isStoppedRef = useRef(false);

  const playAudio = useCallback((audioBlob: Blob): Promise<void> => {
    return new Promise((resolve) => {
      if (isStoppedRef.current) {
        resolve();
        return;
      }

      const audio = createAudioElement(audioBlob);
      currentAudioRef.current = audio;
      setIsPlaying(true);

      audio.onended = () => {
        currentAudioRef.current = null;
        resolve();
      };

      audio.onerror = () => {
        currentAudioRef.current = null;
        resolve();
      };

      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
        currentAudioRef.current = null;
        resolve();
      });
    });
  }, []);

  // Process queue: synthesize and play with parallel processing
  const processSentenceQueue = useCallback(async () => {
    if (isProcessingRef.current || isStoppedRef.current) return;
    isProcessingRef.current = true;

    // Track synthesis promises for parallel processing
    const activeSynthesis = new Set<Promise<void>>();
    
    const synthesizeSentence = async (sentence: QueuedSentence) => {
      setIsSynthesizing(true);
      
      try {
        const response = await fetch('/api/voice/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: sentence.text, 
            language: settings.language 
          }),
        });

        if (response.ok && !isStoppedRef.current && response.body) {
          // Stream audio chunks as they arrive for faster playback
          const reader = response.body.getReader();
          const chunks: Uint8Array[] = [];
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (isStoppedRef.current) {
              reader.cancel();
              break;
            }
            if (value) {
              chunks.push(value);
            }
          }
          
          if (!isStoppedRef.current && chunks.length > 0) {
            // Convert Uint8Array chunks to Blob
            const audioBlob = new Blob(chunks as BlobPart[], { type: 'audio/mpeg' });
            audioQueueRef.current.push(audioBlob);
          }
        }
      } catch (error) {
        console.error('Error synthesizing sentence:', error);
      } finally {
        setIsSynthesizing(activeSynthesis.size > 0);
      }
    };

    while (!isStoppedRef.current && (sentenceQueueRef.current.length > 0 || audioQueueRef.current.length > 0 || activeSynthesis.size > 0)) {
      // Launch parallel synthesis requests (up to 3 at once)
      while (sentenceQueueRef.current.length > 0 && activeSynthesis.size < 3 && !isStoppedRef.current) {
        const sentence = sentenceQueueRef.current.shift()!;
        const promise = synthesizeSentence(sentence);
        activeSynthesis.add(promise);
        
        // Clean up when done
        promise.finally(() => activeSynthesis.delete(promise));
      }

      // Play audio while synthesis is happening in parallel
      if (audioQueueRef.current.length > 0 && !currentAudioRef.current && !isStoppedRef.current) {
        const audioBlob = audioQueueRef.current.shift()!;
        await playAudio(audioBlob);
      } else {
        // Short wait only if no audio to play
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    // Wait for any remaining synthesis to complete
    await Promise.all(Array.from(activeSynthesis));

    isProcessingRef.current = false;
    if (!isStoppedRef.current) {
      setIsPlaying(false);
    }
  }, [settings.language, playAudio]);

  // Add sentence to queue and start processing
  const enqueueSentence = useCallback((text: string) => {
    if (isStoppedRef.current) return;
    
    const sentence: QueuedSentence = {
      text: text.trim(),
      id: Date.now().toString() + Math.random(),
    };
    
    // Only add non-empty sentences
    if (sentence.text) {
      sentenceQueueRef.current.push(sentence);
      
      // Start processing if not already processing
      if (!isProcessingRef.current) {
        processSentenceQueue();
      }
    }
  }, [processSentenceQueue]);

  const stopAll = useCallback(() => {
    isStoppedRef.current = true;
    
    // Clear queues
    sentenceQueueRef.current = [];
    audioQueueRef.current = [];
    
    // Stop current audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    
    isProcessingRef.current = false;
    setIsPlaying(false);
    setIsSynthesizing(false);
    
    // Reset stop flag after a brief delay
    setTimeout(() => {
      isStoppedRef.current = false;
    }, 100);
  }, []);

  return {
    enqueueSentence,
    stopAll,
    isPlaying,
    isSynthesizing,
  };
}
