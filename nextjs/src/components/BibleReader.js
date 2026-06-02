'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

/**
 * BibleReader Component - Design inspired by eBiblia.ro
 * 
 * Features:
 * - Left sidebar with book navigation (VT/NT organized)
 * - Main content area with verses
 * - Chapter selector
 * - Search functionality
 * - Bookmarks
 * - Font size controls
 * - Cross-references
 */

export default function BibleReader({ books, initialBook = 'geneza', initialChapter = 1 }) {
  const [selectedBook, setSelectedBook] = useState(initialBook);
  const [selectedChapter, setSelectedChapter] = useState(initialChapter);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showChapterNav, setShowChapterNav] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize from URL params
  useEffect(() => {
    const bookParam = searchParams.get('carte');
    const chapterParam = searchParams.get('capitol');
    if (bookParam) setSelectedBook(bookParam);
    if (chapterParam) setSelectedChapter(parseInt(chapterParam) || 1);
  }, [searchParams]);

  // Fetch verses when book/chapter changes
  useEffect(() => {
    fetchVerses();
  }, [selectedBook, selectedChapter]);

  const fetchVerses = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/biblia/${selectedBook}/${selectedChapter}`);
      const data = await response.json();
      setVerses(data.verses || []);
    } catch (error) {
      console.error('Error fetching verses:', error);
      setVerses([]);
    }
    setLoading(false);
  };

  const handleBookSelect = (bookSlug) => {
    setSelectedBook(bookSlug);
    setSelectedChapter(1);
    router.push(`/biblia/${bookSlug}?capitol=1`, { scroll: false });
    setShowChapterNav(false);
  };

  const handleChapterSelect = (chapter) => {
    setSelectedChapter(chapter);
    router.push(`/biblia/${selectedBook}?capitol=${chapter}`, { scroll: false });
    setShowChapterNav(false);
  };

  const goToPreviousChapter = () => {
    if (selectedChapter > 1) {
      handleChapterSelect(selectedChapter - 1);
    } else {
      // Go to previous book
      const currentIndex = books.findIndex(b => b.slug === selectedBook);
      if (currentIndex > 0) {
        const prevBook = books[currentIndex - 1];
        setSelectedBook(prevBook.slug);
        setSelectedChapter(prevBook.chapters);
        router.push(`/biblia/${prevBook.slug}?capitol=${prevBook.chapters}`, { scroll: false });
      }
    }
  };

  const goToNextChapter = () => {
    const currentBook = books.find(b => b.slug === selectedBook);
    if (selectedChapter < currentBook.chapters) {
      handleChapterSelect(selectedChapter + 1);
    } else {
      // Go to next book
      const currentIndex = books.findIndex(b => b.slug === selectedBook);
      if (currentIndex < books.length - 1) {
        const nextBook = books[currentIndex + 1];
        setSelectedBook(nextBook.slug);
        setSelectedChapter(1);
        router.push(`/biblia/${nextBook.slug}?capitol=1`, { scroll: false });
      }
    }
  };

  const currentBook = books.find(b => b.slug === selectedBook);
  const chaptersArray = Array.from({ length: currentBook?.chapters || 1 }, (_, i) => i + 1);

  const oldTestament = books.filter(b => b.testament === 'VT');
  const newTestament = books.filter(b => b.testament === 'NT');

  return (
    <div className="bible-reader">
      {/* Mobile Header */}
      <div className="bible-mobile-header">
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <div className="bible-mobile-title" onClick={() => setShowChapterNav(!showChapterNav)}>
          <span>{currentBook?.name}</span>
          <span className="chapter-badge">Cap. {selectedChapter}</span>
          <span className="dropdown-icon">▼</span>
        </div>
        <div className="bible-mobile-actions">
          <button onClick={goToPreviousChapter} aria-label="Previous chapter">◀</button>
          <button onClick={goToNextChapter} aria-label="Next chapter">▶</button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Left Sidebar - Book Navigation */}
      <aside className={`bible-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link href="/biblia" className="sidebar-logo">
            📖 Biblia
          </Link>
          <button className="close-sidebar" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        {/* Search */}
        <div className="sidebar-search">
          <input
            type="text"
            placeholder="Caută în Biblie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Font Size Controls */}
        <div className="font-controls">
          <span>Aa</span>
          <input
            type="range"
            min="14"
            max="28"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
          />
          <span style={{fontSize: '18px'}}>A</span>
        </div>

        {/* Testament Tabs */}
        <div className="testament-tabs">
          <button 
            className={`tab-btn ${!searchQuery ? 'active' : ''}`}
            onClick={() => setSearchQuery('')}
          >
            📜 VT
          </button>
          <button 
            className={`tab-btn ${!searchQuery ? '' : 'active'}`}
            onClick={() => setSearchQuery('')}
          >
            ✝️ NT
          </button>
        </div>

        {/* Books List */}
        <div className="books-list">
          {/* Old Testament */}
          <div className="testament-section">
            <h3 className="testament-title">📜 Vechiul Testament</h3>
            <div className="books-grid">
              {oldTestament.map(book => (
                <button
                  key={book.slug}
                  className={`book-item ${selectedBook === book.slug ? 'active' : ''}`}
                  onClick={() => handleBookSelect(book.slug)}
                >
                  <span className="book-abbr">{book.abbr}</span>
                  <span className="book-name">{book.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* New Testament */}
          <div className="testament-section">
            <h3 className="testament-title">✝️ Noul Testament</h3>
            <div className="books-grid">
              {newTestament.map(book => (
                <button
                  key={book.slug}
                  className={`book-item ${selectedBook === book.slug ? 'active' : ''}`}
                  onClick={() => handleBookSelect(book.slug)}
                >
                  <span className="book-abbr">{book.abbr}</span>
                  <span className="book-name">{book.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="bible-content">
        {/* Chapter Header */}
        <div className="chapter-header">
          <div className="chapter-info">
            <h1>{currentBook?.name}</h1>
            <span className="chapter-count">Capitolul {selectedChapter} din {currentBook?.chapters}</span>
          </div>
          <div className="chapter-nav-buttons">
            <button onClick={goToPreviousChapter} title="Capitolul anterior">
              ◀ Anterior
            </button>
            <button onClick={() => setShowChapterNav(!showChapterNav)} className="chapter-select-btn">
              ☰ Capitole
            </button>
            <button onClick={goToNextChapter} title="Capitolul următor">
              Următor ▶
            </button>
          </div>
        </div>

        {/* Chapter Navigation Dropdown */}
        {showChapterNav && (
          <div className="chapter-nav-dropdown">
            <div className="chapter-nav-grid">
              {chaptersArray.map(ch => (
                <button
                  key={ch}
                  className={`chapter-nav-item ${selectedChapter === ch ? 'active' : ''}`}
                  onClick={() => handleChapterSelect(ch)}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Verses Content */}
        <div className="verses-container" style={{ fontSize: `${fontSize}px` }}>
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Se încarcă versetele...</p>
            </div>
          ) : verses.length > 0 ? (
            <div className="verses-list">
              {verses.map((verse, index) => (
                <p key={index} className="verse" id={`v${verse.number}`}>
                  <sup className="verse-number">{verse.number}</sup>
                  {verse.text}
                </p>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Selectează o carte și un capitol pentru a citi.</p>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bible-footer-nav">
          <button onClick={goToPreviousChapter}>
            ◀ {selectedChapter > 1 ? `Cap. ${selectedChapter - 1}` : 'Anterior'}
          </button>
          <span className="footer-progress">
            {currentBook?.name} {selectedChapter}/{currentBook?.chapters}
          </span>
          <button onClick={goToNextChapter}>
            {selectedChapter < currentBook?.chapters ? `Cap. ${selectedChapter + 1}` : 'Următor'} ▶
          </button>
        </div>
      </main>

      {/* CSS Styles */}
      <style jsx>{`
        .bible-reader {
          display: flex;
          height: calc(100vh - 60px);
          background: var(--bg-primary);
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

        .sidebar-toggle {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
        }

        .bible-mobile-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .chapter-badge {
          background: var(--gold-primary);
          color: var(--bg-primary);
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .dropdown-icon {
          font-size: 0.7rem;
          opacity: 0.6;
        }

        .bible-mobile-actions {
          display: flex;
          gap: 0.5rem;
        }

        .bible-mobile-actions button {
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          cursor: pointer;
        }

        /* Sidebar */
        .bible-sidebar {
          width: 320px;
          min-width: 320px;
          height: 100%;
          background: var(--bg-card);
          border-right: 1px solid var(--border-color);
          overflow-y: auto;
          transition: transform 0.3s ease;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
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
        }

        .close-sidebar {
          display: none;
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0.5rem;
        }

        .sidebar-search {
          padding: 0.75rem 1rem;
        }

        .sidebar-search input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .font-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .font-controls span {
          color: var(--text-secondary);
          font-weight: 600;
        }

        .font-controls input[type="range"] {
          flex: 1;
          height: 4px;
          -webkit-appearance: none;
          background: var(--border-color);
          border-radius: 2px;
        }

        .font-controls input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: var(--gold-primary);
          border-radius: 50%;
          cursor: pointer;
        }

        .testament-tabs {
          display: flex;
          padding: 0.75rem 1rem;
          gap: 0.5rem;
        }

        .tab-btn {
          flex: 1;
          padding: 0.6rem;
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.2s;
        }

        .tab-btn.active {
          background: var(--gold-primary);
          color: var(--bg-primary);
          border-color: var(--gold-primary);
        }

        .books-list {
          padding: 0 0.75rem 1rem;
        }

        .testament-section {
          margin-bottom: 1.5rem;
        }

        .testament-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .books-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }

        .book-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.75rem 0.5rem;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .book-item:hover {
          border-color: var(--gold-primary);
          background: rgba(212, 175, 55, 0.1);
        }

        .book-item.active {
          background: var(--gold-primary);
          color: var(--bg-primary);
          border-color: var(--gold-primary);
        }

        .book-abbr {
          font-weight: 700;
          font-size: 0.75rem;
          margin-bottom: 0.25rem;
        }

        .book-name {
          font-size: 0.65rem;
          opacity: 0.8;
        }

        /* Main Content */
        .bible-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chapter-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-card);
        }

        .chapter-info h1 {
          margin: 0;
          font-size: 1.5rem;
          color: var(--text-primary);
        }

        .chapter-count {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .chapter-nav-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .chapter-nav-buttons button {
          padding: 0.6rem 1rem;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          color: var(--text-primary);
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.2s;
        }

        .chapter-nav-buttons button:hover {
          border-color: var(--gold-primary);
        }

        .chapter-select-btn {
          background: var(--gold-primary) !important;
          color: var(--bg-primary) !important;
          border-color: var(--gold-primary) !important;
        }

        .chapter-nav-dropdown {
          padding: 1rem 2rem;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-color);
        }

        .chapter-nav-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
          gap: 0.5rem;
          max-height: 200px;
          overflow-y: auto;
        }

        .chapter-nav-item {
          padding: 0.75rem;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .chapter-nav-item:hover {
          border-color: var(--gold-primary);
        }

        .chapter-nav-item.active {
          background: var(--gold-primary);
          color: var(--bg-primary);
          border-color: var(--gold-primary);
        }

        .verses-container {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
          line-height: 1.8;
        }

        .verses-list {
          max-width: 800px;
          margin: 0 auto;
        }

        .verse {
          margin-bottom: 1rem;
          text-align: justify;
        }

        .verse-number {
          color: var(--gold-primary);
          font-weight: 700;
          margin-right: 0.5rem;
          font-size: 0.75em;
        }

        .loading-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-secondary);
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

        .bible-footer-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          border-top: 1px solid var(--border-color);
          background: var(--bg-card);
        }

        .bible-footer-nav button {
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          color: var(--text-primary);
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }

        .bible-footer-nav button:hover {
          border-color: var(--gold-primary);
          background: rgba(212, 175, 55, 0.1);
        }

        .footer-progress {
          color: var(--text-secondary);
          font-weight: 600;
        }

        /* Mobile Responsive */
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
          }

          .bible-sidebar.open {
            transform: translateX(0);
          }

          .sidebar-overlay {
            display: block;
            position: fixed;
            top: 116px;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 150;
          }

          .close-sidebar {
            display: block;
          }

          .bible-content {
            padding-top: 56px;
          }

          .chapter-header {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
          }

          .chapter-nav-buttons {
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
          }

          .verses-container {
            padding: 1rem;
          }

          .bible-footer-nav {
            position: fixed;
            bottom: 70px;
            left: 0;
            right: 0;
            padding: 0.75rem 1rem;
            background: var(--bg-card);
          }

          .books-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .books-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .chapter-nav-buttons button {
            padding: 0.5rem 0.75rem;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}