import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '../lib/i18n';
import { ThemeProvider } from '../lib/theme';

export const metadata: Metadata = {
  title: 'श्री बालाजी मेस',
  description: 'श्री बालाजी मेस • २१ वर्षांची अखंड परंपरा • चालक: शंकर गिरी (९८२२३३८९७५)',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.jpeg',
    shortcut: '/logo.jpeg',
    apple: '/logo.jpeg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'श्री बालाजी मेस',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ea580c' },
    { media: '(prefers-color-scheme: dark)', color: '#090d16' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mr" className="light">
      <head>
        <link rel="icon" type="image/jpeg" href="/logo.jpeg" />
        <link rel="shortcut icon" type="image/jpeg" href="/logo.jpeg" />
        <link rel="apple-touch-icon" href="/logo.jpeg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="बालाजी मेस" />
        <meta name="apple-mobile-web-app-title" content="बालाजी मेस" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased selection:bg-brand-500 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
