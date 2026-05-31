'use client';
import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FontSizeContext } from './Header';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ═══ FONT SETTINGS ═══
const FONT_SIZES = { small: '0.9rem', medium: '1.05rem', large: '1.25rem' };
const FONT_FAMILIES = {
  lora: { label: 'Lora', value: 'Lora, Georgia, serif' },
  georgia: { label: 'Georgia', value: 'Georgia, serif' },
  system: { label: 'System', value: 'system-ui, -apple-system, sans-serif' },
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

  // Popup referință
  const [refPopup, setRefPopup] = useState(null);
  const popupRef = useRef(null);
  
  // ═══ SEARCH ═══
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchPage, setSearchPage] = useState(1);
  const [showSearch, setShowSearch] = useState(false);
  const searchTimeout = useRef(null);
  const searchInputRef = useRef(null);

  const { isAuthenticated } = useAuth();
  const { fontSize } = useContext(FontSizeContext);

  // Bible-specific font settings
  const [bibleFont, setBibleFont] = useState('lora');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('bibleFont') || 'lora';
    setBibleFont(saved);
  }, []);

  const changeBibleFont = (font) => {
    setBibleFont(font);
    localStorage.setItem('bibleFont', font);
  };

  const verseFontSize = FONT_SIZES[fontSize] || FONT_SIZES.medium;
  const verseFontFamily = FONT_FAMILIES[bibleFont]?.value || FONT_FAMILIES.lora.value;

  useEffect(() => { fetchData(); }, []);

  // Închide popup la click afară
  useEffect(() => {
    if (!refPopup) return;
    const handleClick = (e) => {
      if (!e.target.closest('[data-ref-popup]') && !e.target.closest('[data-ref-badge]')) {
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

  // ═══ SEARCH LOGIC ═══
  const performSearch = useCallback(async (query, page = 1) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]); setSearchTotal(0); return;
    }
    setSearchLoading(true);
    try {
      const r = await api.get(`/api/verses?search=${encodeURIComponent(query.trim())}&page=${page}&limit=20`);
      const data = r.data;
      if (page === 1) {
        setSearchResults(data.versete || []);
      } else {
        setSearchResults(prev => [...prev, ...(data.versete || [])]);
      }
      setSearchTotal(data.total || 0);
      setSearchPage(page);
    } catch (e) { console.error('Search error:', e); }
    finally { setSearchLoading(false); }
  }, []);

  const handleSearchInput = useCallback((value) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!value || value.trim().length < 2) {
      setSearchResults([]); setSearchTotal(0); return;
    }
    searchTimeout.current = setTimeout(() => {
      performSearch(value, 1);
    }, 400);
  }, [performSearch]);

  const handleSearchClear = () => {
    setSearchQuery(''); setSearchResults([]); setSearchTotal(0); setSearchPage(1);
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const goToSearchResult = async (verse) => {
    const carte = ordineBiblie.find(o => o.carte === verse.carte);
    const carteInfo = cartiData.find(c => c.carte === verse.carte);
    if (!carte) return;

    const carteObj = { ...carte, totalCapitole: carteInfo?.totalCapitole || 0, totalVersete: carteInfo?.totalVersete || 0 };
    
    // Setează starea
    setSelectedCarte(carteObj);
    setSelectedCapitol(verse.capitol);
    setStep('versete');
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    setSearchTotal(0);
    setReferinteMap({});
    setRefPopup(null);
    setLoadingVersete(true);

    try {
      const r = await api.get(`/api/verses?carte=${encodeURIComponent(verse.carte)}&capitol=${verse.capitol}&limit=500`);
      setVersete(r.data?.versete || []);
      await Promise.all([fetchBookmarks(verse.carte, verse.capitol), fetchReferinte(verse.carte, verse.capitol)]);
    } catch (e) { console.error(e); }
    finally { setLoadingVersete(false); }

    // Scroll la verset specific
    setTimeout(() => {
      const el = document.querySelector(`[data-verset="${verse.verset}"]`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.transition = 'background 0.3s';
        el.style.background = 'rgba(212,175,55,0.15)';
        setTimeout(() => { el.style.background = ''; }, 2000);
      }
    }, 300);
  };

  const highlightText = (text, query) => {
    if (!query || query.length < 2) return text;
    try {
      // Construiește regex cu suport diacritice
      const diacriticMap = { 'a': '[aăâ]', 'ă': '[aăâ]', 'â': '[aăâ]', 'i': '[iî]', 'î': '[iî]', 's': '[sș]', 'ș': '[sș]', 't': '[tț]', 'ț': '[tț]' };
      const pattern = query.split('').map(c => {
        const escaped = c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return diacriticMap[c.toLowerCase()] || escaped;
      }).join('');
      const parts = text.split(new RegExp(`(${pattern})`, 'gi'));
      return parts.map((part, i) =>
        new RegExp(`^${pattern}$`, 'i').test(part)
          ? <mark key={i} style={{ background: 'rgba(212,175,55,0.35)', color: 'var(--text-primary)', borderRadius: '2px', padding: '0 1px' }}>{part}</mark>
          : part
      );
    } catch { return text; }
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
      const r = await fetch(`${API_URL}/api/cross-references/capitol?carte=${encodeURIComponent(carte)}&capitol=${capitol}`);
      const data = await r.json();
      if (data.success) setReferinteMap(data.referinteMap || {});
    } catch (e) { console.error('CrossRef error:', e); }
  }, []);

  const handleRefClick = async (ref, e) => {
    e.stopPropagation();
    if (refPopup?.referinta === ref.referinta) { setRefPopup(null); return; }

    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const bodyRect = document.querySelector('.bible-nav-body')?.getBoundingClientRect() || { top: 0, left: 0, width: 400 };

    let top = rect.bottom - bodyRect.top + document.querySelector('.bible-nav-body').scrollTop + 6;
    let left = rect.left - bodyRect.left;
    if (left + 300 > bodyRect.width) left = Math.max(0, bodyRect.width - 310);

    setRefPopup({ referinta: ref.referinta, text: null, loading: true, top, left });

    try {
      const r = await fetch(`${API_URL}/api/cross-references/verset?carte=${encodeURIComponent(ref.carte)}&capitol=${ref.capitol}&verset=${ref.versetStart}`);
      const data = await r.json();
      setRefPopup(prev => prev?.referinta === ref.referinta ? {
        ...prev, text: data.success ? data.verset.text : 'Versetul nu a fost găsit.', loading: false
      } : prev);
    } catch {
      setRefPopup(prev => prev?.referinta === ref.referinta ? { ...prev, text: 'Eroare la încărcare.', loading: false } : prev);
    }
  };

  const fetchBookmarks = async (carte, capitol) => {
    if (!isAuthenticated) return;
    try {
      const r = await api.get(`/api/bookmarks/capitol?carte=${encodeURIComponent(carte)}&capitol=${capitol}`, { headers: getHeaders() });
      if (r.data?.success) setBookmarksMap(r.data.bookmarks || {});
    } catch {}
  };

  const handleBookmark = async (verse, tip = 'bookmark', culoare = 'gold') => {
    if (!isAuthenticated) return;
    try {
      const existing = bookmarksMap[verse.verset];
      if (existing && existing.tip === tip) {
        await api.delete(`/api/bookmarks/${existing._id}`, { headers: getHeaders() });
        const m = { ...bookmarksMap }; delete m[verse.verset]; setBookmarksMap(m);
      } else {
        const r = await api.post('/api/bookmarks', {
          carte: verse.carte, capitol: verse.capitol, verset: verse.verset,
          text: verse.text, referinta: `${verse.carte} ${verse.capitol}:${verse.verset}`,
          testament: verse.testament, tip, culoare
        }, { headers: getHeaders() });
        if (r.data?.success) setBookmarksMap(prev => ({ ...prev, [verse.verset]: r.data.bookmark }));
      }
    } catch (e) { console.error('Bookmark error:', e); }
    setShowActions(null);
  };

  const getCartiSorted = () => {
    const filtered = testamentFilter === 'all' ? ordineBiblie : ordineBiblie.filter(o => o.test === testamentFilter);
    return filtered.map(o => {
      const data = cartiData.find(c => c.carte === o.carte);
      return { ...o, totalCapitole: data?.totalCapitole || 0, totalVersete: data?.totalVersete || 0 };
    });
  };

  const handleSelectCarte = (carte) => {
    setSelectedCarte(carte); setSelectedCapitol(null); setVersete([]);
    setStep('capitole'); setRefPopup(null);
  };

  const handleSelectCapitol = async (capitol) => {
    setSelectedCapitol(capitol); setStep('versete'); setLoadingVersete(true);
    setReferinteMap({}); setRefPopup(null);
    try {
      const r = await api.get(`/api/verses?carte=${encodeURIComponent(selectedCarte.carte)}&capitol=${capitol}&limit=500`);
      setVersete(r.data?.versete || []);
      await Promise.all([fetchBookmarks(selectedCarte.carte, capitol), fetchReferinte(selectedCarte.carte, capitol)]);
    } catch (e) { console.error(e); }
    finally { setLoadingVersete(false); }
    if (onSelectCapitol) onSelectCapitol(selectedCarte.carte, capitol);
  };

  const handleBack = () => {
    if (step === 'versete') { setStep('capitole'); setSelectedCapitol(null); setVersete([]); setReferinteMap({}); setRefPopup(null); }
    else if (step === 'capitole') { setStep('carti'); setSelectedCarte(null); }
  };

  const isRedLetter = (verse) => {
    const carteRL = redLetter[verse.carte];
    if (!carteRL) return false;
    const capRL = carteRL[verse.capitol];
    return capRL?.includes(verse.verset) || false;
  };

  const copyVerse = (verse) => {
    navigator.clipboard.writeText(`„${verse.text}" — ${verse.carte} ${verse.capitol}:${verse.verset}`).then(() => {
      setCopiat(verse._id); setTimeout(() => setCopiat(null), 1500);
    });
  };

  const getHighlight = (bm) => {
    if (!bm || bm.tip !== 'highlight') return {};
    const colors = { gold: 'rgba(212,175,55,0.18)', red: 'rgba(220,38,38,0.14)', green: 'rgba(16,185,129,0.14)', blue: 'rgba(59,130,246,0.14)', purple: 'rgba(124,58,237,0.14)' };
    return { background: colors[bm.culoare] || 'transparent', borderRadius: '4px', padding: '1px 3px' };
  };

  const carti = getCartiSorted();

  return (
    <div className="bible-nav">
      {/* ═══ HEADER ═══ */}
      <div className="bible-nav-header">
        <div className="bible-nav-header-left">
          {step !== 'carti' && <button className="bible-nav-back" onClick={handleBack}>← Înapoi</button>}
          <div className="bible-nav-breadcrumb">
            <span className={`bible-bc-item ${step === 'carti' ? 'active' : 'clickable'}`}
              onClick={() => { setStep('carti'); setSelectedCarte(null); setSelectedCapitol(null); setVersete([]); setRefPopup(null); }}>
              📖 Biblia
            </span>
            {selectedCarte && (<><span className="bible-bc-sep">›</span>
              <span className={`bible-bc-item ${step === 'capitole' ? 'active' : 'clickable'}`}
                onClick={() => { setStep('capitole'); setSelectedCapitol(null); setVersete([]); setRefPopup(null); }}>
                {selectedCarte.ab}
              </span></>)}
            {selectedCapitol && (<><span className="bible-bc-sep">›</span>
              <span className="bible-bc-item active">Cap. {selectedCapitol}</span></>)}
          </div>
        </div>
        {onClose && <button className="bible-nav-close" onClick={onClose}>✕</button>}
      </div>

      {/* ═══ SEARCH BAR ═══ */}
      <div style={{
        padding: '0.6rem 1rem',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
      }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', color: 'var(--text-muted)', pointerEvents: 'none' }}>🔍</span>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onFocus={() => setShowSearch(true)}
              placeholder='Caută text sau referință (ex: "dragoste", "Ioan 3:16")'
              style={{
                width: '100%',
                padding: '0.65rem 2.2rem 0.65rem 2.2rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
            {searchQuery && (
              <button onClick={handleSearchClear} style={{
                position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                fontSize: '1rem', padding: '2px', lineHeight: 1
              }}>✕</button>
            )}
          </div>
          {showSearch && searchQuery && (
            <button onClick={() => { setShowSearch(false); setSearchResults([]); setSearchTotal(0); setSearchQuery(''); }} style={{
              padding: '0.5rem 0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)',
              background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem',
              whiteSpace: 'nowrap', flexShrink: 0
            }}>Anulează</button>
          )}
        </div>

        {/* Info rezultate */}
        {showSearch && searchQuery.length >= 2 && (
          <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {searchLoading ? '⏳ Se caută...' : `${searchTotal} rezultate pentru „${searchQuery}"`}
          </div>
        )}
      </div>

      {/* ═══ SEARCH RESULTS ═══ */}
      {showSearch && searchResults.length > 0 && (
        <div style={{
          maxHeight: '60vh', overflowY: 'auto', borderBottom: '2px solid var(--gold-primary)',
          background: 'var(--bg-primary)',
        }}>
          {searchResults.map((verse, idx) => (
            <div
              key={verse._id || idx}
              onClick={() => goToSearchResult(verse)}
              style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {/* Referință */}
              <div style={{
                fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-primary)',
                marginBottom: '0.25rem', fontFamily: 'Inter, sans-serif',
              }}>
                📖 {verse.carte} {verse.capitol}:{verse.verset}
                <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                  {verse.testament === 'VT' ? '📜 VT' : '✝️ NT'}
                </span>
              </div>
              {/* Text cu highlight */}
              <p style={{
                fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)',
                fontFamily: 'Lora, Georgia, serif', fontStyle: 'italic',
                margin: 0,
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                „{highlightText(verse.text, searchQuery)}"
              </p>
            </div>
          ))}

          {/* Load more */}
          {searchResults.length < searchTotal && (
            <button
              onClick={() => performSearch(searchQuery, searchPage + 1)}
              disabled={searchLoading}
              style={{
                width: '100%', padding: '0.75rem', background: 'var(--bg-card)',
                border: 'none', borderTop: '1px solid var(--border-color)',
                color: 'var(--gold-primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
              }}
            >
              {searchLoading ? '⏳ Se încarcă...' : `📖 Încarcă mai multe (${searchResults.length}/${searchTotal})`}
            </button>
          )}
        </div>
      )}

      {/* ═══ BODY ═══ */}
      <div className="bible-nav-body" style={{ position: 'relative' }}>

        {/* ── POPUP REFERINȚĂ ── */}
        {refPopup && (
          <div data-ref-popup="true" style={{
            position: 'absolute', top: refPopup.top, left: Math.max(4, refPopup.left),
            zIndex: 500, background: 'var(--bg-elevated, #16213e)',
            border: '1px solid var(--gold-primary, #d4af37)', borderRadius: '14px',
            padding: '1rem 1.1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            maxWidth: '300px', minWidth: '200px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--gold-primary, #d4af37)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  ✦ {refPopup.referinta}
                </div>
                {refPopup.loading
                  ? <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Se încarcă...</div>
                  : <div style={{ color: 'var(--text-primary)', fontFamily: 'Lora, Georgia, serif', fontSize: '0.9rem', lineHeight: 1.7, fontStyle: 'italic' }}>
                      „{refPopup.text}"
                    </div>
                }
              </div>
              <button onClick={() => setRefPopup(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', flexShrink: 0, padding: 0 }}>✕</button>
            </div>
          </div>
        )}

        {/* ═══ STEP 1: CĂRȚI ═══ */}
        {step === 'carti' && (
          <div>
            <div className="bible-test-filter">
              {[{ key: 'all', label: '📚 Toate' }, { key: 'VT', label: '📜 VT' }, { key: 'NT', label: '✝️ NT' }].map(f => (
                <button key={f.key} className={`bible-test-btn ${testamentFilter === f.key ? 'active' : ''}`} onClick={() => setTestamentFilter(f.key)}>{f.label}</button>
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

        {/* ═══ STEP 3: VERSETE ═══ */}
        {step === 'versete' && selectedCarte && selectedCapitol && (
          <div>
            <div className="bible-carte-info">
              <div className="bible-carte-name">{selectedCarte.carte} {selectedCapitol}</div>
              <div className="bible-carte-meta">
                {versete.length} versete • {selectedCarte.test === 'VT' ? '📜 VT' : '✝️ NT'}
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  style={{
                    marginLeft: '0.75rem', background: 'none', border: '1px solid var(--border-color)',
                    borderRadius: '8px', padding: '0.2rem 0.5rem', cursor: 'pointer',
                    color: showSettings ? 'var(--gold-primary)' : 'var(--text-muted)',
                    fontSize: '0.8rem', transition: 'all 0.15s'
                  }}
                  title="Setări text"
                >
                  ⚙️ Aa
                </button>
              </div>
            </div>

            {/* ═══ TEXT SETTINGS BAR ═══ */}
            {showSettings && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                padding: '0.6rem 0.75rem', marginBottom: '0.5rem',
                background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px',
              }}>
                {/* Font Family */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Font:</span>
                  {Object.entries(FONT_FAMILIES).map(([key, f]) => (
                    <button key={key} onClick={() => changeBibleFont(key)} style={{
                      padding: '0.25rem 0.5rem', borderRadius: '8px', cursor: 'pointer',
                      border: bibleFont === key ? '1px solid var(--gold-primary)' : '1px solid var(--border-color)',
                      background: bibleFont === key ? 'rgba(212,175,55,0.12)' : 'transparent',
                      color: bibleFont === key ? 'var(--gold-primary)' : 'var(--text-secondary)',
                      fontSize: '0.75rem', fontFamily: f.value, fontWeight: bibleFont === key ? 600 : 400,
                    }}>
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Separator */}
                <div style={{ width: 1, height: 20, background: 'var(--border-color)' }} />

                {/* Font Size info */}
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Mărime: <strong style={{ color: 'var(--gold-primary)' }}>{fontSize === 'small' ? 'Mic' : fontSize === 'large' ? 'Mare' : 'Mediu'}</strong>
                  <span style={{ marginLeft: '0.3rem', opacity: 0.6 }}>(din Aa header)</span>
                </div>
              </div>
            )}

            {loadingVersete ? (
              <div className="loading-spinner"><div className="spinner" /></div>
            ) : (
              <>
                <div className="bible-verses-list">
                  {versete.map((verse) => {
                    const rl = isRedLetter(verse);
                    const bm = bookmarksMap[verse.verset];
                    const refs = referinteMap[verse.verset] || [];
                    const actionsOpen = showActions === verse.verset;
                    const isCopiat = copiat === verse._id;

                    return (
                      <div
                        key={verse._id}
                        data-verset={verse.verset}
                        className={`bible-verse-row ${rl ? 'red-letter' : ''} ${isCopiat ? 'copied' : ''}`}
                        style={bm?.tip === 'highlight' ? { background: getHighlight(bm).background } : {}}
                      >
                        {/* Număr verset */}
                        <span className="bible-verse-num">{verse.verset}</span>

                        {/* Conținut */}
                        <div style={{ flex: 1 }}>
                          {/* Text verset — mai mare */}
                          <p
                            className={`bible-verse-text ${rl ? 'rl-text' : ''}`}
                            style={{
                              fontSize: verseFontSize,
                              lineHeight: 1.85,
                              margin: '0 0 0.4rem 0',
                              cursor: 'pointer',
                              fontFamily: verseFontFamily,
                              transition: 'font-size 0.2s, font-family 0.2s',
                            }}
                            onClick={() => copyVerse(verse)}
                            title="Click pentru a copia"
                          >
                            {verse.text}
                          </p>

                          {/* Referințe încrucișate */}
                          {refs.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.25rem' }}>
                              {refs.map((ref, i) => (
                                <button
                                  key={i}
                                  data-ref-badge="true"
                                  onClick={(e) => handleRefClick(ref, e)}
                                  style={{
                                    background: refPopup?.referinta === ref.referinta ? 'rgba(212,175,55,0.22)' : 'rgba(212,175,55,0.07)',
                                    border: `1px solid ${refPopup?.referinta === ref.referinta ? 'rgba(212,175,55,0.65)' : 'rgba(212,175,55,0.22)'}`,
                                    borderRadius: '20px',
                                    color: 'var(--gold-primary, #d4af37)',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    padding: '0.18rem 0.55rem',
                                    cursor: 'pointer',
                                    fontFamily: 'Inter, sans-serif',
                                    transition: 'all 0.15s',
                                    lineHeight: 1.4,
                                  }}
                                  title={`Deschide ${ref.referinta}`}
                                >
                                  {ref.referinta}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Acțiuni */}
                        <div className="bible-verse-actions">
                          <button className="bva-btn" onClick={() => copyVerse(verse)} title="Copiază">
                            {isCopiat ? '✅' : '📋'}
                          </button>
                          {isAuthenticated && (
                            <div style={{ position: 'relative' }}>
                              <button
                                className={`bva-btn ${bm ? 'active' : ''}`}
                                onClick={() => setShowActions(actionsOpen ? null : verse.verset)}
                                title="Semn de carte / Evidențiere"
                              >
                                {bm ? '🔖' : '🏷️'}
                              </button>
                              {actionsOpen && (
                                <div className="bible-verse-popup">
                                  <button className="bvp-btn" onClick={() => handleBookmark(verse, 'bookmark', 'gold')}>
                                    🔖 {bm ? 'Șterge semnul' : 'Semn de carte'}
                                  </button>
                                  <div style={{ padding: '0.4rem 0.75rem 0.25rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Evidențiere culoare:</div>
                                  <div className="bvp-colors">
                                    {['gold', 'red', 'green', 'blue', 'purple'].map(c => (
                                      <button key={c} className={`bvp-color ${bm?.culoare === c ? 'active' : ''}`}
                                        onClick={() => handleBookmark(verse, 'highlight', c)} title={c}>
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

                {/* Navigare capitol */}
                <div className="bible-chapter-nav" style={{ marginTop: '1.5rem' }}>
                  <button className="bible-chapter-nav-btn"
                    onClick={() => selectedCapitol > 1 && handleSelectCapitol(selectedCapitol - 1)}
                    disabled={selectedCapitol <= 1}>← Capitol anterior</button>
                  <span className="bible-chapter-nav-current">{selectedCarte.ab} {selectedCapitol}</span>
                  <button className="bible-chapter-nav-btn"
                    onClick={() => selectedCapitol < selectedCarte.totalCapitole && handleSelectCapitol(selectedCapitol + 1)}
                    disabled={selectedCapitol >= selectedCarte.totalCapitole}>Capitol următor →</button>
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
