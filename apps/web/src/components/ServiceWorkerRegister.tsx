'use client';

import { useEffect, useState, useRef } from 'react';

// Current client build version baked into the JS bundle
const CLIENT_BUILD_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '';

declare global {
  interface Window {
    __messmitra_reload_app?: () => void;
  }
}

export default function ServiceWorkerRegister() {
  const [isUpdating, setIsUpdating] = useState(false);
  const isReloadingRef = useRef(false);
  const currentAppVersionRef = useRef<string>(CLIENT_BUILD_VERSION);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let registrationRef: ServiceWorkerRegistration | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    // Hard purge all caches and force reload to latest version
    const forcePurgeAndReload = async () => {
      try {
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const reg of registrations) {
            await reg.unregister();
          }
        }
      } catch (e) {
        console.warn('Purge error:', e);
      }
      // Force reload bypassing cache
      window.location.href = window.location.pathname + '?_t=' + Date.now();
    };

    window.__messmitra_reload_app = forcePurgeAndReload;

    const triggerReload = async (targetVersion?: string) => {
      if (isReloadingRef.current) return;

      const lastReload = sessionStorage.getItem('balaji_last_reload');
      const now = Date.now();
      if (lastReload && now - parseInt(lastReload, 10) < 6000) {
        // Prevent rapid reload loops within 6 seconds
        return;
      }

      isReloadingRef.current = true;
      setIsUpdating(true);
      sessionStorage.setItem('balaji_last_reload', String(now));
      if (targetVersion) {
        sessionStorage.setItem('balaji_known_version', targetVersion);
      }

      // Clear all caches so the upcoming reload gets the fresh HTML and JS chunks
      try {
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
      } catch {}

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    };

    // Check version from /api/version
    const checkVersionUpdate = async () => {
      try {
        if (!navigator.onLine) return;

        // Force check for sw.js byte difference
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

        if (!serverVersion) return;

        // If we didn't have an initial version, adopt the first returned one
        if (!currentAppVersionRef.current) {
          currentAppVersionRef.current = serverVersion;
          return;
        }

        // Remote version changed -> new commit/build has been deployed!
        if (serverVersion !== currentAppVersionRef.current) {
          console.log(`[AutoUpdate] New deployment detected: ${serverVersion} (was: ${currentAppVersionRef.current})`);
          currentAppVersionRef.current = serverVersion;
          triggerReload(serverVersion);
        }
      } catch (e) {
        // Network failure / temporary offline
      }
    };

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
      // Register with updateViaCache: 'none' and version query param to bypass edge/browser cache
      const swUrl = `/sw.js?v=${CLIENT_BUILD_VERSION || Date.now()}`;
      navigator.serviceWorker
        .register(swUrl, { updateViaCache: 'none' })
        .then((reg) => {
          registrationRef = reg;

          // Check for waiting worker immediately
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            triggerReload();
          }

          // Listen for new worker installation
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[SW] New version installed. Activating and updating page...');
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                triggerReload();
              }
            });
          });
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

    // Initial check after 2 seconds
    const initialTimer = setTimeout(() => {
      checkVersionUpdate();
    }, 2000);

    // Poll every 25 seconds
    pollInterval = setInterval(checkVersionUpdate, 25000);

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
