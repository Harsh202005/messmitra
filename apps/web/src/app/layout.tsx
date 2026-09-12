import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '../lib/i18n';

export const metadata: Metadata = {
  title: 'MessMitra (मेस मित्र) — Smart Mess & Tiffin Accounting SaaS',
  description: 'Automated billing, leave proration, and accounting system for small mess and tiffin center owners in India.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MessMitra',
  },
};

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mr" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-brand-500 selection:text-white">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
