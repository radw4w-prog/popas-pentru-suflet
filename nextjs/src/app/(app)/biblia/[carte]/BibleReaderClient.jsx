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

  const book = getBibleBookBySlug(bookSlug);
  const { previous, next } = getAdjacentBibleBooks(bookSlug);

  // Words that indicate Jesus speaking (from Gospels)
  const isGospelBook = ['matei', 'marcu', 'luca', 'ioan'].includes(bookSlug);
  
  // Pattern to detect Jesus words - quotes in Gospels
  const jesusWordsPattern = /[\"„"]([^"„"]*)[\"„"]/g;
  
  // Common quote patterns that indicate speech
  const quotePatterns = [
    /^„/,
    /“$/,
    /«/,
    /»/
  ];

  const highlightJesusWords = (text) => {
    if (!isGospelBook) return text;
    
    // Simple approach: highlight words in quotes (direct speech)
    // This is a simplified version - in production you'd have actual tagged data
    let result = text;
    
    // For demonstration: highlight "Eu zic voua" type patterns
    const jesusPhrases = [
      /\bEu\s+(?:sunt|vou?i|am|voi|zic|dau|fac|spun|ştiu)\b/gi,
      /\bAdevărul\s+vou?i\s+zic\b/gi,
      /\bÎnainte\s+să\s+fiu\b/gi,
      /\bFiul\s+(?:omului|meu)\b/gi,
    ];
    
    // Apply highlighting by wrapping in spans
    // For production, the backend should provide tagged data
    return result;
  };

  const fetchVerses = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSavedToJourney(false);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://popas-pentru-suflet.onrender.com';
      const response = await fetch(
        `${apiUrl}/api/verses?carte=${encodeURIComponent(bookName)}&capitol=${currentChapter}&limit=500`,
        { signal: AbortSignal.timeout(8000) }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.versete && data.versete.length > 0) {
          setVerses(data.versete);
          
          // Save to journey after successful load
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

  useEffect(() => {
    fetchVerses();
  }, [fetchVerses]);

  // Save reading progress to Journey
  const saveToJourney = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://popas-pentru-suflet.onrender.com';
      
      await fetch(`${apiUrl}/api/reading/mark-read`, {
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
      
      // Also mark spiritual journey activity
      await fetch(`${apiUrl}/api/journey/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'biblia',
          data: { carte: bookName, capitol: currentChapter }
        })
      });
    } catch (err) {
      console.log('Journey save failed:', err);
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

  // Get cross-references for a verse (simplified - would need backend data)
  const getCrossReferences = (verseText) => {
    // This is a placeholder - real cross-references would come from backend
    return [];
  };

  return (
    <>
      {/* Reading Content */}
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
            </h2>
            <div className="verses">
              {verses.map((verse, idx) => {
                const crossRefs = getCrossReferences(verse.text);
                
                return (
                  <div key={verse._id || idx} className="verse-wrapper">
                    <p className="verse-item" id={`v${verse.verset}`}>
                      <sup className="verse-num">{verse.verset}</sup>
                      <span className="verse-text">
                        {highlightJesusWords(verse.text)}
                      </span>
                    </p>
                    
                    {/* Cross References (placeholder for now) */}
                    {verse.crossReferences && verse.crossReferences.length > 0 && (
                      <div className="verse-cross-refs">
                        <span className="ref-label">📖 Referințe: </span>
                        {verse.crossReferences.map((ref, i) => (
                          <Link 
                            key={i} 
                            href={`/biblia/${ref.slug}?capitol=${ref.capitol}`}
                            className="cross-ref-link"
                          >
                            {ref.name} {ref.capitol}:{ref.verset}
                          </Link>
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

        @keyframes spin {
          to { transform: rotate(360deg); }
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

        /* Verses */
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
          cursor: help;
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
          border-radius: 6px;
          transition: all 0.2s;
        }

        .cross-ref-link:hover {
          background: rgba(212,175,55,0.2);
          text-decoration: underline;
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
        }
      `}</style>
    </>
  );
}