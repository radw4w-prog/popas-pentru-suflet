/* ═══════════════════════════════════════
   SERVICE WORKER - Popas pentru Suflet
   ═══════════════════════════════════════ */

const CACHE_NAME = 'popas-suflet-v1';
const OFFLINE_URL = '/offline.html';

// Resurse de cache la install
const STATIC_CACHE = [
  '/',
  '/dashboard',
  '/offline.html',
  '/manifest.json',
  '/logo.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// ─── INSTALL ───
self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE).catch((err) => {
        console.log('[SW] Cache error:', err);
      });
    })
  );
  self.skipWaiting();
});

// ─── ACTIVATE ───
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// ─── FETCH ───
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip API requests - nu le cache-uim
  if (url.pathname.startsWith('/api/') ||
      url.hostname.includes('onrender.com') ||
      url.hostname.includes('unsplash.com') ||
      url.hostname.includes('facebook.com')) {
    return;
  }

  // Network first pentru navigare
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(OFFLINE_URL) ||
               caches.match('/') ||
               new Response('<h1>Offline</h1>', {
                 headers: { 'Content-Type': 'text/html' }
               });
      })
    );
    return;
  }

  // Cache first pentru static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });

        return response;
      }).catch(() => {
        return caches.match(OFFLINE_URL);
      });
    })
  );
});

// ─── PUSH NOTIFICATIONS ───
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  let data = {
    title: 'Popas pentru Suflet',
    body: 'Ai o notificare nouă!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    tag: 'popas-notif',
    data: { url: '/dashboard' }
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/icon-72.png',
    tag: data.tag || 'popas-notif',
    data: data.data || { url: '/dashboard' },
    vibrate: [200, 100, 200],
    requireInteraction: false,
    silent: false,
    actions: [
      {
        action: 'open',
        title: 'Deschide'
      },
      {
        action: 'close',
        title: 'Închide'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ─── NOTIFICATION CLICK ───
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event.action);
  event.notification.close();

  if (event.action === 'close') return;

  const urlToOpen = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Dacă aplicația e deschisă, focus pe ea
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Altfel, deschide o fereastră nouă
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// ─── BACKGROUND SYNC ───
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
});