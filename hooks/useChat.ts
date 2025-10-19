'use client';

import { useState, useCallback } from 'react';
import { AgentMessage } from '@/types/agents';
import { useSettings } from '@/contexts/SettingsContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export function useChat(onStreamingSentence?: (sentence: string) => void) {
  const { settings } = useSettings();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string, dashboardData?: any) => {
    // Always get the latest settings from context
    const { language: currentLanguage, role: currentRole } = settings;
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Create placeholder for assistant message
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const conversationHistory: AgentMessage[] = messages.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          language: currentLanguage,
          userRole: currentRole,
          dashboardData,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let accumulatedContent = '';
      let sentenceBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Emit any remaining sentence
          if (sentenceBuffer.trim() && onStreamingSentence) {
            onStreamingSentence(sentenceBuffer.trim());
          }
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;
        sentenceBuffer += chunk;

        // Update the assistant message with accumulated content
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: accumulatedContent }
              : msg
          )
        );

        // Detect sentence boundaries for streaming TTS
        // Split on periods, question marks, exclamation marks followed by space/newline/end
        // Supports: English (.!?), Chinese (。！？), Arabic (؟), Hindi (।॥)
        const sentenceRegex = /[.!?。！？؟।॥]+(?=[\s\n]|$)/g;
        const matches = [...sentenceBuffer.matchAll(sentenceRegex)];
        
        if (matches.length > 0) {
          const lastMatch = matches[matches.length - 1];
          const endIndex = lastMatch.index! + lastMatch[0].length;
          
          // Extract complete sentences
          const completeSentences = sentenceBuffer.substring(0, endIndex);
          
          // Emit complete sentences
          if (completeSentences.trim() && onStreamingSentence) {
            onStreamingSentence(completeSentences.trim());
          }
          
          // Keep the incomplete part in buffer
          sentenceBuffer = sentenceBuffer.substring(endIndex).trimStart();
        }
      }

      // Mark streaming as complete
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Remove the placeholder message if there was an error
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
    } finally {
      setIsLoading(false);
    }
  }, [messages, settings, onStreamingSentence]); // Include settings to always get latest values

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
  };
}

