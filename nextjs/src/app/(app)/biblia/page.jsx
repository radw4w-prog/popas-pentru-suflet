import Link from 'next/link';
import VersesPage from '@/views/VersesPage';
import { getBibleBooksByTestament } from '@/data/bibleBooks';
import { createSeoMetadata } from '@/lib/seoMetadata';

export const metadata = createSeoMetadata({
  title: 'Biblia Cornilescu online — 31.102 versete',
  description: 'Citește Biblia Cornilescu online gratuit. Explorează cele 66 de cărți ale Bibliei, accesează rapid capitolele și versetele importante.',
  path: '/biblia',
  ogTitle: 'Biblia Cornilescu online — 66 de cărți',
  ogDescription: 'Explorează cele 66 de cărți ale Bibliei și citește versetele rapid, online și gratuit.',
  imageTitle: 'Biblia Cornilescu online',
  imageSubtitle: '66 de cărți, 31.102 versete și acces rapid la capitole',
  imageTag: 'Biblia online',
});

export const dynamic = 'force-dynamic';

export default function Biblia() {
  const oldTestament = getBibleBooksByTestament('VT');
  const newTestament = getBibleBooksByTestament('NT');

  return (
    <div className="biblia-container">
      {/* Hero Section */}
      <div className="biblia-hero">
        <div className="hero-icon">📖</div>
        <span className="hero-badge">📚 66 cărți</span>
        <span className="hero-badge">✨ 31.102 versete</span>
        <h1>Biblia Cornilescu</h1>
        <p className="hero-description">
          Descoperă fiecare carte a Bibliei, accesează capitolele rapid și citește online într-o interfață clară,
          optimizată pentru mobil, desktop și PWA.
        </p>
        <div className="hero-actions">
          <Link href="/biblia/geneza?capitol=1" className="cta-primary" style={ctaPrimaryStyle}>
            📘 Începe cu Geneza
          </Link>
          <Link href="/biblia/ioan?capitol=1" className="cta-secondary" style={ctaSecondaryStyle}>
            ✝️ Mergi la Ioan
          </Link>
        </div>
      </div>

      {/* Books Grid */}
      <div className="books-section">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          Cărțile Bibliei
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Fiecare carte are propria pagină statică, indexabilă, cu prezentare și acces rapid la capitole.
        </p>

        {/* Old Testament */}
        <div className="testament-section">
          <h3 style={sectionTitleStyle}>📜 Vechiul Testament</h3>
          <div className="books-grid" style={booksGridStyle}>
            {oldTestament.map((book) => (
              <Link
                key={book.slug}
                href={`/biblia/${book.slug}`}
                style={bookCardStyle}
                className="book-card"
              >
                <span className="book-name">{book.name}</span>
                <span className="book-chapters">{book.chapters} capitole</span>
              </Link>
            ))}
          </div>
        </div>

        {/* New Testament */}
        <div className="testament-section">
          <h3 style={sectionTitleStyle}>✝️ Noul Testament</h3>
          <div className="books-grid" style={booksGridStyle}>
            {newTestament.map((book) => (
              <Link
                key={book.slug}
                href={`/biblia/${book.slug}`}
                style={bookCardStyle}
                className="book-card"
              >
                <span className="book-name">{book.name}</span>
                <span className="book-chapters">{book.chapters} capitole</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Verse Search Section */}
      <VersesPage />

      <style>{`
        .biblia-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 1.5rem 1rem 4rem;
        }

        .biblia-hero {
          text-align: center;
          padding: 3rem 1.5rem;
          background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-primary) 100%);
          border-radius: 24px;
          margin-bottom: 2.5rem;
          border: 1px solid var(--border-color);
        }

        .hero-icon {
          font-size: 4rem;
          display: block;
          margin-bottom: 1rem;
        }

        .hero-badge {
          display: inline-block;
          padding: 0.28rem 0.65rem;
          border-radius: 999px;
          border: 1px solid rgba(212,175,55,0.25);
          background: rgba(212,175,55,0.08);
          color: var(--gold-primary);
          font-size: 0.76rem;
          font-weight: 700;
          margin: 0 0.25rem;
        }

        .biblia-hero h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 1.25rem 0 1rem;
          background: linear-gradient(135deg, var(--gold-primary) 0%, #f4cf67 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          color: var(--text-secondary);
          max-width: 650px;
          margin: 0 auto 2rem;
          line-height: 1.65;
          font-size: 1rem;
        }

        .hero-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .cta-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          border-radius: 14px;
          background: linear-gradient(135deg, #d4af37, #b8960c);
          color: #0a0a0f;
          text-decoration: none;
          font-weight: 800;
          padding: 0.75rem 1.25rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(212,175,55,0.3);
        }

        .cta-secondary {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          border-radius: 14px;
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          color: var(--text-primary);
          text-decoration: none;
          font-weight: 700;
          padding: 0.75rem 1.25rem;
          transition: all 0.2s;
        }

        .cta-secondary:hover {
          border-color: var(--gold-primary);
          background: rgba(212,175,55,0.05);
        }

        .books-section {
          margin-bottom: 3rem;
        }

        .testament-section {
          margin-bottom: 2.5rem;
        }

        .books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 0.7rem;
        }

        .book-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.1rem 0.9rem;
          border-radius: 16px;
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          text-decoration: none;
          transition: all 0.2s;
          text-align: center;
        }

        .book-card:hover {
          border-color: var(--gold-primary);
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.12);
        }

        .book-card .book-name {
          color: var(--text-primary);
          font-weight: 700;
          font-size: 0.95rem;
          margin-bottom: 0.3rem;
        }

        .book-card .book-chapters {
          color: var(--text-secondary);
          font-size: 0.78rem;
        }

        @media (max-width: 768px) {
          .biblia-hero h1 {
            font-size: 1.8rem;
          }

          .hero-actions {
            flex-direction: column;
            align-items: center;
          }

          .books-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 0.6rem;
          }

          .book-card {
            padding: 0.9rem 0.6rem;
          }

          .book-card .book-name {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}

const cardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: '22px',
  padding: '1.15rem',
};

const badgeStyle = {
  padding: '0.28rem 0.65rem',
  borderRadius: '999px',
  border: '1px solid rgba(212,175,55,0.25)',
  background: 'rgba(212,175,55,0.08)',
  color: 'var(--gold-primary)',
  fontSize: '0.76rem',
  fontWeight: 700,
};

const ctaPrimaryStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 48,
  borderRadius: '14px',
  background: 'linear-gradient(135deg, #d4af37, #b8960c)',
  color: '#0a0a0f',
  textDecoration: 'none',
  fontWeight: 800,
  padding: '0.75rem 1rem',
};

const ctaSecondaryStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 46,
  borderRadius: '14px',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-card)',
  color: 'var(--text-primary)',
  textDecoration: 'none',
  fontWeight: 700,
  padding: '0.75rem 1rem',
};

const sectionTitleStyle = {
  marginBottom: '0.7rem',
  color: 'var(--text-primary)',
  fontWeight: 800,
  fontSize: '0.95rem',
};

const booksGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '0.7rem',
};

const bookCardStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '0.85rem 0.9rem',
  borderRadius: '16px',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-input)',
  textDecoration: 'none',
  textAlign: 'center',
};