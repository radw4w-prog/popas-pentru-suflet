'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { getBibleBookBySlug, getAdjacentBibleBooks } from '@/data/bibleBooks';
import { getChapterCrossRefs } from '@/lib/crossRefs';
import { buildRedLetterSegments } from '@/lib/redLetter';

// URL-ul corect al backend-ului (productie). Atentie: 'popas-pentru-suflet.onrender.com'
// (fara '-backend') NU exista si returneaza 404 — de aceea trebuie sufixul '-backend'.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://popas-pentru-suflet-backend.onrender.com';

export default function BibleReaderClient({ bookSlug, bookName, currentChapter, chapters }) {
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fontSize, setFontSize] = useState(18);
  const [savedToJourney, setSavedToJourney] = useState(false);
  const [crossRefsMap, setCrossRefsMap] = useState({});
  const [selectedRef, setSelectedRef] = useState(null);
  const [refVerseText, setRefVerseText] = useState(null);
  const [loadingRef, setLoadingRef] = useState(false);

  const book = getBibleBookBySlug(bookSlug);
  const { previous, next } = getAdjacentBibleBooks(bookSlug);

  const isGospelBook = ['matei', 'marcu', 'luca', 'ioan'].includes(bookSlug);

  const fetchVerses = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSavedToJourney(false);
    
    try {
      const versesRes = await fetch(
        `${API_URL}/api/verses?carte=${encodeURIComponent(bookName)}&capitol=${currentChapter}&limit=500`,
        { signal: AbortSignal.timeout(8000) }
      );
      
      if (versesRes.ok) {
        const versesData = await versesRes.json();
        if (versesData.versete && versesData.versete.length > 0) {
          setVerses(versesData.versete);
          saveToJourney();
        } else {
          setVerses([]);
        }
      } else {
        setVerses([]);
      }
    } catch (err) {
      console.error('Error fetching verses:', err);
      setError('Nu s-au putut încărca versetele.');
      setVerses([]);
    }
    
    setLoading(false);
  }, [bookSlug, bookName, currentChapter]);

  const fetchCrossRefs = useCallback(async () => {
    // Sursa principala: setul local complet de referinte incrucisate
    // (Treasury of Scripture Knowledge, ~278.000 referinte, offline).
    const localMap = getChapterCrossRefs(bookName, currentChapter);
    setCrossRefsMap(localMap);

    // Optional: incearca sa imbogateasca cu date suplimentare din backend.
    // Daca backend-ul nu raspunde, ramane setul local (deja complet).
    try {
      const refsRes = await fetch(
        `${API_URL}/api/cross-references/capitol?carte=${encodeURIComponent(bookName)}&capitol=${currentChapter}`,
        { signal: AbortSignal.timeout(5000) }
      );

      if (refsRes.ok) {
        const refsData = await refsRes.json();
        const backendMap = refsData.referinteMap;
        if (backendMap && Object.keys(backendMap).length > 0) {
          // Pastreaza varianta cu cele mai multe referinte pentru fiecare verset.
          const merged = { ...localMap };
          for (const verseNum of Object.keys(backendMap)) {
            const beRefs = backendMap[verseNum] || [];
            const localRefs = merged[verseNum] || [];
            if (beRefs.length > localRefs.length) {
              merged[verseNum] = beRefs;
            }
          }
          setCrossRefsMap(merged);
        }
      }
    } catch (err) {
      // Setul local este deja afisat — nu e nevoie de actiune.
    }
  }, [bookName, currentChapter]);

  useEffect(() => {
    fetchVerses();
  }, [fetchVerses]);

  useEffect(() => {
    if (verses.length > 0) {
      fetchCrossRefs();
    }
  }, [verses, fetchCrossRefs]);

  const saveToJourney = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`${API_URL}/api/reading/mark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          carte: bookName,
          capitol: currentChapter
        })
      });
      
      setSavedToJourney(true);
    } catch (err) {
      console.log('Journey save failed:', err);
    }
  };

  // Cuvintele Domnului Isus (red-letter), calculate corect pe baza setului \wj.
  // Coloreaza DOAR versetele in care vorbeste Isus, respectand ghilimelele Cornilescu,
  // astfel incat vorbirea altor persoane (ex. Ioan Botezatorul, Nicodim) NU este colorata.
  const redLetterMap = useMemo(() => {
    if (!isGospelBook || verses.length === 0) return {};
    return buildRedLetterSegments(bookName, currentChapter, verses);
  }, [isGospelBook, bookName, currentChapter, verses]);

  const handleRefClick = async (ref) => {
    setSelectedRef(ref);
    setRefVerseText(null);
    setLoadingRef(true);

    const verseNum = ref.versetStart || ref.verset;

    try {
      const res = await fetch(
        `${API_URL}/api/cross-references/verset?carte=${encodeURIComponent(ref.carte)}&capitol=${ref.capitol}&verset=${verseNum}`,
        { signal: AbortSignal.timeout(8000) }
      );

      if (res.ok) {
        const data = await res.json();
        setRefVerseText(data.verset);
      } else {
        // Incearca direct din API-ul de versete
        const versesRes = await fetch(
          `${API_URL}/api/verses?carte=${encodeURIComponent(ref.carte)}&capitol=${ref.capitol}&limit=500`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (versesRes.ok) {
          const versesData = await versesRes.json();
          const found = versesData.versete?.find(v => v.verset === verseNum);
          if (found) {
            setRefVerseText(found);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch verse:', err);
    }
    
    setLoadingRef(false);
  };

  const goToPreviousChapter = () => {
    if (currentChapter > 1) {
      window.location.href = `/biblia/${bookSlug}?capitol=${currentChapter - 1}`;
    } else if (previous) {
      window.location.href = `/biblia/${previous.slug}?capitol=${previous.chapters}`;
    }
  };

  const goToNextChapter = () => {
    if (currentChapter < chapters) {
      window.location.href = `/biblia/${bookSlug}?capitol=${currentChapter + 1}`;
    } else if (next) {
      window.location.href = `/biblia/${next.slug}?capitol=1`;
    }
  };

  const getBookSlug = (name) => {
    const slugMap = {
      'Geneza': 'geneza', 'Exodul': 'exodul', 'Leviticul': 'leviticul', 'Numeri': 'numeri',
      'Deuteronomul': 'deuteronomul', 'Iosua': 'iosua', 'Judecători': 'judecatori', 'Rut': 'rut',
      '1 Samuel': '1-samuel', '2 Samuel': '2-samuel', '1 Împărați': '1-imparati', '2 Împărați': '2-imparati',
      '1 Cronici': '1-cronici', '2 Cronici': '2-cronici', 'Ezra': 'ezra', 'Neemia': 'neemia',
      'Estera': 'estera', 'Iov': 'iov', 'Psalmii': 'psalmii', 'Proverbe': 'proverbe',
      'Eclesiastul': 'eclesiastul', 'Cântarea Cântărilor': 'cantarea-cantarilor', 'Isaia': 'isaia',
      'Ieremia': 'ieremia', 'Plângerile lui Ieremia': 'plangerile-lui-ieremia', 'Ezechiel': 'ezechiel',
      'Daniel': 'daniel', 'Osea': 'osea', 'Ioel': 'ioel', 'Amos': 'amos', 'Obadia': 'obadia',
      'Iona': 'iona', 'Mica': 'mica', 'Naum': 'naum', 'Habacuc': 'habacuc', 'Ţefania': 'tefania',
      'Hagai': 'hagai', 'Zaharia': 'zaharia', 'Maleahi': 'maleahi',
      'Matei': 'matei', 'Marcu': 'marcu', 'Luca': 'luca', 'Ioan': 'ioan',
      'Faptele Apostolilor': 'faptele-apostolilor', 'Romani': 'romani', '1 Corinteni': '1-corinteni',
      '2 Corinteni': '2-corinteni', 'Galateni': 'galateni', 'Efeseni': 'efeseni',
      'Filipeni': 'filipeni', 'Coloseni': 'coloseni', '1 Tesaloniceni': '1-tesaloniceni',
      '2 Tesaloniceni': '2-tesaloniceni', '1 Timotei': '1-timotei', '2 Timotei': '2-timotei',
      'Tit': 'tit', 'Filimon': 'filimon', 'Evrei': 'evrei', 'Iacov': 'iacov',
      '1 Petru': '1-petru', '2 Petru': '2-petru', '1 Ioan': '1-ioan', '2 Ioan': '2-ioan',
      '3 Ioan': '3-ioan', 'Iuda': 'iuda', 'Apocalipsa': 'apocalipsa'
    };
    return slugMap[name] || name.toLowerCase().replace(/\s+/g, '-');
  };

  return (
    <>
      {/* Reference Modal */}
      {selectedRef && (
        <div className="ref-modal-overlay" onClick={() => setSelectedRef(null)}>
          <div className="ref-modal" onClick={e => e.stopPropagation()}>
            <div className="ref-modal-header">
              <h3>{selectedRef.carte} {selectedRef.capitol}:{selectedRef.versetStart || selectedRef.verset}</h3>
              <button className="ref-modal-close" onClick={() => setSelectedRef(null)}>✕</button>
            </div>
            <div className="ref-modal-content">
              {loadingRef ? (
                <div className="ref-loading">
                  <div className="spinner"></div>
                  <p>Se încarcă...</p>
                </div>
              ) : refVerseText ? (
                <>
                  <p className="ref-verse-text">{refVerseText.text}</p>
                  <div className="ref-modal-actions">
                    <Link href={`/biblia/${getBookSlug(selectedRef.carte)}?capitol=${selectedRef.capitol}`} className="ref-goto-btn">
                      → Mergi la verset
                    </Link>
                  </div>
                </>
              ) : (
                <p className="ref-not-found">Versetul nu a fost găsit.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="reader-content" style={{ fontSize: `${fontSize}px` }}>
        {loading ? (
          <div className="reader-loading">
            <div className="loading-spinner"></div>
            <p>Se încarcă versetele...</p>
          </div>
        ) : error ? (
          <div className="reader-error">
            <p>{error}</p>
            <button onClick={fetchVerses} className="retry-button">
              Încearcă din nou
            </button>
          </div>
        ) : verses.length > 0 ? (
          <div className="verses-container">
            <h2 className="chapter-heading">
              Capitolul {currentChapter}
              {savedToJourney && <span className="saved-badge">✓</span>}
            </h2>
            <div className="verses">
              {verses.map((verse, idx) => {
                const refs = crossRefsMap[verse.verset] || [];
                const segments = redLetterMap[verse.verset];

                return (
                  <div key={verse._id || idx} className="verse-wrapper">
                    <p className="verse-item" id={`v${verse.verset}`}>
                      <sup className="verse-num">{verse.verset}</sup>
                      <span className="verse-text">
                        {segments && segments.length > 0 ? (
                          segments.map((seg, sIdx) =>
                            seg.red ? (
                              <span key={sIdx} className="jesus-word">{seg.text}</span>
                            ) : (
                              <span key={sIdx}>{seg.text}</span>
                            )
                          )
                        ) : (
                          verse.text
                        )}
                      </span>
                    </p>
                    
                    {refs.length > 0 && (
                      <div className="verse-cross-refs">
                        <span className="ref-label">📖 </span>
                        {refs.map((ref, i) => {
                          const verseNum = ref.versetStart || ref.verset || (ref.versetEnd ? `${ref.versetStart}-${ref.versetEnd}` : ref.versetStart);
                          return (
                            <button
                              key={i}
                              className="cross-ref-link"
                              onClick={() => handleRefClick(ref)}
                            >
                              {ref.carte} {ref.capitol}:{verseNum}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="reader-empty">
            <div className="empty-icon">📖</div>
            <h3>Versete indisponibile</h3>
            <p>Versetele pentru acest capitol nu sunt disponibile momentan.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="reader-footer">
        <div className="font-controls">
          <span className="font-label small">Aa</span>
          <input
            type="range"
            min="14"
            max="26"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="font-range"
          />
          <span className="font-label large">A</span>
        </div>

        <div className="nav-controls">
          <button onClick={goToPreviousChapter} className="nav-button">
            ◀ {currentChapter > 1 ? `Cap. ${currentChapter - 1}` : (previous ? previous.name : 'Anterior')}
          </button>
          
          <Link href="/journey" className="journey-link">
            📊 Călătoria
          </Link>
          
          <span className="progress-indicator">
            {book?.name} {currentChapter}/{chapters}
          </span>
          
          <button onClick={goToNextChapter} className="nav-button">
            {currentChapter < chapters ? `Cap. ${currentChapter + 1}` : (next ? next.name : 'Următor')} ▶
          </button>
        </div>
      </div>

      <style>{`
        /* Modal */
        .ref-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .ref-modal {
          background: var(--bg-card);
          border-radius: 20px;
          max-width: 500px;
          width: 100%;
          max-height: 80vh;
          overflow: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }

        .ref-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #d4af37, #b8960c);
          color: #0a0a0f;
        }

        .ref-modal-header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 700;
        }

        .ref-modal-close {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: #0a0a0f;
          padding: 0.25rem;
        }

        .ref-modal-content {
          padding: 1.5rem;
        }

        .ref-verse-text {
          font-size: 1.1rem;
          line-height: 1.9;
          color: var(--text-primary);
          text-align: justify;
        }

        .ref-not-found {
          color: var(--text-secondary);
          text-align: center;
        }

        .ref-modal-actions {
          margin-top: 1rem;
        }

        .ref-goto-btn {
          display: inline-block;
          padding: 0.75rem 1.25rem;
          background: linear-gradient(135deg, #d4af37, #b8960c);
          color: #0a0a0f;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 700;
        }

        .ref-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
        }

        .ref-loading .spinner {
          width: 30px;
          height: 30px;
          border: 3px solid var(--border-color);
          border-top-color: #d4af37;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 0.75rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .ref-loading p {
          color: var(--text-secondary);
          margin: 0;
        }

        /* Reader */
        .reader-content {
          padding: 2rem;
          min-height: 400px;
        }

        .reader-loading, .reader-error, .reader-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 1rem;
          text-align: center;
        }

        .loading-spinner {
          width: 44px;
          height: 44px;
          border: 3px solid var(--border-color);
          border-top-color: #d4af37;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        .reader-loading p, .reader-error p, .reader-empty p {
          color: var(--text-secondary);
          margin: 0;
        }

        .retry-button {
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #d4af37, #b8960c);
          color: #0a0a0f;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .verses-container {
          max-width: 750px;
          margin: 0 auto;
        }

        .chapter-heading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          color: #d4af37;
          font-size: 1.6rem;
          font-weight: 700;
          margin: 0 0 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid var(--border-color);
        }

        .saved-badge {
          font-size: 1rem;
          color: #22c55e;
        }

        .verse-wrapper {
          margin-bottom: 0.5rem;
        }

        .verse-item {
          margin: 0 0 0.25rem;
          text-align: justify;
          line-height: 1.9;
        }

        .verse-num {
          color: #d4af37;
          font-weight: 700;
          font-size: 0.7em;
          margin-right: 0.6rem;
          min-width: 1.8em;
          display: inline-block;
          vertical-align: top;
        }

        .verse-text {
          color: var(--text-primary);
        }

        /* Cuvintele Domnului Isus - ROSU */
        .jesus-word {
          color: #c0392b !important;
        }
        [data-theme="dark"] .jesus-word {
          color: #ff6b6b !important;
        }

        /* Cross References */
        .verse-cross-refs {
          margin: 0.25rem 0 1rem 2.5rem;
          font-size: 0.8rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
        }

        .ref-label {
          color: #d4af37;
          font-weight: 700;
        }

        .cross-ref-link {
          color: #d4af37;
          padding: 0.15rem 0.5rem;
          background: rgba(212,175,55,0.1);
          border: 1px solid rgba(212,175,55,0.3);
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
        }

        .cross-ref-link:hover {
          background: rgba(212,175,55,0.25);
        }

        .reader-footer {
          border-top: 1px solid var(--border-color);
          padding: 1rem 2rem;
          background: var(--bg-input);
        }

        .font-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .font-label {
          color: var(--text-secondary);
          font-weight: 700;
        }

        .font-label.small { font-size: 0.85rem; }
        .font-label.large { font-size: 1.1rem; }

        .font-range {
          width: 120px;
          height: 4px;
          -webkit-appearance: none;
          background: var(--border-color);
          border-radius: 2px;
        }

        .font-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: #d4af37;
          border-radius: 50%;
          cursor: pointer;
        }

        .nav-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .nav-button {
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .nav-button:hover {
          border-color: #d4af37;
          background: rgba(212,175,55,0.1);
        }

        .journey-link {
          padding: 0.5rem 1rem;
          border-radius: 10px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.8rem;
        }

        .progress-indicator {
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .reader-content {
            padding: 1.5rem 1rem;
          }

          .chapter-heading {
            font-size: 1.3rem;
          }

          .reader-footer {
            padding: 1rem;
          }

          .nav-controls {
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}