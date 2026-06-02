'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { bibleBooks, getBibleBookBySlug, getBibleBooksByTestament, getAdjacentBibleBooks } from '@/data/bibleBooks';

function testamentLabel(testament) {
  return testament === 'VT' ? 'Vechiul Testament' : 'Noul Testament';
}

export default function BibleBookPage({ params }) {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const resolvedBook = getBibleBookBySlug(params.carte);
    if (resolvedBook) {
      setBook(resolvedBook);
    }
    setLoading(false);
  }, [params.carte]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Se încarcă...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="not-found">
        <h1>Carte negăsită</h1>
        <p>Cărțile disponibile:</p>
        <div className="books-links">
          {bibleBooks.slice(0, 10).map(b => (
            <Link key={b.slug} href={`/biblia/${b.slug}`}>{b.name}</Link>
          ))}
        </div>
        <Link href="/biblia" className="back-link">← Înapoi la lista cărților</Link>
      </div>
    );
  }

  const currentChapter = parseInt(searchParams.get('capitol')) || 1;
  const { previous, next } = getAdjacentBibleBooks(book.slug);
  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);

  // Organize sidebar books
  const oldTestament = getBibleBooksByTestament('VT');
  const newTestament = getBibleBooksByTestament('NT');

  return (
    <div className="bible-reader">
      {/* Mobile Header */}
      <div className="bible-mobile-header">
        <Link href="/biblia" className="mobile-back">←</Link>
        <div className="bible-mobile-title">
          <span className="book-abbr-small">{book.abbr}</span>
          <span className="chapter-badge">Cap. {currentChapter}</span>
        </div>
        <div className="bible-mobile-actions">
          <Link href={`/biblia/${book.slug}?capitol=${Math.max(1, currentChapter - 1)}`}>◀</Link>
          <Link href={`/biblia/${book.slug}?capitol=${Math.min(book.chapters, currentChapter + 1)}`}>▶</Link>
        </div>
      </div>

      {/* Left Sidebar */}
      <aside className="bible-sidebar">
        <div className="sidebar-header">
          <Link href="/biblia" className="sidebar-logo">
            📖 Biblia
          </Link>
        </div>

        {/* Current Book Info */}
        <div className="current-book-info">
          <div className="current-book-badge">
            <span>{book.abbr}</span>
          </div>
          <div className="current-book-details">
            <h3>{book.name}</h3>
            <span>{book.chapters} capitole</span>
            <span className="testament-tag">{testamentLabel(book.testament)}</span>
          </div>
        </div>

        {/* Testament Tabs */}
        <div className="testament-tabs">
          <span className="tab-label">📜 VT</span>
          <span className="tab-label">✝️ NT</span>
        </div>

        {/* Books List */}
        <div className="books-list">
          <div className="testament-section">
            <h4 className="testament-title">📜 Vechiul Testament</h4>
            <div className="books-mini-grid">
              {oldTestament.map(b => (
                <Link
                  key={b.slug}
                  href={`/biblia/${b.slug}`}
                  className={`book-mini-item ${book.slug === b.slug ? 'active' : ''}`}
                >
                  {b.abbr}
                </Link>
              ))}
            </div>
          </div>

          <div className="testament-section">
            <h4 className="testament-title">✝️ Noul Testament</h4>
            <div className="books-mini-grid">
              {newTestament.map(b => (
                <Link
                  key={b.slug}
                  href={`/biblia/${b.slug}`}
                  className={`book-mini-item ${book.slug === b.slug ? 'active' : ''}`}
                >
                  {b.abbr}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="bible-content">
        {/* Book Header */}
        <div className="book-header">
          <div className="book-title-area">
            <h1>{book.name}</h1>
            <span className="book-meta">
              {book.chapters} capitole • {testamentLabel(book.testament)} • {book.theme}
            </span>
          </div>
          
          <div className="nav-buttons">
            {previous && (
              <Link href={`/biblia/${previous.slug}?capitol=${previous.chapters}`} className="nav-btn">
                ◀ {previous.name}
              </Link>
            )}
            <Link href={`/biblia/${book.slug}`} className="nav-btn chapters-btn">
              ☰ Capitole
            </Link>
            {next && (
              <Link href={`/biblia/${next.slug}?capitol=1`} className="nav-btn">
                {next.name} ▶
              </Link>
            )}
          </div>
        </div>

        {/* Chapter Selector */}
        <div className="chapter-selector">
          <h3>Selectează capitolul</h3>
          <div className="chapter-grid">
            {chapters.map(ch => (
              <Link
                key={ch}
                href={`/biblia/${book.slug}?capitol=${ch}`}
                className={`chapter-item ${currentChapter === ch ? 'active' : ''}`}
              >
                {ch}
              </Link>
            ))}
          </div>
        </div>

        {/* Reading Area */}
        <div className="reading-area" id="reading-content">
          {/* TODO: Implement API call to fetch verses from backend */}
          <div className="verses-placeholder">
            <h2>Capitolul {currentChapter}</h2>
            <p className="placeholder-text">
              Conținutul acestui capitol va fi încărcat din baza de date.
            </p>
            <p className="placeholder-text">
              Capitolul {currentChapter} din {book.name} are {book.chapters} versete.
            </p>
            <div className="placeholder-actions">
              <Link href="/biblia" className="action-link">
                ← Vezi toate cărțile
              </Link>
              {currentChapter > 1 && (
                <Link href={`/biblia/${book.slug}?capitol=${currentChapter - 1}`} className="action-link">
                  ← Capitolul anterior
                </Link>
              )}
              {currentChapter < book.chapters && (
                <Link href={`/biblia/${book.slug}?capitol=${currentChapter + 1}`} className="action-link">
                  Capitolul următor →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="bible-footer">
          <div className="footer-nav">
            {currentChapter > 1 ? (
              <Link href={`/biblia/${book.slug}?capitol=${currentChapter - 1}`}>
                ◀ Cap. {currentChapter - 1}
              </Link>
            ) : previous ? (
              <Link href={`/biblia/${previous.slug}?capitol=${previous.chapters}`}>
                ◀ {previous.name}
              </Link>
            ) : (
              <span />
            )}
            
            <span className="footer-progress">
              {book.name} {currentChapter}/{book.chapters}
            </span>
            
            {currentChapter < book.chapters ? (
              <Link href={`/biblia/${book.slug}?capitol=${currentChapter + 1}`}>
                Cap. {currentChapter + 1} ▶
              </Link>
            ) : next ? (
              <Link href={`/biblia/${next.slug}?capitol=1`}>
                {next.name} ▶
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        .bible-reader {
          display: flex;
          min-height: calc(100vh - 60px);
          background: var(--bg-primary);
        }

        /* Loading State */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
          gap: 1rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-color);
          border-top-color: var(--gold-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Not Found */
        .not-found {
          text-align: center;
          padding: 4rem 2rem;
        }

        .books-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.5rem;
          margin: 1rem 0;
        }

        .books-links a {
          padding: 0.5rem 1rem;
          background: var(--bg-card);
          border-radius: 8px;
          text-decoration: none;
          color: var(--text-primary);
        }

        .back-link {
          display: inline-block;
          margin-top: 1rem;
          color: var(--gold-primary);
        }

        /* Mobile Header */
        .bible-mobile-header {
          display: none;
          position: fixed;
          top: 60px;
          left: 0;
          right: 0;
          height: 56px;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-color);
          padding: 0 1rem;
          align-items: center;
          justify-content: space-between;
          z-index: 100;
        }

        .mobile-back {
          font-size: 1.5rem;
          text-decoration: none;
          color: var(--text-primary);
          padding: 0.5rem;
        }

        .bible-mobile-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .book-abbr-small {
          font-weight: 700;
          color: var(--gold-primary);
        }

        .chapter-badge {
          background: var(--gold-primary);
          color: var(--bg-primary);
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .bible-mobile-actions {
          display: flex;
          gap: 0.5rem;
        }

        .bible-mobile-actions a {
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          text-decoration: none;
          color: var(--text-primary);
        }

        /* Sidebar */
        .bible-sidebar {
          width: 300px;
          min-width: 300px;
          height: 100vh;
          position: sticky;
          top: 60px;
          background: var(--bg-card);
          border-right: 1px solid var(--border-color);
          overflow-y: auto;
        }

        .sidebar-header {
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          background: var(--bg-card);
          z-index: 10;
        }

        .sidebar-logo {
          font-size: 1.2rem;
          font-weight: 700;
          text-decoration: none;
          color: var(--gold-primary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .current-book-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, transparent 100%);
          border-bottom: 1px solid var(--border-color);
        }

        .current-book-badge {
          width: 50px;
          height: 50px;
          background: var(--gold-primary);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: var(--bg-primary);
          font-size: 0.9rem;
        }

        .current-book-details h3 {
          margin: 0 0 0.25rem;
          font-size: 1rem;
          color: var(--text-primary);
        }

        .current-book-details span {
          display: block;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .testament-tag {
          color: var(--gold-primary) !important;
          font-weight: 600;
        }

        .testament-tabs {
          display: flex;
          padding: 0.75rem 1rem;
          gap: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .tab-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
        }

        .tab-label:hover {
          background: var(--bg-input);
        }

        .books-list {
          padding: 0.75rem;
        }

        .testament-section {
          margin-bottom: 1.25rem;
        }

        .testament-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .books-mini-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.4rem;
        }

        .book-mini-item {
          padding: 0.5rem;
          text-align: center;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 600;
          text-decoration: none;
          color: var(--text-primary);
          transition: all 0.2s;
        }

        .book-mini-item:hover {
          border-color: var(--gold-primary);
        }

        .book-mini-item.active {
          background: var(--gold-primary);
          color: var(--bg-primary);
          border-color: var(--gold-primary);
        }

        /* Main Content */
        .bible-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .book-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-card);
          flex-wrap: wrap;
          gap: 1rem;
        }

        .book-title-area h1 {
          margin: 0 0 0.5rem;
          font-size: 1.75rem;
          color: var(--text-primary);
        }

        .book-meta {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .nav-buttons {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .nav-btn {
          padding: 0.6rem 1rem;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          color: var(--text-primary);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.2s;
        }

        .nav-btn:hover {
          border-color: var(--gold-primary);
        }

        .chapters-btn {
          background: var(--gold-primary);
          color: var(--bg-primary);
          border-color: var(--gold-primary);
        }

        /* Chapter Selector */
        .chapter-selector {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-card);
        }

        .chapter-selector h3 {
          margin: 0 0 1rem;
          font-size: 1rem;
          color: var(--text-secondary);
        }

        .chapter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
          gap: 0.5rem;
          max-height: 250px;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .chapter-item {
          padding: 0.75rem;
          text-align: center;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          text-decoration: none;
          color: var(--text-primary);
          font-weight: 600;
          transition: all 0.2s;
        }

        .chapter-item:hover {
          border-color: var(--gold-primary);
          background: rgba(212, 175, 55, 0.1);
        }

        .chapter-item.active {
          background: var(--gold-primary);
          color: var(--bg-primary);
          border-color: var(--gold-primary);
        }

        /* Reading Area */
        .reading-area {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        .verses-placeholder {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
          padding: 3rem 1rem;
        }

        .verses-placeholder h2 {
          font-size: 1.5rem;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
        }

        .placeholder-text {
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .placeholder-actions {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 2rem;
          flex-wrap: wrap;
        }

        .action-link {
          color: var(--gold-primary);
          text-decoration: none;
          font-weight: 600;
        }

        .action-link:hover {
          text-decoration: underline;
        }

        /* Footer */
        .bible-footer {
          padding: 1rem 2rem;
          border-top: 1px solid var(--border-color);
          background: var(--bg-card);
        }

        .footer-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .footer-nav a {
          padding: 0.75rem 1rem;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          text-decoration: none;
          color: var(--text-primary);
          font-weight: 600;
          transition: all 0.2s;
        }

        .footer-nav a:hover {
          border-color: var(--gold-primary);
        }

        .footer-progress {
          color: var(--text-secondary);
          font-weight: 600;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .bible-sidebar {
            width: 260px;
            min-width: 260px;
          }

          .books-mini-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .bible-mobile-header {
            display: flex;
          }

          .bible-sidebar {
            position: fixed;
            left: 0;
            top: 116px;
            bottom: 0;
            z-index: 200;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }

          .bible-sidebar.open {
            transform: translateX(0);
          }

          .bible-content {
            padding-top: 56px;
          }

          .book-header {
            flex-direction: column;
            align-items: flex-start;
            padding: 1rem;
          }

          .nav-buttons {
            width: 100%;
            justify-content: center;
          }

          .chapter-selector {
            padding: 1rem;
          }

          .reading-area {
            padding: 1rem;
          }

          .bible-footer {
            position: fixed;
            bottom: 70px;
            left: 0;
            right: 0;
            padding: 0.75rem 1rem;
          }

          .footer-nav {
            justify-content: space-around;
          }

          .books-mini-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        @media (max-width: 480px) {
          .books-mini-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .nav-buttons {
            flex-direction: column;
          }

          .nav-btn {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}