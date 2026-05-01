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
      // Ignorăm eroarea silențios
    }
  }, []);

  // Load la mount + polling la 5 minute
  useEffect(() => {
    loadNotificari();
    const interval = setInterval(loadNotificari, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadNotificari]);

  // Închide la click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleOpen = async () => {
    setOpen(!open);
    if (!open) {
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
    } catch (err) {}
    finally { setLoading(false); }
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
    return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
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
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        style={{
          position: 'relative',
          background: open
            ? 'rgba(99,102,241,0.1)'
            : 'var(--bg-card)',
          border: `1px solid ${open
            ? 'rgba(99,102,241,0.3)'
            : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '0.45rem 0.65rem',
          cursor: 'pointer',
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          minWidth: 38,
          minHeight: 38
        }}
        title="Notificări"
      >
        🔔
        {totalNecitite > 0 && (
          <span style={{
            position: 'absolute',
            top: -6, right: -6,
            background: '#ef4444',
            color: 'white',
            fontSize: '0.65rem',
            fontWeight: 700,
            borderRadius: '999px',
            minWidth: 18, height: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            border: '2px solid var(--bg-primary)'
          }}>
            {totalNecitite > 99 ? '99+' : totalNecitite}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: 340,
          maxWidth: '90vw',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '0.875rem 1rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{
              fontWeight: 700,
              color: 'var(--text-primary)',
              fontSize: '0.9rem'
            }}>
              🔔 Notificări
              {totalNecitite > 0 && (
                <span style={{
                  marginLeft: '0.5rem',
                  background: 'rgba(99,102,241,0.15)',
                  color: '#6366f1',
                  fontSize: '0.72rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontWeight: 600
                }}>
                  {totalNecitite} noi
                </span>
              )}
            </div>

            {totalNecitite > 0 && (
              <button
                onClick={handleMarkToateCitite}
                disabled={loading}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#6366f1',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 600
                }}
              >
                {loading ? '...' : '✓ Toate citite'}
              </button>
            )}
          </div>

          {/* Lista notificări */}
          <div style={{
            maxHeight: 380,
            overflowY: 'auto'
          }}>
            {notificari.length === 0 ? (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.875rem'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  🔕
                </div>
                Nu ai notificări
              </div>
            ) : (
              notificari.map(notif => (
                <div
                  key={notif._id}
                  onClick={() => !notif.citit && handleMarkCitit(notif._id)}
                  style={{
                    padding: '0.875rem 1rem',
                    borderBottom: '1px solid var(--border-color)',
                    background: notif.citit
                      ? 'transparent'
                      : 'rgba(99,102,241,0.04)',
                    cursor: notif.citit ? 'default' : 'pointer',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start',
                    transition: 'background 0.15s'
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 36, height: 36,
                    borderRadius: '10px',
                    background: `${getTipColor(notif.tip)}18`,
                    border: `1px solid ${getTipColor(notif.tip)}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    flexShrink: 0
                  }}>
                    {notif.icon || '🔔'}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: notif.citit ? 500 : 700,
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      marginBottom: '0.2rem'
                    }}>
                      {notif.titlu}
                    </div>
                    <div style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4
                    }}>
                      {notif.mesaj}
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.3rem'
                    }}>
                      {formatTime(notif.createdAt)}
                      {!notif.citit && (
                        <span style={{
                          marginLeft: '0.5rem',
                          width: 6, height: 6,
                          borderRadius: '50%',
                          background: '#6366f1',
                          display: 'inline-block',
                          verticalAlign: 'middle'
                        }} />
                      )}
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={(e) => handleDelete(notif._id, e)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      padding: '2px',
                      flexShrink: 0,
                      opacity: 0.6
                    }}
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