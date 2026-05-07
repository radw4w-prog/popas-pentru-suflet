// frontend/src/components/BibleNavigator.js
import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AudioBiblePlayer from './AudioBiblePlayer';

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

  // Audio
  const [showAudio, setShowAudio] = useState(false);
  const [audioIndex, setAudioIndex] = useState(0);
  const activeVerseRef = useRef(null);

  const { isAuthenticated } = useAuth();
  const [bookmarksMap, setBookmarksMap] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
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
          carte: verse.carte,
          capitol: verse.capitol,
          verset: verse.verset,
          text: verse.text,
          referinta: `${verse.carte} ${verse.capitol}:${verse.verset}`,
          testament: verse.testament,
          tip,
          culoare
        }, { headers: getHeaders() });

        if (r.data?.success) {
          setBookmarksMap(prev => ({
            ...prev,
            [verse.verset]: r.data.bookmark
          }));
        }
      }
    } catch (e) {
      console.error('Bookmark error:', e);
    }
    setShowActions(null);
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

  const getCartiSorted = () => {
    const filtered = testamentFilter === 'all'
      ? ordineBiblie
      : ordineBiblie.filter(o => o.test === testamentFilter);

    return filtered.map(o => {
      const data = cartiData.find(c => c.carte === o.carte);
      return {
        ...o,
        totalCapitole: data?.totalCapitole || 0,
        totalVersete: data?.totalVersete || 0
      };
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

    try {
      const r = await api.get(
        `/api/verses?carte=${encodeURIComponent(selectedCarte.carte)}&capitol=${capitol}&limit=500`
      );
      setVersete(r.data?.versete || []);
      await fetchBookmarksForCapitol(selectedCarte.carte, capitol);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingVersete(false);
    }

    if (onSelectCapitol) {
      onSelectCapitol(selectedCarte.carte, capitol);
    }
  };

  const handleBack = () => {
    if (step === 'versete') {
      setStep('capitole');
      setSelectedCapitol(null);
      setVersete([]);
      setShowAudio(false);
    } else if (step === 'capitole') {
      setStep('carti');
      setSelectedCarte(null);
      setShowAudio(false);
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
    <div className={`bible-nav ${showAudio ? 'has-audio-player' : ''}`}>

      {/* HEADER */}
      <div className="bible-nav-header">
        <div className="bible-nav-header-left">
          {step !== 'carti' && (
            <button className="bible-nav-back" onClick={handleBack}>
              ← Înapoi
            </button>
          )}

          <div className="bible-nav-breadcrumb">
            <span
              className={`bible-bc-item ${step === 'carti' ? 'active' : 'clickable'}`}
              onClick={() => {
                setStep('carti');
                setSelectedCarte(null);
                setSelectedCapitol(null);
                setVersete([]);
                setShowAudio(false);
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
                    setStep('capitole');
                    setSelectedCapitol(null);
                    setVersete([]);
                    setShowAudio(false);
                  }}
                >
                  {selectedCarte.ab}
                </span>
              </>
            )}

            {selectedCapitol && (
              <>
                <span className="bible-bc-sep">›</span>
                <span className="bible-bc-item active">
                  Cap. {selectedCapitol}
                </span>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {/* Buton Audio - doar când avem versete */}
          {step === 'versete' && versete.length > 0 && (
            <button
              className={`bible-audio-btn ${showAudio ? 'active' : ''}`}
              onClick={() => setShowAudio(!showAudio)}
              title={showAudio ? 'Oprește audio' : 'Ascultă capitolul'}
            >
              {showAudio ? '⏹' : '🔊'}
              <span className="bible-audio-btn-text">
                {showAudio ? 'Stop' : 'Audio'}
              </span>
            </button>
          )}

          {onClose && (
            <button className="bible-nav-close" onClick={onClose}>✕</button>
          )}
        </div>
      </div>

      {/* STEP 1: CĂRȚI */}
      {step === 'carti' && (
        <div className="bible-nav-body">
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
                    key={carte.ab}
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
                    key={carte.ab}
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
        <div className="bible-nav-body">
          <div className="bible-carte-info">
            <div className="bible-carte-name">{selectedCarte.carte}</div>
            <div className="bible-carte-meta">
              {selectedCarte.test === 'VT' ? '📜 Vechiul Testament' : '✝️ Noul Testament'}
              {' '}• {selectedCarte.totalCapitole} capitole
              {' '}• {selectedCarte.totalVersete} versete
            </div>
          </div>

          <div className="bible-section-title">Alege capitolul</div>
          <div className="bible-chapters-grid">
            {Array.from(
              { length: selectedCarte.totalCapitole },
              (_, i) => i + 1
            ).map(cap => (
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
        <div className="bible-nav-body">
          <div className="bible-carte-info">
            <div className="bible-carte-name">
              {selectedCarte.carte} {selectedCapitol}
            </div>
            <div className="bible-carte-meta">
              {versete.length} versete
              {' '}• {selectedCarte.test === 'VT' ? '📜 Vechiul Testament' : '✝️ Noul Testament'}
              {showAudio && (
                <span style={{
                  marginLeft: '0.5rem',
                  color: '#7c3aed',
                  fontWeight: 700
                }}>
                  🔊 Audio activ
                </span>
              )}
            </div>
          </div>

          {loadingVersete ? (
            <div className="loading-spinner">
              <div>
                <div className="spinner"></div>
                <div className="loading-text">Se încarcă...</div>
              </div>
            </div>
          ) : (
            <div className="bible-verses-list">
              {versete.map((verse, index) => {
                const rl = isRedLetter(verse);
                const isCopiat = copiat === verse._id;
                const bm = bookmarksMap[verse.verset];
                const isBookmarked = !!bm;
                const actionsOpen = showActions === verse.verset;
                const isAudioActive = showAudio && audioIndex === index;

                return (
                  <div
                    key={verse._id}
                    ref={isAudioActive ? activeVerseRef : null}
                    className={`bible-verse-row ${rl ? 'red-letter' : ''} ${isCopiat ? 'copied' : ''} ${isBookmarked ? `highlighted-${bm.culoare}` : ''} ${isAudioActive ? 'audio-active-verse' : ''}`}
                  >
                    <span className="bible-verse-num">{verse.verset}</span>

                    <span
                      className={`bible-verse-text ${rl ? 'rl-text' : ''}`}
                      onClick={() => {
                        if (showAudio) {
                          // Click pe verset = play de acolo
                          setAudioIndex(index);
                          window.__audioBiblePlayFrom?.(index);
                        } else {
                          copyVerse(verse);
                        }
                      }}
                    >
                      {verse.text}
                    </span>

                    <div className="bible-verse-actions">
                      {/* Play din acest verset */}
                      {showAudio && (
                        <button
                          className={`bva-btn ${isAudioActive ? 'active' : ''}`}
                          onClick={() => {
                            setAudioIndex(index);
                            window.__audioBiblePlayFrom?.(index);
                          }}
                          title="Ascultă de aici"
                        >
                          {isAudioActive ? '🔊' : '▶'}
                        </button>
                      )}

                      <button
                        className="bva-btn"
                        onClick={() => copyVerse(verse)}
                        title="Copiază"
                      >
                        {isCopiat ? '✅' : '📋'}
                      </button>

                      {isAuthenticated && (
                        <button
                          className={`bva-btn ${isBookmarked ? 'active' : ''}`}
                          onClick={() => setShowActions(actionsOpen ? null : verse.verset)}
                          title="Semn de carte"
                        >
                          {isBookmarked ? '🔖' : '🏷️'}
                        </button>
                      )}
                    </div>

                    {actionsOpen && isAuthenticated && (
                      <div className="bible-verse-popup">
                        <button
                          className={`bvp-btn ${bm?.tip === 'bookmark' ? 'active' : ''}`}
                          onClick={() => handleBookmark(verse, 'bookmark', 'gold')}
                        >
                          🔖 Semn de carte
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

                        {isBookmarked && (
                          <button
                            className="bvp-btn remove"
                            onClick={() => handleBookmark(verse, bm.tip)}
                          >
                            🗑️ Șterge semnul
                          </button>
                        )}
                      </div>
                    )}

                    {bm?.nota && (
                      <div className="bible-verse-note-indicator" title={bm.nota}>
                        📝
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Navigare capitol */}
          <div className="bible-chapter-nav">
            <button
              className="bible-chapter-nav-btn"
              onClick={() => handleSelectCapitol(selectedCapitol - 1)}
              disabled={selectedCapitol <= 1}
            >
              ← Cap. {selectedCapitol - 1}
            </button>

            <span className="bible-chapter-nav-current">
              {selectedCarte.ab} {selectedCapitol}
            </span>

            <button
              className="bible-chapter-nav-btn"
              onClick={() => handleSelectCapitol(selectedCapitol + 1)}
              disabled={selectedCapitol >= selectedCarte.totalCapitole}
            >
              Cap. {selectedCapitol + 1} →
            </button>
          </div>
        </div>
      )}

      {/* AUDIO PLAYER */}
      {showAudio && versete.length > 0 && (
        <AudioBiblePlayer
          verses={versete}
          bookName={selectedCarte?.carte || ''}
          chapter={selectedCapitol}
          onClose={() => setShowAudio(false)}
          onVerseChange={(index) => {
            setAudioIndex(index);
            // Auto scroll
            if (activeVerseRef.current) {
              activeVerseRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              });
            }
          }}
        />
      )}
    </div>
  );
};

export default BibleNavigator;