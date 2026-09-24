// Shree Balaji Mess Service Worker for Offline PWA Capabilities & Mobile Status Bar Push Notifications
const CACHE_NAME = 'balajimess-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/logo.jpeg',
  '/logo.png',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).catch(() => {
          return caches.match('/');
        })
      );
    })
  );
});

// --- Mobile Notification Panel / System Tray Push Notification Handler ---
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

// --- Handle User Clicking the Notification in Phone Status Bar / Drawer ---
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

// Listen for direct messages from client page to show a notification immediately
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, icon, badge, tag, url } = event.data.payload || {};
    self.registration.showNotification(title || 'श्री बालाजी मेस 🍛', {
      body: body || '',
      icon: icon || '/logo.jpeg',
      badge: badge || '/logo.jpeg',
      vibrate: [200, 100, 200, 100, 200],
      tag: tag || 'balaji-notif-' + Date.now(),
      renotify: true,
      data: { url: url || '/' },
      actions: [
        { action: 'open', title: 'मेस ॲप उघडा 📱' },
      ],
    });
  }
});
