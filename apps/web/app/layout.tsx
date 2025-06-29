import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import dynamic from 'next/dynamic';

const inter = Inter({ subsets: ['latin'] });

// Dynamically import client-only components to prevent hydration errors
const Toaster = dynamic(() => import('sonner').then(mod => mod.Toaster), { ssr: false });
const CommandPalette = dynamic(() => import('@/components/command-palette').then(mod => mod.CommandPalette), { ssr: false });

export const metadata: Metadata = {
  title: 'Modern ERP - Factory Intelligence Platform',
  description: 'AI-powered ERP for Sugar, Ethanol, Power & Feed Industries',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="relative min-h-screen bg-background">
            {children}
            <CommandPalette />
            <Toaster position="bottom-right" richColors />
          </div>
        </Providers>
      </body>
    </html>
  );
}