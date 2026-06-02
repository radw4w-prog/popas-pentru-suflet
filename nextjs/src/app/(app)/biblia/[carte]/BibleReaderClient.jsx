'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getBibleBookBySlug, getAdjacentBibleBooks } from '@/data/bibleBooks';

export default function BibleReaderClient({ bookSlug, bookName, currentChapter, chapters }) {
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fontSize, setFontSize] = useState(18);

  const book = getBibleBookBySlug(bookSlug);
  const { previous, next } = getAdjacentBibleBooks(bookSlug);

  const fetchVerses = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try the Next.js API route first
      try {
        const response = await fetch(`/api/biblia/${bookSlug}/${currentChapter}`, {
          signal: AbortSignal.timeout(8000)
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.versete && data.versete.length > 0) {
            setVerses(data.versete);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.log('Next.js API not available, trying backend directly');
      }

      // Fallback: direct call to backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://popas-pentru-suflet.onrender.com';
      const response = await fetch(
        `${apiUrl}/api/verses?carte=${encodeURIComponent(bookName)}&capitol=${currentChapter}&limit=500`,
        { signal: AbortSignal.timeout(8000) }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.versete && data.versete.length > 0) {
          setVerses(data.versete);
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
            <h2 className="chapter-heading">Capitolul {currentChapter}</h2>
            <div className="verses">
              {verses.map((verse, idx) => (
                <p key={verse._id || idx} className="verse-item">
                  <sup className="verse-num">{verse.verset}</sup>
                  <span className="verse-text">{verse.text}</span>
                </p>
              ))}
            </div>
          </div>
        ) : (
          <div className="reader-empty">
            <div className="empty-icon">📖</div>
            <h3>Versete indisponibile</h3>
            <p>Versetele pentru acest capitol nu sunt disponibile momentan.</p>
            <p className="empty-hint">Verifică conexiunea sau încearcă mai târziu.</p>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="reader-footer">
        {/* Font Size Control */}
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

        {/* Navigation */}
        <div className="nav-controls">
          <button 
            onClick={goToPreviousChapter}
            className="nav-button"
          >
            ◀ {currentChapter > 1 ? `Cap. ${currentChapter - 1}` : (previous ? previous.name : 'Anterior')}
          </button>
          
          <span className="progress-indicator">
            {book?.name} {currentChapter}/{chapters}
          </span>
          
          <button 
            onClick={goToNextChapter}
            className="nav-button"
          >
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
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .retry-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(212,175,55,0.3);
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

        .empty-hint {
          font-size: 0.85rem;
          margin-top: 0.5rem;
          opacity: 0.7;
        }

        /* Verses */
        .verses-container {
          max-width: 750px;
          margin: 0 auto;
        }

        .chapter-heading {
          text-align: center;
          color: var(--gold-primary);
          font-size: 1.6rem;
          font-weight: 700;
          margin: 0 0 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid var(--border-color);
        }

        .verse-item {
          margin: 0 0 1.25rem;
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

        .font-label.small {
          font-size: 0.85rem;
        }

        .font-label.large {
          font-size: 1.1rem;
        }

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

        .progress-indicator {
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.9rem;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .reader-content {
            padding: 1.5rem 1rem;
          }

          .chapter-heading {
            font-size: 1.3rem;
          }

          .reader-footer {
            padding: 1rem;
            position: sticky;
            bottom: 0;
          }

          .nav-controls {
            flex-wrap: wrap;
            justify-content: center;
            gap: 0.5rem;
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