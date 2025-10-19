'use client';

import { useState } from 'react';
import { Box } from '@mantine/core';
import { PowerBIEmbed } from './components/PowerBIEmbed';
import { SeaBackground } from './components/SeaBackground';
import { FloatingInputBar } from './components/FloatingInputBar';
import { ActivityBar } from './components/ActivityBar';
import { useSettings } from '@/contexts/SettingsContext';
import { useChat } from '@/hooks/useChat';
import { useStreamingVoice } from '@/hooks/useStreamingVoice';

export default function HomePage() {
  const { settings, isLoading } = useSettings();
  
  // Use streaming voice for real-time TTS as sentences complete
  const { enqueueSentence, stopAll, isPlaying } = useStreamingVoice();
  
  // Pass enqueueSentence callback to chat for sentence-by-sentence TTS
  const { messages, sendMessage } = useChat(enqueueSentence);
  
  const [isActivityCollapsed, setIsActivityCollapsed] = useState(true);

  const handleSendMessage = (message: string) => {
    sendMessage(message);
    // Auto-open activity bar when message is sent
    if (isActivityCollapsed) {
      setIsActivityCollapsed(false);
    }
  };

  const handleTranscription = (text: string) => {
    // Send the transcribed text to the LLM
    if (text.trim()) {
      handleSendMessage(text);
    }
  };

  const handleStopAudio = () => {
    stopAll();
  };

  // No longer need useEffect - sentences are spoken as they stream in!

  if (isLoading) {
    return null;
  }

  return (
    <Box style={{ 
      position: 'relative', 
      minHeight: '100vh', 
      overflow: 'hidden',
      display: 'flex',
    }}>
      {/* Animated Sea Background */}
      <SeaBackground />

      {/* Main Content Area */}
      <Box
        style={{
          flex: 1,
          position: 'relative',
          paddingBottom: '120px',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'margin-right 0.3s ease-in-out',
          marginRight: isActivityCollapsed ? '0' : '350px',
        }}
      >
        {/* Power BI Dashboard */}
        <Box
          style={{
            width: isActivityCollapsed ? 'min(90vw, 1800px)' : 'min(70vw, 1400px)',
            height: isActivityCollapsed ? 'min(80vh, 1000px)' : 'min(75vh, 850px)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '24px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            transition: 'width 0.3s ease-in-out, height 0.3s ease-in-out',
          }}
        >
          <PowerBIEmbed />
        </Box>
      </Box>

      {/* Activity Bar Sidebar */}
      <ActivityBar
        language={settings.language}
        messages={messages}
        isCollapsed={isActivityCollapsed}
      />

      {/* Floating Input Bar with Language Selector */}
      <FloatingInputBar
        onSendMessage={handleSendMessage}
        onTranscription={handleTranscription}
        onStopAudio={handleStopAudio}
        isAISpeaking={isPlaying}
        isActivityCollapsed={isActivityCollapsed}
        onToggleActivity={() => setIsActivityCollapsed(!isActivityCollapsed)}
      />
    </Box>
  );
}

