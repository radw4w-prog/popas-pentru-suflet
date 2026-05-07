import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const NotificationBell = () => {
  const [totalNecitite, setTotalNecitite] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadNotificari = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/notifications`, {
        headers: getHeaders()
      });

      if (res.data.success) {
        setTotalNecitite(res.data.totalNecitite || 0);
      }
    } catch (err) {
      // silent
    }
  }, []);

  useEffect(() => {
    loadNotificari();
    const interval = setInterval(loadNotificari, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadNotificari]);

  const active = location.pathname === '/notifications';

  return (
    <button
      onClick={() => navigate('/notifications')}
      type="button"
      title="Notificări"
      style={{
        position: 'relative',
        background: active
          ? 'rgba(99,102,241,0.1)'
          : 'var(--bg-card)',
        border: `1px solid ${
          active ? 'rgba(99,102,241,0.3)' : 'var(--border-color)'
        }`,
        borderRadius: 'var(--radius-md)',
        padding: '0.45rem 0.65rem',
        cursor: 'pointer',
        fontSize: '1.1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        minWidth: 38,
        minHeight: 38,
        flexShrink: 0,
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      🔔

      {totalNecitite > 0 && (
        <span
          style={{
            position: 'absolute',
            top: -6,
            right: -6,
            background: '#ef4444',
            color: 'white',
            fontSize: '0.65rem',
            fontWeight: 700,
            borderRadius: '999px',
            minWidth: 18,
            height: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            border: '2px solid var(--bg-primary)'
          }}
        >
          {totalNecitite > 99 ? '99+' : totalNecitite}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;