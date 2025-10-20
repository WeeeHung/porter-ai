'use client';

import { useState, useRef, useEffect } from 'react';
import { Box, Button, Group, Modal, TextInput, Stack } from '@mantine/core';
import { IconFilter, IconFilterOff } from '@tabler/icons-react';
import { PowerBIEmbed } from './components/PowerBIEmbed';
import { PowerBIFilterTest } from './components/PowerBIFilterTest';
import { SeaBackground } from './components/SeaBackground';
import { FloatingInputBar } from './components/FloatingInputBar';
import { ActivityBar } from './components/ActivityBar';
import { useSettings } from '@/contexts/SettingsContext';
import { useChat } from '@/hooks/useChat';
import { useStreamingVoice } from '@/hooks/useStreamingVoice';
import { initializeScreenShare } from '@/lib/utils/screenshot';

export default function HomePage() {
  const { settings, isLoading } = useSettings();
  
  // Use streaming voice for real-time TTS as sentences complete
  const { enqueueSentence, stopAll, isPlaying } = useStreamingVoice();
  
  // Pass enqueueSentence callback to chat for sentence-by-sentence TTS
  const { messages, sendMessageWithScreenshot, isLoading: isLLMProcessing } = useChat(enqueueSentence);
  
  const [isActivityCollapsed, setIsActivityCollapsed] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterValue, setFilterValue] = useState('TestValue');
  const [screenShareInitialized, setScreenShareInitialized] = useState(false);
  const [showScreenSharePrompt, setShowScreenSharePrompt] = useState(true);
  const reportRef = useRef<any>(null);
  const [pbiModule, setPbiModule] = useState<any>(null);

  useEffect(() => {
    const loadPowerBI = async () => {
      try {
        const pbi = await import('powerbi-client');
        setPbiModule(pbi);
      } catch (err) {
        console.error('Failed to load Power BI client:', err);
      }
    };
    loadPowerBI();
  }, []);

  const handleEnableScreenShare = async () => {
    console.log('Initializing screen share...');
    const success = await initializeScreenShare();
    setScreenShareInitialized(success);
    setShowScreenSharePrompt(false);
    if (!success) {
      console.warn('Screen share initialization failed');
    }
  };

  const handleSendMessage = async (message: string, isVoiceInput: boolean = false) => {
    // Send message with automatic screenshot capture (Base64 data URL)
    sendMessageWithScreenshot(message);
    // Auto-open activity bar only for text messages, not voice
    if (!isVoiceInput && isActivityCollapsed) {
      setIsActivityCollapsed(false);
    }
  };

  const handleTranscription = (text: string) => {
    // Send the transcribed text to the LLM (mark as voice input)
    if (text.trim()) {
      handleSendMessage(text, true);
    }
  };

  const handleStopAudio = () => {
    stopAll();
  };

  const applySimpleFilter = async () => {
    if (!reportRef.current || !pbiModule) return;
    
    try {
      const filter = {
        $schema: "http://powerbi.com/product/schema#basic",
        target: {
          table: "YourTableName", // Replace with your actual table name
          column: "YourColumnName" // Replace with your actual column name
        },
        filterType: 1,
        operator: 1, // Equals
        values: [filterValue]
      };
      
      await reportRef.current.setFilters([filter]);
      console.log('Filter applied:', filter);
    } catch (err) {
      console.error('Error applying filter:', err);
    }
  };

  const clearFilters = async () => {
    if (!reportRef.current) return;
    
    try {
      await reportRef.current.setFilters([]);
      console.log('Filters cleared');
    } catch (err) {
      console.error('Error clearing filters:', err);
    }
  };

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
        isLLMProcessing={isLLMProcessing}
        isActivityCollapsed={isActivityCollapsed}
        onToggleActivity={() => setIsActivityCollapsed(!isActivityCollapsed)}
      />

      {/* Filter Test Modal */}
      <Modal
        opened={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Quick Filter Test"
        size="md"
        centered
      >
        <Stack gap="md">
          <TextInput
            label="Filter Value"
            placeholder="Enter value to filter by"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
          <Group>
            <Button onClick={applySimpleFilter} leftSection={<IconFilter size={16} />}>
              Apply Filter
            </Button>
            <Button onClick={clearFilters} leftSection={<IconFilterOff size={16} />} variant="outline">
              Clear Filters
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Screen Share Prompt Modal */}
      <Modal
        opened={showScreenSharePrompt && !screenShareInitialized}
        onClose={() => setShowScreenSharePrompt(false)}
        title="Enable Visual Context"
        size="md"
        centered
        withCloseButton={true}
      >
        <Stack gap="md">
          <Box style={{ fontSize: '14px', color: '#666' }}>
            Porter AI can provide more accurate insights by viewing your dashboard. 
            Enable screen sharing to allow the AI to see what you see.
          </Box>
          <Box style={{ fontSize: '12px', color: '#888' }}>
            • One-time permission required
            <br />
            • Choose to share this tab, window, or entire screen
            <br />
            • You can disable this anytime
          </Box>
          <Group justify="flex-end">
            <Button onClick={() => setShowScreenSharePrompt(false)} variant="subtle">
              Skip for now
            </Button>
            <Button onClick={handleEnableScreenShare} variant="filled">
              Enable Screen Sharing
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}

