'use client';

import { useEffect, useState, useRef } from 'react';

// Current client build version baked into the JS bundle
const CLIENT_BUILD_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '';

export default function ServiceWorkerRegister() {
  const [isUpdating, setIsUpdating] = useState(false);
  const isReloadingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let registrationRef: ServiceWorkerRegistration | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    const triggerReload = (targetVersion?: string) => {
      if (isReloadingRef.current) return;

      const lastReload = sessionStorage.getItem('balaji_last_reload');
      const now = Date.now();
      if (lastReload && now - parseInt(lastReload, 10) < 8000) {
        // Prevent rapid reload loops within 8 seconds
        return;
      }

      isReloadingRef.current = true;
      setIsUpdating(true);
      sessionStorage.setItem('balaji_last_reload', String(now));
      if (targetVersion) {
        sessionStorage.setItem('balaji_known_version', targetVersion);
      }

      setTimeout(() => {
        // Force hard reload from server
        window.location.reload();
      }, 1000);
    };

    // Check version from /api/version
    const checkVersionUpdate = async () => {
      try {
        if (!navigator.onLine) return;

        // Also tell SW to check for byte differences in sw.js
        if (registrationRef) {
          registrationRef.update().catch(() => {});
        }

        const res = await fetch(`/api/version?_t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store',
            Pragma: 'no-cache',
          },
        });

        if (!res.ok) return;
        const data = await res.json();
        const serverVersion = data?.version;

        if (serverVersion && CLIENT_BUILD_VERSION && serverVersion !== CLIENT_BUILD_VERSION) {
          const knownVersion = sessionStorage.getItem('balaji_known_version');
          if (knownVersion !== serverVersion) {
            console.log(`[AutoUpdate] New version detected: server=${serverVersion}, client=${CLIENT_BUILD_VERSION}`);
            triggerReload(serverVersion);
          }
        }
      } catch (e) {
        // Silently catch fetch errors (e.g. temporary network offline)
      }
    };

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
      // Register with updateViaCache: 'none' to always fetch newest sw.js from network
      navigator.serviceWorker
        .register('/sw.js', { updateViaCache: 'none' })
        .then((reg) => {
          registrationRef = reg;
          console.log('[SW] ServiceWorker registered with updateViaCache: none');

          // Listen for new worker installation
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[SW] New version installed, activating immediately...');
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                triggerReload();
              }
            });
          });

          // Check if there is already a waiting worker
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            triggerReload();
          }
        })
        .catch((err) => {
          console.warn('[SW] Registration failed:', err);
        });

      // Reload when the active Service Worker controller changes
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        console.log('[SW] Controller changed. Reloading page...');
        triggerReload();
      });
    }

    // Dynamic import / ChunkLoadError auto-recovery
    const handleError = (event: ErrorEvent) => {
      const msg = event?.message || '';
      if (
        msg.includes('ChunkLoadError') ||
        msg.includes('Loading chunk') ||
        msg.includes('failed to fetch dynamically imported module') ||
        msg.includes('Importing a module script failed')
      ) {
        console.warn('[AutoUpdate] Chunk loading error detected. Triggering reload for latest build...');
        triggerReload();
      }
    };
    window.addEventListener('error', handleError);

    // Initial check after 3 seconds
    const initialTimer = setTimeout(() => {
      checkVersionUpdate();
    }, 3000);

    // Poll every 30 seconds
    pollInterval = setInterval(checkVersionUpdate, 30000);

    // Recheck immediately when user returns to app/tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersionUpdate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', checkVersionUpdate);
    window.addEventListener('online', checkVersionUpdate);

    return () => {
      clearTimeout(initialTimer);
      if (pollInterval) clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkVersionUpdate);
      window.removeEventListener('online', checkVersionUpdate);
      window.removeEventListener('error', handleError);
    };
  }, []);

  if (!isUpdating) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[99999] px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-medium rounded-full shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm animate-pulse border border-white/20"
    >
      <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
      <span>नवीन अपडेट उपलब्ध आहे! ॲप आपोआप अपडेट होत आहे...</span>
    </div>
  );
}
