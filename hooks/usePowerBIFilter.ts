'use client';

import { useState, useCallback, useRef } from 'react';
import { PowerBIFilter } from '@/types/powerbi';

interface UsePowerBIFilterOptions {
  reportRef: React.RefObject<any>;
  pbiModule: any;
}

export function usePowerBIFilter({ reportRef, pbiModule }: UsePowerBIFilterOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<PowerBIFilter[]>([]);

  // Get current filters from the report
  const getFilters = useCallback(async () => {
    if (!reportRef.current || !pbiModule) return;

    try {
      setIsLoading(true);
      setError(null);

      const filters = await reportRef.current.getFilters();
      setCurrentFilters(filters);
      return filters;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get filters';
      setError(errorMessage);
      console.error('Error getting filters:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [reportRef, pbiModule]);

  // Set filters on the report
  const setFilters = useCallback(async (filters: PowerBIFilter[]) => {
    if (!reportRef.current || !pbiModule) return;

    try {
      setIsLoading(true);
      setError(null);

      await reportRef.current.setFilters(filters);
      setCurrentFilters(filters);
      console.log('Filters set successfully:', filters);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set filters';
      setError(errorMessage);
      console.error('Error setting filters:', err);
    } finally {
      setIsLoading(false);
    }
  }, [reportRef, pbiModule]);

  // Clear all filters
  const clearFilters = useCallback(async () => {
    if (!reportRef.current || !pbiModule) return;

    try {
      setIsLoading(true);
      setError(null);

      await reportRef.current.setFilters([]);
      setCurrentFilters([]);
      console.log('All filters cleared');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear filters';
      setError(errorMessage);
      console.error('Error clearing filters:', err);
    } finally {
      setIsLoading(false);
    }
  }, [reportRef, pbiModule]);

  // Create a basic filter for testing
  const createBasicFilter = useCallback((
    table: string,
    column: string,
    operator: number,
    values: any[]
  ): PowerBIFilter => {
    return {
      $schema: "http://powerbi.com/product/schema#basic",
      target: {
        table,
        column
      },
      filterType: 1, // Basic filter
      operator,
      values,
      requireSingleSelection: false
    };
  }, []);

  // Test function to apply a sample filter
  const applyTestFilter = useCallback(async () => {
    // This is a sample filter - you'll need to adjust the table and column names
    // based on your actual PowerBI report structure
    const testFilter = createBasicFilter(
      'YourTableName', // Replace with actual table name
      'YourColumnName', // Replace with actual column name
      1, // Equals operator
      ['TestValue'] // Replace with actual values
    );

    await setFilters([testFilter]);
  }, [createBasicFilter, setFilters]);

  // Test function to apply a date range filter
  const applyDateRangeFilter = useCallback(async () => {
    const dateFilter = createBasicFilter(
      'YourTableName', // Replace with actual table name
      'YourDateColumn', // Replace with actual date column name
      3, // In operator for date range
      [
        new Date('2024-01-01').toISOString(),
        new Date('2024-12-31').toISOString()
      ]
    );

    await setFilters([dateFilter]);
  }, [createBasicFilter, setFilters]);

  return {
    // State
    isLoading,
    error,
    currentFilters,
    
    // Actions
    getFilters,
    setFilters,
    clearFilters,
    createBasicFilter,
    applyTestFilter,
    applyDateRangeFilter,
  };
}
