import Link from 'next/link';
import { createSeoMetadata } from '@/lib/seoMetadata';

export const metadata = createSeoMetadata({
  title: 'Contact — Popas pentru Suflet',
  description: 'Contactează echipa Popas pentru Suflet: întrebări, sugestii, raportări sau sprijin tehnic pentru aplicația creștină gratuită.',
  path: '/contact',
  ogTitle: 'Contact — Popas pentru Suflet',
  ogDescription: 'Suntem aici să te ajutăm. Scrie-ne pentru întrebări, sugestii sau sprijin tehnic.',
  imageTitle: 'Contact',
  imageSubtitle: 'Popas pentru Suflet — suntem aici pentru tine',
  imageTag: 'Contact',
});

const styles = {
  wrapper: { maxWidth: '820px', margin: '0 auto', padding: '3rem 1.5rem 5rem' },
  back: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-primary)', textDecoration: 'none', fontWeight: 600, marginBottom: '2rem', fontSize: '0.95rem' },
  h1: { fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(2rem, 5vw, 2.8rem)', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.15 },
  intro: { color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2.5rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.75rem' },
  icon: { fontSize: '2rem', marginBottom: '0.75rem' },
  cardTitle: { fontFamily: 'var(--font-playfair), serif', fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '0.5rem' },
  cardText: { color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: '0.95rem' },
  a: { color: 'var(--gold-primary)', textDecoration: 'none', fontWeight: 600 },
  verse: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.75rem', textAlign: 'center' },
  verseText: { fontFamily: 'var(--font-lora), serif', fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: '0.75rem' },
  verseRef: { color: 'var(--gold-primary)', fontWeight: 600, fontSize: '0.9rem' },
};

export default function ContactPage() {
  return (
    <div style={styles.wrapper}>
      <Link href="/landing" style={styles.back}>← Înapoi la pagina principală</Link>
      <h1 style={styles.h1}>Contact</h1>
      <p style={styles.intro}>
        Ai o întrebare, o sugestie sau ai nevoie de ajutor? Suntem bucuroși să te auzim.
        Răspundem de obicei în 1–3 zile lucrătoare.
      </p>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.icon}>📧</div>
          <h2 style={styles.cardTitle}>Email general</h2>
          <p style={styles.cardText}>
            Pentru întrebări generale, sugestii și feedback:<br />
            <a href="mailto:contact@popas-pentru-suflet.vercel.app" style={styles.a}>contact@popas-pentru-suflet.vercel.app</a>
          </p>
        </div>

        <div style={styles.card}>
          <div style={styles.icon}>🛠️</div>
          <h2 style={styles.cardTitle}>Suport tehnic</h2>
          <p style={styles.cardText}>
            Probleme cu contul, autentificarea sau aplicația? Scrie-ne la aceeași adresă,
            cu subiectul „Suport tehnic" și o scurtă descriere a problemei.
          </p>
        </div>

        <div style={styles.card}>
          <div style={styles.icon}>🔒</div>
          <h2 style={styles.cardTitle}>Confidențialitate</h2>
          <p style={styles.cardText}>
            Pentru solicitări legate de datele tale personale (acces, ștergere), vezi{' '}
            <Link href="/confidentialitate" style={styles.a}>Politica de confidențialitate</Link> sau
            scrie-ne direct.
          </p>
        </div>

        <div style={styles.card}>
          <div style={styles.icon}>💡</div>
          <h2 style={styles.cardTitle}>Sugestii</h2>
          <p style={styles.cardText}>
            Ai o idee pentru o funcție nouă? Ne place să ascultăm comunitatea.
            Trimite-ne sugestia ta — multe funcții din aplicație au pornit de la utilizatori.
          </p>
        </div>
      </div>

      <div style={styles.verse}>
        <p style={styles.verseText}>„Rugați-vă fără încetare."</p>
        <p style={styles.verseRef}>— 1 Tesaloniceni 5:17</p>
      </div>
    </div>
  );
}
