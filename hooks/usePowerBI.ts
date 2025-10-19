'use client';

import { useState, useEffect, useCallback } from 'react';

interface PowerBIEmbedData {
  embedToken: string;
  embedUrl: string;
  reportId: string;
  expiration: string;
}

export function usePowerBI() {
  const [embedData, setEmbedData] = useState<PowerBIEmbedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmbedToken = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/powerbi/token', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch embed token');
      }

      const data = await response.json();
      setEmbedData(data);
    } catch (err) {
      console.error('Error fetching Power BI embed token:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchEmbedToken();
  }, [fetchEmbedToken]);

  // Auto-refresh token before expiration (every 50 minutes, token valid for 60)
  useEffect(() => {
    if (!embedData) return;

    const refreshInterval = 50 * 60 * 1000; // 50 minutes
    const timer = setInterval(() => {
      fetchEmbedToken();
    }, refreshInterval);

    return () => clearInterval(timer);
  }, [embedData, fetchEmbedToken]);

  return {
    embedData,
    isLoading,
    error,
    refresh: fetchEmbedToken,
  };
}

