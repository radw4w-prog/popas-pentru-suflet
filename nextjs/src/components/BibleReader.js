'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BibleReader({ book, currentChapter, chapters, onChapterChange }) {
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fontSize, setFontSize] = useState(18);

  useEffect(() => {
    fetchVerses();
  }, [book.slug, currentChapter]);

  const fetchVerses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/biblia/${book.slug}/${currentChapter}`);
      const data = await response.json();
      
      if (data.versete && data.versete.length > 0) {
        setVerses(data.versete);
      } else if (data.verses) {
        setVerses(data.verses);
      } else {
        // Try fetching directly from backend
        const backendResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || ''}/api/verses?carte=${encodeURIComponent(book.name)}&capitol=${currentChapter}&limit=500`
        );
        const backendData = await backendResponse.json();
        if (backendData.versete) {
          setVerses(backendData.versete);
        } else {
          setVerses([]);
        }
      }
    } catch (err) {
      console.error('Error fetching verses:', err);
      setError('Nu s-au putut încărca versetele. Te rugăm să încerci din nou.');
      setVerses([]);
    }
    setLoading(false);
  };

  const goToPreviousChapter = () => {
    if (currentChapter > 1) {
      onChapterChange(currentChapter - 1);
    }
  };

  const goToNextChapter = () => {
    if (currentChapter < book.chapters) {
      onChapterChange(currentChapter + 1);
    }
  };

  return (
    <div className="bible-reader-container">
      {/* Reading Area */}
      <div className="reading-content" style={{ fontSize: `${fontSize}px` }}>
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Se încarcă versetele...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchVerses} className="retry-btn">
              Încearcă din nou
            </button>
          </div>
        ) : verses.length > 0 ? (
          <div className="verses-list">
            <h2 className="chapter-title">Capitolul {currentChapter}</h2>
            {verses.map((verse, idx) => (
              <p key={verse._id || idx} className="verse" id={`v${verse.verset}`}>
                <sup className="verse-number">{verse.verset}</sup>
                {verse.text}
              </p>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Versetele pentru acest capitol nu sunt disponibile momentan.</p>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="bible-footer">
        <div className="footer-controls">
          <span className="font-label">Aa</span>
          <input
            type="range"
            min="14"
            max="26"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="font-slider"
          />
          <span className="font-label" style={{ fontSize: '18px' }}>A</span>
        </div>
        <div className="footer-nav">
          <button 
            onClick={goToPreviousChapter}
            disabled={currentChapter <= 1}
            className="nav-btn"
          >
            ◀ {currentChapter > 1 ? `Cap. ${currentChapter - 1}` : 'Anterior'}
          </button>
          <span className="progress-text">
            {book.name} {currentChapter}/{book.chapters}
          </span>
          <button 
            onClick={goToNextChapter}
            disabled={currentChapter >= book.chapters}
            className="nav-btn"
          >
            {currentChapter < book.chapters ? `Cap. ${currentChapter + 1}` : 'Următor'} ▶
          </button>
        </div>
      </div>

      <style>{`
        .bible-reader-container {
          display: flex;
          flex-direction: column;
          min-height: 60vh;
        }

        .reading-content {
          flex: 1;
          padding: 2rem;
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
          line-height: 1.9;
        }

        .chapter-title {
          text-align: center;
          color: var(--gold-primary);
          font-size: 1.5rem;
          margin-bottom: 2rem;
          font-weight: 700;
        }

        .verse {
          margin-bottom: 1rem;
          text-align: justify;
          color: var(--text-primary);
        }

        .verse-number {
          color: var(--gold-primary);
          font-weight: 700;
          margin-right: 0.5rem;
          font-size: 0.75em;
          min-width: 1.5em;
          display: inline-block;
        }

        .loading-state, .error-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 1rem;
          color: var(--text-secondary);
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-color);
          border-top-color: var(--gold-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .retry-btn {
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          background: var(--gold-primary);
          color: var(--bg-primary);
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
        }

        .bible-footer {
          border-top: 1px solid var(--border-color);
          background: var(--bg-card);
          padding: 1rem 2rem;
        }

        .footer-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .font-label {
          color: var(--text-secondary);
          font-weight: 600;
        }

        .font-slider {
          width: 120px;
          height: 4px;
          -webkit-appearance: none;
          background: var(--border-color);
          border-radius: 2px;
        }

        .font-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: var(--gold-primary);
          border-radius: 50%;
          cursor: pointer;
        }

        .footer-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .nav-btn {
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          color: var(--text-primary);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }

        .nav-btn:hover:not(:disabled) {
          border-color: var(--gold-primary);
          background: rgba(212,175,55,0.1);
        }

        .nav-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .progress-text {
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .reading-content {
            padding: 1rem;
          }

          .footer-nav {
            flex-wrap: wrap;
            justify-content: center;
          }

          .nav-btn {
            padding: 0.6rem 1rem;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}