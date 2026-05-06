// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/App.css';
import App from './App';

// ✅ TEMPORAR: Dezactivează complet service worker-ul
// ca să nu mai ai probleme cu cache-ul în timpul dezvoltării UI-ului
async function disableServiceWorkers() {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      if (registrations.length > 0) {
        console.log('🗑️ Service Worker dezactivat');
      }
    }

    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
      if (keys.length > 0) {
        console.log('🗑️ Cache Storage șters');
      }
    }
  } catch (err) {
    console.warn('⚠️ Nu am putut dezactiva SW/cache:', err);
  }
}

async function boot() {
  // Dezactivează SW și cache la fiecare încărcare
  await disableServiceWorkers();

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

boot();