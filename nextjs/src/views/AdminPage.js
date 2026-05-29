'use client';
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

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

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      await Promise.all([loadDashboard(), loadUsers(), loadPosts()]);
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
  }, [loadDashboard, loadUsers, loadPosts, logout]);

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