import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const NotificationBell = () => {
  const [notificari, setNotificari] = useState([]);
  const [totalNecitite, setTotalNecitite] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});

  const buttonRef = useRef(null);
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
      // silent
    }
  }, []);

  useEffect(() => {
    loadNotificari();
    const interval = setInterval(loadNotificari, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadNotificari]);

  const updateDropdownPosition = useCallback(() => {
  if (!buttonRef.current) return;

  const rect = buttonRef.current.getBoundingClientRect();
  const isMobile = window.innerWidth <= 768;
  const dropdownWidth = Math.min(
    isMobile ? window.innerWidth - 24 : 340,
    window.innerWidth - 24
  );

  let top = rect.bottom + 8;

  setDropdownStyle({
    position: 'fixed',
    top: `${Math.round(top)}px`,
    right: isMobile ? '12px' : '16px',
    left: isMobile ? '12px' : 'auto',
    width: isMobile ? 'auto' : `${Math.round(dropdownWidth)}px`,
    maxWidth: isMobile ? 'none' : '340px',
    zIndex: 99999,
    transform: 'none',
    margin: 0
  });
}, []);

  useEffect(() => {
  if (!open) return;

  updateDropdownPosition();

  const handleResize = () => updateDropdownPosition();
  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, [open, updateDropdownPosition]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const insideButton = buttonRef.current?.contains(e.target);
      const insideDropdown = dropdownRef.current?.contains(e.target);

      if (!insideButton && !insideDropdown) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleOpen = async () => {
    const next = !open;
    setOpen(next);

    if (next) {
      await loadNotificari();
      requestAnimationFrame(() => {
        updateDropdownPosition();
      });
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
      await axios.delete(`${API}/api/notifications/${id}`, {
        headers: getHeaders()
      });

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
    <div className="notifbell-root">
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className={`notifbell-btn ${open ? 'open' : ''}`}
        title="Notificări"
        type="button"
      >
        🔔
        {totalNecitite > 0 && (
          <span className="notifbell-badge">
            {totalNecitite > 99 ? '99+' : totalNecitite}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className="notifbell-dropdown"
          style={dropdownStyle}
        >
          <div className="notifbell-header">
            <div className="notifbell-title">
              🔔 Notificări
              {totalNecitite > 0 && (
                <span className="notifbell-count">{totalNecitite} noi</span>
              )}
            </div>

            {totalNecitite > 0 && (
              <button
                onClick={handleMarkToateCitite}
                disabled={loading}
                className="notifbell-markall"
                type="button"
              >
                {loading ? '...' : '✓ Toate citite'}
              </button>
            )}
          </div>

          <div className="notifbell-list">
            {notificari.length === 0 ? (
              <div className="notifbell-empty">
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔕</div>
                Nu ai notificări
              </div>
            ) : (
              notificari.map(notif => (
                <div
                  key={notif._id}
                  onClick={() => !notif.citit && handleMarkCitit(notif._id)}
                  className={`notifbell-item ${notif.citit ? '' : 'unread'}`}
                >
                  <div
                    className="notifbell-item-icon"
                    style={{
                      background: `${getTipColor(notif.tip)}18`,
                      border: `1px solid ${getTipColor(notif.tip)}30`
                    }}
                  >
                    {notif.icon || '🔔'}
                  </div>

                  <div className="notifbell-item-content">
                    <div className={`notifbell-item-title ${notif.citit ? '' : 'strong'}`}>
                      {notif.titlu}
                    </div>

                    <div className="notifbell-item-text">
                      {notif.mesaj}
                    </div>

                    <div className="notifbell-item-time">
                      {formatTime(notif.createdAt)}
                      {!notif.citit && <span className="notifbell-unread-dot" />}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDelete(notif._id, e)}
                    className="notifbell-delete"
                    title="Șterge"
                    type="button"
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