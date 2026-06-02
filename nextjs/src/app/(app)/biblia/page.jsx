import Link from 'next/link';
import { getBibleBooksByTestament } from '@/data/bibleBooks';
import { createSeoMetadata } from '@/lib/seoMetadata';

export const metadata = createSeoMetadata({
  title: 'Biblia Cornilescu online — 66 cărți, 31.102 versete',
  description: 'Citește Biblia Cornilescu online gratuit. Explorează cele 66 de cărți ale Bibliei, accesează rapid capitolele și versetele importante.',
  path: '/biblia',
  ogTitle: 'Biblia Cornilescu online — 66 de cărți',
  ogDescription: 'Explorează cele 66 de cărți ale Bibliei și citește versetele rapid, online și gratuit.',
  imageTitle: 'Biblia Cornilescu online',
  imageSubtitle: '66 de cărți, 31.102 versete',
  imageTag: 'Biblia online',
});

export const dynamic = 'force-dynamic';

export default function BibliaPage() {
  const oldTestament = getBibleBooksByTestament('VT');
  const newTestament = getBibleBooksByTestament('NT');

  return (
    <div className="biblia-home">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-icon">📖</div>
        <span className="hero-badge">📚 66 cărți</span>
        <span className="hero-badge">✨ 31.102 versete</span>
        <h1>Biblia Cornilescu</h1>
        <p className="hero-desc">
          Descoperă fiecare carte a Bibliei, accesează capitolele rapid și citește online într-o interfață clară,
          optimizată pentru mobil, desktop și PWA.
        </p>
        <div className="hero-actions">
          <Link href="/biblia/geneza?capitol=1" className="cta-primary">
            📘 Începe cu Geneza
          </Link>
          <Link href="/biblia/ioan?capitol=1" className="cta-secondary">
            ✝️ Mergi la Ioan
          </Link>
        </div>
      </div>

      {/* Books Grid */}
      <div className="books-section">
        <h2>Cărțile Bibliei</h2>
        <p className="section-desc">
          Fiecare carte are propria pagină statică, indexabilă, cu prezentare și acces rapid la capitole.
        </p>

        {/* Old Testament */}
        <div className="testament-block">
          <h3 className="testament-heading">
            <span>📜</span>
            <span>Vechiul Testament</span>
            <span className="book-count">39 cărți</span>
          </h3>
          <div className="books-grid">
            {oldTestament.map((book) => (
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

        {/* New Testament */}
        <div className="testament-block">
          <h3 className="testament-heading">
            <span>✝️</span>
            <span>Noul Testament</span>
            <span className="book-count">27 cărți</span>
          </h3>
          <div className="books-grid">
            {newTestament.map((book) => (
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
      </div>

      <style>{`
        .biblia-home {
          max-width: 1100px;
          margin: 0 auto;
          padding: 1.5rem 1rem 4rem;
        }

        .hero-section {
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
          padding: 0.3rem 0.75rem;
          border-radius: 999px;
          border: 1px solid rgba(212,175,55,0.25);
          background: rgba(212,175,55,0.08);
          color: var(--gold-primary);
          font-size: 0.8rem;
          font-weight: 700;
          margin: 0 0.25rem;
        }

        .hero-section h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 1.25rem 0 1rem;
          background: linear-gradient(135deg, var(--gold-primary) 0%, #f4cf67 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-desc {
          color: var(--text-secondary);
          max-width: 650px;
          margin: 0 auto 2rem;
          line-height: 1.7;
          font-size: 1rem;
        }

        .hero-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .cta-primary {
          display: inline-flex;
          align-items: center;
          padding: 0.85rem 1.5rem;
          border-radius: 14px;
          background: linear-gradient(135deg, #d4af37, #b8960c);
          color: #0a0a0f;
          text-decoration: none;
          font-weight: 800;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(212,175,55,0.3);
        }

        .cta-secondary {
          display: inline-flex;
          align-items: center;
          padding: 0.85rem 1.5rem;
          border-radius: 14px;
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          color: var(--text-primary);
          text-decoration: none;
          font-weight: 700;
          transition: all 0.2s;
        }

        .cta-secondary:hover {
          border-color: var(--gold-primary);
          background: rgba(212,175,55,0.05);
        }

        .books-section {
          margin-bottom: 3rem;
        }

        .books-section h2 {
          font-size: 1.75rem;
          color: var(--text-primary);
          margin: 0 0 0.75rem;
        }

        .section-desc {
          color: var(--text-secondary);
          margin: 0 0 2rem;
        }

        .testament-block {
          margin-bottom: 2.5rem;
        }

        .testament-heading {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.1rem;
          color: var(--text-primary);
          margin: 0 0 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid var(--border-color);
        }

        .book-count {
          margin-left: auto;
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 0.75rem;
        }

        .book-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem 0.75rem;
          border-radius: 14px;
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

        .book-abbr {
          font-weight: 800;
          color: var(--gold-primary);
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .book-name {
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 0.2rem;
        }

        .book-chapters {
          color: var(--text-secondary);
          font-size: 0.75rem;
        }

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
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
          margin: 0 0 0.5rem;
        }

        .feature-card p {
          color: var(--text-secondary);
          font-size: 0.85rem;
          margin: 0;
        }

        @media (max-width: 768px) {
          .hero-section h1 {
            font-size: 1.8rem;
          }

          .hero-actions {
            flex-direction: column;
            align-items: center;
          }

          .books-grid {
            grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          }
        }
      `}</style>

      {/* Features */}
      <div className="features-section">
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
      </div>
    </div>
  );
}