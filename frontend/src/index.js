import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/App.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service Worker - DEZACTIVAT LOCAL, activ doar în producție
if ('serviceWorker' in navigator) {
  if (process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(reg => console.log('✅ SW înregistrat'))
        .catch(err => console.log('❌ SW eroare:', err));
    });
  } else {
    // Local: șterge orice SW existent
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
        console.log('🗑️ SW dezînregistrat (development)');
      });
    });
  }
}