import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const NotificationBell = () => {
  const [notificari, setNotificari] = useState([]);
  const [totalNecitite, setTotalNecitite] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [panelStyle, setPanelStyle] = useState({});

  const buttonRef = useRef(null);
  const panelRef = useRef(null);

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

  const computePanelPosition = useCallback(() => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mobile = vw <= 768;

    let top = rect.bottom + 10;

    // dacă e prea jos, mută puțin mai sus
    if (top > vh - 180) {
      top = Math.max(12, vh - 420);
    }

    if (mobile) {
      setPanelStyle({
        position: 'fixed',
        top: `${Math.round(top)}px`,
        left: '12px',
        right: '12px',
        width: 'auto',
        maxHeight: `${Math.max(220, vh - top - 12)}px`,
        zIndex: 100000,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '18px',
        boxShadow: '0 18px 48px rgba(0,0,0,0.38)',
        overflow: 'hidden'
      });
    } else {
      // ✅ desktop: poziționare simplă și stabilă
      setPanelStyle({
        position: 'fixed',
        top: `${Math.round(top)}px`,
        right: '16px',
        left: 'auto',
        width: '340px',
        maxWidth: '340px',
        maxHeight: `${Math.max(240, vh - top - 16)}px`,
        zIndex: 100000,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '18px',
        boxShadow: '0 18px 48px rgba(0,0,0,0.38)',
        overflow: 'hidden'
      });
    }
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    computePanelPosition();
  }, [open, computePanelPosition, totalNecitite, notificari.length]);

  useEffect(() => {
    if (!open) return;

    const handleResize = () => computePanelPosition();
    const handleScroll = () => computePanelPosition();
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    document.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, computePanelPosition]);

  const handleOpen = async () => {
    const next = !open;
    setOpen(next);

    if (next) {
      await loadNotificari();
      requestAnimationFrame(() => {
        computePanelPosition();
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

  const panel = open
    ? ReactDOM.createPortal(
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              background: 'transparent'
            }}
          />

          <div
            ref={panelRef}
            style={panelStyle}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '0.9rem 1rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'var(--bg-card)',
                position: 'sticky',
                top: 0,
                zIndex: 2
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  minWidth: 0
                }}
              >
                <span>🔔 Notificări</span>
                {totalNecitite > 0 && (
                  <span
                    style={{
                      background: 'rgba(99,102,241,0.15)',
                      color: '#6366f1',
                      fontSize: '0.72rem',
                      padding: '2px 7px',
                      borderRadius: '999px',
                      fontWeight: 700,
                      flexShrink: 0
                    }}
                  >
                    {totalNecitite} noi
                  </span>
                )}
              </div>

              {totalNecitite > 0 && (
                <button
                  type="button"
                  onClick={handleMarkToateCitite}
                  disabled={loading}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#6366f1',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    flexShrink: 0
                  }}
                >
                  {loading ? '...' : '✓ Toate'}
                </button>
              )}
            </div>

            {/* Listă */}
            <div
              style={{
                maxHeight: 'inherit',
                overflowY: 'auto'
              }}
            >
              {notificari.length === 0 ? (
                <div
                  style={{
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.88rem'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔕</div>
                  Nu ai notificări
                </div>
              ) : (
                notificari.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => !notif.citit && handleMarkCitit(notif._id)}
                    style={{
                      padding: '0.9rem 1rem',
                      borderBottom: '1px solid var(--border-color)',
                      background: notif.citit ? 'transparent' : 'rgba(99,102,241,0.04)',
                      cursor: notif.citit ? 'default' : 'pointer',
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'flex-start',
                      transition: 'background 0.15s'
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: `${getTipColor(notif.tip)}18`,
                        border: `1px solid ${getTipColor(notif.tip)}30`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem',
                        flexShrink: 0
                      }}
                    >
                      {notif.icon || '🔔'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: notif.citit ? 500 : 700,
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          marginBottom: '0.2rem',
                          lineHeight: 1.35
                        }}
                      >
                        {notif.titlu}
                      </div>

                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.45,
                          wordBreak: 'break-word'
                        }}
                      >
                        {notif.mesaj}
                      </div>

                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--text-muted)',
                          marginTop: '0.35rem'
                        }}
                      >
                        {formatTime(notif.createdAt)}
                        {!notif.citit && (
                          <span
                            style={{
                              marginLeft: '0.5rem',
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: '#6366f1',
                              display: 'inline-block',
                              verticalAlign: 'middle'
                            }}
                          />
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(notif._id, e)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        padding: '2px',
                        flexShrink: 0,
                        opacity: 0.75
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
        </>,
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleOpen}
        type="button"
        title="Notificări"
        style={{
          position: 'relative',
          background: open
            ? 'rgba(99,102,241,0.1)'
            : 'var(--bg-card)',
          border: `1px solid ${
            open ? 'rgba(99,102,241,0.3)' : 'var(--border-color)'
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

      {panel}
    </>
  );
};

export default NotificationBell;