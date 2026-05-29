// service-worker.js — gol, doar pentru a înlocui orice SW vechi
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
