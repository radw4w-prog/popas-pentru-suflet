import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const NotificationBell = () => {
  const [notificari, setNotificari] = useState([]);
  const [totalNecitite, setTotalNecitite] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

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
        setNotificari(res.data.notificari || []);
        setTotalNecitite(res.data.totalNecitite || 0);
      }
    } catch (err) {
      // silent fail
    }
  }, []);

  useEffect(() => {
    loadNotificari();
    const interval = setInterval(loadNotificari, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadNotificari]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, []);

  const handleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      await loadNotificari();
    }
  };

  const handleMarkCitit = async (id) => {
    try {
      await axios.put(
        `${API}/api/notifications/${id}/citit`,
        {},
        { headers: getHeaders() }
      );
      setNotificari(prev =>
        prev.map(n => n._id === id ? { ...n, citit: true } : n)
      );
      setTotalNecitite(prev => Math.max(0, prev - 1));
    } catch (err) {}
  };

  const handleMarkToateCitite = async () => {
    try {
      setLoading(true);
      await axios.put(
        `${API}/api/notifications/citit-toate`,
        {},
        { headers: getHeaders() }
      );
      setNotificari(prev => prev.map(n => ({ ...n, citit: true })));
      setTotalNecitite(0);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.delete(
        `${API}/api/notifications/${id}`,
        { headers: getHeaders() }
      );
      setNotificari(prev => prev.filter(n => n._id !== id));
      const deleted = notificari.find(n => n._id === id);
      if (deleted && !deleted.citit) {
        setTotalNecitite(prev => Math.max(0, prev - 1));
      }
    } catch (err) {}
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const acum = new Date();
    const diff = Math.floor((acum - d) / 1000);

    if (diff < 60) return 'Acum';
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;

    return d.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getTipColor = (tip) => {
    const colors = {
      reminder: '#6366f1',
      milestone: '#f4d03f',
      intarziere: '#ef4444',
      sistem: '#6b7280'
    };
    return colors[tip] || '#6366f1';
  };

  return (
    <div ref={dropdownRef} className="notification-bell-wrapper">
      {/* Bell */}
      <button
        onClick={handleOpen}
        className={`notification-bell-btn ${open ? 'open' : ''}`}
        title="Notificări"
      >
        🔔
        {totalNecitite > 0 && (
          <span className="notification-bell-badge">
            {totalNecitite > 99 ? '99+' : totalNecitite}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <div className="notification-dropdown-title">
              🔔 Notificări
              {totalNecitite > 0 && (
                <span className="notification-dropdown-count">
                  {totalNecitite} noi
                </span>
              )}
            </div>

            {totalNecitite > 0 && (
              <button
                onClick={handleMarkToateCitite}
                disabled={loading}
                className="notification-mark-all-btn"
              >
                {loading ? '...' : '✓ Toate citite'}
              </button>
            )}
          </div>

          <div className="notification-dropdown-list">
            {notificari.length === 0 ? (
              <div className="notification-empty">
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔕</div>
                Nu ai notificări
              </div>
            ) : (
              notificari.map(notif => (
                <div
                  key={notif._id}
                  onClick={() => !notif.citit && handleMarkCitit(notif._id)}
                  className={`notification-item ${notif.citit ? '' : 'unread'}`}
                >
                  <div
                    className="notification-item-icon"
                    style={{
                      background: `${getTipColor(notif.tip)}18`,
                      border: `1px solid ${getTipColor(notif.tip)}30`
                    }}
                  >
                    {notif.icon || '🔔'}
                  </div>

                  <div className="notification-item-content">
                    <div className={`notification-item-title ${notif.citit ? '' : 'strong'}`}>
                      {notif.titlu}
                    </div>
                    <div className="notification-item-text">
                      {notif.mesaj}
                    </div>
                    <div className="notification-item-time">
                      {formatTime(notif.createdAt)}
                      {!notif.citit && <span className="notification-unread-dot" />}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDelete(notif._id, e)}
                    className="notification-delete-btn"
                    title="Șterge"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;