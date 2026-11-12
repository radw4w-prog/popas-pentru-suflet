import Link from 'next/link';
import { createSeoMetadata } from '@/lib/seoMetadata';

export const metadata = createSeoMetadata({
  title: 'Politica de confidențialitate — Popas pentru Suflet',
  description: 'Politica de confidențialitate a aplicației Popas pentru Suflet. Află cum colectăm, folosim și protejăm datele tale personale, conform GDPR.',
  path: '/confidentialitate',
  ogTitle: 'Politica de confidențialitate — Popas pentru Suflet',
  ogDescription: 'Cum protejăm datele tale personale. Conform Regulamentului General privind Protecția Datelor (GDPR).',
  imageTitle: 'Politica de confidențialitate',
  imageSubtitle: 'Popas pentru Suflet — datele tale sunt în siguranță',
  imageTag: 'Confidențialitate',
});

const styles = {
  wrapper: { maxWidth: '820px', margin: '0 auto', padding: '3rem 1.5rem 5rem' },
  back: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-primary)', textDecoration: 'none', fontWeight: 600, marginBottom: '2rem', fontSize: '0.95rem' },
  h1: { fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(2rem, 5vw, 2.8rem)', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.15 },
  updated: { color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2.5rem' },
  h2: { fontFamily: 'var(--font-playfair), serif', fontSize: '1.4rem', color: 'var(--gold-primary)', margin: '2.2rem 0 0.8rem' },
  p: { color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '1rem', fontSize: '1rem' },
  ul: { color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '1rem', paddingLeft: '1.4rem' },
  li: { marginBottom: '0.4rem' },
  a: { color: 'var(--gold-primary)' },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', margin: '1.5rem 0' },
};

export default function ConfidentialitatePage() {
  return (
    <div style={styles.wrapper}>
      <Link href="/landing" style={styles.back}>← Înapoi la pagina principală</Link>
      <h1 style={styles.h1}>Politica de confidențialitate</h1>
      <p style={styles.updated}>Ultima actualizare: 11 noiembrie 2026</p>

      <p style={styles.p}>
        Popas pentru Suflet („noi", „aplicația") respectă viața ta privată. Această pagină explică ce date
        colectăm, de ce, cum le folosim și ce drepturi ai, conform Regulamentului (UE) 2016/679 — GDPR.
      </p>

      <h2 style={styles.h2}>1. Ce date colectăm</h2>
      <ul style={styles.ul}>
        <li style={styles.li}><strong>Date de cont:</strong> nume, adresă de email și parolă (hash-uită) — doar dacă îți creezi cont.</li>
        <li style={styles.li}><strong>Date de utilizare:</strong> pagini vizitate, funcții folosite, progresul de citire, semne de carte, intrări în jurnal.</li>
        <li style={styles.li}><strong>Date tehnice:</strong> tip dispozitiv, sistem de operare, adresă IP (pentru securitate și limitare abuzuri).</li>
        <li style={styles.li}><strong>Autentificare Facebook (opțional):</strong> dacă alegi login cu Facebook, primim numele, emailul și ID-ul de Facebook.</li>
        <li style={styles.li}><strong>Cookie-uri / stocare locală:</strong> token-ul de sesiune, preferințe (temă, dimensiune font) și date pentru funcționarea aplicației.</li>
      </ul>

      <h2 style={styles.h2}>2. De ce le folosim (temei legal)</h2>
      <ul style={styles.ul}>
        <li style={styles.li}><strong>Executarea serviciului</strong> — pentru a-ți oferi contul și funcțiile aplicației (art. 6 alin. 1 lit. b GDPR).</li>
        <li style={styles.li}><strong>Consimțământul tău</strong> — pentru notificări push și, dacă accepți, statistici anonime (art. 6 alin. 1 lit. a).</li>
        <li style={styles.li}><strong>Interes legitim</strong> — securitate, prevenirea fraudelor și îmbunătățirea serviciului (art. 6 alin. 1 lit. f).</li>
      </ul>

      <h2 style={styles.h2}>3. Cu cine partajăm datele</h2>
      <p style={styles.p}>Nu vindem datele tale. Le partajăm doar cu furnizori care ne ajută să funcționăm:</p>
      <ul style={styles.ul}>
        <li style={styles.li}><strong>Vercel</strong> — găzduirea site-ului (frontend).</li>
        <li style={styles.li}><strong>Render</strong> — găzduirea serverului (backend).</li>
        <li style={styles.li}><strong>MongoDB Atlas</strong> — baza de date (datele sunt stocate în Uniunea Europeană / regiuni conforme).</li>
        <li style={styles.li}><strong>Google Analytics</strong> — statistici anonime de utilizare (ID-ul GA4 este anonimizat).</li>
        <li style={styles.li}><strong>Facebook</strong> — doar dacă folosești autentificarea cu Facebook.</li>
      </ul>

      <h2 style={styles.h2}>4. Cât timp păstrăm datele</h2>
      <p style={styles.p}>
        Păstrăm datele de cont cât timp ai cont activ. Le poți șterge oricând din setări sau contactându-ne,
        iar noi le eliminăm din sistemele noastre în maximum 30 de zile.
      </p>

      <h2 style={styles.h2}>5. Drepturile tale</h2>
      <p style={styles.p}>Conform GDPR, ai dreptul să:</p>
      <ul style={styles.ul}>
        <li style={styles.li}>accezi la datele tale personale;</li>
        <li style={styles.li}>le rectifici sau le ștergi;</li>
        <li style={styles.li}>le exporți (portabilitate);</li>
        <li style={styles.li}>te opui prelucrării sau îți retragi consimțământul;</li>
        <li style={styles.li}>depui o plângere la Autoritatea Națională de Supraveghere (ANSPDCP).</li>
      </ul>

      <h2 style={styles.h2}>6. Securitate</h2>
      <p style={styles.p}>
        Parolele sunt stocate hash-uite (bcrypt), conexiunile sunt criptate (HTTPS), iar accesul la date este
        limitat și monitorizat. Niciun sistem nu este 100% sigur, dar luăm măsuri rezonabile pentru protecția ta.
      </p>

      <div style={styles.card}>
        <p style={{ ...styles.p, marginBottom: 0 }}>
          <strong>Contact pentru confidențialitate:</strong>{' '}
          <a href="mailto:contact@popas-pentru-suflet.vercel.app" style={styles.a}>contact@popas-pentru-suflet.vercel.app</a>
        </p>
      </div>

      <p style={styles.p}>
        Vezi și <Link href="/termeni" style={styles.a}>Termenii și condițiile</Link> de utilizare.
      </p>
    </div>
  );
}
