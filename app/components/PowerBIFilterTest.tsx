'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Group, 
  Stack, 
  Text, 
  Alert, 
  Loader, 
  Center,
  Paper,
  Title,
  TextInput,
  Select
} from '@mantine/core';
import { IconAlertCircle, IconFilter, IconFilterOff, IconRefresh } from '@tabler/icons-react';
import { usePowerBI } from '@/hooks/usePowerBI';
import { usePowerBIFilter } from '@/hooks/usePowerBIFilter';
import { PowerBIEmbed } from './PowerBIEmbed';

export function PowerBIFilterTest() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<any>(null);
  const [pbiModule, setPbiModule] = useState<any>(null);
  const { embedData, isLoading: embedLoading, error: embedError } = usePowerBI();
  
  // Custom filter state
  const [tableName, setTableName] = useState('YourTableName');
  const [columnName, setColumnName] = useState('YourColumnName');
  const [filterValue, setFilterValue] = useState('TestValue');

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

  // Initialize the PowerBI report with filter control
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

  // Initialize filter hook
  const {
    isLoading: filterLoading,
    error: filterError,
    currentFilters,
    getFilters,
    setFilters,
    clearFilters,
    createBasicFilter,
    applyTestFilter,
    applyDateRangeFilter,
  } = usePowerBIFilter({ reportRef, pbiModule });

  // Custom filter application
  const applyCustomFilter = async () => {
    if (!tableName || !columnName || !filterValue) {
      alert('Please fill in all filter fields');
      return;
    }

    const customFilter = createBasicFilter(
      tableName,
      columnName,
      1, // Equals operator
      [filterValue]
    );

    await setFilters([customFilter]);
  };

  if (embedLoading) {
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

  if (embedError) {
    return (
      <Center h="100%" p="xl">
        <Alert
          icon={<IconAlertCircle size={24} />}
          title="Error Loading Dashboard"
          color="red"
          variant="filled"
        >
          <Text>{embedError}</Text>
        </Alert>
      </Center>
    );
  }

  return (
    <Stack gap="md" h="100%">
      {/* Filter Controls */}
      <Paper p="md" shadow="sm">
        <Title order={3} mb="md">
          PowerBI Filter Test Controls
        </Title>
        
        <Stack gap="sm">
          {/* Custom Filter Inputs */}
          <Group grow>
            <TextInput
              label="Table Name"
              placeholder="Enter table name"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
            />
            <TextInput
              label="Column Name"
              placeholder="Enter column name"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
            />
            <TextInput
              label="Filter Value"
              placeholder="Enter filter value"
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
            />
          </Group>

          {/* Filter Action Buttons */}
          <Group>
            <Button
              leftSection={<IconFilter size={16} />}
              onClick={applyCustomFilter}
              loading={filterLoading}
              disabled={!tableName || !columnName || !filterValue}
            >
              Apply Custom Filter
            </Button>
            
            <Button
              leftSection={<IconFilter size={16} />}
              onClick={applyTestFilter}
              loading={filterLoading}
              variant="outline"
            >
              Apply Test Filter
            </Button>
            
            <Button
              leftSection={<IconFilter size={16} />}
              onClick={applyDateRangeFilter}
              loading={filterLoading}
              variant="outline"
            >
              Apply Date Range Filter
            </Button>
            
            <Button
              leftSection={<IconFilterOff size={16} />}
              onClick={clearFilters}
              loading={filterLoading}
              color="red"
              variant="outline"
            >
              Clear All Filters
            </Button>
            
            <Button
              leftSection={<IconRefresh size={16} />}
              onClick={getFilters}
              loading={filterLoading}
              variant="light"
            >
              Get Current Filters
            </Button>
          </Group>

          {/* Error Display */}
          {filterError && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Filter Error"
              color="red"
              variant="light"
            >
              {filterError}
            </Alert>
          )}

          {/* Current Filters Display */}
          {currentFilters.length > 0 && (
            <Paper p="sm" bg="gray.0">
              <Text size="sm" fw={500} mb="xs">
                Current Filters ({currentFilters.length}):
              </Text>
              <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                {JSON.stringify(currentFilters, null, 2)}
              </Text>
            </Paper>
          )}
        </Stack>
      </Paper>

      {/* PowerBI Report Embed */}
      <Box
        ref={containerRef}
        style={{
          width: '100%',
          height: '600px',
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      />
    </Stack>
  );
}
