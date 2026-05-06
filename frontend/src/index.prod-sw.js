import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/App.css';
import App from './App';

// Cache version - schimbă când vrei refresh forțat
const CACHE_VERSION = '2026-05-06-prod-v1';

async function clearOldCacheOnce() {
  try {
    const savedVersion = localStorage.getItem('app_cache_version');
    if (savedVersion === CACHE_VERSION) return;

    console.log('🧹 Curăț cache vechi...');

    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) {
        await reg.unregister();
      }
    }

    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    }

    localStorage.setItem('app_cache_version', CACHE_VERSION);
    console.log('✅ Cache curățat:', CACHE_VERSION);
  } catch (err) {
    console.warn('⚠️ Cache cleanup error:', err);
  }
}

async function boot() {
  await clearOldCacheOnce();

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(reg => {
          console.log('✅ SW înregistrat');
          reg.update();
        })
        .catch(err => {
          console.log('❌ SW eroare:', err);
        });
    });
  }
}

boot();