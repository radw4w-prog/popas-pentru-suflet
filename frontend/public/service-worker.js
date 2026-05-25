// service-worker.js — SW Killer
// Acest SW se înregistrează, șterge tot cache-ul și se dezactivează imediat
// Rezolvă: main.js Unexpected token '<'

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) {
        console.log('[SW Killer] Șterg cache:', key);
        return caches.delete(key);
      }));
    }).then(function() {
      console.log('[SW Killer] Toate cache-urile șterse');
      return self.clients.claim();
    }).then(function() {
      // Forțează reload pe toate tab-urile deschise
      return self.clients.matchAll({ type: 'window' });
    }).then(function(clients) {
      clients.forEach(function(client) {
        client.navigate(client.url);
      });
    })
  );
});

// NU intercepta niciun request — lasă totul să treacă normal
self.addEventListener('fetch', function(e) {
  // Fără cache, fără interceptare
  return;
});
