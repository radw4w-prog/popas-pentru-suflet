import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdjacentBibleBooks, getBibleBookBySlug, getBibleBookDescription, bibleBooks } from '@/data/bibleBooks';
import { getBibleBookSchemas } from '@/lib/structuredData';
import { buildOgImageUrl } from '@/lib/seoMetadata';

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

export default async function BibleBookPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const book = getBibleBookBySlug(resolvedParams.carte);
  if (!book) notFound();

  const currentChapter = parseInt(resolvedSearchParams?.capitol) || 1;
  const { previous, next } = getAdjacentBibleBooks(book.slug);
  const description = getBibleBookDescription(book);
  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);
  const schemas = getBibleBookSchemas(book);

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      
      <div className="book-page-container">
        {/* Back Link */}
        <Link href="/biblia" className="back-link">← Înapoi la lista cărților</Link>

        {/* Book Header */}
        <div className="book-header">
          <h1>{book.name}</h1>
          <p className="book-meta">
            {book.chapters} capitole • {testamentLabel(book.testament)}
          </p>
          <p className="book-theme">{book.theme}</p>
        </div>

        {/* Navigation */}
        <div className="book-navigation">
          {previous && (
            <Link href={`/biblia/${previous.slug}?capitol=${previous.chapters}`} className="nav-link prev">
              ◀ {previous.name}
            </Link>
          )}
          <Link href="/biblia" className="nav-link center">
            ☰ Toate cărțile
          </Link>
          {next && (
            <Link href={`/biblia/${next.slug}?capitol=1`} className="nav-link next">
              {next.name} ▶
            </Link>
          )}
        </div>

        {/* Chapter Grid */}
        <div className="chapter-grid-container">
          <h3>Selectează capitolul</h3>
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

        {/* Verses Placeholder */}
        <div className="verses-section">
          <h2>Capitolul {currentChapter}</h2>
          <p className="verses-info">
            Citește capitolul {currentChapter} din {book.name}
          </p>
          <div className="chapter-nav">
            {currentChapter > 1 && (
              <Link href={`/biblia/${book.slug}?capitol=${currentChapter - 1}`} className="chapter-nav-btn">
                ◀ Capitolul anterior
              </Link>
            )}
            {currentChapter < book.chapters && (
              <Link href={`/biblia/${book.slug}?capitol=${currentChapter + 1}`} className="chapter-nav-btn">
                Capitolul următor ▶
              </Link>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .book-page-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 1.5rem 1rem 4rem;
        }

        .back-link {
          display: inline-block;
          color: var(--gold-primary);
          text-decoration: none;
          font-weight: 600;
          margin-bottom: 1.5rem;
          padding: 0.5rem 1rem;
          background: var(--bg-card);
          border-radius: 10px;
          border: 1px solid var(--border-color);
          transition: all 0.2s;
        }

        .back-link:hover {
          border-color: var(--gold-primary);
        }

        .book-header {
          text-align: center;
          padding: 2rem;
          background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-primary) 100%);
          border-radius: 20px;
          border: 1px solid var(--border-color);
          margin-bottom: 1.5rem;
        }

        .book-header h1 {
          font-size: 2rem;
          color: var(--text-primary);
          margin: 0 0 0.75rem;
        }

        .book-meta {
          color: var(--gold-primary);
          font-weight: 600;
          margin: 0 0 0.5rem;
        }

        .book-theme {
          color: var(--text-secondary);
          font-style: italic;
          margin: 0;
        }

        .book-navigation {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .nav-link {
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          color: var(--text-primary);
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s;
        }

        .nav-link:hover {
          border-color: var(--gold-primary);
          background: rgba(212,175,55,0.1);
        }

        .nav-link.center {
          background: var(--gold-primary);
          color: var(--bg-primary);
          border-color: var(--gold-primary);
        }

        .chapter-grid-container {
          background: var(--bg-card);
          border-radius: 16px;
          border: 1px solid var(--border-color);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .chapter-grid-container h3 {
          margin: 0 0 1rem;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .chapter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(55px, 1fr));
          gap: 0.5rem;
        }

        .chapter-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          color: var(--text-primary);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
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

        .verses-section {
          background: var(--bg-card);
          border-radius: 16px;
          border: 1px solid var(--border-color);
          padding: 2rem;
          text-align: center;
        }

        .verses-section h2 {
          margin: 0 0 1rem;
          color: var(--text-primary);
        }

        .verses-info {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .chapter-nav {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .chapter-nav-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: var(--bg-input);
          color: var(--text-primary);
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s;
        }

        .chapter-nav-btn:hover {
          border-color: var(--gold-primary);
        }

        @media (max-width: 768px) {
          .book-header h1 {
            font-size: 1.5rem;
          }

          .book-navigation {
            flex-direction: column;
          }

          .nav-link {
            text-align: center;
          }

          .chapter-grid {
            grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
          }
        }
      `}</style>
    </>
  );
}