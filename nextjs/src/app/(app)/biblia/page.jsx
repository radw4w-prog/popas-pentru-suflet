import Link from 'next/link';
import VersesPage from '@/views/VersesPage';
import { getBibleBooksByTestament } from '@/data/bibleBooks';

export const metadata = {
  title: 'Biblia Cornilescu online - 31.102 versete',
  description: 'Citește Biblia Cornilescu online gratuit. Explorează cele 66 de cărți ale Bibliei, accesează rapid capitolele și versetele importante.',
};

export const dynamic = 'force-dynamic';

export default function Biblia() {
  const oldTestament = getBibleBooksByTestament('VT');
  const newTestament = getBibleBooksByTestament('NT');

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <section style={{
        maxWidth: 1100,
        margin: '0 auto',
        width: '100%',
        borderRadius: '28px',
        border: '1px solid var(--border-color)',
        background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(59,130,246,0.07), rgba(124,58,237,0.06))',
        padding: '1.25rem 1.2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
              <span style={badgeStyle}>📖 66 cărți</span>
              <span style={badgeStyle}>31.102 versete</span>
              <span style={badgeStyle}>Biblia Cornilescu</span>
            </div>
            <h1 style={{ margin: 0, fontSize: 'clamp(1.85rem, 4vw, 2.6rem)', lineHeight: 1.1, color: 'var(--text-primary)' }}>
              Biblia Cornilescu online
            </h1>
            <p style={{ margin: '0.8rem 0 0 0', color: 'var(--text-secondary)', lineHeight: 1.75, fontSize: '0.95rem', maxWidth: 760 }}>
              Descoperă fiecare carte a Bibliei, accesează capitolele rapid și citește online într-o interfață clară,
              optimizată pentru mobil, desktop și PWA.
            </p>
          </div>
          <div style={{ minWidth: 250, flex: '0 0 280px', display: 'grid', gap: '0.6rem' }}>
            <Link href="/biblia/geneza" style={ctaPrimaryStyle}>📘 Începe cu Geneza</Link>
            <Link href="/biblia/ioan" style={ctaSecondaryStyle}>✝️ Mergi la Ioan</Link>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', width: '100%', display: 'grid', gap: '1rem' }}>
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 0.4rem 0', color: 'var(--text-primary)', fontSize: '1.15rem' }}>Cărțile Bibliei</h2>
          <p style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)', fontSize: '0.84rem', lineHeight: 1.65 }}>
            Fiecare carte are propria pagină statică, indexabilă, cu prezentare și acces rapid la capitole.
          </p>

          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <div style={sectionTitleStyle}>📜 Vechiul Testament</div>
              <div style={booksGridStyle}>
                {oldTestament.map((book) => (
                  <Link key={book.slug} href={`/biblia/${book.slug}`} style={bookCardStyle}>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{book.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{book.chapters} capitole</div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div style={sectionTitleStyle}>✝️ Noul Testament</div>
              <div style={booksGridStyle}>
                {newTestament.map((book) => (
                  <Link key={book.slug} href={`/biblia/${book.slug}`} style={bookCardStyle}>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{book.name}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{book.chapters} capitole</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="animate-in" style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>
        <VersesPage />
      </div>
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
  display: 'block',
  borderRadius: '16px',
  border: '1px solid var(--border-color)',
  background: 'var(--bg-input)',
  padding: '0.85rem 0.9rem',
  textDecoration: 'none',
};
