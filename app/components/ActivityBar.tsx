'use client';

import { useEffect, useRef } from 'react';
import { Box, Paper, Stack, Text, Group, ScrollArea, Badge } from '@mantine/core';
import { IconMessage, IconActivity } from '@tabler/icons-react';
import { ChatMessage } from '@/hooks/useChat';
import { t } from '@/lib/i18n';
import { SupportedLanguage } from '@/lib/i18n';

// Wave animation component for thinking state
function ThinkingWave() {
  return (
    <Group gap="xs" align="center">
      <Text size="xs" c="dimmed">
        Thinking
      </Text>
      <Box style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#228be6',
              animationDelay: `${i * 0.2}s`,
            }}
            className="wave"
          />
        ))}
      </Box>
    </Group>
  );
}

interface ActivityBarProps {
  language: SupportedLanguage;
  messages: ChatMessage[];
  isCollapsed: boolean;
}

interface ActivityItem {
  id: string;
  type: 'message' | 'action';
  timestamp: Date;
  content: string;
  user?: string;
}

export function ActivityBar({ language, messages, isCollapsed }: ActivityBarProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Convert messages to activity items
  const activityItems: ActivityItem[] = messages.map((msg) => ({
    id: msg.id,
    type: 'message',
    timestamp: msg.timestamp,
    content: msg.content,
    user: msg.role === 'user' ? 'You' : 'Porter',
  }));

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (!isCollapsed && scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        setTimeout(() => {
          viewport.scrollTop = viewport.scrollHeight;
        }, 100);
      }
    }
  }, [messages, isCollapsed]);

  // Add some sample activity items for demonstration
  const sampleActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'action',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      content: 'Agent changed Date Range from 12/9/2024 to 30/9/2024',
    },
    {
      id: '2',
      type: 'action',
      timestamp: new Date(Date.now() - 600000), // 10 minutes ago
      content: 'Agent filtered by Container Type: Refrigerated',
    },
    {
      id: '3',
      type: 'action',
      timestamp: new Date(Date.now() - 900000), // 15 minutes ago
      content: 'Agent highlighted Berth Utilization anomaly',
    },
  ];

  const allActivities = [...activityItems, ...sampleActivities].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  // Don't render anything if collapsed
  if (isCollapsed) {
    return null;
  }

  return (
    <Box
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        width: '350px',
        height: '100vh',
        zIndex: 999,
        background: 'rgba(255, 255, 255, 0.58)',
        backdropFilter: 'blur(10px)',
        borderLeft: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.1)',
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      <Stack gap="md" style={{ height: '100%', padding: '24px' }}>
        {/* Header */}
        <Group gap="xs">
          <IconActivity size={20} color="#228be6" />
          <Text fw={600} size="lg">
            {t('activity', language)}
          </Text>
        </Group>

        {/* Activity Content */}
        <ScrollArea style={{ flex: 1 }}>
          <Stack gap="sm">
            {allActivities.length === 0 ? (
              <Text size="sm" c="dimmed" ta="center" style={{ marginTop: '40px' }}>
                No activity yet
              </Text>
            ) : (
              allActivities.map((item) => (
                <Paper
                  key={item.id}
                  p="sm"
                  radius="md"
                  style={{
                    background: item.type === 'message' ? '#f8f9fa' : '#e7f5ff',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <Stack gap="xs">
                    <Group justify="space-between" align="flex-start">
                      <Group gap="xs">
                        {item.type === 'message' ? (
                          <IconMessage size={14} color="#6c757d" />
                        ) : (
                          <IconActivity size={14} color="#228be6" />
                        )}
                        <Badge
                          size="xs"
                          variant={item.type === 'message' ? 'light' : 'filled'}
                          color={item.type === 'message' ? 'gray' : 'blue'}
                        >
                          {item.type === 'message' ? t('chat', language) : t('action', language)}
                        </Badge>
                      </Group>
                      <Text size="xs" c="dimmed">
                        {item.timestamp.toLocaleTimeString()}
                      </Text>
                    </Group>
                    
                    {item.user && (
                      <Text size="xs" fw={500} c="blue">
                        {item.user}
                      </Text>
                    )}
                    
                    {item.content ? (
                    <Text 
                      size="sm" 
                      style={{ 
                        lineHeight: 1.4,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {item.content}
                    </Text>
                    ) : (
                      <ThinkingWave />
                    )}
                  </Stack>
                </Paper>
              ))
            )}
          </Stack>
        </ScrollArea>
      </Stack>
    </Box>
  );
}
