import Link from 'next/link';
import { createSeoMetadata } from '@/lib/seoMetadata';

export const metadata = createSeoMetadata({
  title: 'Întrebări frecvente — Popas pentru Suflet',
  description: 'Răspunsuri la întrebările frecvente despre aplicația Popas pentru Suflet: cum funcționează, este gratuită, cum îmi creez cont și altele.',
  path: '/faq',
  ogTitle: 'Întrebări frecvente — Popas pentru Suflet',
  ogDescription: 'Tot ce trebuie să știi despre aplicația creștină gratuită Popas pentru Suflet.',
  imageTitle: 'Întrebări frecvente',
  imageSubtitle: 'Popas pentru Suflet — răspunsuri la întrebările tale',
  imageTag: 'FAQ',
});

const styles = {
  wrapper: { maxWidth: '820px', margin: '0 auto', padding: '3rem 1.5rem 5rem' },
  back: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gold-primary)', textDecoration: 'none', fontWeight: 600, marginBottom: '2rem', fontSize: '0.95rem' },
  h1: { fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(2rem, 5vw, 2.8rem)', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.15 },
  intro: { color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2.5rem' },
  item: { background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem' },
  q: { fontFamily: 'var(--font-playfair), serif', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.6rem' },
  a: { color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.98rem' },
  link: { color: 'var(--gold-primary)', textDecoration: 'none', fontWeight: 600 },
};

const FAQS = [
  {
    q: 'Aplicația este cu adevărat gratuită?',
    a: 'Da, 100% gratuită. Nu avem reclame, abonamente sau funcții plătite. Toate funcțiile — Biblia completă, devoționalul zilnic, rugăciunile, jurnalul — sunt disponibile pentru toți, fără cost.',
  },
  {
    q: 'Ce traducere a Bibliei folosiți?',
    a: 'Folosim traducerea Cornilescu, una dintre cele mai iubite și răspândite traduceri în limba română. Conține toate cele 31.102 versete din cele 66 de cărți, cu referințe încrucișate și cuvintele lui Isus evidențiate cu roșu.',
  },
  {
    q: 'Trebuie să-mi creez cont?',
    a: 'Pentru citirea Bibliei și devoționalul zilnic nu ai nevoie de cont. Contul gratuit îți permite să salvezi semne de carte, să ții jurnal spiritual, să urmărești planul de citire și să publici cereri de rugăciune.',
  },
  {
    q: 'Cum funcționează devoționalul zilnic?',
    a: 'În fiecare zi, aplicația alege o temă (credință, speranță, dragoste, pace etc.) și un verset, apoi generează cu inteligență artificială o meditație, o rugăciune și un gând pentru ziua respectivă. Se schimbă automat la miezul nopții.',
  },
  {
    q: 'Pot asculta Biblia audio?',
    a: 'Da. Secțiunea Audio Biblie îți permite să asculți capitolele cu redare continuă, ideal pentru mașină, sport sau înainte de culcare. Există și funcția de citire vocală (TTS) pentru orice verset.',
  },
  {
    q: 'Cum pot cere rugăciune pentru mine?',
    a: 'Mergi la secțiunea Rugăciuni, completează formularul cu cererea ta (poți alege să fii anonim) și publică. Comunitatea se poate ruga pentru tine apăsând butonul „M-am rugat". Cererile sunt aprobate de moderatori înainte de publicare.',
  },
  {
    q: 'Aplicația funcționează și pe telefon?',
    a: 'Da. Site-ul este complet responsive și funcționează ca o aplicație web (PWA) pe telefon — îl poți adăuga pe ecranul principal. Există și o aplicație Android dedicată.',
  },
  {
    q: 'Datele mele sunt în siguranță?',
    a: 'Da. Parolele sunt criptate, datele sunt stocate securizat, iar noi nu vindem niciodată datele tale. Citește mai multe în Politica de confidențialitate.',
  },
];

export default function FaqPage() {
  return (
    <div style={styles.wrapper}>
      <Link href="/landing" style={styles.back}>← Înapoi la pagina principală</Link>
      <h1 style={styles.h1}>Întrebări frecvente</h1>
      <p style={styles.intro}>
        Nu găsești răspunsul căutat? <Link href="/contact" style={styles.link}>Scrie-ne</Link> și îți răspundem
        cât de curând posibil.
      </p>

      {FAQS.map((item, i) => (
        <div key={i} style={styles.item}>
          <h2 style={styles.q}>{item.q}</h2>
          <p style={styles.a}>{item.a}</p>
        </div>
      ))}

      <p style={{ ...styles.intro, marginTop: '2rem' }}>
        Vezi și <Link href="/despre" style={styles.link}>Despre noi</Link> sau{' '}
        <Link href="/contact" style={styles.link}>Contact</Link>.
      </p>
    </div>
  );
}
