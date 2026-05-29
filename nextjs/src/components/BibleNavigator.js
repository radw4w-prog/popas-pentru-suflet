'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ── Stiluri inline pentru popup referință ─────────────────────
const popupStyle = {
  position: 'absolute',
  zIndex: 1000,
  background: 'var(--bg-elevated, #16213e)',
  border: '1px solid var(--gold-primary, #d4af37)',
  borderRadius: '12px',
  padding: '0.85rem 1rem',
  boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
  maxWidth: '320px',
  minWidth: '220px',
  animation: 'fadeInGPU 0.15s ease',
};

const BibleNavigator = ({ onSelectCapitol, onClose }) => {
  const [step, setStep] = useState('carti');
  const [ordineBiblie, setOrdineBiblie] = useState([]);
  const [cartiData, setCartiData] = useState([]);
  const [selectedCarte, setSelectedCarte] = useState(null);
  const [selectedCapitol, setSelectedCapitol] = useState(null);
  const [versete, setVersete] = useState([]);
  const [loadingVersete, setLoadingVersete] = useState(false);
  const [redLetter, setRedLetter] = useState({});
  const [copiat, setCopiat] = useState(null);
  const [testamentFilter, setTestamentFilter] = useState('all');
  const [showActions, setShowActions] = useState(null);
  const [bookmarksMap, setBookmarksMap] = useState({});
  const [referinteMap, setReferinteMap] = useState({});

  // ── Popup referință ───────────────────────────────────────────
  const [refPopup, setRefPopup] = useState(null);
  // refPopup = { referinta, text, loading, rect } — rect = poziția butonului

  const { isAuthenticated } = useAuth();

  useEffect(() => { fetchData(); }, []);

  // Închide popup la click în afară
  useEffect(() => {
    if (!refPopup) return;
    const handleClick = (e) => {
      if (!e.target.closest('.ref-popup') && !e.target.closest('.ref-badge')) {
        setRefPopup(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [refPopup]);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchData = async () => {
    try {
      const [ordineR, cartiR, rlR] = await Promise.all([
        api.get('/api/verses/ordine-biblie'),
        api.get('/api/verses/carti'),
        api.get('/api/verses/red-letter')
      ]);
      if (ordineR.data?.success) setOrdineBiblie(ordineR.data.ordine);
      if (Array.isArray(cartiR.data)) setCartiData(cartiR.data);
      if (rlR.data?.success) setRedLetter(rlR.data.redLetter || {});
    } catch (e) { console.error(e); }
  };

  const fetchReferinte = useCallback(async (carte, capitol) => {
    try {
      const r = await fetch(
        `${API_URL}/api/cross-references/capitol?carte=${encodeURIComponent(carte)}&capitol=${capitol}`
      );
      const data = await r.json();
      if (data.success) setReferinteMap(data.referinteMap || {});
    } catch (e) { console.error('CrossRef error:', e); }
  }, []);

  // ── Click pe referință → popup lângă buton ───────────────────
  const handleRefClick = async (ref, buttonEl) => {
    // Dacă e deja deschis același popup → închide
    if (refPopup?.referinta === ref.referinta) {
      setRefPopup(null);
      return;
    }

    // Calculează poziția butonului
    const rect = buttonEl.getBoundingClientRect();
    const containerRect = buttonEl.closest('.bible-nav-body')?.getBoundingClientRect();

    setRefPopup({
      referinta: ref.referinta,
      text: null,
      loading: true,
      top: rect.bottom - (containerRect?.top || 0) + 8,
      left: Math.min(rect.left - (containerRect?.left || 0), (containerRect?.width || 400) - 330),
    });

    try {
      const r = await fetch(
        `${API_URL}/api/cross-references/verset?carte=${encodeURIComponent(ref.carte)}&capitol=${ref.capitol}&verset=${ref.versetStart}`
      );
      const data = await r.json();
      setRefPopup(prev => prev?.referinta === ref.referinta ? {
        ...prev,
        text: data.success ? data.verset.text : 'Versetul nu a fost găsit.',
        loading: false
      } : prev);
    } catch {
      setRefPopup(prev => prev?.referinta === ref.referinta ? {
        ...prev, text: 'Eroare la încărcare.', loading: false
      } : prev);
    }
  };

  const fetchBookmarksForCapitol = async (carte, capitol) => {
    if (!isAuthenticated) return;
    try {
      const r = await api.get(
        `/api/bookmarks/capitol?carte=${encodeURIComponent(carte)}&capitol=${capitol}`,
        { headers: getHeaders() }
      );
      if (r.data?.success) setBookmarksMap(r.data.bookmarks || {});
    } catch (e) {}
  };

  const handleBookmark = async (verse, tip = 'bookmark', culoare = 'gold') => {
    if (!isAuthenticated) return;
    try {
      const existing = bookmarksMap[verse.verset];
      if (existing && existing.tip === tip) {
        await api.delete(`/api/bookmarks/${existing._id}`, { headers: getHeaders() });
        const newMap = { ...bookmarksMap };
        delete newMap[verse.verset];
        setBookmarksMap(newMap);
      } else {
        const r = await api.post('/api/bookmarks', {
          carte: verse.carte, capitol: verse.capitol,
          verset: verse.verset, text: verse.text,
          referinta: `${verse.carte} ${verse.capitol}:${verse.verset}`,
          testament: verse.testament, tip, culoare
        }, { headers: getHeaders() });
        if (r.data?.success) {
          setBookmarksMap(prev => ({ ...prev, [verse.verset]: r.data.bookmark }));
        }
      }
    } catch (e) { console.error('Bookmark error:', e); }
    setShowActions(null);
  };

  const getCartiSorted = () => {
    const filtered = testamentFilter === 'all'
      ? ordineBiblie
      : ordineBiblie.filter(o => o.test === testamentFilter);
    return filtered.map(o => {
      const data = cartiData.find(c => c.carte === o.carte);
      return { ...o, totalCapitole: data?.totalCapitole || 0, totalVersete: data?.totalVersete || 0 };
    });
  };

  const handleSelectCarte = (carte) => {
    setSelectedCarte(carte);
    setSelectedCapitol(null);
    setVersete([]);
    setStep('capitole');
    setRefPopup(null);
  };

  const handleSelectCapitol = async (capitol) => {
    setSelectedCapitol(capitol);
    setStep('versete');
    setLoadingVersete(true);
    setReferinteMap({});
    setRefPopup(null);

    try {
      const r = await api.get(
        `/api/verses?carte=${encodeURIComponent(selectedCarte.carte)}&capitol=${capitol}&limit=500`
      );
      setVersete(r.data?.versete || []);
      await Promise.all([
        fetchBookmarksForCapitol(selectedCarte.carte, capitol),
        fetchReferinte(selectedCarte.carte, capitol),
      ]);
    } catch (e) { console.error(e); }
    finally { setLoadingVersete(false); }

    if (onSelectCapitol) onSelectCapitol(selectedCarte.carte, capitol);
  };

  const handleBack = () => {
    if (step === 'versete') {
      setStep('capitole'); setSelectedCapitol(null); setVersete([]);
      setReferinteMap({}); setRefPopup(null);
    } else if (step === 'capitole') {
      setStep('carti'); setSelectedCarte(null);
    }
  };

  const isRedLetter = (verse) => {
    const carteRL = redLetter[verse.carte];
    if (!carteRL) return false;
    const capRL = carteRL[verse.capitol];
    if (!capRL) return false;
    return capRL.includes(verse.verset);
  };

  const copyVerse = (verse) => {
    const ref = `${verse.carte} ${verse.capitol}:${verse.verset}`;
    navigator.clipboard.writeText(`„${verse.text}" — ${ref}`).then(() => {
      setCopiat(verse._id);
      setTimeout(() => setCopiat(null), 1500);
    });
  };

  // Culoare highlight bookmark
  const getHighlightColor = (bm) => {
    if (!bm || bm.tip !== 'highlight') return 'transparent';
    const colors = {
      gold: 'rgba(212,175,55,0.2)',
      red: 'rgba(220,38,38,0.15)',
      green: 'rgba(16,185,129,0.15)',
      blue: 'rgba(59,130,246,0.15)',
      purple: 'rgba(124,58,237,0.15)',
    };
    return colors[bm.culoare] || 'transparent';
  };

  const carti = getCartiSorted();

  return (
    <div className="bible-nav" style={{ position: 'relative' }}>

      {/* ═══ HEADER ═══ */}
      <div className="bible-nav-header">
        <div className="bible-nav-header-left">
          {step !== 'carti' && (
            <button className="bible-nav-back" onClick={handleBack}>← Înapoi</button>
          )}
          <div className="bible-nav-breadcrumb">
            <span
              className={`bible-bc-item ${step === 'carti' ? 'active' : 'clickable'}`}
              onClick={() => { setStep('carti'); setSelectedCarte(null); setSelectedCapitol(null); setVersete([]); setRefPopup(null); }}
            >
              📖 Biblia
            </span>
            {selectedCarte && (
              <>
                <span className="bible-bc-sep">›</span>
                <span
                  className={`bible-bc-item ${step === 'capitole' ? 'active' : 'clickable'}`}
                  onClick={() => { setStep('capitole'); setSelectedCapitol(null); setVersete([]); setRefPopup(null); }}
                >
                  {selectedCarte.ab}
                </span>
              </>
            )}
            {selectedCapitol && (
              <>
                <span className="bible-bc-sep">›</span>
                <span className="bible-bc-item active">Cap. {selectedCapitol}</span>
              </>
            )}
          </div>
        </div>
        {onClose && <button className="bible-nav-close" onClick={onClose}>✕</button>}
      </div>

      {/* ═══ BODY ═══ */}
      <div className="bible-nav-body" style={{ position: 'relative' }}>

        {/* ── POPUP REFERINȚĂ (inline, lângă buton) ── */}
        {refPopup && (
          <div
            className="ref-popup"
            style={{
              ...popupStyle,
              top: refPopup.top,
              left: Math.max(8, refPopup.left),
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  color: 'var(--gold-primary, #d4af37)',
                  fontSize: '0.72rem', fontWeight: 700,
                  letterSpacing: '0.5px', marginBottom: '0.5rem',
                  textTransform: 'uppercase'
                }}>
                  ✦ {refPopup.referinta}
                </div>
                {refPopup.loading ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Se încarcă...</div>
                ) : (
                  <div style={{
                    color: 'var(--text-primary)',
                    fontFamily: 'Lora, Georgia, serif',
                    fontSize: '0.92rem', lineHeight: 1.7,
                    fontStyle: 'italic'
                  }}>
                    „{refPopup.text}"
                  </div>
                )}
              </div>
              <button
                onClick={() => setRefPopup(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}
              >✕</button>
            </div>
          </div>
        )}

        {/* ═══ STEP 1: CĂRȚI ═══ */}
        {step === 'carti' && (
          <div>
            <div className="bible-test-filter">
              {[{ key: 'all', label: '📚 Toate' }, { key: 'VT', label: '📜 VT' }, { key: 'NT', label: '✝️ NT' }].map(f => (
                <button key={f.key} className={`bible-test-btn ${testamentFilter === f.key ? 'active' : ''}`} onClick={() => setTestamentFilter(f.key)}>
                  {f.label}
                </button>
              ))}
            </div>
            {(testamentFilter === 'all' || testamentFilter === 'VT') && (
              <div className="bible-section">
                <div className="bible-section-title">📜 Vechiul Testament</div>
                <div className="bible-books-grid">
                  {carti.filter(c => c.test === 'VT').map(carte => (
                    <button key={carte.carte} className="bible-book-btn" onClick={() => handleSelectCarte(carte)} title={carte.carte}>
                      <span className="bible-book-ab">{carte.ab}</span>
                      <span className="bible-book-cap">{carte.totalCapitole}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {(testamentFilter === 'all' || testamentFilter === 'NT') && (
              <div className="bible-section">
                <div className="bible-section-title">✝️ Noul Testament</div>
                <div className="bible-books-grid">
                  {carti.filter(c => c.test === 'NT').map(carte => (
                    <button key={carte.carte} className="bible-book-btn nt" onClick={() => handleSelectCarte(carte)} title={carte.carte}>
                      <span className="bible-book-ab">{carte.ab}</span>
                      <span className="bible-book-cap">{carte.totalCapitole}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ STEP 2: CAPITOLE ═══ */}
        {step === 'capitole' && selectedCarte && (
          <div>
            <div className="bible-carte-info">
              <div className="bible-carte-name">{selectedCarte.carte}</div>
              <div className="bible-carte-meta">
                {selectedCarte.test === 'VT' ? '📜 Vechiul Testament' : '✝️ Noul Testament'}
                {' '}• {selectedCarte.totalCapitole} capitole • {selectedCarte.totalVersete} versete
              </div>
            </div>
            <div className="bible-chapters-grid">
              {Array.from({ length: selectedCarte.totalCapitole }, (_, i) => i + 1).map(cap => (
                <button key={cap} className="bible-chapter-btn" onClick={() => handleSelectCapitol(cap)}>{cap}</button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ STEP 3: VERSETE — text continuu ca eBiblia ═══ */}
        {step === 'versete' && selectedCarte && selectedCapitol && (
          <div>
            {/* Titlu capitol */}
            <div className="bible-carte-info">
              <div className="bible-carte-name">{selectedCarte.carte} {selectedCapitol}</div>
              <div className="bible-carte-meta">
                {versete.length} versete • {selectedCarte.test === 'VT' ? '📜 VT' : '✝️ NT'}
              </div>
            </div>

            {loadingVersete ? (
              <div className="loading-spinner"><div className="spinner" /></div>
            ) : (
              <>
                {/* ── TEXT CONTINUU (stil eBiblia) ── */}
                <div style={{
                  fontFamily: 'Lora, Georgia, serif',
                  fontSize: '1rem',
                  lineHeight: 1.9,
                  color: 'var(--text-primary)',
                  padding: '0.5rem 0.25rem',
                }}>
                  {versete.map((verse) => {
                    const rl = isRedLetter(verse);
                    const bm = bookmarksMap[verse.verset];
                    const refs = referinteMap[verse.verset] || [];
                    const actionsOpen = showActions === verse.verset;

                    return (
                      <span key={verse._id} style={{ position: 'relative' }}>
                        {/* Număr verset — suprascrip mic */}
                        <sup
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            color: 'var(--gold-primary, #d4af37)',
                            marginRight: '0.2rem',
                            marginLeft: '0.3rem',
                            cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif',
                            verticalAlign: 'super',
                            lineHeight: 0,
                          }}
                          title={`${selectedCarte.carte} ${selectedCapitol}:${verse.verset}`}
                        >
                          {verse.verset}
                        </sup>

                        {/* Text verset */}
                        <span
                          style={{
                            color: rl ? '#dc2626' : 'var(--text-primary)',
                            background: getHighlightColor(bm),
                            borderRadius: bm?.tip === 'highlight' ? '3px' : 0,
                            padding: bm?.tip === 'highlight' ? '0 2px' : 0,
                            cursor: 'pointer',
                          }}
                          onClick={() => copyVerse(verse)}
                          title="Click pentru a copia"
                        >
                          {verse.text}
                        </span>

                        {/* Acțiuni (bookmark) */}
                        {isAuthenticated && (
                          <span style={{ position: 'relative', display: 'inline-block' }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowActions(actionsOpen ? null : verse.verset); }}
                              style={{
                                background: 'transparent', border: 'none',
                                cursor: 'pointer', fontSize: '0.7rem',
                                color: bm ? 'var(--gold-primary)' : 'var(--text-muted)',
                                padding: '0 0.15rem', verticalAlign: 'middle',
                                opacity: bm ? 1 : 0,
                                transition: 'opacity 0.15s',
                              }}
                              className="verse-bm-btn"
                            >
                              {bm ? '🔖' : '🏷️'}
                            </button>
                            {actionsOpen && (
                              <div className="bible-verse-popup" style={{ left: 0, top: '1.2rem' }}>
                                <button className="bvp-btn" onClick={() => handleBookmark(verse, 'bookmark', 'gold')}>
                                  🔖 {bm ? 'Șterge semnul' : 'Semn de carte'}
                                </button>
                                <div className="bvp-colors">
                                  {['gold', 'red', 'green', 'blue', 'purple'].map(c => (
                                    <button key={c} className={`bvp-color ${bm?.culoare === c ? 'active' : ''}`}
                                      onClick={() => handleBookmark(verse, 'highlight', c)}>
                                      <span className={`bvp-dot ${c}`} />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </span>
                        )}

                        {/* ── Referințe încrucișate ── */}
                        {refs.length > 0 && (
                          <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.2rem', verticalAlign: 'middle', margin: '0 0.25rem' }}>
                            {refs.map((ref, i) => (
                              <button
                                key={i}
                                className="ref-badge"
                                onClick={(e) => { e.stopPropagation(); handleRefClick(ref, e.currentTarget); }}
                                style={{
                                  background: refPopup?.referinta === ref.referinta
                                    ? 'rgba(212,175,55,0.25)' : 'rgba(212,175,55,0.08)',
                                  border: `1px solid ${refPopup?.referinta === ref.referinta
                                    ? 'rgba(212,175,55,0.7)' : 'rgba(212,175,55,0.25)'}`,
                                  borderRadius: '20px',
                                  color: 'var(--gold-primary, #d4af37)',
                                  fontSize: '0.65rem',
                                  fontWeight: 600,
                                  padding: '0.1rem 0.45rem',
                                  cursor: 'pointer',
                                  fontFamily: 'Inter, sans-serif',
                                  lineHeight: 1.4,
                                  transition: 'all 0.15s',
                                }}
                                title={`Click pentru ${ref.referinta}`}
                              >
                                {ref.referinta}
                              </button>
                            ))}
                          </span>
                        )}

                        {' '}
                      </span>
                    );
                  })}
                </div>

                {/* CSS pentru hover pe bookmark btn */}
                <style>{`
                  .verse-bm-btn { opacity: 0 !important; }
                  *:hover > .verse-bm-btn,
                  span:hover .verse-bm-btn { opacity: 1 !important; }
                `}</style>

                {/* Navigare capitol */}
                <div className="bible-chapter-nav" style={{ marginTop: '2rem' }}>
                  <button
                    className="bible-chapter-nav-btn"
                    onClick={() => selectedCapitol > 1 && handleSelectCapitol(selectedCapitol - 1)}
                    disabled={selectedCapitol <= 1}
                  >← Capitol anterior</button>
                  <span className="bible-chapter-nav-current">{selectedCarte.ab} {selectedCapitol}</span>
                  <button
                    className="bible-chapter-nav-btn"
                    onClick={() => selectedCapitol < selectedCarte.totalCapitole && handleSelectCapitol(selectedCapitol + 1)}
                    disabled={selectedCapitol >= selectedCarte.totalCapitole}
                  >Capitol următor →</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BibleNavigator;
