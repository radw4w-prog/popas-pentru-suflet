'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getBibleBookBySlug, getAdjacentBibleBooks } from '@/data/bibleBooks';

export default function BibleReaderClient({ bookSlug, bookName, currentChapter, chapters }) {
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fontSize, setFontSize] = useState(18);
  const [savedToJourney, setSavedToJourney] = useState(false);
  const [crossRefsMap, setCrossRefsMap] = useState({});
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [selectedRef, setSelectedRef] = useState(null);
  const [refVerseText, setRefVerseText] = useState(null);

  const book = getBibleBookBySlug(bookSlug);
  const { previous, next } = getAdjacentBibleBooks(bookSlug);

  // Gospel books where Jesus speaks
  const isGospelBook = ['matei', 'marcu', 'luca', 'ioan'].includes(bookSlug);

  // Fetch verses
  const fetchVerses = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSavedToJourney(false);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://popas-pentru-suflet.onrender.com';
      
      // Fetch verses
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

  // Fetch cross-references for the whole chapter
  const fetchCrossRefs = useCallback(async () => {
    setLoadingRefs(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://popas-pentru-suflet.onrender.com';
      
      const refsRes = await fetch(
        `${apiUrl}/api/cross-references/capitol?carte=${encodeURIComponent(bookName)}&capitol=${currentChapter}`,
        { signal: AbortSignal.timeout(8000) }
      );
      
      if (refsRes.ok) {
        const refsData = await refsRes.json();
        if (refsData.referinteMap) {
          setCrossRefsMap(refsData.referinteMap);
        }
      }
    } catch (err) {
      console.log('Cross-refs fetch failed:', err);
      // Try individual fetch for each verse
      await fetchCrossRefsIndividually();
    }
    setLoadingRefs(false);
  }, [bookName, currentChapter]);

  // Fallback: fetch cross-refs for each verse individually
  const fetchCrossRefsIndividually = async () => {
    const refsMap = {};
    for (const verse of verses) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://popas-pentru-suflet.onrender.com';
        const res = await fetch(
          `${apiUrl}/api/cross-references?carte=${encodeURIComponent(bookName)}&capitol=${currentChapter}&verset=${verse.verset}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.referinte && data.referinte.length > 0) {
            refsMap[verse.verset] = data.referinte;
          }
        }
      } catch (e) {}
    }
    setCrossRefsMap(refsMap);
  };

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

  // Highlight Jesus words in Gospels
  const highlightJesusWords = (text) => {
    if (!isGospelBook) return text;
    
    // Jesus speaking indicators in Romanian:
    // - „..." quotes (Romanian left quote)
    // - Words like "Eu zic vouă", "Adevărul vouă zic", etc.
    
    let result = text;
    
    // Wrap text in quotes with red color
    result = result.replace(/„([^"„"]+)"/g, '<span class="jesus-word">„$1"</span>');
    result = result.replace(/"([^""]+)"/g, '<span class="jesus-word">"$1"</span>');
    
    // Add special styling for direct speech indicators
    const jesusPatterns = [
      /([Ee]u\s+zic\s+[vouă]+)/g,
      /([Aa]devărul\s+[vouă]+\s+zic)/g,
      /([Vv]ouă\s+zic)/g,
      /([Ee]u\s+(?:sunt|am|voi|dau|fac|spun|ştiu))/g,
      /([Tt]atăl\s+(?:meu|meu|voi))/g,
      /([Ii]fătul\s+(?:omului|meu))/g,
    ];
    
    // Apply highlighting - just wrap in special span
    for (const pattern of jesusPatterns) {
      result = result.replace(pattern, '<span class="jesus-word">$1</span>');
    }
    
    return result;
  };

  // Fetch verse text when clicking a cross-reference
  const handleRefClick = async (ref) => {
    setSelectedRef(ref);
    setRefVerseText(null);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://popas-pentru-suflet.onrender.com';
      const res = await fetch(
        `${apiUrl}/api/cross-references/verset?carte=${encodeURIComponent(ref.carte)}&capitol=${ref.capitol}&verset=${ref.verset}`
      );
      
      if (res.ok) {
        const data = await res.json();
        setRefVerseText(data.verset);
      }
    } catch (err) {
      console.error('Failed to fetch verse:', err);
    }
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

  // Get book slug from name
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
      {/* Verse Reference Modal */}
      {selectedRef && (
        <div className="ref-modal-overlay" onClick={() => setSelectedRef(null)}>
          <div className="ref-modal" onClick={e => e.stopPropagation()}>
            <div className="ref-modal-header">
              <h3>{selectedRef.carte} {selectedRef.capitol}:{selectedRef.verset}</h3>
              <button className="ref-modal-close" onClick={() => setSelectedRef(null)}>✕</button>
            </div>
            <div className="ref-modal-content">
              {refVerseText ? (
                <>
                  <p className="ref-verse-text">{refVerseText.text}</p>
                  <div className="ref-modal-actions">
                    <Link href={`/biblia/${getBookSlug(selectedRef.carte)}?capitol=${selectedRef.capitol}`} className="ref-goto-btn">
                      → Mergi la verset
                    </Link>
                  </div>
                </>
              ) : (
                <div className="ref-loading">
                  <div className="spinner"></div>
                  <p>Se încarcă...</p>
                </div>
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
              {savedToJourney && <span className="saved-badge" title="Salvat în Journey">✓</span>}
              {loadingRefs && <span className="loading-refs">📖</span>}
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
                    
                    {/* Cross References */}
                    {refs.length > 0 && (
                      <div className="verse-cross-refs">
                        <span className="ref-label">📖 Referințe: </span>
                        {refs.map((ref, i) => (
                          <button
                            key={i}
                            className="cross-ref-link"
                            onClick={() => handleRefClick(ref)}
                          >
                            {ref.carte} {ref.capitol}:{ref.verset}
                          </button>
                        ))}
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

      {/* Footer Controls */}
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
            📊 Călătoria Spirituală
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
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .ref-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          background: var(--gold-primary);
          color: var(--bg-primary);
        }

        .ref-modal-header h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .ref-modal-close {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: var(--bg-primary);
          padding: 0.25rem;
        }

        .ref-modal-content {
          padding: 1.5rem;
        }

        .ref-verse-text {
          font-size: 1.1rem;
          line-height: 1.8;
          color: var(--text-primary);
          text-align: justify;
        }

        .ref-modal-actions {
          margin-top: 1rem;
          display: flex;
          gap: 0.75rem;
        }

        .ref-goto-btn {
          padding: 0.75rem 1.25rem;
          background: var(--gold-primary);
          color: var(--bg-primary);
          border-radius: 10px;
          text-decoration: none;
          font-weight: 600;
          transition: transform 0.2s;
        }

        .ref-goto-btn:hover {
          transform: scale(1.02);
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
          border-top-color: var(--gold-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .ref-loading p {
          color: var(--text-secondary);
          margin: 0;
        }

        /* Reader Content */
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

        .reader-empty h3 {
          color: var(--text-primary);
          margin: 0 0 0.5rem;
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
          text-align: center;
          color: var(--gold-primary);
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

        .loading-refs {
          font-size: 1rem;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
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
          color: var(--gold-primary);
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
          font-weight: 500;
          font-style: italic;
        }

        /* Cross References */
        .verse-cross-refs {
          margin: 0.25rem 0 1rem 2.5rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
        }

        .ref-label {
          color: var(--gold-primary);
          font-weight: 600;
        }

        .cross-ref-link {
          color: var(--gold-primary);
          text-decoration: none;
          padding: 0.15rem 0.5rem;
          background: rgba(212,175,55,0.1);
          border: 1px solid rgba(212,175,55,0.3);
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cross-ref-link:hover {
          background: rgba(212,175,55,0.25);
          border-color: var(--gold-primary);
        }

        /* Footer */
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
          transition: all 0.2s;
        }

        .nav-button:hover {
          border-color: var(--gold-primary);
          background: rgba(212,175,55,0.1);
        }

        .journey-link {
          padding: 0.5rem 1rem;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.8rem;
          transition: transform 0.2s;
        }

        .journey-link:hover {
          transform: scale(1.05);
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

          .nav-button {
            padding: 0.6rem 1rem;
            font-size: 0.85rem;
          }

          .verse-cross-refs {
            margin-left: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}