import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getAdjacentBibleBooks, getBibleBookBySlug, getBibleBookDescription, bibleBooks } from '@/data/bibleBooks';
import { getBibleBookSchemas } from '@/lib/structuredData';
import { buildOgImageUrl } from '@/lib/seoMetadata';
import BibleReaderClient from './BibleReaderClient';

export const dynamicParams = false;

export function generateStaticParams() {
  return bibleBooks.map((book) => ({ carte: book.slug }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const book = getBibleBookBySlug(resolvedParams.carte);
  if (!book) {
    return { title: 'Carte negăsită' };
  }

  const description = getBibleBookDescription(book);
  const url = `https://popas-pentru-suflet.vercel.app/biblia/${book.slug}`;
  const imageUrl = buildOgImageUrl({
    title: `${book.name} — Biblia Cornilescu`,
    subtitle: `${book.chapters} capitole din ${book.testament === 'VT' ? 'Vechiul Testament' : 'Noul Testament'}`,
    tag: 'Biblia online',
  });

  return {
    title: `${book.name} — Biblia Cornilescu online`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${book.name} — Biblia Cornilescu online`,
      description,
      url,
      type: 'article',
      images: [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: `${book.name} — Biblia Cornilescu online`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${book.name} — Biblia Cornilescu online`,
      description,
      images: [imageUrl],
    },
  };
}

function testamentLabel(testament) {
  return testament === 'VT' ? 'Vechiul Testament' : 'Noul Testament';
}

function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem',
      color: 'var(--text-secondary)'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid var(--border-color)',
        borderTopColor: '#d4af37',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '1rem'
      }} />
      <p>Se încarcă...</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default async function BibleBookPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const book = getBibleBookBySlug(resolvedParams.carte);
  if (!book) notFound();

  const currentChapter = parseInt(resolvedSearchParams?.capitol) || 1;
  const { previous, next } = getAdjacentBibleBooks(book.slug);
  const schemas = getBibleBookSchemas(book);
  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);

  return (
    <>
      {schemas.map((schema, index) => {
        const schemaJson = JSON.stringify(schema);
        return (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: schemaJson }}
          />
        );
      })}
      
      <div className="book-page-wrapper">
        {/* Back Navigation */}
        <div className="top-nav">
          <Link href="/biblia" className="back-btn">
            ← Toate cărțile
          </Link>
        </div>

        {/* Book Header Card */}
        <div className="book-hero-card">
          <div className="book-icon">📖</div>
          <div className="book-info">
            <h1>{book.name}</h1>
            <div className="book-meta-row">
              <span className="meta-badge">{book.chapters} capitole</span>
              <span className="meta-badge secondary">{testamentLabel(book.testament)}</span>
            </div>
            <p className="book-theme">{book.theme}</p>
          </div>
        </div>

        {/* Chapter Navigation */}
        <div className="chapter-nav-section">
          {previous && (
            <Link href={`/biblia/${previous.slug}?capitol=${previous.chapters}`} className="book-nav-btn prev">
              <span className="nav-arrow">◀</span>
              <span className="nav-book">{previous.name}</span>
            </Link>
          )}
          
          <div className="chapter-selector">
            <div className="chapter-label">Capitolul curent</div>
            <div className="chapter-grid">
              {chapters.map(ch => (
                <Link
                  key={ch}
                  href={`/biblia/${book.slug}?capitol=${ch}`}
                  className={`chapter-btn ${currentChapter === ch ? 'active' : ''}`}
                >
                  {ch}
                </Link>
              ))}
            </div>
          </div>

          {next && (
            <Link href={`/biblia/${next.slug}?capitol=1`} className="book-nav-btn next">
              <span className="nav-book">{next.name}</span>
              <span className="nav-arrow">▶</span>
            </Link>
          )}
        </div>

        {/* Bible Reader */}
        <div className="reader-wrapper">
          <Suspense fallback={<LoadingFallback />}>
            <BibleReaderClient 
              bookSlug={book.slug}
              bookName={book.name}
              currentChapter={currentChapter}
              chapters={chapters.length}
              testament={book.testament}
            />
          </Suspense>
        </div>
      </div>

      <style>{`
        .book-page-wrapper {
          max-width: 1000px;
          margin: 0 auto;
          padding: 1rem 1rem 4rem;
        }

        /* Top Navigation */
        .top-nav {
          margin-bottom: 1.5rem;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--gold-primary);
          text-decoration: none;
          font-weight: 600;
          padding: 0.5rem 1rem;
          background: var(--bg-card);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          transition: all 0.2s;
        }

        .back-btn:hover {
          border-color: var(--gold-primary);
          background: rgba(212,175,55,0.1);
        }

        /* Book Hero Card */
        .book-hero-card {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-primary) 100%);
          border-radius: 20px;
          border: 1px solid var(--border-color);
          margin-bottom: 1.5rem;
        }

        .book-icon {
          font-size: 3rem;
          width: 70px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #d4af37 0%, #b8960c 100%);
          border-radius: 16px;
        }

        .book-info h1 {
          font-size: 2rem;
          color: var(--text-primary);
          margin: 0 0 0.75rem;
          background: linear-gradient(135deg, var(--gold-primary) 0%, #f4cf67 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .book-meta-row {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .meta-badge {
          display: inline-block;
          padding: 0.3rem 0.8rem;
          border-radius: 999px;
          background: rgba(212,175,55,0.15);
          border: 1px solid rgba(212,175,55,0.3);
          color: var(--gold-primary);
          font-size: 0.85rem;
          font-weight: 600;
        }

        .meta-badge.secondary {
          background: rgba(212,175,55,0.08);
          color: var(--text-secondary);
        }

        .book-theme {
          color: var(--text-secondary);
          font-style: italic;
          margin: 0;
          font-size: 0.95rem;
        }

        /* Chapter Navigation Section */
        .chapter-nav-section {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 1rem;
          align-items: start;
          margin-bottom: 1.5rem;
        }

        .book-nav-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          text-decoration: none;
          color: var(--text-primary);
          transition: all 0.2s;
        }

        .book-nav-btn:hover {
          border-color: var(--gold-primary);
          background: rgba(212,175,55,0.05);
        }

        .book-nav-btn.next {
          justify-content: flex-end;
        }

        .nav-arrow {
          font-size: 1.2rem;
          color: var(--gold-primary);
        }

        .nav-book {
          font-weight: 600;
          font-size: 0.9rem;
        }

        /* Chapter Selector */
        .chapter-selector {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 1.25rem;
          min-width: 300px;
        }

        .chapter-label {
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .chapter-grid {
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          gap: 0.4rem;
        }

        .chapter-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.6rem 0.25rem;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          color: var(--text-primary);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.2s;
        }

        .chapter-btn:hover {
          border-color: var(--gold-primary);
          background: rgba(212,175,55,0.1);
        }

        .chapter-btn.active {
          background: var(--gold-primary);
          color: var(--bg-primary);
          border-color: var(--gold-primary);
        }

        /* Reader Wrapper */
        .reader-wrapper {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          overflow: hidden;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .chapter-nav-section {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .book-nav-btn {
            justify-content: center !important;
          }

          .chapter-selector {
            min-width: auto;
          }

          .chapter-grid {
            grid-template-columns: repeat(8, 1fr);
          }
        }

        @media (max-width: 768px) {
          .book-hero-card {
            flex-direction: column;
            text-align: center;
            padding: 1.5rem;
          }

          .book-info h1 {
            font-size: 1.5rem;
          }

          .book-meta-row {
            justify-content: center;
            flex-wrap: wrap;
          }

          .chapter-grid {
            grid-template-columns: repeat(6, 1fr);
          }
        }

        @media (max-width: 480px) {
          .chapter-grid {
            grid-template-columns: repeat(5, 1fr);
          }

          .chapter-btn {
            padding: 0.5rem 0.2rem;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </>
  );
}