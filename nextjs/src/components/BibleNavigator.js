'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

  // ── Cross References ──────────────────────────────────────
  const [referinteMap, setReferinteMap] = useState({});  // { versetNr: [refs] }
  const [loadingRefs, setLoadingRefs] = useState(false);

  // ── Popup referință ───────────────────────────────────────
  const [refPopup, setRefPopup] = useState(null); // { referinta, text, loading }

  // ── Audio ─────────────────────────────────────────────────
  const [showAudio, setShowAudio] = useState(false);
  const [audioIndex, setAudioIndex] = useState(0);
  const activeVerseRef = useRef(null);

  const { isAuthenticated } = useAuth();

  useEffect(() => { fetchData(); }, []);

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
    } catch (e) {
      console.error(e);
    }
  };

  // ── Fetch referințe pentru tot capitolul ─────────────────
  const fetchReferinte = useCallback(async (carte, capitol) => {
    setLoadingRefs(true);
    try {
      const r = await fetch(
        `${API_URL}/api/cross-references/capitol?carte=${encodeURIComponent(carte)}&capitol=${capitol}`
      );
      const data = await r.json();
      if (data.success) setReferinteMap(data.referinteMap || {});
    } catch (e) {
      console.error('CrossRef error:', e);
    } finally {
      setLoadingRefs(false);
    }
  }, []);

  // ── Fetch text verset pentru popup ───────────────────────
  const fetchVersetText = async (ref) => {
    setRefPopup({ referinta: ref.referinta, text: null, loading: true });
    try {
      const r = await fetch(
        `${API_URL}/api/cross-references/verset?carte=${encodeURIComponent(ref.carte)}&capitol=${ref.capitol}&verset=${ref.versetStart}`
      );
      const data = await r.json();
      if (data.success) {
        setRefPopup({
          referinta: ref.referinta,
          text: data.verset.text,
          loading: false
        });
      } else {
        setRefPopup({ referinta: ref.referinta, text: 'Versetul nu a fost găsit.', loading: false });
      }
    } catch (e) {
      setRefPopup({ referinta: ref.referinta, text: 'Eroare la încărcare.', loading: false });
    }
  };

  // ── Bookmarks ─────────────────────────────────────────────
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

  // ── Navigare ──────────────────────────────────────────────
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
    setShowAudio(false);
    setStep('capitole');
  };

  const handleSelectCapitol = async (capitol) => {
    setSelectedCapitol(capitol);
    setStep('versete');
    setLoadingVersete(true);
    setShowAudio(false);
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
      setShowAudio(false); setReferinteMap({}); setRefPopup(null);
    } else if (step === 'capitole') {
      setStep('carti'); setSelectedCarte(null); setShowAudio(false);
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
    const text = `„${verse.text}" — ${ref}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiat(verse._id);
      setTimeout(() => setCopiat(null), 1500);
    });
  };

  const carti = getCartiSorted();

  return (
    <div className="bible-nav">
      {/* ═══ POPUP REFERINȚĂ (sticky sus) ═══ */}
      {refPopup && (
        <div style={{
          position: 'sticky', top: 0, zIndex: 200,
          background: 'var(--bg-elevated, #16213e)',
          border: '1px solid var(--gold-primary, #d4af37)',
          borderRadius: '12px', padding: '1rem 1.25rem',
          margin: '0.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          animation: 'fadeInGPU 0.2s ease'
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-start', gap: '1rem'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                color: 'var(--gold-primary, #d4af37)',
                fontSize: '0.75rem', fontWeight: 700,
                letterSpacing: '1px', marginBottom: '0.5rem',
                textTransform: 'uppercase'
              }}>
                ✦ {refPopup.referinta}
              </div>
              {refPopup.loading ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Se încarcă...
                </div>
              ) : (
                <div style={{
                  color: 'var(--text-primary)',
                  fontFamily: 'Lora, Georgia, serif',
                  fontSize: '0.95rem', lineHeight: 1.75,
                  fontStyle: 'italic'
                }}>
                  „{refPopup.text}"
                </div>
              )}
            </div>
            <button
              onClick={() => setRefPopup(null)}
              style={{
                background: 'transparent', border: 'none',
                color: 'var(--text-muted)', cursor: 'pointer',
                fontSize: '1.1rem', flexShrink: 0, padding: '0.2rem'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ═══ HEADER ═══ */}
      <div className="bible-nav-header">
        <div className="bible-nav-header-left">
          {step !== 'carti' && (
            <button className="bible-nav-back" onClick={handleBack}>← Înapoi</button>
          )}
          <div className="bible-nav-breadcrumb">
            <span
              className={`bible-bc-item ${step === 'carti' ? 'active' : 'clickable'}`}
              onClick={() => {
                setStep('carti'); setSelectedCarte(null);
                setSelectedCapitol(null); setVersete([]);
                setShowAudio(false); setRefPopup(null);
              }}
            >
              📖 Biblia
            </span>
            {selectedCarte && (
              <>
                <span className="bible-bc-sep">›</span>
                <span
                  className={`bible-bc-item ${step === 'capitole' ? 'active' : 'clickable'}`}
                  onClick={() => {
                    setStep('capitole'); setSelectedCapitol(null);
                    setVersete([]); setShowAudio(false); setRefPopup(null);
                  }}
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

        {step === 'versete' && versete.length > 0 && (
          <button
            className="bible-nav-back"
            onClick={() => setShowAudio(!showAudio)}
            title={showAudio ? 'Oprește audio' : 'Ascultă capitolul'}
          >
            {showAudio ? '⏹' : '🔊'} {showAudio ? 'Stop' : 'Audio'}
          </button>
        )}
        {onClose && (
          <button className="bible-nav-close" onClick={onClose}>✕</button>
        )}
      </div>

      {/* ═══ BODY ═══ */}
      <div className="bible-nav-body">

        {/* STEP 1: CĂRȚI */}
        {step === 'carti' && (
          <div>
            <div className="bible-test-filter">
              {[
                { key: 'all', label: '📚 Toate' },
                { key: 'VT', label: '📜 VT' },
                { key: 'NT', label: '✝️ NT' }
              ].map(f => (
                <button
                  key={f.key}
                  className={`bible-test-btn ${testamentFilter === f.key ? 'active' : ''}`}
                  onClick={() => setTestamentFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {(testamentFilter === 'all' || testamentFilter === 'VT') && (
              <div className="bible-section">
                <div className="bible-section-title">📜 Vechiul Testament</div>
                <div className="bible-books-grid">
                  {carti.filter(c => c.test === 'VT').map(carte => (
                    <button
                      key={carte.carte}
                      className="bible-book-btn"
                      onClick={() => handleSelectCarte(carte)}
                      title={carte.carte}
                    >
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
                    <button
                      key={carte.carte}
                      className="bible-book-btn nt"
                      onClick={() => handleSelectCarte(carte)}
                      title={carte.carte}
                    >
                      <span className="bible-book-ab">{carte.ab}</span>
                      <span className="bible-book-cap">{carte.totalCapitole}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: CAPITOLE */}
        {step === 'capitole' && selectedCarte && (
          <div>
            <div className="bible-carte-info">
              <div className="bible-carte-name">{selectedCarte.carte}</div>
              <div className="bible-carte-meta">
                {selectedCarte.test === 'VT' ? '📜 Vechiul Testament' : '✝️ Noul Testament'}
                {' '}• {selectedCarte.totalCapitole} capitole
                {' '}• {selectedCarte.totalVersete} versete
              </div>
            </div>
            <div className="bible-chapters-grid">
              {Array.from({ length: selectedCarte.totalCapitole }, (_, i) => i + 1).map(cap => (
                <button
                  key={cap}
                  className="bible-chapter-btn"
                  onClick={() => handleSelectCapitol(cap)}
                >
                  {cap}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: VERSETE */}
        {step === 'versete' && selectedCarte && selectedCapitol && (
          <div>
            <div className="bible-carte-info">
              <div className="bible-carte-name">
                {selectedCarte.carte} {selectedCapitol}
              </div>
              <div className="bible-carte-meta">
                {versete.length} versete
                {' '}• {selectedCarte.test === 'VT' ? '📜 VT' : '✝️ NT'}
                {loadingRefs && <span style={{ marginLeft: '0.5rem', opacity: 0.6 }}>· se încarcă referințe...</span>}
              </div>
            </div>

            {loadingVersete ? (
              <div className="loading-spinner">
                <div className="spinner" />
              </div>
            ) : (
              <div className="bible-verses-list">
                {versete.map((verse, index) => {
                  const rl = isRedLetter(verse);
                  const isCopiat = copiat === verse._id;
                  const bm = bookmarksMap[verse.verset];
                  const isBookmarked = !!bm;
                  const actionsOpen = showActions === verse.verset;
                  const refs = referinteMap[verse.verset] || [];

                  return (
                    <div
                      key={verse._id}
                      className={`bible-verse-row ${rl ? 'red-letter' : ''} ${isCopiat ? 'copied' : ''}`}
                      ref={index === audioIndex && showAudio ? activeVerseRef : null}
                    >
                      {/* Număr verset */}
                      <span className="bible-verse-num">{verse.verset}</span>

                      {/* Text verset */}
                      <div style={{ flex: 1 }}>
                        <span
                          className={`bible-verse-text ${rl ? 'rl-text' : ''}`}
                          onClick={() => copyVerse(verse)}
                          style={{ cursor: 'pointer' }}
                        >
                          {verse.text}
                        </span>

                        {/* ── REFERINȚE ÎNCRUCIȘATE ── */}
                        {refs.length > 0 && (
                          <div style={{
                            display: 'flex', flexWrap: 'wrap', gap: '0.3rem',
                            marginTop: '0.5rem'
                          }}>
                            {refs.map((ref, i) => (
                              <button
                                key={i}
                                onClick={() => fetchVersetText(ref)}
                                style={{
                                  background: refPopup?.referinta === ref.referinta
                                    ? 'rgba(212,175,55,0.2)'
                                    : 'rgba(212,175,55,0.06)',
                                  border: `1px solid ${refPopup?.referinta === ref.referinta
                                    ? 'rgba(212,175,55,0.6)'
                                    : 'rgba(212,175,55,0.2)'}`,
                                  borderRadius: '20px',
                                  color: 'var(--gold-primary, #d4af37)',
                                  fontSize: '0.68rem',
                                  fontWeight: 600,
                                  padding: '0.15rem 0.5rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s',
                                  fontFamily: 'inherit'
                                }}
                                title={`Click pentru a vedea ${ref.referinta}`}
                              >
                                {ref.referinta}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Acțiuni */}
                      <div className="bible-verse-actions">
                        {/* Copiază */}
                        <button
                          className="bva-btn"
                          onClick={() => copyVerse(verse)}
                          title="Copiază"
                        >
                          {isCopiat ? '✅' : '📋'}
                        </button>

                        {/* Bookmark */}
                        {isAuthenticated && (
                          <div style={{ position: 'relative' }}>
                            <button
                              className={`bva-btn ${isBookmarked ? 'active' : ''}`}
                              onClick={() => setShowActions(actionsOpen ? null : verse.verset)}
                              title="Semn de carte"
                            >
                              {isBookmarked ? '🔖' : '🏷️'}
                            </button>

                            {actionsOpen && (
                              <div className="bible-verse-popup">
                                <button className="bvp-btn" onClick={() => handleBookmark(verse, 'bookmark', 'gold')}>
                                  🔖 {isBookmarked ? 'Șterge semnul' : 'Semn de carte'}
                                </button>
                                <div className="bvp-colors">
                                  {['gold', 'red', 'green', 'blue', 'purple'].map(c => (
                                    <button
                                      key={c}
                                      className={`bvp-color ${bm?.culoare === c ? 'active' : ''}`}
                                      onClick={() => handleBookmark(verse, 'highlight', c)}
                                      title={`Evidențiază ${c}`}
                                    >
                                      <span className={`bvp-dot ${c}`} />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Navigare capitol */}
            <div className="bible-chapter-nav">
              <button
                className="bible-chapter-nav-btn"
                onClick={() => selectedCapitol > 1 && handleSelectCapitol(selectedCapitol - 1)}
                disabled={selectedCapitol <= 1}
              >
                ← Capitol anterior
              </button>
              <span className="bible-chapter-nav-current">
                {selectedCarte.ab} {selectedCapitol}
              </span>
              <button
                className="bible-chapter-nav-btn"
                onClick={() => selectedCapitol < selectedCarte.totalCapitole && handleSelectCapitol(selectedCapitol + 1)}
                disabled={selectedCapitol >= selectedCarte.totalCapitole}
              >
                Capitol următor →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BibleNavigator;
