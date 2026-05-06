// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/App.css';
import App from './App';

// ✅ CACHE BUSTER - schimbă versiunea la fiecare deploy important
const CACHE_VERSION = '2026-05-05-v4';

async function clearOldCache() {
  try {
    const saved = localStorage.getItem('app_cache_version');
    if (saved === CACHE_VERSION) return; // deja curățat

    console.log('🧹 Cache vechi detectat, curăț...');

    // Dezînregistrează toate service worker-ele
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
      if (regs.length) console.log(`🗑️ ${regs.length} SW dezînregistrat(e)`);
    }

    // Șterge toate cache-urile
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      if (keys.length) console.log(`🗑️ ${keys.length} cache(s) șterse`);
    }

    localStorage.setItem('app_cache_version', CACHE_VERSION);
    console.log('✅ Cache curățat, versiune nouă:', CACHE_VERSION);

  } catch (err) {
    console.warn('⚠️ Cache clear error:', err);
  }
}

async function boot() {
  await clearOldCache();

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Service Worker
  if ('serviceWorker' in navigator) {
    if (process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then(reg => {
            console.log('✅ SW înregistrat');
            // Verifică imediat update
            reg.update();
          })
          .catch(err => console.log('❌ SW eroare:', err));
      });
    } else {
      // Local: șterge orice SW existent
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(r => {
          r.unregister();
          console.log('🗑️ SW dezînregistrat (development)');
        });
      });
    }
  }
}

boot();