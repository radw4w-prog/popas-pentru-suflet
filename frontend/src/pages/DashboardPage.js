import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalPosts: 0, scheduled: 0, published: 0, drafts: 0, failed: 0,
    totalVerses: 0, vtVerses: 0, ntVerses: 0, totalCarti: 0,
    totalDescriptions: 0
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [versetulZilei, setVersetulZilei] = useState(null);
  const [fbStatus, setFbStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [quoteIndex, setQuoteIndex] = useState(0);

  const quotes = [
    { text: "Căci atât de mult a iubit Dumnezeu lumea, că a dat pe singurul Lui Fiu...", ref: "Ioan 3:16" },
    { text: "Eu sunt Calea, Adevărul și Viața.", ref: "Ioan 14:6" },
    { text: "Toate lucrurile lucrează împreună spre binele celor ce iubesc pe Dumnezeu.", ref: "Romani 8:28" },
    { text: "Pot totul în Hristos, care mă întărește.", ref: "Filipeni 4:13" },
    { text: "Domnul este Păstorul meu: nu voi duce lipsă de nimic.", ref: "Psalmi 23:1" },
  ];

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bună dimineața');
    else if (hour < 18) setGreeting('Bună ziua');
    else setGreeting('Bună seara');

    setQuoteIndex(Math.floor(Math.random() * quotes.length));
    fetchAllData();

    const interval = setInterval(fetchAllData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const [versesR, postsR, scheduledR, versetR, fbR] = await Promise.all([
        axios.get(`${API}/api/verses/statistici`).catch(() => ({ data: {} })),
        axios.get(`${API}/api/posts?limit=5`).catch(() => ({ data: { posts: [] } })),
        axios.get(`${API}/api/social/scheduled`).catch(() => ({ data: [] })),
        axios.get(`${API}/api/verses/versetul-zilei`).catch(() => ({ data: null })),
        axios.get(`${API}/api/social/status`).catch(() => ({ data: { facebook: {} } })),
      ]);

      const posts = postsR.data?.posts || postsR.data || [];
      const allPosts = Array.isArray(posts) ? posts : [];

      setStats({
        totalPosts: allPosts.length,
        scheduled: Array.isArray(scheduledR.data) ? scheduledR.data.length : 0,
        published: allPosts.filter(p => p.status === 'published').length,
        drafts: allPosts.filter(p => p.status === 'draft').length,
        failed: allPosts.filter(p => p.status === 'failed').length,
        totalVerses: versesR.data?.totalVersete || 0,
        vtVerses: versesR.data?.testamentVechi || 0,
        ntVerses: versesR.data?.testamentNou || 0,
        totalCarti: versesR.data?.totalCarti || 0,
        totalDescriptions: 62
      });

      setRecentPosts(allPosts.slice(0, 5));
      setScheduledPosts(Array.isArray(scheduledR.data) ? scheduledR.data.slice(0, 3) : []);
      setVersetulZilei(versetR.data);
      setFbStatus(fbR.data?.facebook || null);
    } catch (e) {
      console.error('Dashboard fetch error:', e);
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
    if (diff <= 0) return 'Acum...';
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (h > 24) return `${Math.floor(h / 24)}z ${h % 24}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'pulse 2s infinite' }}>🕊️</div>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Se încarcă dashboard-ul...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">

      {/* ═══ HERO SECTION ═══ */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(124,58,237,0.05) 50%, rgba(59,130,246,0.03) 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem 2.5rem',
        marginBottom: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: 'linear-gradient(90deg, var(--gold-primary), var(--accent-purple), var(--accent-blue))'
        }} />

        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-50px', right: '-30px',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'rgba(212,175,55,0.05)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '-40px', right: '100px',
          width: '150px', height: '150px', borderRadius: '50%',
          background: 'rgba(124,58,237,0.04)', pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: '0.72rem', color: 'var(--gold-primary)',
            textTransform: 'uppercase', letterSpacing: '3px',
            fontWeight: 700, marginBottom: '0.5rem'
          }}>
            🕊️ Popas pentru Suflet
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.8rem', fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '0.5rem', lineHeight: 1.3
          }}>
            {greeting}, <span style={{ color: 'var(--gold-primary)' }}>Radu</span>! ✨
          </h1>

          <p style={{
            color: 'var(--text-secondary)', fontSize: '0.92rem',
            maxWidth: '500px', lineHeight: 1.6, marginBottom: '1.25rem'
          }}>
            Pregătește conținut inspirațional și publică-l automat pe Facebook.
            Ai <strong style={{ color: 'var(--gold-primary)' }}>
              {stats.totalVerses.toLocaleString()}
            </strong> versete la dispoziție.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-gold"
              onClick={() => window.location.href = '/generate'}
              style={{ fontSize: '0.9rem' }}
            >
              ✨ Generează Postare
            </button>
            <button
              className="btn btn-outline"
              onClick={() => window.location.href = '/verses'}
            >
              📖 Explorează Biblia
            </button>
          </div>
        </div>
      </div>

      {/* ═══ STATS GRID ═══ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {[
          {
            icon: '📖', label: 'Versete Biblie', value: stats.totalVerses.toLocaleString(),
            sub: `${stats.totalCarti} cărți`, color: 'var(--gold-primary)',
            bg: 'rgba(212,175,55,0.08)', border: 'rgba(212,175,55,0.2)'
          },
          {
            icon: '📅', label: 'Programate', value: stats.scheduled,
            sub: 'În așteptare', color: 'var(--accent-blue)',
            bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)'
          },
          {
            icon: '✅', label: 'Publicate', value: stats.published,
            sub: 'Pe Facebook', color: 'var(--accent-green)',
            bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)'
          },
          {
            icon: '📝', label: 'Descrieri', value: stats.totalDescriptions,
            sub: '12 teme', color: 'var(--accent-purple)',
            bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)'
          },
        ].map((s, idx) => (
          <div key={idx} style={{
            background: s.bg,
            border: `1px solid ${s.border}`,
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            display: 'flex', alignItems: 'center', gap: '1rem',
            transition: 'var(--transition)',
            cursor: 'default'
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
              background: `${s.bg}`,
              border: `1px solid ${s.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', flexShrink: 0
            }}>
              {s.icon}
            </div>
            <div>
              <div style={{
                fontSize: '0.68rem', color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '1px',
                fontWeight: 600, marginBottom: '0.2rem'
              }}>
                {s.label}
              </div>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.6rem', fontWeight: 700,
                color: s.color, lineHeight: 1
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                {s.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ CONTENT GRID ═══ */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem'
      }}>

        {/* ═══ COLOANA STÂNGA ═══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Versetul Zilei */}
          {versetulZilei && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.06), rgba(124,58,237,0.03))',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.5rem',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: 'linear-gradient(90deg, transparent, var(--gold-primary), transparent)'
              }} />
              <div style={{
                fontSize: '0.62rem', color: 'var(--gold-primary)',
                textTransform: 'uppercase', letterSpacing: '3px',
                fontWeight: 700, marginBottom: '0.75rem',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                ✝️ Versetul Zilei
                <span style={{
                  background: 'rgba(212,175,55,0.1)', padding: '2px 8px',
                  borderRadius: '20px', fontSize: '0.6rem'
                }}>
                  {new Date().toLocaleDateString('ro-RO', {
                    day: 'numeric', month: 'long'
                  })}
                </span>
              </div>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1rem', fontStyle: 'italic',
                color: 'var(--text-primary)', lineHeight: 1.8,
                marginBottom: '0.75rem'
              }}>
                "{versetulZilei.text?.substring(0, 200)}{versetulZilei.text?.length > 200 ? '...' : ''}"
              </div>
              <div style={{ color: 'var(--gold-primary)', fontWeight: 700, fontSize: '0.85rem' }}>
                — {versetulZilei.carte} {versetulZilei.capitol}:{versetulZilei.verset}
              </div>
            </div>
          )}

          {/* Postări Programate */}
          <div className="card" style={{ border: '1px solid var(--border-color)' }}>
            <div className="card-header">
              <div className="card-title">
                <span className="icon">📅</span>
                Programate
              </div>
              <span className="badge badge-blue">{stats.scheduled}</span>
            </div>

            {scheduledPosts.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '1.5rem',
                color: 'var(--text-muted)', fontSize: '0.85rem'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.4 }}>📅</div>
                Nicio postare programată
              </div>
            ) : (
              scheduledPosts.map((post, idx) => (
                <div key={post._id || idx} style={{
                  padding: '0.85rem',
                  borderBottom: idx < scheduledPosts.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.82rem', color: 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {post.content?.substring(0, 60)}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      🕐 {formatDate(post.scheduledDate)}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.72rem', color: 'var(--accent-green)',
                    fontWeight: 600, whiteSpace: 'nowrap'
                  }}>
                    {timeUntil(post.scheduledDate)}
                  </span>
                </div>
              ))
            )}

            <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
              <button className="btn btn-outline btn-sm btn-block"
                onClick={() => window.location.href = '/schedule'}>
                📅 Vezi toate programările
              </button>
            </div>
          </div>
        </div>

        {/* ═══ COLOANA DREAPTA ═══ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Status Facebook */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            display: 'flex', alignItems: 'center', gap: '1rem'
          }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: fbStatus?.valid
                ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: `2px solid ${fbStatus?.valid
                ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.3rem', flexShrink: 0
            }}>
              📘
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {fbStatus?.pageName || 'Facebook'}
              </div>
              <div style={{
                fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px',
                color: fbStatus?.valid ? 'var(--accent-green)' : 'var(--accent-red)'
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
                ⚙️ Setări
              </button>
            )}
          </div>

          {/* Acțiuni rapide */}
          <div className="card" style={{ border: '1px solid var(--border-color)' }}>
            <div className="card-header">
              <div className="card-title">
                <span className="icon">⚡</span>
                Acțiuni Rapide
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button className="btn btn-gold btn-block"
                onClick={() => window.location.href = '/generate'}
                style={{ justifyContent: 'flex-start', paddingLeft: '1.25rem' }}>
                ✨ Generează Postare Nouă
              </button>
              <button className="btn btn-outline btn-block"
                onClick={() => window.location.href = '/schedule'}
                style={{ justifyContent: 'flex-start', paddingLeft: '1.25rem' }}>
                📅 Vezi Programări
              </button>
              <button className="btn btn-secondary btn-block"
                onClick={() => window.location.href = '/verses'}
                style={{ justifyContent: 'flex-start', paddingLeft: '1.25rem' }}>
                📖 Explorează {stats.totalVerses.toLocaleString()} Versete
              </button>
              <button className="btn btn-secondary btn-block"
                onClick={() => window.location.href = '/settings'}
                style={{ justifyContent: 'flex-start', paddingLeft: '1.25rem' }}>
                ⚙️ Setări & Conectări
              </button>
            </div>
          </div>

          {/* Citat inspirational */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '0.92rem', fontStyle: 'italic',
              color: 'var(--text-secondary)', lineHeight: 1.7,
              marginBottom: '0.5rem'
            }}>
              "{quotes[quoteIndex].text}"
            </div>
            <div style={{
              color: 'var(--gold-primary)', fontWeight: 600,
              fontSize: '0.8rem'
            }}>
              — {quotes[quoteIndex].ref}
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
              textTransform: 'uppercase', letterSpacing: '1px',
              fontWeight: 600, marginBottom: '0.75rem'
            }}>
              📊 Biblia în numere
            </div>

            {[
              { label: 'Total versete', value: stats.totalVerses.toLocaleString(), color: 'var(--gold-primary)' },
              { label: 'Testament Vechi', value: stats.vtVerses.toLocaleString(), color: 'var(--accent-purple)' },
              { label: 'Testament Nou', value: stats.ntVerses.toLocaleString(), color: 'var(--accent-blue)' },
              { label: 'Cărți biblice', value: stats.totalCarti, color: 'var(--accent-green)' },
            ].map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.5rem 0',
                borderBottom: idx < 3 ? '1px solid var(--border-subtle)' : 'none'
              }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {item.label}
                </span>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.85rem', fontWeight: 700,
                  color: item.color
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;