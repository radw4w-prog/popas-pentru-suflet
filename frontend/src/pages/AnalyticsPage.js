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
        axios.get(
          `${API}/api/social/analytics/page?period=${period}`,
          headers
        ),
        axios.get(
          `${API}/api/social/analytics/posts?limit=10`,
          headers
        )
      ]);

      if (pageRes.data.success) {
        setPageAnalytics(pageRes.data.analytics);
      }

      if (postsRes.data.success) {
        setPosts(postsRes.data.posts || []);
        setTotals(postsRes.data.totals);
        setTopPost(postsRes.data.topPost);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Eroare la încărcarea analytics. Verifică conexiunea Facebook.'
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
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('ro-RO', {
      day: '2-digit', month: 'short', year: 'numeric'
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
        <p style={{ color: 'var(--text-muted)' }}>
          Se încarcă analytics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', maxWidth: 600 }}>
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '16px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
          <h3 style={{ color: '#ef4444', margin: '0 0 0.5rem' }}>
            Eroare Analytics
          </h3>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            margin: '0 0 1rem'
          }}>
            {error}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={loadAnalytics}
              className="btn btn-gold"
            >
              🔄 Încearcă din nou
            </button>
            <button
              onClick={() => window.location.href = '/settings'}
              className="btn btn-outline"
            >
              ⚙️ Verifică setările
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">

      {/* HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0
          }}>
            📊 Analytics Facebook
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            margin: '0.3rem 0 0'
          }}>
            Statistici postări și performanța paginii
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Period selector */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-input)',
            borderRadius: '10px',
            padding: '3px',
            border: '1px solid var(--border-color)'
          }}>
            {[
              { key: 'day', label: 'Azi' },
              { key: 'week', label: '7 zile' },
              { key: 'month', label: '28 zile' }
            ].map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: period === p.key
                    ? 'var(--bg-card)'
                    : 'transparent',
                  color: period === p.key
                    ? 'var(--gold-primary)'
                    : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: period === p.key ? 700 : 400,
                  transition: 'all 0.2s'
                }}
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

      {/* PAGE INFO */}
      {pageAnalytics && (
        <div style={{
          background: 'linear-gradient(135deg, #1877F2, #0C5DC7)',
          borderRadius: '20px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          flexWrap: 'wrap'
        }}>
          {pageAnalytics.picture && (
            <img
              src={pageAnalytics.picture}
              alt="Page"
              style={{
                width: 60, height: 60,
                borderRadius: '50%',
                border: '3px solid rgba(255,255,255,0.3)',
                flexShrink: 0
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            <div style={{
              fontWeight: 700, fontSize: '1.1rem',
              color: 'white', marginBottom: '0.2rem'
            }}>
              {pageAnalytics.pageName}
            </div>
            <div style={{
              fontSize: '0.82rem',
              color: 'rgba(255,255,255,0.75)'
            }}>
              📘 {formatNumber(pageAnalytics.fans)} fani
              {' '}•{' '}
              👥 {formatNumber(pageAnalytics.followers)} urmăritori
            </div>
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.6)',
            background: 'rgba(255,255,255,0.1)',
            padding: '0.35rem 0.75rem',
            borderRadius: '20px'
          }}>
            Ultimele {period === 'day' ? '24 ore' : period === 'week' ? '7 zile' : '28 zile'}
          </div>
        </div>
      )}

      {/* PAGE STATS */}
      {pageAnalytics && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.85rem',
          marginBottom: '1.5rem'
        }}>
          {[
  {
    icon: '👥',
    label: 'Fani Pagină',
    value: formatNumber(pageAnalytics.fans),
    sub: 'total fani',
    color: 'rgba(24,119,242,0.12)',
    border: 'rgba(24,119,242,0.25)',
    textColor: '#1877F2'
  },
  {
    icon: '👁️',
    label: 'Reach',
    value: formatNumber(pageAnalytics.reach),
    sub: 'persoane unice',
    color: 'rgba(59,130,246,0.12)',
    border: 'rgba(59,130,246,0.25)',
    textColor: '#3b82f6'
  },
  {
    icon: '💬',
    label: 'Vorbesc despre',
    value: formatNumber(pageAnalytics.talkingAbout),
    sub: 'această săptămână',
    color: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.25)',
    textColor: '#10b981'
  },
  {
    icon: '🖱️',
    label: 'Interacțiuni',
    value: formatNumber(pageAnalytics.engagements),
    sub: 'click-uri și reacții',
    color: 'rgba(212,175,55,0.12)',
    border: 'rgba(212,175,55,0.25)',
    textColor: 'var(--gold-primary)'
  },
  {
    icon: '👀',
    label: 'Vizite Pagină',
    value: formatNumber(pageAnalytics.pageViews),
    sub: 'în această perioadă',
    color: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.2)',
    textColor: '#ef4444'
  },
  {
    icon: '❤️',
    label: 'Fani Noi',
    value: formatNumber(pageAnalytics.newFans),
    sub: 'în această perioadă',
    color: 'rgba(236,72,153,0.08)',
    border: 'rgba(236,72,153,0.2)',
    textColor: '#ec4899'
  }
].map((s, idx) => (
  <div key={idx} style={{
    background: s.color,
    border: `1px solid ${s.border}`,
    borderRadius: '16px',
    padding: '1.1rem'
  }}>
    <div style={{
      display: 'flex', alignItems: 'center',
      gap: '0.5rem', marginBottom: '0.5rem'
    }}>
      <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
      <span style={{
        fontSize: '0.68rem',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        fontWeight: 600
      }}>
        {s.label}
      </span>
    </div>
    <div style={{
      fontFamily: "'Playfair Display', serif",
      fontSize: '1.65rem',
      fontWeight: 700,
      color: s.textColor,
      lineHeight: 1
    }}>
      {s.value}
    </div>
    <div style={{
      fontSize: '0.7rem',
      color: 'var(--text-muted)',
      marginTop: '0.2rem'
    }}>
      {s.sub}
    </div>
  </div>
))}
        </div>
      )}

      {/* TOTALE POSTĂRI */}
      {totals && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '1rem',
            fontSize: '0.95rem'
          }}>
            📈 Total interacțiuni postări (ultimele 10)
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem'
          }}>
            {[
              { icon: '👍', label: 'Like-uri', value: totals.likes, color: '#1877F2' },
              { icon: '💬', label: 'Comentarii', value: totals.comments, color: '#10b981' },
              { icon: '🔄', label: 'Share-uri', value: totals.shares, color: '#7c3aed' },
              { icon: '❤️', label: 'Reacții', value: totals.reactions, color: '#ef4444' }
            ].map((t, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: t.color,
                  fontFamily: "'Playfair Display', serif"
                }}>
                  {formatNumber(t.value)}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.2rem'
                }}>
                  {t.icon} {t.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TOP POST */}
      {topPost && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.02))',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: '16px',
          padding: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <span style={{ fontSize: '1.25rem' }}>🏆</span>
            <span style={{
              fontWeight: 700,
              color: 'var(--gold-primary)',
              fontSize: '0.95rem'
            }}>
              Top Postare
            </span>
            <span style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              background: 'var(--bg-input)',
              padding: '2px 8px',
              borderRadius: '10px',
              marginLeft: '0.25rem'
            }}>
              Cel mai mult engagement
            </span>
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
            flexWrap: 'wrap'
          }}>
            {topPost.picture && (
              <img
                src={topPost.picture}
                alt=""
                style={{
                  width: 80, height: 80,
                  objectFit: 'cover',
                  borderRadius: '10px',
                  flexShrink: 0
                }}
              />
            )}

            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{
                fontSize: '0.88rem',
                color: 'var(--text-primary)',
                lineHeight: 1.5,
                marginBottom: '0.75rem',
                fontStyle: 'italic'
              }}>
                "{topPost.message}..."
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                {[
                  { icon: '👍', value: topPost.likes, label: 'likes' },
                  { icon: '💬', value: topPost.comments, label: 'comentarii' },
                  { icon: '🔄', value: topPost.shares, label: 'share-uri' }
                ].map((s, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <span>{s.icon}</span>
                    <strong style={{ color: 'var(--gold-primary)' }}>
                      {s.value}
                    </strong>
                    <span style={{ fontSize: '0.75rem' }}>{s.label}</span>
                  </div>
                ))}
              </div>

              <div style={{
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                marginTop: '0.5rem'
              }}>
                📅 {formatDate(topPost.createdTime)}
              </div>
            </div>

            <a
              href={topPost.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              style={{ flexShrink: 0 }}
            >
              📘 Vezi pe Facebook
            </a>
          </div>
        </div>
      )}

      {/* LISTA POSTĂRI */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{
            fontWeight: 700,
            color: 'var(--text-primary)',
            fontSize: '0.95rem'
          }}>
            📋 Ultimele postări ({posts.length})
          </span>
          <button
            onClick={loadAnalytics}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            🔄
          </button>
        </div>

        {posts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--text-muted)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem', opacity: 0.4 }}>
              📭
            </div>
            <p>Nu există postări pe Facebook.</p>
          </div>
        ) : (
          posts.map((post, idx) => {
            const engagement = post.likes + post.comments + post.shares;

            return (
              <div
                key={post.postId}
                style={{
                  padding: '1rem 1.25rem',
                  borderBottom: idx < posts.length - 1
                    ? '1px solid var(--border-subtle)'
                    : 'none',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center'
                }}
              >
                {/* Rank */}
                <div style={{
                  width: 28, height: 28,
                  borderRadius: '50%',
                  background: idx === 0
                    ? 'rgba(212,175,55,0.15)'
                    : 'var(--bg-input)',
                  border: `1px solid ${idx === 0
                    ? 'rgba(212,175,55,0.3)'
                    : 'var(--border-subtle)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: idx === 0 ? '0.85rem' : '0.75rem',
                  fontWeight: 700,
                  color: idx === 0 ? 'var(--gold-primary)' : 'var(--text-muted)',
                  flexShrink: 0
                }}>
                  {idx === 0 ? '🏆' : idx + 1}
                </div>

                {/* Thumbnail */}
                {post.picture && (
                  <img
                    src={post.picture}
                    alt=""
                    style={{
                      width: 44, height: 44,
                      objectFit: 'cover',
                      borderRadius: '8px',
                      flexShrink: 0
                    }}
                  />
                )}

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginBottom: '0.25rem'
                  }}>
                    {post.message || 'Postare fără text'}
                  </div>
                  <div style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)'
                  }}>
                    {formatDate(post.createdTime)}
                  </div>
                </div>

                {/* Stats */}
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  flexShrink: 0,
                  alignItems: 'center'
                }}>
                  <StatBadge icon="👍" value={post.likes} color="#1877F2" />
                  <StatBadge icon="💬" value={post.comments} color="#10b981" />
                  <StatBadge icon="🔄" value={post.shares} color="#7c3aed" />

                  <div style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-input)',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    whiteSpace: 'nowrap'
                  }}>
                    {engagement} total
                  </div>

                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.75rem',
                      color: '#1877F2',
                      textDecoration: 'none'
                    }}
                  >
                    ↗
                  </a>
                </div>
              </div>
            );
          })
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
    <span style={{ fontWeight: 700, color }}>
      {value}
    </span>
  </div>
);

export default AnalyticsPage;