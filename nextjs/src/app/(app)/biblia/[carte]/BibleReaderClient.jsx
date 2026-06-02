'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getBibleBookBySlug, getAdjacentBibleBooks } from '@/data/bibleBooks';

// Fallback cross-references (when backend fails or doesn't have data)
const LOCAL_CROSS_REFS = {
  'Ioan 3:16': [{ carte: 'Rom', capitol: 10, versetStart: 9 }, { carte: 'Efes', capitol: 2, versetStart: 8 }, { carte: 'Ioan', capitol: 1, versetStart: 12 }],
  'Ioan 14:6': [{ carte: 'Fapt', capitol: 4, versetStart: 12 }, { carte: '1Tim', capitol: 2, versetStart: 5 }],
  'Ioan 10:10': [{ carte: 'Ier', capitol: 10, versetStart: 10 }, { carte: 'Ps', capitol: 23, versetStart: 1 }],
  'Ioan 8:12': [{ carte: 'Ps', capitol: 27, versetStart: 1 }, { carte: 'Isaia', capitol: 60, versetStart: 1 }],
  'Matei 11:28': [{ carte: 'Evr', capitol: 4, versetStart: 16 }, { carte: 'Ps', capitol: 55, versetStart: 22 }],
  'Matei 6:33': [{ carte: '1Pet', capitol: 3, versetStart: 11 }, { carte: 'Filip', capitol: 4, versetStart: 19 }],
  'Matei 5:14': [{ carte: 'Efes', capitol: 5, versetStart: 14 }, { carte: 'Filip', capitol: 2, versetStart: 15 }],
  'Ps 23:1': [{ carte: 'Ps', capitol: 23, versetStart: 4 }, { carte: 'Ier', capitol: 17, versetStart: 7 }],
  'Ps 119:105': [{ carte: '2Pet', capitol: 1, versetStart: 19 }, { carte: 'Prov', capitol: 6, versetStart: 23 }],
  'Psalmii 23:1': [{ carte: 'Ier', capitol: 17, versetStart: 7 }],
  'Ps 91:1': [{ carte: 'Ps', capitol: 91, versetStart: 2 }],
  'Ps 46:1': [{ carte: 'Ps', capitol: 46, versetStart: 11 }],
  'Isaia 40:31': [{ carte: 'Gal', capitol: 5, versetStart: 22 }, { carte: 'Efes', capitol: 3, versetStart: 20 }],
  'Isaia 41:10': [{ carte: 'Deut', capitol: 31, versetStart: 6 }, { carte: 'Iosua', capitol: 1, versetStart: 9 }],
  'Ieremia 29:11': [{ carte: 'Rom', capitol: 8, versetStart: 28 }, { carte: 'Filip', capitol: 4, versetStart: 13 }],
  'Romani 8:28': [{ carte: 'Gen', capitol: 50, versetStart: 20 }, { carte: 'Filip', capitol: 4, versetStart: 19 }],
  'Romani 8:1': [{ carte: 'Rom', capitol: 8, versetStart: 38 }, { carte: 'Gal', capitol: 2, versetStart: 16 }],
  'Romani 10:9': [{ carte: 'Rom', capitol: 10, versetStart: 13 }, { carte: '1Cor', capitol: 12, versetStart: 3 }],
  'Filipeni 4:13': [{ carte: '2Tim', capitol: 1, versetStart: 7 }, { carte: 'Efes', capitol: 3, versetStart: 20 }],
  'Filipeni 4:6': [{ carte: '1Pet', capitol: 5, versetStart: 7 }, { carte: 'Filip', capitol: 4, versetStart: 4 }],
  'Filipeni 4:7': [{ carte: 'Col', capitol: 3, versetStart: 15 }, { carte: 'Ioan', capitol: 14, versetStart: 27 }],
  'Evrei 11:1': [{ carte: 'Rom', capitol: 4, versetStart: 20 }, { carte: 'Iacov', capitol: 1, versetStart: 6 }],
  'Evrei 4:16': [{ carte: 'Evr', capitol: 10, versetStart: 22 }, { carte: 'Iacov', capitol: 1, versetStart: 5 }],
  '1 Ioan 4:7': [{ carte: '1Cor', capitol: 13, versetStart: 13 }, { carte: 'Ioan', capitol: 13, versetStart: 34 }],
  '1 Ioan 4:8': [{ carte: 'Ioan', capitol: 3, versetStart: 16 }, { carte: '1Cor', capitol: 13, versetStart: 4 }],
  '1 Petru 5:7': [{ carte: 'Ps', capitol: 55, versetStart: 22 }, { carte: 'Matei', capitol: 11, versetStart: 30 }],
  'Iacov 1:5': [{ carte: 'Prov', capitol: 2, versetStart: 3 }, { carte: 'Iacov', capitol: 4, versetStart: 3 }],
  'Apocalipsa 21:4': [{ carte: 'Isaia', capitol: 25, versetStart: 8 }, { carte: 'Rom', capitol: 8, versetStart: 18 }],
};

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://popas-pentru-suflet.onrender.com';
      
      const versesRes = await fetch(
        `${apiUrl}/api/verses?carte=${encodeURIComponent(bookName)}&capitol=${currentChapter}&limit=500`,
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
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://popas-pentru-suflet.onrender.com';
      
      const refsRes = await fetch(
        `${apiUrl}/api/cross-references/capitol?carte=${encodeURIComponent(bookName)}&capitol=${currentChapter}`,
        { signal: AbortSignal.timeout(5000) }
      );
      
      if (refsRes.ok) {
        const refsData = await refsRes.json();
        if (refsData.referinteMap) {
          setCrossRefsMap(refsData.referinteMap);
          return;
        }
      }
    } catch (err) {
      console.log('Backend cross-refs unavailable, using local');
    }
    
    // Fallback: build from LOCAL_CROSS_REFS
    const localMap = {};
    for (const refKey of Object.keys(LOCAL_CROSS_REFS)) {
      const parts = refKey.split(' ');
      if (parts.length >= 3 && parts[0] === bookName && parseInt(parts[1]) === currentChapter) {
        const verseNum = parseInt(parts[2].replace(':', '').split('-')[0]);
        localMap[verseNum] = LOCAL_CROSS_REFS[refKey];
      }
    }
    setCrossRefsMap(localMap);
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

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://popas-pentru-suflet.onrender.com';
      
      await fetch(`${apiUrl}/api/reading/mark`, {
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

  // Highlight Jesus words - different approach
  const highlightJesusWords = (text) => {
    if (!isGospelBook) return text;
    
    let result = text;
    
    // Pattern 1: „text în ghilimele românești”
    result = result.replace(/„([^"„"]+)"/g, '<span class="jesus-word">„$1"</span>');
    
    // Pattern 2: Words starting phrases that indicate Jesus is speaking
    // Romanian Bible uses specific patterns for Jesus' words
    const jesusPhrases = [
      /\bEU\s+([A-ZĂÂÎȘȚ][a-zăâîșț]+)/g,
      /\bADEVĂRUL\s+[VOUĂ]+\s+ZIC/g,
      /\b[VOUĂ]+\s+ZIC\s+EU/g,
      /\bSPUN\s+[VOUĂ]+/g,
      /\bFRAȚI\s+[VOUĂ]+/g,
      /\bCOPII\s+[VOUĂ]+/g,
    ];
    
    // Simply wrap words that commonly appear in Jesus' speech
    // In Romanian Cornilescu, Jesus often says "Eu" at start of sentences
    result = result.replace(/\bEu\s+([a-zăâîșț]+)/gi, '<span class="jesus-word">Eu $1</span>');
    
    return result;
  };

  const handleRefClick = async (ref) => {
    setSelectedRef(ref);
    setRefVerseText(null);
    setLoadingRef(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://popas-pentru-suflet.onrender.com';
      
      // Use versetStart instead of verset
      const verseNum = ref.versetStart || ref.verset;
      
      const res = await fetch(
        `${apiUrl}/api/cross-references/verset?carte=${encodeURIComponent(ref.carte)}&capitol=${ref.capitol}&verset=${verseNum}`
      );
      
      if (res.ok) {
        const data = await res.json();
        setRefVerseText(data.verset);
      } else {
        // Try fetching directly from verses API
        const versesRes = await fetch(
          `${apiUrl}/api/verses?carte=${encodeURIComponent(ref.carte)}&capitol=${ref.capitol}&limit=500`
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
                
                return (
                  <div key={verse._id || idx} className="verse-wrapper">
                    <p className="verse-item" id={`v${verse.verset}`}>
                      <sup className="verse-num">{verse.verset}</sup>
                      <span 
                        className="verse-text"
                        dangerouslySetInnerHTML={{ __html: highlightJesusWords(verse.text) }}
                      />
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

        /* Jesus words - RED */
        .jesus-word {
          color: #dc2626 !important;
          font-weight: 600;
          text-decoration: underline;
          text-decoration-style: dotted;
          text-underline-offset: 3px;
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