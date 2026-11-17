/* Popas pentru Suflet — service worker v3.
   Offline informativ, NU Biblie/audio offline. API și date personale excluse. */
const CACHE_PREFIX = 'popas-suflet-';
const CACHE_NAME = 'popas-suflet-prod-v3';
const OFFLINE_URL = '/offline.html';
const ASSET_CACHE = `${CACHE_NAME}-assets`;
const IMAGE_CACHE = `${CACHE_NAME}-images`;
const CURRENT_CACHES = [CACHE_NAME, ASSET_CACHE, IMAGE_CACHE];
const STATIC_CACHE = [OFFLINE_URL, '/manifest.json', '/logo.png', '/icons/icon-192.png', '/icons/icon-512.png'];

async function offlinePage() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const page = await cache.match(OFFLINE_URL);
    if (page) return page;
  } catch (_) { /* Cache indisponibil: răspuns minimal garantat. */ }
  return new Response('<!doctype html><html lang="ro"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fără conexiune — Popas pentru Suflet</title><body><h1>Ești offline</h1><p>Reconectează-te la internet și reîncarcă pagina. Lectura și audio necesită conexiune.</p><button onclick="location.reload()">Reîncearcă</button></body></html>', {
    status: 503,
    headers: {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store'}
  });
}

async function remember(cacheName, request, response, limit) {
  if (!response.ok || response.type === 'opaque') return;
  try {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
    const keys = await cache.keys();
    // Limita este pe număr de intrări, nu pe octeți. Curățare FIFO.
    await Promise.all(keys.slice(0, Math.max(0, keys.length - limit)).map(key => cache.delete(key)));
  } catch (_) { /* Quota/cache failure must not break online loading. */ }
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Fallback-ul este obligatoriu: dacă nu se descarcă, vechiul worker rămâne activ.
    await cache.add(new Request(OFFLINE_URL, {cache: 'reload'}));
    await Promise.all(STATIC_CACHE.filter(url => url !== OFFLINE_URL).map(url =>
      cache.add(new Request(url, {cache: 'reload'})).catch(() => {})
    ));
    // Activare la închiderea filelor vechi; SKIP_WAITING rămâne disponibil explicit.
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && !CURRENT_CACHES.includes(key)).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  // Nu interceptăm mutații, API, surse externe, audio, răspunsuri RSC sau date personale.
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => offlinePage()));
    return;
  }

  const isAsset = url.pathname.startsWith('/_next/static/') && /\.(js|css|woff2?)$/i.test(url.pathname);
  const isImage = /\.(png|jpe?g|webp|svg|ico|gif)$/i.test(url.pathname);
  // Cache doar fișiere statice identificabile; nu cache generic de răspunsuri Next.js.
  if (!isAsset && !isImage) return;
  const name = isAsset ? ASSET_CACHE : IMAGE_CACHE;
  const limit = isAsset ? 120 : 80;
  // Clone înainte de returnarea răspunsului; waitUntil ține în viață scrierea în cache.
  let finishCache;
  event.waitUntil(new Promise(resolve => { finishCache = resolve; }));
  event.respondWith((async () => {
    try {
      if (isImage) {
        let cached;
        try {
          const cache = await caches.open(name);
          cached = await cache.match(request);
        } catch (_) { /* Continuăm online dacă citirea cache-ului eșuează. */ }
        if (cached) return cached;
      }
      const response = await fetch(request);
      await remember(name, request, response, limit);
      return response;
    } catch (_) {
      try {
        const cache = await caches.open(name);
        const cached = await cache.match(request);
        if (cached) return cached;
      } catch (_) {}
      // Niciodată HTML în locul unui script, font sau al unei imagini.
      return Response.error();
    } finally {
      finishCache();
    }
  })());
});

// PUSH
self.addEventListener('push', (event) => {
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

// NOTIFICATION CLICK
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

// MESSAGE
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});