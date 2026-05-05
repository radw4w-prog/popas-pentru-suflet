// frontend/src/pages/AnalyticsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const AnalyticsPage = () => {
  const [period, setPeriod] = useState('week');
  const [pageAnalytics, setPageAnalytics] = useState(null);
  const [posts, setPosts] = useState([]);
  const [totals, setTotals] = useState(null);
  const [topPost, setTopPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const headers = { headers: getHeaders() };
      const [pageRes, postsRes] = await Promise.all([
        axios.get(`${API}/api/social/analytics/page?period=${period}`, headers),
        axios.get(`${API}/api/social/analytics/posts?limit=10`, headers)
      ]);
      if (pageRes.data.success) setPageAnalytics(pageRes.data.analytics);
      if (postsRes.data.success) {
        setPosts(postsRes.data.posts || []);
        setTotals(postsRes.data.totals);
        setTopPost(postsRes.data.topPost);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Nu am putut încărca analytics.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await axios.put(`${API}/api/social/analytics/sync`, {}, { headers: getHeaders() });
      if (res.data.success) { alert(res.data.message); await loadAnalytics(); }
    } catch { alert('Eroare la sincronizare.'); }
    finally { setSyncing(false); }
  };

  const fmt = (n) => {
    if (!n) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  const fmtDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ fontSize: '3rem' }}>📊</div>
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)' }}>Se încarcă analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ap-wrap">
        <div className="ap-error">
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>❌</div>
          <h3 style={{ color: '#ef4444', margin: '0 0 0.5rem', fontSize: '1.1rem' }}>Eroare Analytics</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0 0 1rem' }}>{error}</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={loadAnalytics} className="btn btn-gold btn-sm">🔄 Reîncearcă</button>
            <button onClick={() => window.location.href = '/settings'} className="btn btn-outline btn-sm">⚙️ Setări</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in ap-wrap">

      {/* HERO */}
      <div className="ap-hero">
        <div className="ap-hero-bg" />
        <div className="ap-hero-content">
          <div className="ap-hero-left">
            <div className="ap-kicker">✦ Facebook Insights ✦</div>
            <h1 className="ap-title">Statistici</h1>
            <p className="ap-subtitle">Impactul postărilor și creșterea paginii tale.</p>
          </div>
          <div className="ap-hero-right">
            <div className="ap-period-bar">
              {[
                { key: 'day', label: 'Azi' },
                { key: 'week', label: '7 zile' },
                { key: 'month', label: '28 zile' }
              ].map(p => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={`ap-period-btn ${period === p.key ? 'active' : ''}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button onClick={handleSync} disabled={syncing} className="ap-sync-btn">
              {syncing ? '⏳' : '🔄'} {syncing ? 'Sync...' : 'Sync'}
            </button>
          </div>
        </div>
      </div>

      {/* PAGE INFO */}
      {pageAnalytics && (
        <div className="ap-page-card">
          {pageAnalytics.picture && (
            <img src={pageAnalytics.picture} alt="" className="ap-page-avatar" />
          )}
          <div className="ap-page-info">
            <div className="ap-page-name">{pageAnalytics.pageName}</div>
            <div className="ap-page-meta">
              📘 {fmt(pageAnalytics.fans)} fani • 👥 {fmt(pageAnalytics.followers)} urmăritori
            </div>
          </div>
          <div className="ap-page-period">
            {period === 'day' ? '24h' : period === 'week' ? '7 zile' : '28 zile'}
          </div>
        </div>
      )}

      {/* KPI */}
      {pageAnalytics && (
        <div className="ap-kpi-grid">
          {[
            { icon: '👥', label: 'Fani', value: fmt(pageAnalytics.fans), c: 'blue' },
            { icon: '👁️', label: 'Reach', value: fmt(pageAnalytics.reach), c: 'sky' },
            { icon: '💬', label: 'Discuții', value: fmt(pageAnalytics.talkingAbout), c: 'green' },
            { icon: '🖱️', label: 'Engagement', value: fmt(pageAnalytics.engagements), c: 'gold' },
            { icon: '👀', label: 'Vizite', value: fmt(pageAnalytics.pageViews), c: 'red' },
            { icon: '❤️', label: 'Fani noi', value: fmt(pageAnalytics.newFans), c: 'pink' }
          ].map((s, i) => (
            <div key={i} className={`ap-kpi ${s.c}`}>
              <div className="ap-kpi-head">
                <span>{s.icon}</span>
                <span className="ap-kpi-label">{s.label}</span>
              </div>
              <div className="ap-kpi-value">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* TOTALS */}
      {totals && (
        <div className="ap-card">
          <div className="ap-card-head">
            <span className="ap-card-title">📈 Interacțiuni totale</span>
            <span className="ap-card-sub">ultimele 10 postări</span>
          </div>
          <div className="ap-totals-grid">
            {[
              { icon: '👍', label: 'Like', value: totals.likes, color: '#1877F2' },
              { icon: '💬', label: 'Comentarii', value: totals.comments, color: '#10b981' },
              { icon: '🔄', label: 'Share', value: totals.shares, color: '#7c3aed' },
              { icon: '❤️', label: 'Reacții', value: totals.reactions, color: '#ef4444' }
            ].map((t, i) => (
              <div key={i} className="ap-total-item">
                <div className="ap-total-value" style={{ color: t.color }}>{fmt(t.value)}</div>
                <div className="ap-total-label">{t.icon} {t.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TOP POST */}
      {topPost && (
        <div className="ap-top">
          <div className="ap-top-head">
            <span className="ap-top-title">🏆 Top postare</span>
            <span className="ap-top-badge">best engagement</span>
          </div>
          <div className="ap-top-body">
            {topPost.picture && (
              <img src={topPost.picture} alt="" className="ap-top-img" />
            )}
            <div className="ap-top-content">
              <p className="ap-top-text">{topPost.message?.substring(0, 100)}...</p>
              <div className="ap-top-stats">
                <span>👍 <b>{topPost.likes}</b></span>
                <span>💬 <b>{topPost.comments}</b></span>
                <span>🔄 <b>{topPost.shares}</b></span>
              </div>
              <div className="ap-top-date">📅 {fmtDate(topPost.createdTime)}</div>
            </div>
          </div>
          <a href={topPost.url} target="_blank" rel="noopener noreferrer" className="ap-top-link">
            📘 Vezi pe Facebook ↗
          </a>
        </div>
      )}

      {/* POSTS */}
      <div className="ap-card">
        <div className="ap-card-head">
          <span className="ap-card-title">📋 Ultimele postări</span>
          <button onClick={loadAnalytics} className="ap-refresh">🔄</button>
        </div>

        {posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">Nu există postări</div>
          </div>
        ) : (
          <div className="ap-posts">
            {posts.map((post, idx) => (
              <div key={post.postId || idx} className="ap-post-row">
                <div className="ap-post-rank">{idx === 0 ? '🏆' : idx + 1}</div>
                {post.picture && <img src={post.picture} alt="" className="ap-post-thumb" />}
                <div className="ap-post-main">
                  <div className="ap-post-text">{post.message || 'Postare fără text'}</div>
                  <div className="ap-post-date">{fmtDate(post.createdTime)}</div>
                </div>
                <div className="ap-post-metrics">
                  <span className="ap-metric">👍 <b style={{ color: '#1877F2' }}>{post.likes}</b></span>
                  <span className="ap-metric">💬 <b style={{ color: '#10b981' }}>{post.comments}</b></span>
                  <span className="ap-metric">🔄 <b style={{ color: '#7c3aed' }}>{post.shares}</b></span>
                  <a href={post.url} target="_blank" rel="noopener noreferrer" className="ap-post-link">↗</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;