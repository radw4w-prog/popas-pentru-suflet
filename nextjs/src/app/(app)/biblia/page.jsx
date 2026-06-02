'use client';

import { useState } from 'react';
import Link from 'next/link';
import { bibleBooks, getBibleBooksByTestament } from '@/data/bibleBooks';
import { createSeoMetadata } from '@/lib/seoMetadata';

export const metadata = createSeoMetadata({
  title: 'Biblia Cornilescu online — 66 cărți, 31.102 versete',
  description: 'Citește Biblia Cornilescu online gratuit. Explorează cele 66 de cărți ale Bibliei, accesează rapid capitolele și versetele importante.',
  path: '/biblia',
  ogTitle: 'Biblia Cornilescu online',
  ogDescription: 'Explorează cele 66 de cărți ale Bibliei și citește versetele rapid, online și gratuit.',
  imageTitle: 'Biblia Cornilescu online',
  imageSubtitle: '66 de cărți, 31.102 versete',
  imageTag: 'Biblia online',
});

export default function BibliaPage() {
  const [activeTestament, setActiveTestament] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);

  const oldTestament = getBibleBooksByTestament('VT');
  const newTestament = getBibleBooksByTestament('NT');

  // Filter books based on search
  const filteredBooks = bibleBooks.filter(book => {
    const matchesSearch = book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.abbr.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTestament === 'VT') return matchesSearch && book.testament === 'VT';
    if (activeTestament === 'NT') return matchesSearch && book.testament === 'NT';
    return matchesSearch;
  });

  // Popular books for quick access
  const popularBooks = [
    { slug: 'psalmii', name: 'Psalmii', abbr: 'Ps', chapters: 150, reason: 'Cel mai citit' },
    { slug: 'ioan', name: 'Ioan', abbr: 'Ioan', chapters: 21, reason: 'Evanghelia iubirii' },
    { slug: 'proverbe', name: 'Proverbe', abbr: 'Prov', chapters: 31, reason: 'Înțelepciune' },
    { slug: 'romani', name: 'Romani', abbr: 'Rom', chapters: 16, reason: 'Doctrină' },
    { slug: 'geneza', name: 'Geneza', abbr: 'Gen', chapters: 50, reason: 'Începuturile' },
    { slug: 'matei', name: 'Matei', abbr: 'Mat', chapters: 28, reason: 'Isus Mesia' },
  ];

  return (
    <div className="biblia-home">
      {/* Hero Section */}
      <section className="biblia-hero">
        <div className="hero-content">
          <div className="hero-icon">📖</div>
          <h1>Biblia Cornilescu</h1>
          <p className="hero-stats">
            <span className="stat">📚 66 cărți</span>
            <span className="stat">✨ 31.102 versete</span>
            <span className="stat">📜 Traducere 1914</span>
          </p>
          <p className="hero-description">
            Citește și explorează Cuvântul lui Dumnezeu în traducerea Cornilescu. 
            Accesează rapid orice carte, capitol și verset.
          </p>
          
          {/* Quick Search */}
          <div className="hero-search">
            <input
              type="text"
              placeholder="Caută o carte... (ex: Psalmii, Ioan, Geneza)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button>🔍</button>
          </div>
        </div>
      </section>

      {/* Popular Books */}
      {!searchQuery && (
        <section className="popular-section">
          <h2>⭐ Începe să citești</h2>
          <div className="popular-grid">
            {popularBooks.map(book => (
              <Link 
                key={book.slug} 
                href={`/biblia/${book.slug}`}
                className="popular-card"
              >
                <div className="popular-icon">📖</div>
                <div className="popular-info">
                  <span className="popular-abbr">{book.abbr}</span>
                  <span className="popular-name">{book.name}</span>
                  <span className="popular-reason">{book.reason}</span>
                </div>
                <span className="popular-chapters">{book.chapters} cap.</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All Books */}
      <section className="all-books-section">
        <div className="section-header">
          <h2>📚 Toate cărțile Bibliei</h2>
          
          {/* Testament Filter */}
          <div className="filter-tabs">
            <button 
              className={`filter-btn ${activeTestament === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTestament('all')}
            >
              Toate (66)
            </button>
            <button 
              className={`filter-btn ${activeTestament === 'VT' ? 'active' : ''}`}
              onClick={() => setActiveTestament('VT')}
            >
              📜 VT (39)
            </button>
            <button 
              className={`filter-btn ${activeTestament === 'NT' ? 'active' : ''}`}
              onClick={() => setActiveTestament('NT')}
            >
              ✝️ NT (27)
            </button>
          </div>
        </div>

        {/* Search Results or All Books */}
        {searchQuery ? (
          <div className="search-results">
            <p className="search-info">Rezultate pentru "{searchQuery}" ({filteredBooks.length})</p>
            <div className="books-grid">
              {filteredBooks.map(book => (
                <Link 
                  key={book.slug} 
                  href={`/biblia/${book.slug}`}
                  className="book-card"
                >
                  <span className="book-abbr">{book.abbr}</span>
                  <span className="book-name">{book.name}</span>
                  <span className="book-chapters">{book.chapters} capitole</span>
                </Link>
              ))}
            </div>
            {filteredBooks.length === 0 && (
              <div className="no-results">
                <p>Nicio carte găsită pentru "{searchQuery}"</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Old Testament */}
            {(activeTestament === 'all' || activeTestament === 'VT') && (
              <div className="testament-block">
                <h3 className="testament-title">
                  <span className="testament-icon">📜</span>
                  Vechiul Testament
                  <span className="testament-count">39 cărți</span>
                </h3>
                <div className="books-grid">
                  {oldTestament.map(book => (
                    <Link 
                      key={book.slug} 
                      href={`/biblia/${book.slug}`}
                      className="book-card"
                    >
                      <span className="book-abbr">{book.abbr}</span>
                      <span className="book-name">{book.name}</span>
                      <span className="book-chapters">{book.chapters} cap.</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* New Testament */}
            {(activeTestament === 'all' || activeTestament === 'NT') && (
              <div className="testament-block">
                <h3 className="testament-title">
                  <span className="testament-icon">✝️</span>
                  Noul Testament
                  <span className="testament-count">27 cărți</span>
                </h3>
                <div className="books-grid">
                  {newTestament.map(book => (
                    <Link 
                      key={book.slug} 
                      href={`/biblia/${book.slug}`}
                      className="book-card"
                    >
                      <span className="book-abbr">{book.abbr}</span>
                      <span className="book-name">{book.name}</span>
                      <span className="book-chapters">{book.chapters} cap.</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>✨ Funcționalități</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🔍</span>
            <h3>Căutare rapidă</h3>
            <p>Găsește orice verset sau expresie în toată Biblia</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📱</span>
            <h3>Responsive</h3>
            <p>Citește pe orice dispozitiv - mobil, tabletă sau desktop</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🔗</span>
            <h3>Cross-references</h3>
            <p>Vezi versetele înrudite și conexiunile biblice</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🎯</span>
            <h3>Navigare ușoară</h3>
            <p>Sară rapid la orice capitol sau verset</p>
          </div>
        </div>
      </section>

      <style jsx>{`
        .biblia-home {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem 3rem;
        }

        /* Hero Section */
        .biblia-hero {
          text-align: center;
          padding: 3rem 1rem;
          background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-primary) 100%);
          border-radius: 24px;
          margin-bottom: 2rem;
          border: 1px solid var(--border-color);
        }

        .hero-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .biblia-hero h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 1rem;
          background: linear-gradient(135deg, var(--gold-primary) 0%, #f4cf67 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .hero-description {
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto 2rem;
          line-height: 1.6;
        }

        .hero-search {
          display: flex;
          max-width: 500px;
          margin: 0 auto;
          gap: 0.5rem;
        }

        .hero-search input {
          flex: 1;
          padding: 1rem 1.5rem;
          border-radius: 16px;
          border: 2px solid var(--border-color);
          background: var(--bg-input);
          font-size: 1rem;
          color: var(--text-primary);
        }

        .hero-search input:focus {
          outline: none;
          border-color: var(--gold-primary);
        }

        .hero-search button {
          padding: 1rem 1.5rem;
          border-radius: 16px;
          border: none;
          background: var(--gold-primary);
          font-size: 1.2rem;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .hero-search button:hover {
          transform: scale(1.05);
        }

        /* Popular Section */
        .popular-section {
          margin-bottom: 2.5rem;
        }

        .popular-section h2 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .popular-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }

        .popular-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .popular-card:hover {
          border-color: var(--gold-primary);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .popular-icon {
          font-size: 2rem;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--gold-primary) 0%, #b8960c 100%);
          border-radius: 12px;
        }

        .popular-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .popular-abbr {
          font-weight: 800;
          color: var(--gold-primary);
          font-size: 0.9rem;
        }

        .popular-name {
          color: var(--text-primary);
          font-weight: 700;
          font-size: 1.1rem;
        }

        .popular-reason {
          color: var(--text-secondary);
          font-size: 0.8rem;
        }

        .popular-chapters {
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 600;
        }

        /* All Books Section */
        .all-books-section {
          margin-bottom: 2.5rem;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .section-header h2 {
          font-size: 1.5rem;
          color: var(--text-primary);
          margin: 0;
        }

        .filter-tabs {
          display: flex;
          gap: 0.5rem;
        }

        .filter-btn {
          padding: 0.6rem 1.2rem;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          color: var(--text-secondary);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn:hover {
          border-color: var(--gold-primary);
        }

        .filter-btn.active {
          background: var(--gold-primary);
          color: var(--bg-primary);
          border-color: var(--gold-primary);
        }

        .testament-block {
          margin-bottom: 2rem;
        }

        .testament-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.2rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid var(--border-color);
        }

        .testament-icon {
          font-size: 1.5rem;
        }

        .testament-count {
          margin-left: auto;
          font-size: 0.9rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 0.75rem;
        }

        .book-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          text-decoration: none;
          transition: all 0.2s;
          text-align: center;
        }

        .book-card:hover {
          border-color: var(--gold-primary);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .book-abbr {
          font-weight: 800;
          color: var(--gold-primary);
          font-size: 1rem;
          margin-bottom: 0.25rem;
        }

        .book-name {
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .book-chapters {
          color: var(--text-secondary);
          font-size: 0.75rem;
        }

        .search-info {
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .no-results {
          text-align: center;
          padding: 3rem;
          color: var(--text-secondary);
        }

        /* Features Section */
        .features-section {
          margin-top: 3rem;
        }

        .features-section h2 {
          font-size: 1.5rem;
          text-align: center;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }

        .feature-card {
          text-align: center;
          padding: 1.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
        }

        .feature-icon {
          font-size: 2rem;
          margin-bottom: 0.75rem;
          display: block;
        }

        .feature-card h3 {
          font-size: 1rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .feature-card p {
          color: var(--text-secondary);
          font-size: 0.85rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .biblia-hero {
            padding: 2rem 1rem;
          }

          .biblia-hero h1 {
            font-size: 1.8rem;
          }

          .hero-stats {
            gap: 1rem;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .books-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          }

          .popular-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .books-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .filter-tabs {
            width: 100%;
            overflow-x: auto;
          }

          .filter-btn {
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
}