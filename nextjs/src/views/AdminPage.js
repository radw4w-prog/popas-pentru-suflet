'use client';
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

const CATEGORII = ['spiritual', 'apus', 'rasarit', 'munte', 'padure', 'mare', 'flori', 'cer', 'minimalist', 'iarna'];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const AdminPage = () => {
  const { user, isAdmin, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [templateStats, setTemplateStats] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [prayerStats, setPrayerStats] = useState({});
  const [devotionals, setDevotionals] = useState([]);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', url: '', categorie: 'spiritual' });
  const [editingDevotional, setEditingDevotional] = useState(null);

  // Folosește întotdeauna token-ul curent din localStorage
  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }, []);

  const loadDashboard = useCallback(async () => {
    const res = await axios.get(
      `${API_URL}/api/admin/dashboard`,
      getHeaders()
    );
    if (res.data.success) setStats(res.data.stats);
  }, [getHeaders]);

  const loadUsers = useCallback(async () => {
    const res = await axios.get(
      `${API_URL}/api/admin/users`,
      getHeaders()
    );
    if (res.data.success) setUsers(res.data.useri || []);
  }, [getHeaders]);

  const loadPosts = useCallback(async () => {
    const res = await axios.get(
      `${API_URL}/api/admin/posts`,
      getHeaders()
    );
    if (res.data.success) setPosts(res.data.postari || []);
  }, [getHeaders]);

  const loadTemplates = useCallback(async () => {
    const res = await axios.get(`${API_URL}/api/admin/templates?limit=500`, getHeaders());
    if (res.data.success) {
      setTemplates(res.data.templates || []);
      setTemplateStats(res.data.stats || []);
    }
  }, [getHeaders]);

  const loadPrayers = useCallback(async () => {
    const res = await axios.get(`${API_URL}/api/admin/prayers?limit=50`, getHeaders());
    if (res.data.success) {
      setPrayers(res.data.cereri || []);
      setPrayerStats(res.data.stats || {});
    }
  }, [getHeaders]);

  const loadDevotionals = useCallback(async () => {
    const res = await axios.get(`${API_URL}/api/admin/devotionals?limit=30`, getHeaders());
    if (res.data.success) setDevotionals(res.data.devotionale || []);
  }, [getHeaders]);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      await Promise.all([loadDashboard(), loadUsers(), loadPosts(), loadTemplates(), loadPrayers(), loadDevotionals()]);
    } catch (err) {
      console.error(err);
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message;

      if (status === 401) {
        setError('Sesiunea a expirat. Te rugăm să te reconectezi.');
        setTimeout(() => {
          logout();
          router.push('/login');
        }, 2000);
      } else if (status === 403) {
        setError('Acces interzis. Doar administratorii pot accesa această pagină.');
      } else {
        setError(msg || 'Eroare la încărcarea panoului admin.');
      }
    } finally {
      setLoading(false);
    }
  }, [loadDashboard, loadUsers, loadPosts, loadTemplates, loadPrayers, loadDevotionals, logout]);

  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
    loadAll();
  }, [isAdmin, loadAll]);

  const changeUserRole = async (userId, rol) => {
    try {
      await axios.put(
        `${API_URL}/api/admin/users/${userId}/rol`,
        { rol },
        getHeaders()
      );
      await loadUsers();
      await loadDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Eroare la schimbarea rolului.');
    }
  };

  const toggleUserActive = async (userId) => {
    try {
      await axios.put(
        `${API_URL}/api/admin/users/${userId}/toggle-activ`,
        {},
        getHeaders()
      );
      await loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Eroare la actualizarea contului.');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Sigur vrei să ștergi acest utilizator?')) return;
    try {
      await axios.delete(
        `${API_URL}/api/admin/users/${userId}`,
        getHeaders()
      );
      await loadUsers();
      await loadDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Eroare la ștergerea utilizatorului.');
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: '2rem',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '3rem' }}>🛡️</div>
        <p>Se încarcă Admin Panel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          color: '#ef4444',
          padding: '1rem',
          borderRadius: '10px',
          marginBottom: '1rem'
        }}>
          ❌ {error}
        </div>
        <button
          onClick={loadAll}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            marginRight: '1rem'
          }}
        >
          🔄 Încearcă din nou
        </button>
        <button
          onClick={() => router.push('/login')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none',
            borderRadius: '10px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          🔑 Login din nou
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>🛡️ Admin Panel</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem', fontSize: '0.9rem' }}>
          Logat ca: <strong>{user?.nume}</strong> ({user?.email})
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem'
      }}>
        {[
          { key: 'dashboard', label: '📊 Dashboard' },
          { key: 'users', label: '👥 Utilizatori' },
          { key: 'templates', label: '🖼️ Template-uri' },
          { key: 'prayers', label: '🙏 Rugăciuni' },
          { key: 'devotionals', label: '📋 Devoționale' },
          { key: 'posts', label: '📝 Postări' },
          { key: 'settings', label: '⚙️ Setări Site' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.7rem 1rem',
              borderRadius: '10px',
              border: activeTab === tab.key
                ? '1px solid rgba(99,102,241,0.5)'
                : '1px solid var(--border-color)',
              background: activeTab === tab.key
                ? 'rgba(99,102,241,0.12)'
                : 'var(--bg-card)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ DASHBOARD ═══ */}
      {activeTab === 'dashboard' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <StatCard
            title="Total useri"
            value={stats?.useri?.total || 0}
            icon="👥"
            color="rgba(99,102,241,0.1)"
          />
          <StatCard
            title="Useri noi / 7 zile"
            value={stats?.useri?.noiSaptamana || 0}
            icon="🆕"
            color="rgba(34,197,94,0.1)"
          />
          <StatCard
            title="Activi azi"
            value={stats?.useri?.activiAzi || 0}
            icon="✅"
            color="rgba(59,130,246,0.1)"
          />
          <StatCard
            title="Total postări"
            value={stats?.postari?.total || 0}
            icon="📝"
            color="rgba(244,208,63,0.1)"
          />
          <StatCard
            title="Publicate"
            value={stats?.postari?.publicate || 0}
            icon="📢"
            color="rgba(34,197,94,0.1)"
          />
          <StatCard
            title="Draft"
            value={stats?.postari?.draft || 0}
            icon="📄"
            color="rgba(156,163,175,0.1)"
          />
          <StatCard
            title="Template-uri active"
            value={stats?.templates?.active || 0}
            icon="🖼️"
            color="rgba(251,191,36,0.1)"
          />
          <StatCard
            title="Rugăciuni neaprobate"
            value={stats?.rugaciuni?.neaprobate || 0}
            icon="🙏"
            color={stats?.rugaciuni?.neaprobate > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)'}
          />
          <StatCard
            title="Devoționale"
            value={stats?.devotionale?.total || 0}
            icon="📋"
            color="rgba(167,139,250,0.1)"
          />
        </div>
      )}

      {/* ═══ USERS ═══ */}
      {activeTab === 'users' && (
        <div style={cardStyle}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h3 style={{ margin: 0 }}>
              👥 Utilizatori ({users.length})
            </h3>
            <button
              onClick={loadUsers}
              style={smallBtnStyle}
            >
              🔄 Reîncarcă
            </button>
          </div>

          {users.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>
              Nu există utilizatori.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {users.map(u => (
                <div
                  key={u._id}
                  style={{
                    border: `1px solid ${u.activ ? 'var(--border-color)' : 'rgba(239,68,68,0.3)'}`,
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    background: u.activ ? 'transparent' : 'rgba(239,68,68,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Avatar */}
                    <div style={{
                      width: 40, height: 40,
                      borderRadius: '50%',
                      background: u.rol === 'admin'
                        ? 'linear-gradient(135deg, #f4d03f, #e67e22)'
                        : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'white',
                      flexShrink: 0,
                      overflow: 'hidden'
                    }}>
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        u.nume?.slice(0, 2).toUpperCase() || '?'
                      )}
                    </div>

                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {u.nume}
                        {u.facebookId && (
                          <span style={{
                            marginLeft: '0.4rem',
                            fontSize: '0.7rem',
                            background: '#1877F2',
                            color: 'white',
                            padding: '1px 5px',
                            borderRadius: '4px'
                          }}>
                            FB
                          </span>
                        )}
                      </div>
                      <div style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-secondary)'
                      }}>
                        {u.email}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginTop: '0.2rem',
                        display: 'flex',
                        gap: '0.5rem',
                        flexWrap: 'wrap'
                      }}>
                        <span style={{
                          padding: '1px 6px',
                          borderRadius: '10px',
                          background: u.rol === 'admin'
                            ? 'rgba(244,208,63,0.2)'
                            : 'rgba(99,102,241,0.1)',
                          color: u.rol === 'admin' ? '#f4d03f' : '#6366f1',
                          fontWeight: 600
                        }}>
                          {u.rol === 'admin' ? '👑 Admin' : '👤 User'}
                        </span>
                        <span style={{
                          padding: '1px 6px',
                          borderRadius: '10px',
                          background: u.activ
                            ? 'rgba(34,197,94,0.1)'
                            : 'rgba(239,68,68,0.1)',
                          color: u.activ ? '#22c55e' : '#ef4444',
                          fontWeight: 600
                        }}>
                          {u.activ ? '✅ Activ' : '⛔ Blocat'}
                        </span>
                        {u.lastLogin && (
                          <span>
                            Ultima activitate: {new Date(u.lastLogin).toLocaleDateString('ro-RO')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => changeUserRole(
                        u._id,
                        u.rol === 'admin' ? 'user' : 'admin'
                      )}
                      style={smallBtnStyle}
                      title={u.rol === 'admin' ? 'Retrogradează la user' : 'Promovează la admin'}
                    >
                      {u.rol === 'admin' ? '↩️ Fă user' : '🛡️ Fă admin'}
                    </button>

                    <button
                      onClick={() => toggleUserActive(u._id)}
                      style={{
                        ...smallBtnStyle,
                        color: u.activ ? '#ef4444' : '#22c55e',
                        borderColor: u.activ
                          ? 'rgba(239,68,68,0.3)'
                          : 'rgba(34,197,94,0.3)'
                      }}
                    >
                      {u.activ ? '⛔ Blochează' : '✅ Activează'}
                    </button>

                    <button
                      onClick={() => deleteUser(u._id)}
                      style={{
                        ...smallBtnStyle,
                        color: '#ef4444',
                        borderColor: 'rgba(239,68,68,0.3)'
                      }}
                    >
                      🗑️ Șterge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ POSTS ═══ */}
      {activeTab === 'posts' && (
        <div style={cardStyle}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h3 style={{ margin: 0 }}>📝 Postări ({posts.length})</h3>
            <button onClick={loadPosts} style={smallBtnStyle}>
              🔄 Reîncarcă
            </button>
          </div>

          {posts.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>Nu există postări.</p>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {posts.map(post => (
                <div
                  key={post._id}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1rem'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: '0.3rem'
                      }}>
                        {(post.content || post.description || 'Postare fără conținut')
                          .substring(0, 100)}...
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        gap: '0.75rem',
                        flexWrap: 'wrap'
                      }}>
                        <span>
                          Status:{' '}
                          <strong style={{
                            color: post.status === 'published'
                              ? '#22c55e'
                              : post.status === 'failed'
                                ? '#ef4444'
                                : 'var(--text-secondary)'
                          }}>
                            {post.status || 'draft'}
                          </strong>
                        </span>
                        {post.platform && <span>Platform: {post.platform}</span>}
                        {post.tema && <span>Temă: {post.tema}</span>}
                        <span>
                          {new Date(post.createdAt).toLocaleDateString('ro-RO')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ TEMPLATES ═══ */}
      {activeTab === 'templates' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ margin: 0 }}>🖼️ Template-uri ({templates.length})</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setShowAddTemplate(!showAddTemplate)} style={{ ...smallBtnStyle, color: '#22c55e', borderColor: 'rgba(34,197,94,0.3)' }}>
                ➕ Adaugă
              </button>
              <button onClick={loadTemplates} style={smallBtnStyle}>🔄 Reîncarcă</button>
            </div>
          </div>

          {/* Statistici categorii */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {templateStats.map(s => (
              <span key={s._id} style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {s._id}: {s.active}/{s.total}
              </span>
            ))}
          </div>

          {/* Formular adăugare */}
          {showAddTemplate && (
            <div style={{ border: '1px solid rgba(34,197,94,0.3)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', background: 'rgba(34,197,94,0.03)' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#22c55e' }}>➕ Template nou</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0' }}>
                Lipește un URL Unsplash. Dimensiunile se setează automat la <strong>1080×1350</strong> (format Facebook/Instagram).
              </p>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <input value={newTemplate.name} onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })} placeholder="Nume template (ex: Apus Maiestuos)" style={inputStyle} />
                <input value={newTemplate.url} onChange={e => {
                  let raw = e.target.value.trim();
                  // Dacă e URL direct images.unsplash.com — normalizează parametrii
                  if (raw.includes('images.unsplash.com')) {
                    const base = raw.split('?')[0];
                    raw = `${base}?w=1080&h=1350&fit=crop&q=85`;
                  }
                  // Dacă e URL pagină unsplash.com/photos/... — lăsăm backend-ul să-l rezolve
                  setNewTemplate({ ...newTemplate, url: raw });
                }} placeholder="URL Unsplash (pagină SAU imagine directă)" style={inputStyle} />
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '-0.2rem 0 0 0' }}>
                  ✅ Acceptă: <code>unsplash.com/photos/...</code> sau <code>images.unsplash.com/photo-...</code> — se convertește automat la 1080×1350
                </p>
                <select value={newTemplate.categorie} onChange={e => setNewTemplate({ ...newTemplate, categorie: e.target.value })} style={inputStyle}>
                  {CATEGORII.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={async () => {
                    if (!newTemplate.name || !newTemplate.url) { alert('Completează numele și URL-ul!'); return; }
                    try {
                      await axios.post(`${API_URL}/api/admin/templates`, newTemplate, getHeaders());
                      setNewTemplate({ name: '', url: '', categorie: 'spiritual' });
                      setShowAddTemplate(false);
                      await loadTemplates(); await loadDashboard();
                      alert('✅ Template adăugat!');
                    } catch (err) { alert(err.response?.data?.message || 'Eroare'); }
                  }} style={{ ...smallBtnStyle, color: '#22c55e', borderColor: 'rgba(34,197,94,0.3)' }}>
                    ✅ Salvează
                  </button>
                  <button onClick={() => setShowAddTemplate(false)} style={smallBtnStyle}>❌ Anulează</button>
                </div>
              </div>
              {newTemplate.url && (
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.3rem 0' }}>Preview:</p>
                    {newTemplate.url.includes('images.unsplash.com') ? (
                      <img
                        src={`${newTemplate.url.split('?')[0]}?w=200&h=250&fit=crop&q=60`}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        style={{ width: 100, height: 125, objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{ width: 100, height: 125, borderRadius: '8px', border: '1px solid rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#d4af37', textAlign: 'center', padding: '0.3rem' }}>
                        🔗 Preview apare<br/>după salvare
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <div>📐 Full: 1080×1350px</div>
                    <div>🎯 Format: Vertical (4:5)</div>
                    <div>📱 Ideal: FB, IG, TikTok</div>
                    {!newTemplate.url.includes('images.unsplash.com') && (
                      <div style={{ color: '#d4af37', marginTop: '0.3rem' }}>⚡ URL-ul va fi convertit automat la salvare</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info format */}
          <div style={{ padding: '0.6rem 1rem', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            📐 Format standard: <strong>1080×1350px</strong> (vertical) — ideal Facebook, Instagram, TikTok
          </div>

          {/* Grid template-uri */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
            {templates.map(t => {
              // Generează thumbnail din URL — decode HTML entities + extrage base
              const rawUrl = (t.thumbnail || t.url || '').replace(/&#x2F;/gi, '/').replace(/&amp;/gi, '&').replace(/&#x3A;/gi, ':');
              const thumbBase = rawUrl.split('?')[0];
              const thumbSrc = thumbBase.includes('unsplash.com') 
                ? `${thumbBase}?w=300&h=375&fit=crop&q=60` 
                : rawUrl;
              return (
              <div key={t._id} style={{
                border: `1px solid ${t.activ ? 'var(--border-color)' : 'rgba(239,68,68,0.3)'}`,
                borderRadius: '12px', overflow: 'hidden', position: 'relative',
                opacity: t.activ ? 1 : 0.5
              }}>
                <div style={{ width: '100%', height: 170, background: 'rgba(99,102,241,0.05)', position: 'relative' }}>
                  <img
                    src={thumbSrc}
                    alt={t.name}
                    referrerPolicy="no-referrer"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    loading="lazy"
                  />
                  {!t.activ && (
                    <div style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(239,68,68,0.9)', color: 'white', padding: '1px 6px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 700 }}>
                      INACTIV
                    </div>
                  )}
                </div>
                <div style={{ padding: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.name}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    {t.categorie} • {t.sursa || 'builtin'} • {t.templateId}
                  </div>

                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button onClick={async () => {
                      try {
                        await axios.put(`${API_URL}/api/admin/templates/${t._id}/toggle`, {}, getHeaders());
                        await loadTemplates(); await loadDashboard();
                      } catch (err) { alert(err.response?.data?.message || 'Eroare'); }
                    }} style={{ ...smallBtnStyle, padding: '3px 8px', fontSize: '0.7rem' }} title={t.activ ? 'Dezactivează' : 'Activează'}>
                      {t.activ ? '🙈 Ascunde' : '👁️ Arată'}
                    </button>
                    <button onClick={async () => {
                      if (!window.confirm(`Ștergi definitiv "${t.name}"?`)) return;
                      try {
                        await axios.delete(`${API_URL}/api/admin/templates/${t._id}`, getHeaders());
                        await loadTemplates(); await loadDashboard();
                      } catch (err) { alert(err.response?.data?.message || 'Eroare'); }
                    }} style={{ ...smallBtnStyle, padding: '3px 8px', fontSize: '0.7rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );})}
          </div>
        </div>
      )}

      {/* ═══ PRAYERS ═══ */}
      {activeTab === 'prayers' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>🙏 Moderare Rugăciuni ({prayers.length})</h3>
            <button onClick={loadPrayers} style={smallBtnStyle}>🔄 Reîncarcă</button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(34,197,94,0.1)', fontSize: '0.85rem' }}>
              ✅ Aprobate: {prayerStats.aprobate || 0}
            </span>
            <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', fontSize: '0.85rem' }}>
              ❌ Neaprobate: {prayerStats.neaprobate || 0}
            </span>
            <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', fontSize: '0.85rem' }}>
              🎯 Rezolvate: {prayerStats.rezolvate || 0}
            </span>
          </div>

          {prayers.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>Nu există cereri de rugăciune.</p>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {prayers.map(c => (
                <div key={c._id} style={{
                  border: `1px solid ${c.aprobat ? 'var(--border-color)' : 'rgba(239,68,68,0.3)'}`,
                  borderRadius: '12px', padding: '1rem',
                  background: c.aprobat ? 'transparent' : 'rgba(239,68,68,0.03)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                        {c.titlu}
                        {!c.aprobat && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: 'rgba(239,68,68,0.2)', color: '#ef4444', padding: '1px 6px', borderRadius: '4px' }}>NEAPROBAT</span>}
                        {c.rezolvat && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: 'rgba(34,197,94,0.2)', color: '#22c55e', padding: '1px 6px', borderRadius: '4px' }}>REZOLVAT</span>}
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.3rem 0' }}>{c.cerere}</p>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span>📂 {c.categorie}</span>
                        <span>👤 {c.anonim ? 'Anonim' : c.numeAfisat}</span>
                        <span>🙏 {c.rugaciuni} rugăciuni</span>
                        <span>📅 {new Date(c.createdAt).toLocaleDateString('ro-RO')}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                      <button onClick={async () => {
                        try {
                          await axios.put(`${API_URL}/api/admin/prayers/${c._id}/toggle-aprobare`, {}, getHeaders());
                          await loadPrayers(); await loadDashboard();
                        } catch (err) { alert(err.response?.data?.message || 'Eroare'); }
                      }} style={{ ...smallBtnStyle, color: c.aprobat ? '#ef4444' : '#22c55e' }}>
                        {c.aprobat ? '❌ Respinge' : '✅ Aprobă'}
                      </button>
                      <button onClick={async () => {
                        try {
                          await axios.put(`${API_URL}/api/admin/prayers/${c._id}/rezolvat`, {}, getHeaders());
                          await loadPrayers();
                        } catch (err) { alert(err.response?.data?.message || 'Eroare'); }
                      }} style={smallBtnStyle}>
                        {c.rezolvat ? '↩️ Nerezolvat' : '🎯 Rezolvat'}
                      </button>
                      <button onClick={async () => {
                        if (!window.confirm('Ștergi definitiv această cerere?')) return;
                        try {
                          await axios.delete(`${API_URL}/api/admin/prayers/${c._id}`, getHeaders());
                          await loadPrayers(); await loadDashboard();
                        } catch (err) { alert(err.response?.data?.message || 'Eroare'); }
                      }} style={{ ...smallBtnStyle, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                        🗑️ Șterge
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ DEVOTIONALS ═══ */}
      {activeTab === 'devotionals' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>📋 Devoționale ({devotionals.length})</h3>
            <button onClick={loadDevotionals} style={smallBtnStyle}>🔄 Reîncarcă</button>
          </div>

          {/* Editor devoțional */}
          {editingDevotional && (
            <div style={{ border: '1px solid rgba(99,102,241,0.3)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', background: 'rgba(99,102,241,0.03)' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#6366f1' }}>✏️ Editare: {editingDevotional.title}</h4>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                <input value={editingDevotional.title} onChange={e => setEditingDevotional({ ...editingDevotional, title: e.target.value })} placeholder="Titlu" style={inputStyle} />
                <input value={editingDevotional.verseReference} onChange={e => setEditingDevotional({ ...editingDevotional, verseReference: e.target.value })} placeholder="Referință verset" style={inputStyle} />
                <textarea value={editingDevotional.verseText} onChange={e => setEditingDevotional({ ...editingDevotional, verseText: e.target.value })} placeholder="Text verset" style={{ ...inputStyle, minHeight: '60px' }} />
                <textarea value={editingDevotional.introduction} onChange={e => setEditingDevotional({ ...editingDevotional, introduction: e.target.value })} placeholder="Introducere" style={{ ...inputStyle, minHeight: '80px' }} />
                <textarea value={editingDevotional.reflection} onChange={e => setEditingDevotional({ ...editingDevotional, reflection: e.target.value })} placeholder="Mesaj/Reflecție" style={{ ...inputStyle, minHeight: '80px' }} />
                <textarea value={editingDevotional.practicalApplication} onChange={e => setEditingDevotional({ ...editingDevotional, practicalApplication: e.target.value })} placeholder="Aplică astăzi" style={{ ...inputStyle, minHeight: '60px' }} />
                <textarea value={editingDevotional.prayer} onChange={e => setEditingDevotional({ ...editingDevotional, prayer: e.target.value })} placeholder="Rugăciune" style={{ ...inputStyle, minHeight: '60px' }} />
                <textarea value={editingDevotional.thoughtOfTheDay} onChange={e => setEditingDevotional({ ...editingDevotional, thoughtOfTheDay: e.target.value })} placeholder="Gândul zilei" style={{ ...inputStyle, minHeight: '60px' }} />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={async () => {
                    try {
                      await axios.put(`${API_URL}/api/admin/devotionals/${editingDevotional._id}`, editingDevotional, getHeaders());
                      setEditingDevotional(null);
                      await loadDevotionals();
                      alert('Devoțional salvat!');
                    } catch (err) { alert(err.response?.data?.message || 'Eroare'); }
                  }} style={{ ...smallBtnStyle, color: '#22c55e', borderColor: 'rgba(34,197,94,0.3)' }}>
                    ✅ Salvează
                  </button>
                  <button onClick={() => setEditingDevotional(null)} style={smallBtnStyle}>❌ Anulează</button>
                </div>
              </div>
            </div>
          )}

          {devotionals.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>Nu există devoționale.</p>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {devotionals.map(d => (
                <div key={d._id} style={{
                  border: `1px solid ${d.published ? 'var(--border-color)' : 'rgba(239,68,68,0.3)'}`,
                  borderRadius: '12px', padding: '1rem',
                  opacity: d.published ? 1 : 0.6
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                        {d.title}
                        {!d.published && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: 'rgba(239,68,68,0.2)', color: '#ef4444', padding: '1px 6px', borderRadius: '4px' }}>ASCUNS</span>}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0', fontStyle: 'italic' }}>
                        „{d.verseText?.substring(0, 100)}..." — {d.verseReference}
                      </p>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span>📅 {d.dateKey}</span>
                        <span>🤖 {d.generatedBy === 'ai' ? `AI (${d.aiModel || '?'})` : d.generatedBy}</span>
                        {d.theologyScore && <span>📊 Scor: {d.theologyScore}/10</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                      <button onClick={() => setEditingDevotional({ ...d })} style={smallBtnStyle}>
                        ✏️ Editează
                      </button>
                      <button onClick={async () => {
                        try {
                          await axios.put(`${API_URL}/api/admin/devotionals/${d._id}/toggle-published`, {}, getHeaders());
                          await loadDevotionals();
                        } catch (err) { alert(err.response?.data?.message || 'Eroare'); }
                      }} style={{ ...smallBtnStyle, color: d.published ? '#ef4444' : '#22c55e' }}>
                        {d.published ? '🙈 Ascunde' : '👁️ Publică'}
                      </button>
                      <button onClick={async () => {
                        if (!window.confirm(`Ștergi devoționalul "${d.title}"?`)) return;
                        try {
                          await axios.delete(`${API_URL}/api/admin/devotionals/${d._id}`, getHeaders());
                          await loadDevotionals();
                        } catch (err) { alert(err.response?.data?.message || 'Eroare'); }
                      }} style={{ ...smallBtnStyle, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ SETTINGS ═══ */}
      {activeTab === 'settings' && (
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0 }}>⚙️ Setări Site</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Setările globale ale aplicației vor fi configurabile din această secțiune.
          </p>

          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
            {[
              { label: 'Nume site', value: 'Popas pentru Suflet' },
              { label: 'Generări maxime vizitator / zi', value: '3' },
              { label: 'Generări maxime user / oră', value: '5' },
              { label: 'Înregistrare utilizatori', value: 'Activă' },
              { label: 'Facebook Login', value: 'Activ' },
              { label: 'Total versete Biblie', value: '31.102' },
              { label: 'Versiune Biblie', value: 'Cornilescu (VDCC)' }
            ].map((item, idx) => (
              <div key={idx} style={settingRowStyle}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {item.label}
                </span>
                <strong style={{ color: 'var(--text-primary)' }}>
                  {item.value}
                </strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══ SUB-COMPONENTE ═══
const StatCard = ({ title, value, icon, color }) => (
  <div style={{
    background: color || 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '1.25rem'
  }}>
    <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{icon}</div>
    <div style={{
      fontSize: '2rem',
      fontWeight: 700,
      color: 'var(--text-primary)'
    }}>
      {value}
    </div>
    <div style={{
      color: 'var(--text-secondary)',
      marginTop: '0.35rem',
      fontSize: '0.875rem'
    }}>
      {title}
    </div>
  </div>
);

const cardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: '16px',
  padding: '1.25rem'
};

const smallBtnStyle = {
  padding: '0.5rem 0.8rem',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  fontSize: '0.82rem',
  transition: 'all 0.15s',
  whiteSpace: 'nowrap'
};

const inputStyle = {
  padding: '0.65rem 0.85rem',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  fontSize: '0.9rem',
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  resize: 'vertical'
};

const settingRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.85rem 1rem',
  border: '1px solid var(--border-color)',
  borderRadius: '10px',
  fontSize: '0.9rem'
};

export default AdminPage;