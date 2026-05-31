'use client';
import React, { useState, useEffect } from 'react';

const PWAInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verifică dacă e deja instalat
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Verifică dacă userul a respins deja (reapare după 7 zile)
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
      localStorage.removeItem('pwa-install-dismissed');
    }

    // Detectează iOS
    const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());
    setIsIOS(iOS);

    const handleInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-install-dismissed');
    };

    // iOS nu are beforeinstallprompt
    if (iOS) {
      const isSafari = /safari/i.test(navigator.userAgent) &&
                       !/chrome/i.test(navigator.userAgent);
      if (isSafari) {
        setTimeout(() => setShowBanner(true), 3000);
      }
      window.addEventListener('appinstalled', handleInstalled);
      return () => window.removeEventListener('appinstalled', handleInstalled);
    }

    // Android / Desktop
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowBanner(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setShowBanner(false);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-install-dismissed', String(Date.now()));
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: isIOS ? '80px' : '70px',
      left: '0.75rem',
      right: '0.75rem',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '20px',
      padding: '1rem 1.15rem',
      zIndex: 500,
      boxShadow: '0 -4px 30px rgba(0,0,0,0.3), 0 4px 30px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.875rem',
      animation: 'slideUp 0.3s ease'
    }}>
      {/* Icon */}
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: 'linear-gradient(135deg, #0a0a0f, #1a1a2e)',
        border: '1px solid rgba(212,175,55,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem', flexShrink: 0
      }}>
        🕊️
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 700, fontSize: '0.9rem',
          color: 'var(--text-primary)', marginBottom: '2px'
        }}>
          Instalează aplicația
        </div>
        {isIOS ? (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Apasă <strong>Share</strong> → <strong>Add to Home Screen</strong>
          </div>
        ) : (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Acces rapid la Biblia online, devoțional și rugăciuni
          </div>
        )}
      </div>

      {/* Butoane */}
      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
        <button
          onClick={handleDismiss}
          style={{
            padding: '0.45rem 0.75rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}
        >
          Nu acum
        </button>

        {!isIOS && (
          <button
            onClick={handleInstall}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #d4af37, #b8960c)',
              color: '#0a0a0f',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 700
            }}
          >
            Instalează
          </button>
        )}
      </div>
    </div>
  );
};

export default PWAInstallBanner;