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
      setError(
        err.response?.data?.error ||
        'Nu am putut încărca analytics. Verifică conexiunea Facebook.'
      );
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await axios.put(
        `${API}/api/social/analytics/sync`,
        {},
        { headers: getHeaders() }
      );
      if (res.data.success) {
        alert(res.data.message);
        await loadAnalytics();
      }
    } catch (err) {
      alert('Eroare la sincronizare.');
    } finally {
      setSyncing(false);
    }
  };

  const formatNumber = (n) => {
    if (!n) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh',
        flexDirection: 'column', gap: '1rem'
      }}>
        <div style={{ fontSize: '3rem' }}>📊</div>
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)' }}>Se încarcă analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', maxWidth: 700 }}>
        <div className="analytics-error-box">
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
          <h3 style={{ color: '#ef4444', margin: '0 0 0.5rem' }}>Eroare Analytics</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: '0 0 1rem' }}>
            {error}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={loadAnalytics} className="btn btn-gold">🔄 Încearcă din nou</button>
            <button onClick={() => window.location.href = '/settings'} className="btn btn-outline">
              ⚙️ Verifică setările
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in analytics-page">

      {/* HERO */}
      <div className="analytics-hero">
        <div className="analytics-hero-bg" />
        <div className="analytics-hero-content">
          <div className="analytics-hero-left">
            <div className="analytics-kicker">✦ Facebook Insights ✦</div>
            <h1 className="analytics-title">Statistici care contează</h1>
            <p className="analytics-subtitle">
              Urmărește creșterea paginii, impactul postărilor și conținutul care atinge cel mai mult inimile oamenilor.
            </p>
          </div>

          <div className="analytics-hero-actions">
            <div className="analytics-period-switch">
              {[
                { key: 'day', label: 'Azi' },
                { key: 'week', label: '7 zile' },
                { key: 'month', label: '28 zile' }
              ].map(p => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={`analytics-period-btn ${period === p.key ? 'active' : ''}`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleSync}
              disabled={syncing}
              className="btn btn-outline btn-sm"
            >
              {syncing ? '⏳ Sincronizare...' : '🔄 Sincronizează'}
            </button>
          </div>
        </div>
      </div>

      {/* PAGE CARD */}
      {pageAnalytics && (
        <div className="analytics-page-card">
          {pageAnalytics.picture && (
            <img
              src={pageAnalytics.picture}
              alt="Page"
              className="analytics-page-avatar"
            />
          )}

          <div className="analytics-page-info">
            <div className="analytics-page-name">{pageAnalytics.pageName}</div>
            <div className="analytics-page-meta">
              📘 {formatNumber(pageAnalytics.fans)} fani • 👥 {formatNumber(pageAnalytics.followers)} urmăritori
            </div>
          </div>

          <div className="analytics-page-period">
            Ultimele {period === 'day' ? '24 ore' : period === 'week' ? '7 zile' : '28 zile'}
          </div>
        </div>
      )}

      {/* KPI GRID */}
      {pageAnalytics && (
        <div className="analytics-kpi-grid">
          {[
            {
              icon: '👥',
              label: 'Fani Pagină',
              value: formatNumber(pageAnalytics.fans),
              sub: 'total fani',
              colorClass: 'blue'
            },
            {
              icon: '👁️',
              label: 'Reach',
              value: formatNumber(pageAnalytics.reach),
              sub: 'persoane unice',
              colorClass: 'sky'
            },
            {
              icon: '💬',
              label: 'Vorbesc despre',
              value: formatNumber(pageAnalytics.talkingAbout),
              sub: 'această perioadă',
              colorClass: 'green'
            },
            {
              icon: '🖱️',
              label: 'Interacțiuni',
              value: formatNumber(pageAnalytics.engagements),
              sub: 'engagement total',
              colorClass: 'gold'
            },
            {
              icon: '👀',
              label: 'Vizite Pagină',
              value: formatNumber(pageAnalytics.pageViews),
              sub: 'în această perioadă',
              colorClass: 'red'
            },
            {
              icon: '❤️',
              label: 'Fani Noi',
              value: formatNumber(pageAnalytics.newFans),
              sub: 'în această perioadă',
              colorClass: 'pink'
            }
          ].map((s, idx) => (
            <div key={idx} className={`analytics-kpi-card ${s.colorClass}`}>
              <div className="analytics-kpi-top">
                <span className="analytics-kpi-icon">{s.icon}</span>
                <span className="analytics-kpi-label">{s.label}</span>
              </div>
              <div className="analytics-kpi-value">{s.value}</div>
              <div className="analytics-kpi-sub">{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* TOTAL INTERACȚIUNI */}
      {totals && (
        <div className="analytics-block">
          <div className="analytics-block-header">
            <div className="analytics-block-title">📈 Interacțiuni totale ale postărilor</div>
            <div className="analytics-block-sub">ultimele 10 postări</div>
          </div>

          <div className="analytics-mini-grid">
            {[
              { icon: '👍', label: 'Like-uri', value: totals.likes, color: '#1877F2' },
              { icon: '💬', label: 'Comentarii', value: totals.comments, color: '#10b981' },
              { icon: '🔄', label: 'Share-uri', value: totals.shares, color: '#7c3aed' },
              { icon: '❤️', label: 'Reacții', value: totals.reactions, color: '#ef4444' }
            ].map((t, i) => (
              <div key={i} className="analytics-mini-card">
                <div className="analytics-mini-value" style={{ color: t.color }}>
                  {formatNumber(t.value)}
                </div>
                <div className="analytics-mini-label">{t.icon} {t.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TOP POST */}
      {topPost && (
        <div className="analytics-top-post">
          <div className="analytics-top-header">
            <div className="analytics-top-title">🏆 Top postare</div>
            <div className="analytics-top-badge">cel mai mult engagement</div>
          </div>

          <div className="analytics-top-body">
            {topPost.picture && (
              <img src={topPost.picture} alt="" className="analytics-top-image" />
            )}

            <div className="analytics-top-content">
              <div className="analytics-top-text">„{topPost.message}...”</div>

              <div className="analytics-top-stats">
                <span>👍 <strong>{topPost.likes}</strong> like-uri</span>
                <span>💬 <strong>{topPost.comments}</strong> comentarii</span>
                <span>🔄 <strong>{topPost.shares}</strong> share-uri</span>
              </div>

              <div className="analytics-top-date">📅 {formatDate(topPost.createdTime)}</div>
            </div>

            <a
              href={topPost.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
            >
              📘 Vezi pe Facebook
            </a>
          </div>
        </div>
      )}

      {/* POST LIST */}
      <div className="analytics-block">
        <div className="analytics-block-header">
          <div className="analytics-block-title">📋 Ultimele postări</div>
          <button onClick={loadAnalytics} className="analytics-refresh-btn">🔄</button>
        </div>

        {posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">Nu există postări</div>
            <div className="empty-state-text">Momentan nu există date de afișat.</div>
          </div>
        ) : (
          <div className="analytics-posts-list">
            {posts.map((post, idx) => {
              const engagement = post.likes + post.comments + post.shares;

              return (
                <div key={post.postId} className="analytics-post-row">
                  <div className="analytics-post-rank">
                    {idx === 0 ? '🏆' : idx + 1}
                  </div>

                  {post.picture && (
                    <img src={post.picture} alt="" className="analytics-post-thumb" />
                  )}

                  <div className="analytics-post-main">
                    <div className="analytics-post-text">
                      {post.message || 'Postare fără text'}
                    </div>
                    <div className="analytics-post-date">
                      {formatDate(post.createdTime)}
                    </div>
                  </div>

                  <div className="analytics-post-stats">
                    <StatBadge icon="👍" value={post.likes} color="#1877F2" />
                    <StatBadge icon="💬" value={post.comments} color="#10b981" />
                    <StatBadge icon="🔄" value={post.shares} color="#7c3aed" />

                    <div className="analytics-post-total">
                      {engagement} total
                    </div>

                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="analytics-post-link"
                    >
                      ↗
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const StatBadge = ({ icon, value, color }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '0.82rem'
  }}>
    <span>{icon}</span>
    <span style={{ fontWeight: 700, color }}>{value}</span>
  </div>
);

export default AnalyticsPage;