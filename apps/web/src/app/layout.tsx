import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '../lib/i18n';
import { ThemeProvider } from '../lib/theme';
import ServiceWorkerRegister from '../components/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'श्री बालाजी मेस',
  description: 'श्री बालाजी मेस • २१ वर्षांची अखंड परंपरा • चालक: शंकर गिरी (९८२२३३८९७५)',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'बालाजी मेस',
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
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="बालाजी मेस" />
        <meta name="apple-mobile-web-app-title" content="बालाजी मेस" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // 1. Purge older Service Worker caches
                if ('caches' in window) {
                  caches.keys().then(function(keys) {
                    keys.forEach(function(k) {
                      if (k !== 'balajimess-v5-live') {
                        caches.delete(k);
                      }
                    });
                  });
                }

                // 2. Purge stale legacy dummy price plans from phone localStorage
                var plansKey = 'messmitra_custom_price_plans';
                var p = localStorage.getItem(plansKey);
                if (p) {
                  if (
                    p.indexOf('plan-30token-flexi') !== -1 ||
                    p.indexOf('plan-20token-pack') !== -1 ||
                    p.indexOf('plan-student-female-concession') !== -1 ||
                    p.indexOf('plan-1meal-nonveg') !== -1 ||
                    p.indexOf('1700') !== -1 ||
                    p.indexOf('3950') !== -1
                  ) {
                    localStorage.removeItem(plansKey);
                  }
                }

                // 3. Purge legacy dummy members
                var memKey = 'messmitra_members';
                var m = localStorage.getItem(memKey);
                if (m && (m.indexOf('Rahul Deshmukh') !== -1 || m.indexOf('11111111') !== -1 || m.indexOf('Priya Patil') !== -1)) {
                  try {
                    var arr = JSON.parse(m);
                    var filtered = arr.filter(function(x) {
                      var id = String(x.id || '');
                      var name = String(x.name || '');
                      return !id.includes('1111') && !id.includes('2222') && !id.includes('3333') &&
                             name !== 'Rahul Deshmukh' && name !== 'Priya Patil' && name !== 'Amit Shinde';
                    });
                    localStorage.setItem(memKey, JSON.stringify(filtered));
                  } catch(e) {
                    localStorage.setItem(memKey, '[]');
                  }
                }

                // 4. Purge legacy dummy staff
                var stKey = 'messmitra_staff';
                var s = localStorage.getItem(stKey);
                if (s && (s.indexOf('Mahadev Mama') !== -1 || s.indexOf('aa111111') !== -1)) {
                  localStorage.removeItem(stKey);
                }

                // 5. Purge legacy dummy registrations
                var regKey = 'messmitra_registrations';
                var r = localStorage.getItem(regKey);
                if (r && (r.indexOf('reg-001') !== -1 || r.indexOf('Aniket Pawar') !== -1)) {
                  try {
                    var arrR = JSON.parse(r);
                    var filteredR = arrR.filter(function(x) {
                      return x.id !== 'reg-001' && x.id !== 'reg-002' && (!x.name || x.name.indexOf('Aniket Pawar') === -1);
                    });
                    localStorage.setItem(regKey, JSON.stringify(filteredR));
                  } catch(e) {
                    localStorage.setItem(regKey, '[]');
                  }
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased selection:bg-brand-500 selection:text-white transition-colors duration-200">
        <ServiceWorkerRegister />
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
