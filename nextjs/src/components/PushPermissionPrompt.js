'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import usePushNotifications from '@/hooks/usePushNotifications';

const DISMISS_DAYS = 3;

function getDismissKey(userId) {
  return `push-permission-dismissed:${userId || 'guest'}`;
}

export default function PushPermissionPrompt() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const {
    supported,
    permission,
    isSubscribed,
    loading,
    serverConfigured,
    subscribe,
  } = usePushNotifications();

  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  const userId = user?.id || user?._id || user?.email || 'guest';
  const dismissKey = useMemo(() => getDismissKey(userId), [userId]);

  useEffect(() => {
    if (!isAuthenticated) {
      setVisible(false);
      return;
    }

    if (!supported || !serverConfigured || isSubscribed || permission === 'denied') {
      setVisible(false);
      return;
    }

    if (pathname === '/login' || pathname === '/register') {
      setVisible(false);
      return;
    }

    const dismissedAt = localStorage.getItem(dismissKey);
    if (dismissedAt) {
      const ts = Number(dismissedAt);
      if (Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000) {
        setVisible(false);
        return;
      }
      localStorage.removeItem(dismissKey);
    }

    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, [isAuthenticated, supported, serverConfigured, isSubscribed, permission, pathname, dismissKey]);

  const handleDismiss = () => {
    localStorage.setItem(dismissKey, String(Date.now()));
    setVisible(false);
  };

  const handleEnable = async () => {
    const result = await subscribe();
    if (result.success) {
      localStorage.removeItem(dismissKey);
      setMessage('✅ Notificările au fost activate.');
      setTimeout(() => setVisible(false), 1200);
      return;
    }
    setMessage(result.message || 'Nu am putut activa notificările.');
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.48)',
        zIndex: 1600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        style={{
          width: 'min(100%, 440px)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
          padding: '1.35rem',
          display: 'grid',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #d4af37, #b8960c)',
              color: '#0a0a0f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              flexShrink: 0
            }}
          >
            🔔
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 6 }}>
              Activează notificările
            </div>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Primești devoționalul zilnic și reminder-ele de citire direct pe telefon sau browser,
              fără să mai intri de fiecare dată în aplicație.
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(212,175,55,0.08)',
            border: '1px solid rgba(212,175,55,0.18)',
            borderRadius: 16,
            padding: '0.9rem 1rem',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            lineHeight: 1.55
          }}
        >
          Poți opri notificările oricând mai târziu din contul tău.
        </div>

        {message && (
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 14,
              background: message.startsWith('✅') ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
              border: message.startsWith('✅')
                ? '1px solid rgba(34,197,94,0.18)'
                : '1px solid rgba(239,68,68,0.18)',
              color: message.startsWith('✅') ? '#22c55e' : '#f87171',
              fontSize: '0.82rem'
            }}
          >
            {message}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleDismiss}
            disabled={loading}
            style={{
              padding: '0.72rem 1rem',
              borderRadius: 12,
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Mai târziu
          </button>

          <button
            onClick={handleEnable}
            disabled={loading}
            style={{
              padding: '0.72rem 1rem',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #d4af37, #b8960c)',
              color: '#0a0a0f',
              fontWeight: 800,
              cursor: 'pointer',
              minWidth: 170
            }}
          >
            {loading ? '⏳ Se activează...' : 'Permite notificările'}
          </button>
        </div>
      </div>
    </div>
  );
}
