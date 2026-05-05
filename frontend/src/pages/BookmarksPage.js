import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const BookmarksPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editId, setEditId] = useState(null);
  const [editNota, setEditNota] = useState('');

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const loadBookmarks = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const params = filter !== 'all' ? `?tip=${filter}` : '';
      const r = await axios.get(`${API}/api/bookmarks${params}`, {
        headers: getHeaders()
      });
      if (r.data?.success) {
        setBookmarks(r.data.bookmarks || []);
        setStats(r.data.stats || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, filter, getHeaders]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/bookmarks/${id}`, {
        headers: getHeaders()
      });
      setBookmarks(prev => prev.filter(b => b._id !== id));
    } catch (e) {
      alert('Eroare la ștergere.');
    }
  };

  const handleSaveNota = async (id) => {
    try {
      await axios.put(
        `${API}/api/bookmarks/${id}`,
        { nota: editNota },
        { headers: getHeaders() }
      );
      setBookmarks(prev =>
        prev.map(b => b._id === id ? { ...b, nota: editNota } : b)
      );
      setEditId(null);
      setEditNota('');
    } catch (e) {
      alert('Eroare la salvare.');
    }
  };

  const getCuloareCSS = (culoare) => {
    const map = {
      gold: 'rgba(212,175,55,0.15)',
      red: 'rgba(220,38,38,0.12)',
      green: 'rgba(16,185,129,0.12)',
      blue: 'rgba(59,130,246,0.12)',
      purple: 'rgba(124,58,237,0.12)'
    };
    return map[culoare] || 'transparent';
  };

  const getBorderColor = (culoare) => {
    const map = {
      gold: 'rgba(212,175,55,0.3)',
      red: 'rgba(220,38,38,0.25)',
      green: 'rgba(16,185,129,0.25)',
      blue: 'rgba(59,130,246,0.25)',
      purple: 'rgba(124,58,237,0.25)'
    };
    return map[culoare] || 'var(--border-color)';
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        padding: '2rem', maxWidth: 500, margin: '4rem auto', textAlign: 'center'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔖</div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Semnele mele
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Creează un cont gratuit pentru a salva versete, evidenția pasaje și adăuga notițe personale.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn btn-gold" onClick={() => navigate('/register')}>
            ✅ Cont gratuit
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/login')}>
            🔑 Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in" style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* HEADER */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', flexWrap: 'wrap',
        gap: '1rem', marginBottom: '1.25rem'
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.5rem', fontWeight: 700,
            color: 'var(--text-primary)', margin: 0
          }}>
            🔖 Semnele mele
          </h1>
          <p style={{
            color: 'var(--text-muted)', fontSize: '0.85rem',
            margin: '0.3rem 0 0'
          }}>
            Versete salvate, evidențiate și cu notițe personale
          </p>
        </div>

        <div style={{
          display: 'flex', gap: '0.5rem',
          fontSize: '0.82rem', color: 'var(--text-muted)'
        }}>
          <span>🔖 {stats.bookmarks || 0}</span>
          <span>🎨 {stats.highlights || 0}</span>
          <span>📝 {stats.notes || 0}</span>
        </div>
      </div>

      {/* FILTRE */}
      <div style={{
        display: 'flex', gap: '0.4rem', marginBottom: '1.25rem',
        background: 'var(--bg-input)', borderRadius: '12px', padding: '4px'
      }}>
        {[
          { key: 'all', label: '📚 Toate', count: stats.total },
          { key: 'bookmark', label: '🔖 Semne', count: stats.bookmarks },
          { key: 'highlight', label: '🎨 Evidențiate', count: stats.highlights },
          { key: 'note', label: '📝 Cu notițe', count: stats.notes }
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              flex: 1, padding: '0.55rem',
              borderRadius: '10px', border: 'none',
              background: filter === f.key ? 'var(--bg-card)' : 'transparent',
              color: filter === f.key ? 'var(--gold-primary)' : 'var(--text-muted)',
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
            }}
          >
            {f.label} ({f.count || 0})
          </button>
        ))}
      </div>

      {/* LISTA */}
      {loading ? (
        <div className="loading-spinner">
          <div>
            <div className="spinner" />
            <div className="loading-text">Se încarcă...</div>
          </div>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔖</div>
          <div className="empty-state-title">Niciun semn salvat</div>
          <div className="empty-state-text">
            Deschide Biblia și apasă 🏷️ pe un verset pentru a-l salva.
          </div>
          <button
            className="btn btn-gold"
            style={{ marginTop: '1rem' }}
            onClick={() => navigate('/verses')}
          >
            📖 Deschide Biblia
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {bookmarks.map(bm => (
            <div
              key={bm._id}
              style={{
                background: getCuloareCSS(bm.culoare),
                border: `1px solid ${getBorderColor(bm.culoare)}`,
                borderRadius: '16px',
                padding: '1.15rem',
                borderLeft: `4px solid ${getBorderColor(bm.culoare)}`
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: '0.65rem',
                flexWrap: 'wrap', gap: '0.5rem'
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.85rem' }}>
                    {bm.tip === 'bookmark' ? '🔖' : bm.tip === 'highlight' ? '🎨' : '📝'}
                  </span>
                  <span style={{
                    fontWeight: 700, color: 'var(--gold-primary)',
                    fontSize: '0.88rem'
                  }}>
                    {bm.referinta}
                  </span>
                  <span style={{
                    fontSize: '0.68rem', color: 'var(--text-muted)',
                    background: 'var(--bg-input)', padding: '1px 6px',
                    borderRadius: '10px'
                  }}>
                    {bm.testament === 'NT' ? '✝️ NT' : '📜 VT'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => {
                      setEditId(editId === bm._id ? null : bm._id);
                      setEditNota(bm.nota || '');
                    }}
                    style={{
                      background: 'transparent', border: 'none',
                      cursor: 'pointer', fontSize: '0.85rem',
                      color: 'var(--text-muted)'
                    }}
                    title="Editează notă"
                  >
                    📝
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`„${bm.text}" — ${bm.referinta}`);
                    }}
                    style={{
                      background: 'transparent', border: 'none',
                      cursor: 'pointer', fontSize: '0.85rem',
                      color: 'var(--text-muted)'
                    }}
                    title="Copiază"
                  >
                    📋
                  </button>
                  <button
                    onClick={() => handleDelete(bm._id)}
                    style={{
                      background: 'transparent', border: 'none',
                      cursor: 'pointer', fontSize: '0.85rem',
                      color: 'var(--text-muted)'
                    }}
                    title="Șterge"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Text */}
              <div style={{
                fontFamily: "'Lora', 'Playfair Display', serif",
                fontSize: '0.95rem', fontStyle: 'italic',
                color: 'var(--text-primary)', lineHeight: 1.8,
                marginBottom: bm.nota || editId === bm._id ? '0.85rem' : 0
              }}>
                „{bm.text}"
              </div>

              {/* Notă existentă */}
              {bm.nota && editId !== bm._id && (
                <div style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px', padding: '0.75rem',
                  fontSize: '0.85rem', color: 'var(--text-secondary)',
                  lineHeight: 1.6
                }}>
                  📝 {bm.nota}
                </div>
              )}

              {/* Edit notă */}
              {editId === bm._id && (
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: '0.5rem'
                }}>
                  <textarea
                    value={editNota}
                    onChange={e => setEditNota(e.target.value)}
                    placeholder="Scrie o notă personală..."
                    rows={3}
                    style={{
                      width: '100%', padding: '0.75rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem', resize: 'vertical',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-gold btn-sm"
                      onClick={() => handleSaveNota(bm._id)}
                    >
                      💾 Salvează
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => { setEditId(null); setEditNota(''); }}
                    >
                      Anulează
                    </button>
                  </div>
                </div>
              )}

              {/* Data */}
              <div style={{
                fontSize: '0.68rem', color: 'var(--text-muted)',
                marginTop: '0.5rem'
              }}>
                Salvat pe {new Date(bm.createdAt).toLocaleDateString('ro-RO', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;