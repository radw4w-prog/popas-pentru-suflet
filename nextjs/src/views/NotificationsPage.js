'use client';
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const NotificationsPage = () => {
  const [notificari, setNotificari] = useState([]);
  const [totalNecitite, setTotalNecitite] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMarkAll, setLoadingMarkAll] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadNotificari = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/notifications`, {
        headers: getHeaders()
      });

      if (res.data.success) {
        setNotificari(res.data.notificari || []);
        setTotalNecitite(res.data.totalNecitite || 0);
      }
    } catch (err) {
      console.error('Notif load error:', err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotificari();
  }, [loadNotificari]);

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
      setLoadingMarkAll(true);

      await axios.put(
        `${API}/api/notifications/citit-toate`,
        {},
        { headers: getHeaders() }
      );

      setNotificari(prev => prev.map(n => ({ ...n, citit: true })));
      setTotalNecitite(0);
    } catch (err) {
    } finally {
      setLoadingMarkAll(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/notifications/${id}`, {
        headers: getHeaders()
      });

      const deleted = notificari.find(n => n._id === id);

      setNotificari(prev => prev.filter(n => n._id !== id));

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
      month: 'short',
      year: 'numeric'
    });
  };

  const getTipColor = (tip) => {
    const colors = {
      reminder: '#6366f1',
      devotional: '#f59e0b',
      milestone: '#f4d03f',
      intarziere: '#ef4444',
      sistem: '#6b7280'
    };
    return colors[tip] || '#6366f1';
  };

  if (loading) {
    return (
      <div className="card" style={{ maxWidth: 860, margin: '0 auto' }}>
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
        <div className="loading-text">Se încarcă notificările...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div className="card" style={{ borderRadius: 20 }}>
        <div className="card-header" style={{ alignItems: 'center' }}>
          <div className="card-title">
            🔔 Notificări
            {totalNecitite > 0 && (
              <span className="badge badge-blue" style={{ marginLeft: 8 }}>
                {totalNecitite} noi
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {totalNecitite > 0 && (
              <button
                className="btn btn-outline btn-sm"
                onClick={handleMarkToateCitite}
                disabled={loadingMarkAll}
              >
                {loadingMarkAll ? '...' : '✓ Marchează toate citite'}
              </button>
            )}

            <button
              className="btn btn-secondary btn-sm"
              onClick={loadNotificari}
            >
              🔄 Reîncarcă
            </button>
          </div>
        </div>

        {notificari.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔕</div>
            <div className="empty-state-title">Nu ai notificări</div>
            <div className="empty-state-text">
              Când apar notificări noi, le vei vedea aici.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notificari.map(notif => (
              <div
                key={notif._id}
                className="card"
                style={{
                  padding: '1rem',
                  borderRadius: 16,
                  background: notif.citit ? 'var(--bg-card)' : 'rgba(99,102,241,0.04)',
                  border: notif.citit
                    ? '1px solid var(--border-subtle)'
                    : '1px solid rgba(99,102,241,0.18)',
                  boxShadow: 'none'
                }}
              >
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: `${getTipColor(notif.tip)}18`,
                      border: `1px solid ${getTipColor(notif.tip)}30`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      flexShrink: 0
                    }}
                  >
                    {notif.icon || '🔔'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: notif.citit ? 600 : 800,
                        color: 'var(--text-primary)',
                        fontSize: '0.95rem',
                        marginBottom: '0.25rem'
                      }}
                    >
                      {notif.titlu}
                    </div>

                    <div
                      style={{
                        fontSize: '0.86rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.55,
                        marginBottom: '0.5rem'
                      }}
                    >
                      {notif.mesaj}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                        fontSize: '0.74rem',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <span>{formatTime(notif.createdAt)}</span>
                      {!notif.citit && (
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            background: '#6366f1',
                            display: 'inline-block'
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    {!notif.citit && (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleMarkCitit(notif._id)}
                      >
                        ✓
                      </button>
                    )}

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(notif._id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;