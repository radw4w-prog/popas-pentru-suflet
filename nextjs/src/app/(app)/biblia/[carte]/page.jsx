import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAdjacentBibleBooks, getBibleBookBySlug, getBibleBookDescription, bibleBooks } from '@/data/bibleBooks';
import { getBibleBookSchemas } from '@/lib/structuredData';

export const dynamicParams = false;

export function generateStaticParams() {
  return bibleBooks.map((book) => ({ carte: book.slug }));
}

export function generateMetadata({ params }) {
  const book = getBibleBookBySlug(params.carte);
  if (!book) {
    return { title: 'Carte negăsită' };
  }

  const description = getBibleBookDescription(book);
  const url = `https://popas-pentru-suflet.vercel.app/biblia/${book.slug}`;

  return {
    title: `${book.name} — Biblia Cornilescu online`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${book.name} — Biblia Cornilescu online`,
      description,
      url,
      type: 'article',
    },
    twitter: {
      title: `${book.name} — Biblia Cornilescu online`,
      description,
    },
  };
}

function testamentLabel(testament) {
  return testament === 'VT' ? 'Vechiul Testament' : 'Noul Testament';
}

export default function BibleBookPage({ params }) {
  const book = getBibleBookBySlug(params.carte);
  if (!book) notFound();

  const { previous, next } = getAdjacentBibleBooks(book.slug);
  const description = getBibleBookDescription(book);
  const chapters = Array.from({ length: book.chapters }, (_, index) => index + 1);
  const schemas = getBibleBookSchemas(book);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gap: '1rem' }}>
      <section style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '28px',
        border: '1px solid var(--border-color)',
        background: 'linear-gradient(135deg, rgba(212,175,55,0.10), rgba(59,130,246,0.08), rgba(124,58,237,0.08))',
        padding: '1.4rem 1.35rem'
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.9rem' }}>
          <Link href="/landing" style={crumbStyle}>Acasă</Link>
          <span style={sepStyle}>›</span>
          <Link href="/biblia" style={crumbStyle}>Biblia</Link>
          <span style={sepStyle}>›</span>
          <span style={{ ...crumbStyle, color: 'var(--gold-primary)' }}>{book.name}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <span style={badgeStyle}>📖 {book.abbr}</span>
              <span style={badgeStyle}>{book.testament === 'VT' ? '📜' : '✝️'} {testamentLabel(book.testament)}</span>
              <span style={badgeStyle}>#{book.order}</span>
              <span style={badgeStyle}>🧭 {book.chapters} capitole</span>
            </div>

            <h1 style={{ margin: 0, fontSize: 'clamp(1.9rem, 4vw, 2.7rem)', lineHeight: 1.1, color: 'var(--text-primary)' }}>
              {book.name}
            </h1>
            <p style={{ margin: '0.85rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.75, maxWidth: 760 }}>
              {description}
            </p>
          </div>

          <div style={{ minWidth: 250, flex: '0 0 280px', display: 'grid', gap: '0.65rem' }}>
            <Link href={`/biblia?carte=${encodeURIComponent(book.name)}`} style={ctaPrimaryStyle}>
              📘 Deschide cartea în cititor
            </Link>
            <Link href={`/biblia?carte=${encodeURIComponent(book.name)}&capitol=1`} style={ctaSecondaryStyle}>
              ▶️ Începe cu capitolul 1
            </Link>
          </div>
        </div>
      </section>

      <section style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.9rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>Capitolele cărții {book.name}</h2>
            <p style={{ margin: '0.35rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.83rem' }}>
              Alege rapid un capitol pentru a-l deschide direct în Biblia Cornilescu.
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
          gap: '0.6rem'
        }}>
          {chapters.map((chapter) => (
            <Link
              key={chapter}
              href={`/biblia?carte=${encodeURIComponent(book.name)}&capitol=${chapter}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 58,
                borderRadius: '14px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.95rem'
              }}
            >
              {chapter}
            </Link>
          ))}
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 0.6rem 0', fontSize: '1.05rem', color: 'var(--text-primary)' }}>Despre această carte</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '0.9rem' }}>
            {book.name} face parte din {testamentLabel(book.testament)} și conține {book.chapters} capitole.
            Tema principală a cărții urmărește {book.theme}. Pagina aceasta te ajută să ajungi rapid la fiecare capitol
            și să citești Biblia Cornilescu online într-un mod simplu și clar.
          </p>
        </div>

        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 0.6rem 0', fontSize: '1.05rem', color: 'var(--text-primary)' }}>Navigare rapidă</h2>
          <div style={{ display: 'grid', gap: '0.6rem' }}>
            {previous ? (
              <Link href={`/biblia/${previous.slug}`} style={navLinkStyle}>← {previous.name}</Link>
            ) : (
              <div style={navDisabledStyle}>← Prima carte a Bibliei</div>
            )}
            {next ? (
              <Link href={`/biblia/${next.slug}`} style={navLinkStyle}>{next.name} →</Link>
            ) : (
              <div style={navDisabledStyle}>Ultima carte a Bibliei →</div>
            )}
          </div>
        </div>
      </section>
      </div>
    </>
  );
}

const cardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: '22px',
  padding: '1.15rem 1.15rem 1.2rem'
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

const crumbStyle = {
  color: 'var(--text-muted)',
  fontSize: '0.82rem',
  textDecoration: 'none',
};

const sepStyle = {
  color: 'var(--text-muted)',
  fontSize: '0.82rem',
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

const navLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: 46,
  borderRadius: '14px',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-input)',
  color: 'var(--text-primary)',
  textDecoration: 'none',
  padding: '0.75rem 0.9rem',
  fontWeight: 700,
};

const navDisabledStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: 46,
  borderRadius: '14px',
  border: '1px dashed var(--border-color)',
  background: 'transparent',
  color: 'var(--text-muted)',
  padding: '0.75rem 0.9rem',
  fontWeight: 600,
};
