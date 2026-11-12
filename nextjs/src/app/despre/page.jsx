import Link from 'next/link';
import { createSeoMetadata } from '@/lib/seoMetadata';

export const metadata = createSeoMetadata({
  title: 'Despre — Popas pentru Suflet',
  description: 'Popas pentru Suflet este o aplicație creștină gratuită în limba română: Biblia Cornilescu completă, devoțional zilnic, rugăciuni și jurnal spiritual.',
  path: '/despre',
  ogTitle: 'Despre Popas pentru Suflet',
  ogDescription: 'Un loc de odihnă și hrană pentru suflet. Descoperă povestea și misiunea aplicației.',
  imageTitle: 'Despre noi',
  imageSubtitle: 'Popas pentru Suflet — un loc de odihnă pentru sufletul tău',
  imageTag: 'Despre',
});

const styles = {
  wrapper: { maxWidth: '820px', margin: '0 auto', padding: '3rem 1.5rem 5rem' },
  back: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-primary)', textDecoration: 'none', fontWeight: 600, marginBottom: '2rem', fontSize: '0.95rem' },
  h1: { fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(2rem, 5vw, 2.8rem)', color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.15 },
  lead: { color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: 1.75, marginBottom: '2rem' },
  h2: { fontFamily: 'var(--font-playfair), serif', fontSize: '1.4rem', color: 'var(--gold-primary)', margin: '2.2rem 0 0.8rem' },
  p: { color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '1rem', fontSize: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', margin: '1.5rem 0' },
  stat: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' },
  statNum: { fontFamily: 'var(--font-playfair), serif', fontSize: '2rem', color: 'var(--gold-primary)', fontWeight: 700 },
  statLabel: { color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' },
  verse: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.75rem', textAlign: 'center', margin: '2rem 0' },
  verseText: { fontFamily: 'var(--font-lora), serif', fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: '0.75rem' },
  verseRef: { color: 'var(--gold-primary)', fontWeight: 600, fontSize: '0.9rem' },
  a: { color: 'var(--gold-primary)', textDecoration: 'none', fontWeight: 600 },
  cta: { display: 'inline-block', background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-dark))', color: '#0a0a0f', padding: '0.9rem 2rem', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, marginTop: '1rem' },
};

export default function DesprePage() {
  return (
    <div style={styles.wrapper}>
      <Link href="/landing" style={styles.back}>← Înapoi la pagina principală</Link>
      <h1 style={styles.h1}>Despre Popas pentru Suflet</h1>
      <p style={styles.lead}>
        Popas pentru Suflet este un loc de odihnă și hrană pentru suflet — o aplicație creștină gratuită,
        creată pentru a te ajuta să citești Biblia, să te rogi și să crești în credință, oriunde te-ai afla.
      </p>

      <div style={styles.grid}>
        <div style={styles.stat}><div style={styles.statNum}>31.102</div><div style={styles.statLabel}>versete biblice</div></div>
        <div style={styles.stat}><div style={styles.statNum}>66</div><div style={styles.statLabel}>cărți ale Bibliei</div></div>
        <div style={styles.stat}><div style={styles.statNum}>100%</div><div style={styles.statLabel}>gratuit</div></div>
      </div>

      <h2 style={styles.h2}>Ce găsești aici</h2>
      <p style={styles.p}>
        <strong>Biblia Cornilescu completă</strong> — toate cele 66 de cărți, cu referințe încrucișate
        (Treasury of Scripture Knowledge) și cuvintele lui Isus evidențiate cu roșu. Poți citi, căuta versete
        și asculta Biblia audio.
      </p>
      <p style={styles.p}>
        <strong>Devoțional zilnic</strong> — o meditație zilnică cu verset, mesaj, rugăciune și gândul zilei,
        generată cu ajutorul inteligenței artificiale pe teme precum credința, speranța, dragostea și pacea.
      </p>
      <p style={styles.p}>
        <strong>Rugăciuni și comunitate</strong> — publică cereri de rugăciune și roagă-te pentru ceilalți.
        <strong> Jurnal spiritual</strong> — notează ce ți-a vorbit Dumnezeu în fiecare zi.
        <strong> Călătoria spirituală</strong> — urmărește-ți consecvența cu badge-uri și statistici.
      </p>

      <div style={styles.verse}>
        <p style={styles.verseText}>„Veniți la Mine, toți cei trudiți și împovărați, și Eu vă voi da odihnă."</p>
        <p style={styles.verseRef}>— Matei 11:28</p>
      </div>

      <h2 style={styles.h2}>Misiunea noastră</h2>
      <p style={styles.p}>
        Credem că oricine ar trebui să aibă acces gratuit și ușor la Cuvântul lui Dumnezeu, în limba română.
        De aceea construim instrumente simple și frumoase pentru citire, rugăciune și meditație — fără reclame,
        fără costuri, doar pentru slava lui Dumnezeu și zidirea credincioșilor.
      </p>

      <Link href="/biblia" style={styles.cta}>📖 Începe să citești Biblia</Link>
    </div>
  );
}
