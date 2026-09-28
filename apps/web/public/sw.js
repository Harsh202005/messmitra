// Shree Balaji Mess Service Worker - Auto-Update Enabled & Push Notifications
const CACHE_NAME = 'balajimess-v5-live';
const ASSETS_TO_CACHE = [
  '/manifest.json',
  '/logo.jpeg',
  '/logo.png',
  '/favicon.ico',
];

// 1. INSTALL: Cache essential static assets & skip waiting immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. ACTIVATE: Clear old stale caches and claim all open client windows immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Clearing old stale cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. FETCH STRATEGY:
// - Never cache API requests (/api/*)
// - Network-First for HTML documents & navigation (always fetches latest deployment from Vercel)
// - Cache-First with Network fallback for static images/icons
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Bypass API calls completely - always live from network
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Network-First for HTML navigation requests (ensures new deployed commits load immediately)
  if (
    event.request.mode === 'navigate' ||
    event.request.destination === 'document' ||
    event.request.headers.get('accept')?.includes('text/html')
  ) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline, fall back to cached HTML
          return caches.match(event.request).then((cached) => {
            return cached || caches.match('/');
          });
        })
    );
    return;
  }

  // Stale-While-Revalidate for images, fonts, and static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// 4. PUSH NOTIFICATION HANDLER
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'श्री बालाजी मेस', body: event.data.text() };
    }
  }

  const title = data.title || 'श्री बालाजी मेस 🍛';
  const options = {
    body: data.body || 'नवीन मेस सूचना प्राप्त झाली.',
    icon: data.icon || '/logo.jpeg',
    badge: data.badge || '/logo.jpeg',
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || 'balaji-mess-notification',
    renotify: true,
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      { action: 'open', title: 'मेस ॲप उघडा 📱' },
      { action: 'close', title: 'बंद करा' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 5. NOTIFICATION CLICK
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// 6. MESSAGE LISTENER (Skip Waiting & Direct In-App Notifications)
self.addEventListener('message', (event) => {
  if (event.data) {
    if (event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    } else if (event.data.type === 'SHOW_NOTIFICATION') {
      const { title, body, icon, badge, tag, url } = event.data.payload || {};
      self.registration.showNotification(title || 'श्री बालाजी मेस 🍛', {
        body: body || '',
        icon: icon || '/logo.jpeg',
        badge: badge || '/logo.jpeg',
        vibrate: [200, 100, 200, 100, 200],
        tag: tag || 'balaji-notif-' + Date.now(),
        renotify: true,
        data: { url: url || '/' },
        actions: [{ action: 'open', title: 'मेस ॲप उघडा 📱' }],
      });
    }
  }
});
