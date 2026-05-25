// service-worker.js — SW Killer
// Șterge cache-ul vechi și se dezactivează
// NU mai reîncarcă pagina

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) {
        return caches.delete(key);
      }));
    }).then(function() {
      console.log('[SW Killer] Cache șters');
      return self.clients.claim();
      // NU mai facem client.navigate — cauza logout-ului la refresh
    })
  );
});

// Fără fetch handler — lasă totul să treacă normal
