import '@mantine/core/styles.css';
import '../styles/globals.css';
import { MantineProvider, ColorSchemeScript } from '@mantine/core';
import type { Metadata } from 'next';
import { SettingsProvider } from '@/contexts/SettingsContext';

export const metadata: Metadata = {
  title: 'Porter AI - Intelligent Port Operations Navigator',
  description: 'AI-powered assistant for port operations analytics and insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <MantineProvider
          defaultColorScheme="light"
          theme={{
            primaryColor: 'blue',
            colors: {
              blue: [
                '#e7f5ff',
                '#d0ebff',
                '#a5d8ff',
                '#74c0fc',
                '#4dabf7',
                '#339af0',
                '#228be6',
                '#1c7ed6',
                '#1971c2',
                '#1864ab',
              ],
            },
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <SettingsProvider>
            {children}
          </SettingsProvider>
        </MantineProvider>
      </body>
    </html>
  );
}

