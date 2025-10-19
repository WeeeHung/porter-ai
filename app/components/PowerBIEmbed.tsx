'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Loader, Center, Text, Stack, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { usePowerBI } from '@/hooks/usePowerBI';

export function PowerBIEmbed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<any>(null);
  const { embedData, isLoading, error } = usePowerBI();
  const [pbiModule, setPbiModule] = useState<any>(null);

  // Dynamically import powerbi-client only on client side
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

  useEffect(() => {
    if (!embedData || !containerRef.current || !pbiModule) return;

    const embedConfig = {
      type: 'report',
      id: embedData.reportId,
      embedUrl: embedData.embedUrl,
      accessToken: embedData.embedToken,
      tokenType: pbiModule.models.TokenType.Embed,
      permissions: pbiModule.models.Permissions.Read,
      settings: {
        panes: {
          filters: {
            visible: true,
          },
          pageNavigation: {
            visible: true,
          },
        },
        bars: {
          actionBar: {
            visible: false,
          },
        },
      },
    };

    const powerbi = new pbiModule.service.Service(
      pbiModule.factories.hpmFactory,
      pbiModule.factories.wpmpFactory,
      pbiModule.factories.routerFactory
    );

    // Embed the report
    const report = powerbi.embed(containerRef.current, embedConfig);
    reportRef.current = report;

    // Handle errors
    report.on('error', (event: any) => {
      console.error('Power BI embed error:', event.detail);
    });

    // Handle loaded event
    report.on('loaded', () => {
      console.log('Report loaded successfully');
    });

    // Cleanup
    return () => {
      if (reportRef.current && containerRef.current) {
        powerbi.reset(containerRef.current);
      }
    };
  }, [embedData, pbiModule]);

  if (isLoading) {
    return (
      <Center h="100%">
        <Stack align="center" gap="md">
          <Loader size="xl" />
          <Text size="lg" c="dimmed">
            Loading Power BI Dashboard...
          </Text>
        </Stack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100%" p="xl">
        <Alert
          icon={<IconAlertCircle size={24} />}
          title="Error Loading Dashboard"
          color="red"
          variant="filled"
        >
          <Text>{error}</Text>
        </Alert>
      </Center>
    );
  }

  return (
    <Box
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    />
  );
}

