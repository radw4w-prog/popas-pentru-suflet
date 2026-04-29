import React, { useState, useEffect } from 'react';
import api from '../services/api';

const VersesPage = () => {
  const [versete, setVersete] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [testament, setTestament] = useState('all');
  const [carte, setCarte] = useState('all');
  const [carti, setCarti] = useState([]);
  const [stats, setStats] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [versetulZilei, setVersetulZilei] = useState(null);
  const [activeTab, setActiveTab] = useState('browse');
  const [copiat, setCopiat] = useState(null);

  const LIMIT = 24;

  // ═══ FETCH LA INIT ═══
  useEffect(() => {
    fetchStats();
    fetchCarti();
    fetchVersetulZilei();
  }, []);

  // ═══ FETCH CAND SE SCHIMBA FILTRELE ═══
  useEffect(() => {
    fetchVersete(1, true);
  }, [search, testament, carte]);

  const fetchStats = async () => {
    try {
      const r = await axios.get('/api/verses/statistici');
      setStats(r.data);
    } catch (e) {
      console.error('Stats error:', e);
    }
  };

  const fetchCarti = async () => {
    try {
      const r = await axios.get('/api/verses/carti');
      setCarti(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      console.error('Carti error:', e);
    }
  };

  const fetchVersetulZilei = async () => {
    try {
      const r = await axios.get('/api/verses/versetul-zilei');
      setVersetulZilei(r.data);
    } catch (e) {
      console.error('Versetul zilei error:', e);
    }
  };

  const fetchVersete = async (pageNr = 1, reset = false) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = new URLSearchParams({ page: pageNr, limit: LIMIT });
      if (search) params.append('search', search);
      if (testament !== 'all') params.append('testament', testament);
      if (carte !== 'all') params.append('carte', carte);

      const r = await axios.get(`/api/verses?${params}`);
      const data = r.data;
      const lista = data.versete || [];

      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setPage(pageNr);

      if (reset) setVersete(lista);
      else setVersete(prev => [...prev, ...lista]);

    } catch (e) {
      console.error('Fetch versete error:', e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = () => setSearch(searchInput);

  const handleReset = () => {
    setSearchInput('');
    setSearch('');
    setTestament('all');
    setCarte('all');
  };

  const getRandomVerse = async () => {
    try {
      const params = testament !== 'all' ? `?testament=${testament}` : '';
      const r = await axios.get(`/api/verses/random${params}`);
      if (r.data) {
        setVersete([r.data]);
        setTotal(1);
        setTotalPages(1);
      }
    } catch (e) {}
  };

  const copyVerse = (verse) => {
    const text = `"${verse.text}" — ${verse.referinta}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiat(verse._id);
      setTimeout(() => setCopiat(null), 2000);
    });
  };

  const cartiFiltered = testament === 'all'
    ? carti
    : carti.filter(c => c.testament === testament);

  // ═══ RENDER ═══
  return (
    <div className="animate-in">

      {/* VERSETUL ZILEI */}
      {versetulZilei && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(124,58,237,0.04))',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem 2rem',
          marginBottom: '1.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, transparent, var(--gold-primary), transparent)'
          }} />
          <div style={{
            fontSize: '0.65rem', color: 'var(--gold-primary)',
            textTransform: 'uppercase', letterSpacing: '3px',
            fontWeight: '700', marginBottom: '0.75rem',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            ✝️ Versetul Zilei
            <span style={{
              background: 'rgba(212,175,55,0.1)', padding: '2px 10px',
              borderRadius: '20px', fontSize: '0.65rem'
            }}>
              {new Date().toLocaleDateString('ro-RO', {
                weekday: 'long', day: 'numeric', month: 'long'
              })}
            </span>
          </div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.15rem', fontStyle: 'italic',
            color: 'var(--text-primary)', lineHeight: '1.8',
            marginBottom: '1rem'
          }}>
            "{versetulZilei.text}"
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--gold-primary)', fontWeight: '700', fontSize: '0.9rem' }}>
              — {versetulZilei.referinta}
              <span style={{
                marginLeft: '0.75rem', fontSize: '0.75rem',
                color: 'var(--text-muted)', fontWeight: '400'
              }}>
                {versetulZilei.carte}
              </span>
            </span>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => copyVerse(versetulZilei)}
            >
              {copiat === versetulZilei._id ? '✅ Copiat!' : '📋 Copiază'}
            </button>
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        {[
          { id: 'browse', label: '📖 Răsfoire' },
          { id: 'search', label: '🔍 Căutare' },
          { id: 'stats', label: '📊 Statistici' },
        ].map(t => (
          <button
            key={t.id}
            className={`tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ TAB BROWSE ═══ */}
      {activeTab === 'browse' && (
        <>
          {/* FILTRE */}
          <div className="card card-gold" style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr auto',
              gap: '1rem',
              alignItems: 'end'
            }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">⚡ Testament</label>
                <select
                  className="form-select"
                  value={testament}
                  onChange={e => {
                    setTestament(e.target.value);
                    setCarte('all');
                  }}
                >
                  <option value="all">
                    📚 Toate ({stats.totalVersete?.toLocaleString() || 0})
                  </option>
                  <option value="VT">
                    📜 Testament Vechi ({stats.testamentVechi?.toLocaleString() || 0})
                  </option>
                  <option value="NT">
                    ✝️ Testament Nou ({stats.testamentNou?.toLocaleString() || 0})
                  </option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">📖 Carte</label>
                <select
                  className="form-select"
                  value={carte}
                  onChange={e => setCarte(e.target.value)}
                >
                  <option value="all">Toate cărțile ({cartiFiltered.length})</option>
                  {cartiFiltered.map(c => (
                    <option key={c.carte} value={c.carte}>
                      {c.carte} ({c.totalVersete})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">🔍 Caută în text</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: dragoste, pace, Isus..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', paddingBottom: '0' }}>
                <button className="btn btn-gold" onClick={handleSearch} title="Caută">
                  🔍
                </button>
                <button className="btn btn-outline" onClick={getRandomVerse} title="Verset aleatoriu">
                  🎲
                </button>
                <button className="btn btn-secondary" onClick={handleReset} title="Resetează">
                  ✕
                </button>
              </div>
            </div>

            {/* INFO REZULTATE */}
            <div style={{
              marginTop: '0.75rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: 'var(--text-muted)'
            }}>
              <span>
                📊 <strong style={{ color: 'var(--gold-primary)' }}>
                  {total.toLocaleString()}
                </strong> versete
                {search && <span> pentru "<em>{search}</em>"</span>}
                {carte !== 'all' && <span> în <em>{carte}</em></span>}
                {testament !== 'all' && <span> • {testament === 'VT' ? 'Testament Vechi' : 'Testament Nou'}</span>}
              </span>
              <span>Pagina {page} din {totalPages.toLocaleString()}</span>
            </div>
          </div>

          {/* GRID VERSETE */}
          {loading ? (
            <div className="loading-spinner">
              <div>
                <div className="spinner"></div>
                <div className="loading-text">Se încarcă versetele...</div>
              </div>
            </div>
          ) : versete.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-title">Niciun verset găsit</div>
              <div className="empty-state-text">
                Încearcă alte filtre sau termeni de căutare
              </div>
              <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={handleReset}>
                Resetează filtrele
              </button>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                {versete.map((verse, idx) => (
                  <div
                    key={verse._id || idx}
                    className="card"
                    style={{
                      borderLeft: `3px solid ${
                        verse.testament === 'NT'
                          ? 'var(--accent-purple)'
                          : 'var(--gold-primary)'
                      }`,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}
                    onClick={() => copyVerse(verse)}
                    title="Click pentru copiere"
                  >
                    {/* Header */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        color: verse.testament === 'NT'
                          ? 'var(--accent-purple)'
                          : 'var(--gold-primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        background: verse.testament === 'NT'
                          ? 'rgba(124,58,237,0.08)'
                          : 'rgba(212,175,55,0.08)',
                        padding: '2px 8px',
                        borderRadius: '20px'
                      }}>
                        {verse.testament === 'NT' ? '✝️ NT' : '📜 VT'}
                      </span>
                      <span style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        fontFamily: "'JetBrains Mono', monospace"
                      }}>
                        {verse.referinta}
                      </span>
                    </div>

                    {/* Text */}
                    <div style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: '0.92rem',
                      fontStyle: 'italic',
                      color: 'var(--text-primary)',
                      lineHeight: '1.7',
                      flex: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 5,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      "{verse.text}"
                    </div>

                    {/* Footer */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid var(--border-subtle)'
                    }}>
                      <span style={{
                        color: verse.testament === 'NT'
                          ? 'var(--accent-purple)'
                          : 'var(--gold-primary)',
                        fontWeight: '600',
                        fontSize: '0.82rem'
                      }}>
                        {verse.carte}
                      </span>
                      <span style={{
                        fontSize: '0.72rem',
                        color: copiat === verse._id
                          ? 'var(--accent-green)'
                          : 'var(--text-muted)',
                        transition: 'color 0.3s'
                      }}>
                        {copiat === verse._id ? '✅ Copiat!' : '📋 Click'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* LOAD MORE */}
              {page < totalPages && (
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <button
                    className="btn btn-outline btn-lg"
                    onClick={() => fetchVersete(page + 1, false)}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                        Se încarcă...
                      </>
                    ) : (
                      `⬇️ Încarcă mai multe (${(total - versete.length).toLocaleString()} rămase)`
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ═══ TAB SEARCH ═══ */}
      {activeTab === 'search' && (
        <div className="card card-gold">
          <div className="card-header">
            <div className="card-title"><span className="icon">🔍</span> Căutare în Biblie</div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Caută orice cuvânt sau frază din Biblie..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (setSearch(searchInput), setActiveTab('browse'))}
              style={{ flex: 1, fontSize: '1rem' }}
              autoFocus
            />
            <button
              className="btn btn-gold btn-lg"
              onClick={() => { setSearch(searchInput); setActiveTab('browse'); }}
            >
              🔍 Caută
            </button>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div className="form-label" style={{ marginBottom: '0.75rem' }}>
              🏷️ Căutări populare:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {[
                'dragoste', 'credință', 'pace', 'bucurie', 'speranță',
                'rugăciune', 'iertare', 'putere', 'lumină', 'har',
                'mântuire', 'Dumnezeu', 'Isus', 'Duhul Sfânt', 'viață veșnică',
                'nu te teme', 'voi fi cu tine', 'toate lucrurile', 'ferice'
              ].map(tema => (
                <button
                  key={tema}
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setSearchInput(tema);
                    setSearch(tema);
                    setActiveTab('browse');
                  }}
                >
                  {tema}
                </button>
              ))}
            </div>
          </div>

          <div style={{
            padding: '1rem 1.25rem',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.8'
          }}>
            <strong style={{ color: 'var(--gold-primary)' }}>💡 Sfaturi de căutare:</strong><br />
            • Cuvinte cheie: <code style={{ color: 'var(--gold-primary)' }}>dragoste</code>,{' '}
            <code style={{ color: 'var(--gold-primary)' }}>pace</code><br />
            • Fraze: <code style={{ color: 'var(--gold-primary)' }}>Dumnezeu este bun</code><br />
            • Carte: <code style={{ color: 'var(--gold-primary)' }}>Psalmi</code>,{' '}
            <code style={{ color: 'var(--gold-primary)' }}>Ioan</code><br />
            • Referință: <code style={{ color: 'var(--gold-primary)' }}>Ioan 3</code>
          </div>
        </div>
      )}

      {/* ═══ TAB STATS ═══ */}
      {activeTab === 'stats' && (
        <>
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card gold">
              <div className="stat-icon">📖</div>
              <div className="stat-info">
                <div className="stat-label">Total Versete</div>
                <div className="stat-value">
                  {(stats.totalVersete || 31093).toLocaleString()}
                </div>
                <div className="stat-change positive">Biblia completă</div>
              </div>
            </div>
            <div className="stat-card purple">
              <div className="stat-icon">📜</div>
              <div className="stat-info">
                <div className="stat-label">Testament Vechi</div>
                <div className="stat-value">
                  {(stats.testamentVechi || 23145).toLocaleString()}
                </div>
                <div className="stat-change positive">39 cărți</div>
              </div>
            </div>
            <div className="stat-card blue">
              <div className="stat-icon">✝️</div>
              <div className="stat-info">
                <div className="stat-label">Testament Nou</div>
                <div className="stat-value">
                  {(stats.testamentNou || 7948).toLocaleString()}
                </div>
                <div className="stat-change positive">27 cărți</div>
              </div>
            </div>
            <div className="stat-card green">
              <div className="stat-icon">📚</div>
              <div className="stat-info">
                <div className="stat-label">Total Cărți</div>
                <div className="stat-value">{stats.totalCarti || 66}</div>
                <div className="stat-change positive">VT + NT</div>
              </div>
            </div>
          </div>

          <div className="grid-2">
            {['VT', 'NT'].map(test => (
              <div key={test} className="card">
                <div className="card-header">
                  <div className="card-title">
                    <span className="icon">{test === 'VT' ? '📜' : '✝️'}</span>
                    {test === 'VT' ? 'Testament Vechi' : 'Testament Nou'}
                  </div>
                  <span className={`badge ${test === 'VT' ? 'badge-gold' : 'badge-purple'}`}>
                    {test === 'VT' ? '39' : '27'} cărți
                  </span>
                </div>
                <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                  {carti.filter(c => c.testament === test).map((c, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.6rem 0.25rem',
                        borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                      onClick={() => {
                        setCarte(c.carte);
                        setTestament(test);
                        setActiveTab('browse');
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                          {c.carte}
                        </span>
                        <span style={{
                          fontSize: '0.72rem',
                          color: 'var(--text-muted)',
                          marginLeft: '0.5rem'
                        }}>
                          {c.totalCapitole} cap.
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`badge ${test === 'VT' ? 'badge-gold' : 'badge-purple'}`}
                          style={{ fontSize: '0.7rem' }}>
                          {c.totalVersete.toLocaleString()}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>→</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default VersesPage;