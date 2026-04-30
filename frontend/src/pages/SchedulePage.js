import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '';

const SchedulePage = () => {
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [historyPosts, setHistoryPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('scheduled');

  useEffect(() => {
    fetchData();
    // Refresh la fiecare 30 secunde
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
      console.error('Delete error:', e);
      alert('Eroare la ștergere: ' + (e.response?.data?.error || e.message));
    }
  };

  const publishNow = async (id) => {
    if (!window.confirm('Publici acum această postare?')) return;
    try {
      await axios.post(`${API}/api/social/publish/${id}`);
      await fetchData();
      alert('✅ Publicată cu succes!');
    } catch (e) {
      alert('❌ ' + (e.response?.data?.error || e.message));
    }
  };

  // ✅ Fix timezone - afișează ora României
  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Bucharest'
    });
  };

  // ✅ Calculează cât timp mai e până la publicare
  const timeUntil = (d) => {
    if (!d) return '';
    const diff = new Date(d) - new Date();
    if (diff <= 0) return '⏳ Se publică acum...';

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `în ${days} zile`;
    }
    if (hours > 0) return `în ${hours}h ${minutes}m`;
    return `în ${minutes} minute`;
  };

  return (
    <div className="animate-in">
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
            <div className="spinner"></div>
            <div className="loading-text">Se încarcă...</div>
          </div>
        </div>
      ) : activeTab === 'scheduled' ? (
        <div>
          <div className="card card-gold" style={{ marginBottom: '1rem' }}>
            <div className="card-header">
              <div className="card-title">
                <span className="icon">📅</span>
                Postări programate
              </div>
              <button className="btn btn-secondary btn-sm" onClick={fetchData}>
                🔄 Refresh
              </button>
            </div>

            {/* Info timezone */}
            <div style={{
              padding: '0.6rem 0.85rem',
              background: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.78rem',
              color: 'var(--accent-blue)',
              marginBottom: '1rem'
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
                  <div key={post._id} style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start'
                  }}>
                    {/* Imagine thumbnail */}
                    {post.imageUrl && (
                      <div style={{
                        width: '60px', height: '75px', flexShrink: 0,
                        borderRadius: 'var(--radius-md)', overflow: 'hidden',
                        background: 'var(--bg-card)'
                      }}>
                        <img
                          src={post.imageUrl.startsWith('http')
                            ? post.imageUrl
                            : `${API}/${post.imageUrl}`}
                          alt="Post"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Continut */}
                      <div style={{
                        fontSize: '0.85rem', color: 'var(--text-primary)',
                        lineHeight: 1.5, marginBottom: '0.5rem',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {post.content}
                      </div>

                      {/* Badges */}
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                        <span className="badge badge-blue">📘 {post.platform}</span>
                        {post.tema && <span className="badge badge-gold">🎯 {post.tema}</span>}
                        <span className="badge badge-purple">
                          🕐 {formatDate(post.scheduledDate)}
                        </span>
                        <span style={{
                          fontSize: '0.72rem',
                          color: 'var(--accent-green)',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          {timeUntil(post.scheduledDate)}
                        </span>
                      </div>
                    </div>

                    {/* Butoane */}
                    <div style={{
                      display: 'flex', flexDirection: 'column',
                      gap: '0.4rem', flexShrink: 0
                    }}>
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
        </div>
      ) : (
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
              <div className="empty-state-text">
                Nu există încă publicări.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {historyPosts.map((post) => (
                <div key={post._id} style={{
                  background: 'var(--bg-input)',
                  border: `1px solid ${post.status === 'published'
                    ? 'rgba(16,185,129,0.2)'
                    : 'rgba(239,68,68,0.2)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '1rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start'
                }}>
                  {/* Status indicator */}
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 6,
                    background: post.status === 'published'
                      ? 'var(--accent-green)' : 'var(--accent-red)'
                  }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.85rem', color: 'var(--text-primary)',
                      lineHeight: 1.5, marginBottom: '0.5rem',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {post.content}
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span className={`badge ${post.status === 'published' ? 'badge-green' : 'badge-red'}`}>
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
                        marginTop: '0.5rem', color: 'var(--accent-red)',
                        fontSize: '0.78rem',
                        background: 'rgba(239,68,68,0.08)',
                        padding: '0.4rem 0.6rem',
                        borderRadius: 'var(--radius-sm)'
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
                          display: 'inline-block', marginTop: '0.5rem',
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