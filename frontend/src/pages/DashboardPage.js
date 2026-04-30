import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalPosts: 0, scheduled: 0, published: 0, drafts: 0, failed: 0,
    totalVerses: 0, vtVerses: 0, ntVerses: 0, totalCarti: 0,
    totalDescriptions: 4850
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [randomVerset, setRandomVerset] = useState(null);
  const [fbStatus, setFbStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [readingProgress, setReadingProgress] = useState(null);
const [readingSuggestion, setReadingSuggestion] = useState(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bună dimineața');
    else if (hour < 18) setGreeting('Bună ziua');
    else setGreeting('Bună seara');

    fetchAllData();
    fetchRandomVerset();

    // Clock update
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    // Data refresh la 60 secunde
    const dataInterval = setInterval(fetchAllData, 60000);

    // ✅ Verset aleatoriu la fiecare 30 minute
    const versetInterval = setInterval(fetchRandomVerset, 30 * 60 * 1000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(dataInterval);
      clearInterval(versetInterval);
    };
  }, []);

  const fetchRandomVerset = async () => {
    try {
      const r = await axios.get(`${API}/api/verses/random`);
      setRandomVerset(r.data);
    } catch (e) {
      console.error('Random verse error:', e);
    }
  };

  const fetchAllData = async () => {
    try {
      const [versesR, postsR, scheduledR, fbR] = await Promise.all([
        axios.get(`${API}/api/verses/statistici`).catch(() => ({ data: {} })),
        axios.get(`${API}/api/posts?limit=10`).catch(() => ({ data: { posts: [] } })),
        axios.get(`${API}/api/social/scheduled`).catch(() => ({ data: [] })),
        axios.get(`${API}/api/social/status`).catch(() => ({ data: { facebook: {} } })),
		// Adaugă în Promise.all:
axios.get(`${API}/api/reading/progress`).catch(() => ({ data: null })),
axios.get(`${API}/api/reading/suggest`).catch(() => ({ data: null })),
      ]);
	  setReadingProgress(readingR.data);
setReadingSuggestion(suggestR.data);
	  

      const posts = postsR.data?.posts || postsR.data || [];
      const allPosts = Array.isArray(posts) ? posts : [];

      setStats({
        totalPosts: allPosts.length,
        scheduled: Array.isArray(scheduledR.data) ? scheduledR.data.length : 0,
        published: allPosts.filter(p => p.status === 'published').length,
        drafts: allPosts.filter(p => p.status === 'draft').length,
        failed: allPosts.filter(p => p.status === 'failed').length,
        totalVerses: versesR.data?.totalVersete || 31093,
        vtVerses: versesR.data?.testamentVechi || 23145,
        ntVerses: versesR.data?.testamentNou || 7948,
        totalCarti: versesR.data?.totalCarti || 66,
        totalDescriptions: 4850
      });

      setRecentPosts(allPosts.slice(0, 5));
      setScheduledPosts(Array.isArray(scheduledR.data) ? scheduledR.data.slice(0, 3) : []);
      setFbStatus(fbR.data?.facebook || null);
    } catch (e) {
      console.error('Dashboard error:', e);
    } finally {
      setLoading(false);
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
    if (diff <= 0) return '⏳ Acum...';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (h > 24) return `${Math.floor(h / 24)}z ${h % 24}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  // ✅ Numele de pe Facebook
  const userName = fbStatus?.pageName || 'Utilizator';

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '70vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '4rem', marginBottom: '1.5rem',
            animation: 'pulse 2s infinite'
          }}>🕊️</div>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <div style={{
            color: 'var(--text-muted)', fontSize: '0.9rem',
            fontFamily: "'Playfair Display', serif"
          }}>
            Se pregătește dashboard-ul...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">

      {/* ═══════════════════════════════════════
           HERO SECTION
         ═══════════════════════════════════════ */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(10,10,15,0.95) 0%, rgba(26,26,46,0.98) 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '0',
        marginBottom: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `
            radial-gradient(circle at 20% 50%, rgba(212,175,55,0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(124,58,237,0.06) 0%, transparent 50%),
            radial-gradient(circle at 60% 80%, rgba(59,130,246,0.04) 0%, transparent 50%)
          `,
          pointerEvents: 'none'
        }} />

        {/* Gold accent line top */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent 10%, var(--gold-primary) 50%, transparent 90%)'
        }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '2rem 2.5rem' }}>
          {/* Top bar - ora + status */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              fontSize: '0.68rem', color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 600
            }}>
              {currentTime.toLocaleDateString('ro-RO', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
              })}
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.82rem', color: 'var(--gold-primary)',
              background: 'rgba(212,175,55,0.08)',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(212,175,55,0.15)'
            }}>
              {currentTime.toLocaleTimeString('ro-RO')}
            </div>
          </div>

          {/* Greeting + User info */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1.25rem',
            marginBottom: '1.25rem'
          }}>
            {/* Avatar/Logo */}
            {fbStatus?.picture ? (
              <img src={fbStatus.picture} alt="Page" style={{
                width: '56px', height: '56px', borderRadius: '50%',
                border: '2px solid var(--gold-primary)',
                boxShadow: '0 0 20px rgba(212,175,55,0.2)'
              }} />
            ) : (
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dark))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem',
                boxShadow: '0 0 20px rgba(212,175,55,0.2)'
              }}>
                🕊️
              </div>
            )}

            <div>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.65rem', fontWeight: 700,
                color: 'var(--text-primary)',
                margin: 0, lineHeight: 1.2
              }}>
                {greeting},{' '}
                <span style={{
                  background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-light))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {userName}
                </span>
              </h1>
              <div style={{
                fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                {fbStatus?.valid && (
                  <>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: 'var(--accent-green)',
                      boxShadow: '0 0 8px rgba(16,185,129,0.5)',
                      display: 'inline-block'
                    }} />
                    <span>Facebook conectat</span>
                    {fbStatus?.followers > 0 && (
                      <span>• {fbStatus.followers.toLocaleString()} urmăritori</span>
                    )}
                  </>
                )}
                {!fbStatus?.valid && (
                  <>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: 'var(--accent-red)',
                      display: 'inline-block'
                    }} />
                    <span>Facebook neconectat</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick stats inline */}
          <div style={{
            display: 'flex', gap: '2rem', marginBottom: '1.5rem',
            flexWrap: 'wrap'
          }}>
            {[
              { value: stats.totalVerses.toLocaleString(), label: 'versete', color: 'var(--gold-primary)' },
              { value: stats.published, label: 'publicate', color: 'var(--accent-green)' },
              { value: stats.scheduled, label: 'programate', color: 'var(--accent-blue)' },
              { value: stats.totalDescriptions.toLocaleString(), label: 'descrieri', color: 'var(--accent-purple)' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.5rem', fontWeight: 700,
                  color: s.color, lineHeight: 1
                }}>
                  {s.value}
                </div>
                <div style={{
                  fontSize: '0.68rem', color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '1px',
                  marginTop: '0.15rem'
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-gold"
              onClick={() => window.location.href = '/generate'}
              style={{
                padding: '0.75rem 1.5rem', fontSize: '0.9rem',
                boxShadow: '0 4px 20px rgba(212,175,55,0.3)'
              }}>
              ✨ Generează Postare
            </button>
            <button className="btn btn-outline"
              onClick={() => window.location.href = '/verses'}>
              📖 Explorează Biblia
            </button>
            <button className="btn btn-secondary"
              onClick={() => window.location.href = '/schedule'}>
              📅 Programări ({stats.scheduled})
            </button>
          </div>
        </div>

        {/* Bottom gradient line */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent 10%, rgba(212,175,55,0.3) 50%, transparent 90%)'
        }} />
      </div>

      {/* ═══════════════════════════════════════
           VERSET ALEATORIU
         ═══════════════════════════════════════ */}
      {randomVerset && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem 2rem',
          marginBottom: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          {/* Decorative */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
            background: 'linear-gradient(to bottom, var(--gold-primary), var(--accent-purple))'
          }} />

          {/* Icon */}
          <div style={{
            width: '50px', height: '50px', borderRadius: '50%', flexShrink: 0,
            background: 'rgba(212,175,55,0.08)',
            border: '1px solid rgba(212,175,55,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem'
          }}>
            📖
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              marginBottom: '0.5rem'
            }}>
              <span style={{
                fontSize: '0.6rem', color: 'var(--gold-primary)',
                textTransform: 'uppercase', letterSpacing: '2px',
                fontWeight: 700
              }}>
                Verset Aleatoriu
              </span>
              <span style={{
                fontSize: '0.6rem', color: 'var(--text-muted)',
                background: 'var(--bg-input)',
                padding: '1px 8px', borderRadius: '20px'
              }}>
                Se schimbă la fiecare 30 min
              </span>
            </div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1rem', fontStyle: 'italic',
              color: 'var(--text-primary)', lineHeight: 1.7,
              overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              "{randomVerset.text}"
            </div>
            <div style={{
              color: 'var(--gold-primary)', fontWeight: 700,
              fontSize: '0.82rem', marginTop: '0.35rem'
            }}>
              — {randomVerset.carte} {randomVerset.capitol}:{randomVerset.verset}
            </div>
          </div>
		  
		  
		  
		  {/* ═══ CITEȘTE BIBLIA ═══ */}
<div style={{
  background: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-xl)',
  padding: '1.5rem 2rem',
  marginBottom: '1.5rem',
  position: 'relative',
  overflow: 'hidden'
}}>
  <div style={{
    position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
    background: 'linear-gradient(90deg, var(--accent-green), var(--gold-primary), var(--accent-purple))'
  }} />

  <div style={{
    display: 'flex', alignItems: 'center', gap: '1.5rem',
    flexWrap: 'wrap'
  }}>
    {/* Icon */}
    <div style={{
      width: '60px', height: '60px', borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(212,175,55,0.1))',
      border: '2px solid rgba(16,185,129,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.5rem'
    }}>
      📖
    </div>

    {/* Motivare */}
    <div style={{ flex: 1, minWidth: '200px' }}>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '1.15rem', fontWeight: 700,
        color: 'var(--text-primary)', marginBottom: '0.35rem'
      }}>
        Citește Biblia zilnic 📖
      </div>
      <div style={{
        fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6
      }}>
        {readingSuggestion ? (
          <>
            Sugestie: <strong style={{ color: 'var(--gold-primary)' }}>
              {readingSuggestion.carte} {readingSuggestion.capitol}
            </strong> — {readingSuggestion.descriere}
          </>
        ) : (
          'Descoperă cuvântul lui Dumnezeu în fiecare zi!'
        )}
      </div>
    </div>

    {/* Progress */}
    <div style={{ minWidth: '180px', textAlign: 'right' }}>
      <div style={{
        fontSize: '1.8rem', fontWeight: 700,
        fontFamily: "'Playfair Display', serif",
        color: 'var(--accent-green)', lineHeight: 1
      }}>
        {readingProgress?.procent || 0}%
      </div>
      <div style={{
        fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem'
      }}>
        {readingProgress?.capitoleCitite || 0} / 1.189 capitole
      </div>

      {/* Progress bar */}
      <div style={{
        height: '8px', borderRadius: '4px',
        background: 'var(--bg-input)', marginTop: '0.5rem',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%', borderRadius: '4px',
          width: `${readingProgress?.procent || 0}%`,
          background: 'linear-gradient(90deg, var(--accent-green), var(--gold-primary))',
          transition: 'width 1.5s ease',
          minWidth: readingProgress?.procent > 0 ? '4px' : '0'
        }} />
      </div>
    </div>

    {/* CTA */}
    <button className="btn btn-outline" style={{ flexShrink: 0 }}
      onClick={() => window.location.href = '/verses'}>
      📖 Citește acum
    </button>
  </div>
</div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0 }}>
            <button className="btn btn-outline btn-sm" onClick={fetchRandomVerset}
              title="Alt verset">
              🎲
            </button>
            <button className="btn btn-secondary btn-sm"
              onClick={() => {
                navigator.clipboard.writeText(
                  `"${randomVerset.text}" — ${randomVerset.carte} ${randomVerset.capitol}:${randomVerset.verset}`
                );
              }}
              title="Copiază">
              📋
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
           MAIN GRID
         ═══════════════════════════════════════ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '1.5rem'
      }}>

        {/* ═══ COLOANA STÂNGA ═══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.85rem'
          }}>
            {[
              {
                icon: '📖', label: 'Versete', value: stats.totalVerses.toLocaleString(),
                sub: `${stats.totalCarti} cărți`,
                gradient: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.03))',
                border: 'rgba(212,175,55,0.2)', color: 'var(--gold-primary)'
              },
              {
                icon: '✅', label: 'Publicate', value: stats.published,
                sub: 'Pe Facebook',
                gradient: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.03))',
                border: 'rgba(16,185,129,0.2)', color: 'var(--accent-green)'
              },
              {
                icon: '📅', label: 'Programate', value: stats.scheduled,
                sub: 'În așteptare',
                gradient: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.03))',
                border: 'rgba(59,130,246,0.2)', color: 'var(--accent-blue)'
              },
              {
                icon: '📝', label: 'Descrieri', value: stats.totalDescriptions.toLocaleString(),
                sub: '12 teme',
                gradient: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(124,58,237,0.03))',
                border: 'rgba(124,58,237,0.2)', color: 'var(--accent-purple)'
              },
            ].map((s, idx) => (
              <div key={idx} style={{
                background: s.gradient,
                border: `1px solid ${s.border}`,
                borderRadius: 'var(--radius-lg)',
                padding: '1.15rem',
                transition: 'var(--transition)',
                cursor: 'default'
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
                  <span style={{
                    fontSize: '0.68rem', color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600
                  }}>
                    {s.label}
                  </span>
                </div>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.65rem', fontWeight: 700,
                  color: s.color, lineHeight: 1
                }}>
                  {s.value}
                </div>
                <div style={{
                  fontSize: '0.7rem', color: 'var(--text-muted)',
                  marginTop: '0.2rem'
                }}>
                  {s.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Programări */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1rem 1.25rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: '1px solid var(--border-subtle)'
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)'
              }}>
                📅 Programate
              </div>
              <span className="badge badge-blue">{stats.scheduled}</span>
            </div>

            {scheduledPosts.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '2rem 1rem',
                color: 'var(--text-muted)', fontSize: '0.85rem'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', opacity: 0.3 }}>📅</div>
                Nicio postare programată
                <br />
                <button className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem' }}
                  onClick={() => window.location.href = '/generate'}>
                  ✨ Creează una
                </button>
              </div>
            ) : (
              <div>
                {scheduledPosts.map((post, idx) => (
                  <div key={post._id || idx} style={{
                    padding: '0.85rem 1.25rem',
                    borderBottom: idx < scheduledPosts.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem'
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.82rem', color: 'var(--text-primary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {post.content?.substring(0, 55)}...
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        🕐 {formatDate(post.scheduledDate)}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.7rem', color: 'var(--accent-green)',
                      fontWeight: 600, whiteSpace: 'nowrap',
                      background: 'rgba(16,185,129,0.08)',
                      padding: '2px 8px', borderRadius: '20px'
                    }}>
                      {timeUntil(post.scheduledDate)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div style={{
              padding: '0.75rem 1.25rem',
              borderTop: '1px solid var(--border-subtle)',
              textAlign: 'center'
            }}>
              <button className="btn btn-secondary btn-sm"
                onClick={() => window.location.href = '/schedule'}
                style={{ fontSize: '0.78rem' }}>
                Vezi toate programările →
              </button>
            </div>
          </div>

          {/* Biblia stats */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem'
          }}>
            <div style={{
              fontSize: '0.68rem', color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '1.5px',
              fontWeight: 600, marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              📊 Biblia în numere
            </div>

            {/* Progress bars */}
            {[
              {
                label: 'Testament Vechi', value: stats.vtVerses,
                total: stats.totalVerses,
                color: 'var(--gold-primary)', bg: 'rgba(212,175,55,0.15)'
              },
              {
                label: 'Testament Nou', value: stats.ntVerses,
                total: stats.totalVerses,
                color: 'var(--accent-purple)', bg: 'rgba(124,58,237,0.15)'
              },
            ].map((item, idx) => (
              <div key={idx} style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  marginBottom: '0.35rem'
                }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {item.label}
                  </span>
                  <span style={{
                    fontSize: '0.8rem', color: item.color, fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace"
                  }}>
                    {item.value.toLocaleString()}
                  </span>
                </div>
                <div style={{
                  height: '6px', borderRadius: '3px',
                  background: 'var(--bg-input)', overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%', borderRadius: '3px',
                    width: `${(item.value / item.total) * 100}%`,
                    background: `linear-gradient(90deg, ${item.color}, ${item.bg})`,
                    transition: 'width 1s ease'
                  }} />
                </div>
              </div>
            ))}

            <div style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '0.65rem 0', borderTop: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total cărți</span>
              <span style={{
                fontSize: '0.85rem', color: 'var(--accent-green)', fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace"
              }}>
                {stats.totalCarti}
              </span>
            </div>
          </div>
        </div>

        {/* ═══ COLOANA DREAPTA ═══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Facebook Status Card */}
          <div style={{
            background: 'var(--bg-card)',
            border: `1px solid ${fbStatus?.valid ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            display: 'flex', alignItems: 'center', gap: '1rem'
          }}>
            {fbStatus?.picture ? (
              <img src={fbStatus.picture} alt="FB" style={{
                width: '48px', height: '48px', borderRadius: '50%',
                border: `2px solid ${fbStatus?.valid ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                flexShrink: 0
              }} />
            ) : (
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: fbStatus?.valid ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', flexShrink: 0
              }}>📘</div>
            )}

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {fbStatus?.pageName || 'Facebook'}
              </div>
              <div style={{
                fontSize: '0.78rem',
                color: fbStatus?.valid ? 'var(--accent-green)' : 'var(--accent-red)',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: fbStatus?.valid ? 'var(--accent-green)' : 'var(--accent-red)',
                  boxShadow: fbStatus?.valid ? '0 0 8px rgba(16,185,129,0.4)' : 'none'
                }} />
                {fbStatus?.valid ? 'Conectat' : 'Neconectat'}
                {fbStatus?.followers > 0 && (
                  <span style={{ color: 'var(--text-muted)' }}>
                    • {fbStatus.followers.toLocaleString()} urmăritori
                  </span>
                )}
              </div>
            </div>

            {!fbStatus?.valid && (
              <button className="btn btn-outline btn-sm"
                onClick={() => window.location.href = '/settings'}>
                Conectează
              </button>
            )}
          </div>

          {/* Acțiuni rapide */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              ⚡ Acțiuni Rapide
            </div>

            <div style={{ padding: '0.85rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'Generează Postare', icon: '✨', href: '/generate', cls: 'btn-gold' },
                { label: 'Programări', icon: '📅', href: '/schedule', cls: 'btn-outline' },
                { label: `Explorează ${stats.totalVerses.toLocaleString()} Versete`, icon: '📖', href: '/verses', cls: 'btn-secondary' },
                { label: 'Setări', icon: '⚙️', href: '/settings', cls: 'btn-secondary' },
              ].map((a, i) => (
                <button key={i} className={`btn ${a.cls} btn-block`}
                  onClick={() => window.location.href = a.href}
                  style={{
                    justifyContent: 'flex-start', paddingLeft: '1.25rem',
                    fontSize: '0.85rem'
                  }}>
                  {a.icon} {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Activitate recentă */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border-subtle)',
              fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📋 Activitate Recentă
              </span>
              <span className="badge badge-gold">{stats.totalPosts}</span>
            </div>

            {recentPosts.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '1.5rem',
                color: 'var(--text-muted)', fontSize: '0.85rem'
              }}>
                Nicio activitate încă
              </div>
            ) : (
              recentPosts.slice(0, 4).map((post, idx) => (
                <div key={post._id || idx} style={{
                  padding: '0.75rem 1.25rem',
                  borderBottom: idx < Math.min(recentPosts.length, 4) - 1
                    ? '1px solid var(--border-subtle)' : 'none',
                  display: 'flex', alignItems: 'center', gap: '0.75rem'
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: post.status === 'published' ? 'var(--accent-green)'
                      : post.status === 'scheduled' ? 'var(--accent-blue)'
                      : post.status === 'failed' ? 'var(--accent-red)'
                      : 'var(--text-muted)'
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.8rem', color: 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {post.content?.substring(0, 50)}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                      {formatDate(post.createdAt || post.publishedAt)}
                    </div>
                  </div>
                  <span className={`badge ${
                    post.status === 'published' ? 'badge-green'
                    : post.status === 'scheduled' ? 'badge-blue'
                    : post.status === 'failed' ? 'badge-red'
                    : 'badge-gold'
                  }`} style={{ fontSize: '0.65rem' }}>
                    {post.status}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Footer info */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '0.72rem', color: 'var(--text-muted)',
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.5px'
            }}>
              🕊️ Popas pentru Suflet v1.0
              <br />
              <span style={{ fontSize: '0.65rem' }}>
                Backend: Render • Frontend: Netlify • DB: MongoDB Atlas
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;