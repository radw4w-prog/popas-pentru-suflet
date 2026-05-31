import Link from 'next/link';

export const metadata = {
  title: 'Pagina nu a fost găsită',
};

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%)',
      color: '#e0e0e0',
      fontFamily: 'var(--font-inter), system-ui, sans-serif',
      padding: '2rem',
      textAlign: 'center',
    }}>
      {/* Icon */}
      <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.8 }}>
        🕊️
      </div>

      {/* 404 Number */}
      <h1 style={{
        fontSize: 'clamp(4rem, 10vw, 7rem)',
        fontWeight: 800,
        background: 'linear-gradient(135deg, #d4af37, #f5d680)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        margin: '0 0 0.5rem 0',
        lineHeight: 1,
      }}>
        404
      </h1>

      {/* Message */}
      <p style={{
        fontSize: '1.25rem',
        color: '#a0a0a0',
        marginBottom: '0.5rem',
        fontFamily: 'var(--font-playfair), serif',
        fontStyle: 'italic',
      }}>
        Pagina nu a fost găsită
      </p>

      {/* Verse */}
      <blockquote style={{
        maxWidth: '500px',
        margin: '1.5rem auto',
        padding: '1.25rem 1.5rem',
        background: 'rgba(212, 175, 55, 0.08)',
        border: '1px solid rgba(212, 175, 55, 0.2)',
        borderRadius: '12px',
        fontFamily: 'var(--font-lora), serif',
        fontStyle: 'italic',
        fontSize: '1.05rem',
        lineHeight: 1.7,
        color: '#d4d4d4',
      }}>
        „Eu sunt Calea, Adevărul și Viața."
        <footer style={{
          marginTop: '0.75rem',
          fontSize: '0.85rem',
          color: '#d4af37',
          fontStyle: 'normal',
          fontWeight: 600,
        }}>
          — Ioan 14:6
        </footer>
      </blockquote>

      {/* Subtitle */}
      <p style={{
        color: '#808080',
        fontSize: '0.95rem',
        marginBottom: '2rem',
      }}>
        Poate calea pe care o căutai s-a schimbat. Hai să te ghidăm înapoi.
      </p>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <Link href="/dashboard" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.85rem 1.75rem',
          background: 'linear-gradient(135deg, #d4af37, #c4a030)',
          color: '#0a0a0f',
          borderRadius: '10px',
          textDecoration: 'none',
          fontWeight: 700,
          fontSize: '0.95rem',
          transition: 'transform 0.2s',
        }}>
          🏠 Acasă
        </Link>

        <Link href="/biblia" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.85rem 1.75rem',
          background: 'rgba(212, 175, 55, 0.1)',
          color: '#d4af37',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '10px',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '0.95rem',
        }}>
          📖 Biblia
        </Link>

        <Link href="/devotional" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.85rem 1.75rem',
          background: 'rgba(212, 175, 55, 0.1)',
          color: '#d4af37',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '10px',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '0.95rem',
        }}>
          🙏 Devoțional
        </Link>
      </div>

      {/* Footer */}
      <p style={{
        marginTop: '3rem',
        fontSize: '0.8rem',
        color: '#555',
      }}>
        🕊️ Popas pentru Suflet
      </p>
    </div>
  );
}
