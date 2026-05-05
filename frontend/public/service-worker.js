// frontend/public/service-worker.js
const CACHE_NAME = 'popas-suflet-v3';
const OFFLINE_URL = '/offline.html';

const STATIC_CACHE = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/logo.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// ─── INSTALL ───
self.addEventListener('install', (event) => {
  console.log('[SW] Install v3');
  self.skipWaiting(); // ← IMPORTANT: activează imediat
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE).catch((err) => {
        console.log('[SW] Cache error:', err);
      });
    })
  );
});

// ─── ACTIVATE ───
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate v3 - șterg cache vechi');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log('[SW] Șterg cache vechi:', key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim()) // ← preia controlul imediat
  );
});

// ─── FETCH ───
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip API requests
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('onrender.com') ||
    url.hostname.includes('facebook.com') ||
    url.hostname.includes('googleapis.com')
  ) {
    return;
  }

  // Skip non-http
  if (!url.protocol.startsWith('http')) return;

  // ✅ NAVIGARE - Network first (mereu versiunea nouă din server)
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

  // ✅ JS și CSS - Network first (critice pentru update-uri UI!)
  if (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.includes('/static/js/') ||
    url.pathname.includes('/static/css/')
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // ✅ IMAGINI - Cache first
  if (
    url.pathname.match(/\.(png|jpg|jpeg|webp|svg|ico|gif)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        });
      }).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // ✅ REST - Network first cu fallback cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request) || caches.match(OFFLINE_URL))
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
    try { data = { ...data, ...event.data.json() }; }
    catch (e) { data.body = event.data.text(); }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icons/icon-192.png',
      badge: data.badge || '/icons/icon-72.png',
      tag: data.tag || 'popas-notif',
      data: data.data || { url: '/dashboard' },
      vibrate: [200, 100, 200],
      requireInteraction: false,
      actions: [
        { action: 'open', title: 'Deschide' },
        { action: 'close', title: 'Închide' }
      ]
    })
  );
});

// ─── NOTIFICATION CLICK ───
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;

  const urlToOpen = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        if (clients.openWindow) return clients.openWindow(urlToOpen);
      })
  );
});

// ─── BACKGROUND SYNC ───
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
});

// ─── MESSAGE ───
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});