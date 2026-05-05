import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getImageUrl = (post) => {
  if (!post.imageUrl) return null;
  if (post.imageUrl.startsWith('http')) return post.imageUrl;
  const parts = post.imageUrl.replace(/\\/g, '/').split('/');
  const filename = parts[parts.length - 1];
  if (!filename || !filename.includes('.')) return null;
  return `${API}/uploads/generated/${filename}`;
};

const SchedulePage = () => {
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [historyPosts, setHistoryPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('scheduled');
  const [previewPost, setPreviewPost] = useState(null);
  const [editPost, setEditPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editHashtags, setEditHashtags] = useState('');
  const [editScheduledDate, setEditScheduledDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [scheduledRes, historyRes] = await Promise.all([
        axios.get(`${API}/api/social/scheduled`),
        axios.get(`${API}/api/social/history`)
      ]);
      setScheduledPosts(scheduledRes.data || []);
      setHistoryPosts(historyRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteScheduled = async (id) => {
    if (!window.confirm('Ștergi această programare?')) return;
    try {
      await axios.delete(`${API}/api/social/scheduled/${id}`);
      setScheduledPosts(prev => prev.filter(p => p._id !== id));
    } catch (e) {
      alert('Eroare: ' + (e.response?.data?.error || e.message));
    }
  };

  const publishNow = async (id) => {
    if (!window.confirm('Publici acum această postare?')) return;
    try {
      await axios.post(`${API}/api/social/publish/${id}`, {}, { headers: getHeaders() });
      await fetchData();
      alert('✅ Publicată cu succes!');
    } catch (e) {
      alert('❌ ' + (e.response?.data?.error || e.message));
    }
  };

  const handleOpenEdit = (post) => {
    setEditPost(post);
    setEditContent(post.content || '');
    setEditHashtags(post.hashtags || '');
    if (post.scheduledDate) {
      const d = new Date(post.scheduledDate);
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString().slice(0, 16);
      setEditScheduledDate(local);
    }
  };

  const handleSaveEdit = async () => {
    if (!editPost) return;
    setSaving(true);
    try {
      await axios.put(
        `${API}/api/posts/${editPost._id}`,
        {
          content: editContent,
          hashtags: editHashtags,
          scheduledDate: editScheduledDate
            ? new Date(editScheduledDate).toISOString()
            : editPost.scheduledDate
        },
        { headers: getHeaders() }
      );
      setEditPost(null);
      await fetchData();
    } catch (e) {
      alert('Eroare: ' + (e.response?.data?.error || e.message));
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleString('ro-RO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'Europe/Bucharest'
    });
  };

  const timeUntil = (d) => {
    if (!d) return '';
    const diff = new Date(d) - new Date();
    if (diff <= 0) return '⏳ Se publică acum...';
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 24) return `în ${Math.floor(hours / 24)}z ${hours % 24}h`;
    if (hours > 0) return `în ${hours}h ${minutes}m`;
    return `în ${minutes} minute`;
  };

  const OverlayBg = ({ onClick }) => (
    <div
      onClick={onClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '1rem'
      }}
    />
  );

  return (
    <div className="animate-in">

      {/* ═══ PREVIEW MODAL ═══ */}
      {previewPost && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '1rem'
          }}
          onClick={() => setPreviewPost(null)}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: '20px', padding: '1rem',
              maxWidth: 420, width: '100%',
              maxHeight: '90vh', overflow: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '1rem'
            }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem'
              }}>
                👁️ Preview postare
              </div>
              <button
                onClick={() => setPreviewPost(null)}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px', padding: '0.3rem 0.65rem',
                  cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem'
                }}
              >
                ✕
              </button>
            </div>

            {getImageUrl(previewPost) ? (
              <div style={{
                width: '100%', aspectRatio: '4/5',
                borderRadius: '14px', overflow: 'hidden',
                marginBottom: '1rem', background: 'var(--bg-input)'
              }}>
                <img
                  src={getImageUrl(previewPost)}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ) : (
              <div style={{
                width: '100%', aspectRatio: '4/5',
                borderRadius: '14px', background: 'var(--bg-input)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: '1rem',
                flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)'
              }}>
                <div style={{ fontSize: '3rem', opacity: 0.3 }}>🖼️</div>
                <div style={{ fontSize: '0.85rem' }}>Fără imagine</div>
              </div>
            )}

            <div style={{
              fontSize: '0.88rem', color: 'var(--text-primary)',
              lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: '0.75rem'
            }}>
              {previewPost.content}
            </div>

            {previewPost.hashtags && (
              <div style={{
                fontSize: '0.8rem', color: '#1877F2',
                marginBottom: '0.75rem', lineHeight: 1.6
              }}>
                {previewPost.hashtags}
              </div>
            )}

            <div style={{
              display: 'flex', gap: '0.4rem', flexWrap: 'wrap',
              paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)'
            }}>
              <span className="badge badge-blue">📘 {previewPost.platform}</span>
              {previewPost.tema && (
                <span className="badge badge-gold">🎯 {previewPost.tema}</span>
              )}
              <span className="badge badge-purple">
                🕐 {formatDate(previewPost.scheduledDate)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EDIT MODAL ═══ */}
      {editPost && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '1rem'
          }}
          onClick={() => setEditPost(null)}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px', padding: '1.5rem',
              maxWidth: 560, width: '100%',
              maxHeight: '90vh', overflow: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '1.25rem'
            }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700, fontSize: '1.1rem',
                color: 'var(--text-primary)'
              }}>
                ✏️ Editează postarea
              </div>
              <button
                onClick={() => setEditPost(null)}
                style={{
                  background: 'transparent', border: 'none',
                  cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem'
                }}
              >
                ✕
              </button>
            </div>

            {getImageUrl(editPost) && (
              <div style={{
                width: '100%', height: 140,
                borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem'
              }}>
                <img
                  src={getImageUrl(editPost)}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">📝 Conținut</label>
              <textarea
                className="form-input"
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                rows={5}
                style={{ resize: 'vertical', lineHeight: 1.7 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">#️⃣ Hashtags</label>
              <input
                type="text"
                className="form-input"
                value={editHashtags}
                onChange={e => setEditHashtags(e.target.value)}
                placeholder="#PopasPentruSuflet #Biblia..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">🕐 Data și ora programată</label>
              <input
                type="datetime-local"
                className="form-input"
                value={editScheduledDate}
                onChange={e => setEditScheduledDate(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-gold"
                style={{ flex: 1 }}
                onClick={handleSaveEdit}
                disabled={saving}
              >
                {saving ? '⏳ Se salvează...' : '💾 Salvează modificările'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setEditPost(null)}
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TABS ═══ */}
      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`tab ${activeTab === 'scheduled' ? 'active' : ''}`}
          onClick={() => setActiveTab('scheduled')}
        >
          📅 Programate ({scheduledPosts.length})
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📜 Istoric ({historyPosts.length})
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div>
            <div className="spinner" />
            <div className="loading-text">Se încarcă...</div>
          </div>
        </div>
      ) : activeTab === 'scheduled' ? (

        /* ═══ PROGRAMATE ═══ */
        <div className="card card-gold">
          <div className="card-header">
            <div className="card-title">
              <span className="icon">📅</span>
              Postări programate
            </div>
            <button className="btn btn-secondary btn-sm" onClick={fetchData}>
              🔄 Refresh
            </button>
          </div>

          <div style={{
            padding: '0.6rem 0.85rem',
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: '12px', fontSize: '0.78rem',
            color: 'var(--accent-blue)', marginBottom: '1rem'
          }}>
            🕐 Orele sunt afișate în <strong>ora României (EET/EEST)</strong>.
            Serverul publică automat la ora programată.
          </div>

          {scheduledPosts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-title">Nicio postare programată</div>
              <div className="empty-state-text">
                Generează o postare și programeaz-o pentru publicare automată.
              </div>
              <button
                className="btn btn-gold"
                style={{ marginTop: '1rem' }}
                onClick={() => window.location.href = '/generate'}
              >
                ✨ Generează postare
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {scheduledPosts.map((post) => (
                <div
                  key={post._id}
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '16px', overflow: 'hidden',
                    display: 'flex'
                  }}
                >
                  {/* THUMBNAIL */}
                  <div
                    style={{
                      width: 90, minHeight: 110, flexShrink: 0,
                      cursor: 'pointer', position: 'relative',
                      background: 'var(--bg-input)'
                    }}
                    onClick={() => setPreviewPost(post)}
                    title="Click pentru preview"
                  >
                    {getImageUrl(post) ? (
                      <img
                        src={getImageUrl(post)}
                        alt=""
                        style={{
                          width: '100%', height: '100%',
                          objectFit: 'cover', display: 'block',
                          minHeight: 110
                        }}
                        onError={e => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%', minHeight: 110,
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexDirection: 'column',
                        gap: '0.25rem', color: 'var(--text-muted)', padding: '0.5rem'
                      }}>
                        <span style={{ fontSize: '1.5rem', opacity: 0.4 }}>🖼️</span>
                        <span style={{ fontSize: '0.6rem', textAlign: 'center' }}>
                          Fără imagine
                        </span>
                      </div>
                    )}
                    {/* Overlay hover */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(0,0,0,0)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '1.5rem',
                      transition: 'background 0.15s'
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.35)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
                    >
                    </div>
                  </div>

                  {/* CONȚINUT */}
                  <div style={{
                    flex: 1, padding: '0.85rem',
                    display: 'flex', flexDirection: 'column',
                    gap: '0.5rem', minWidth: 0
                  }}>
                    <div style={{
                      fontSize: '0.85rem', color: 'var(--text-primary)',
                      lineHeight: 1.55,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {post.content}
                    </div>

                    <div style={{
                      display: 'flex', gap: '0.35rem',
                      flexWrap: 'wrap', alignItems: 'center'
                    }}>
                      <span className="badge badge-blue" style={{ fontSize: '0.68rem' }}>
                        📘 {post.platform}
                      </span>
                      {post.tema && (
                        <span className="badge badge-gold" style={{ fontSize: '0.68rem' }}>
                          🎯 {post.tema}
                        </span>
                      )}
                    </div>

                    <div style={{
                      display: 'flex', alignItems: 'center',
                      gap: '0.5rem', flexWrap: 'wrap'
                    }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        🕐 {formatDate(post.scheduledDate)}
                      </span>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 700,
                        color: 'var(--accent-green)'
                      }}>
                        {timeUntil(post.scheduledDate)}
                      </span>
                    </div>
                  </div>

                  {/* BUTOANE */}
                  <div style={{
                    display: 'flex', flexDirection: 'column',
                    gap: '0.4rem', padding: '0.75rem',
                    flexShrink: 0, justifyContent: 'center'
                  }}>
                    <button
                      onClick={() => handleOpenEdit(post)}
                      style={{
                        padding: '0.45rem 0.7rem',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-card)',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer', fontSize: '0.82rem',
                        fontWeight: 600, whiteSpace: 'nowrap'
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => publishNow(post._id)}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      ⚡ Acum
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteScheduled(post._id)}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      🗑️ Șterge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      ) : (

        /* ═══ ISTORIC ═══ */
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <span className="icon">📜</span>
              Istoric publicări
            </div>
            <button className="btn btn-secondary btn-sm" onClick={fetchData}>
              🔄 Refresh
            </button>
          </div>

          {historyPosts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-title">Fără istoric</div>
              <div className="empty-state-text">Nu există încă publicări.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {historyPosts.map((post) => (
                <div
                  key={post._id}
                  style={{
                    background: 'var(--bg-input)',
                    border: `1px solid ${post.status === 'published'
                      ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    borderRadius: '16px', overflow: 'hidden', display: 'flex'
                  }}
                >
                  {getImageUrl(post) && (
                    <div
                      style={{ width: 70, flexShrink: 0, cursor: 'pointer' }}
                      onClick={() => setPreviewPost(post)}
                    >
                      <img
                        src={getImageUrl(post)}
                        alt=""
                        style={{
                          width: '100%', height: '100%',
                          objectFit: 'cover', display: 'block', minHeight: 80
                        }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}

                  <div style={{
                    flex: 1, padding: '0.85rem',
                    display: 'flex', flexDirection: 'column', gap: '0.5rem'
                  }}>
                    <div style={{
                      fontSize: '0.85rem', color: 'var(--text-primary)',
                      lineHeight: 1.55,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {post.content}
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      <span className={`badge ${post.status === 'published'
                        ? 'badge-green' : 'badge-red'}`}>
                        {post.status === 'published' ? '✅ Publicată' : '❌ Eșuată'}
                      </span>
                      <span className="badge badge-blue">📘 {post.platform}</span>
                      {post.publishedAt && (
                        <span className="badge badge-purple">
                          🕐 {formatDate(post.publishedAt)}
                        </span>
                      )}
                    </div>

                    {post.failedReason && (
                      <div style={{
                        color: 'var(--accent-red)', fontSize: '0.78rem',
                        background: 'rgba(239,68,68,0.08)',
                        padding: '0.4rem 0.6rem', borderRadius: '8px'
                      }}>
                        ⚠️ {post.failedReason}
                      </div>
                    )}

                    {post.socialPostId && (
                      <a
                        href={`https://facebook.com/${post.socialPostId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.75rem', color: 'var(--accent-blue)',
                          textDecoration: 'none'
                        }}
                      >
                        🔗 Vezi pe Facebook →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SchedulePage;