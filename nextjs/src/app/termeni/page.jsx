import Link from 'next/link';
import { createSeoMetadata } from '@/lib/seoMetadata';

export const metadata = createSeoMetadata({
  title: 'Termeni și condiții — Popas pentru Suflet',
  description: 'Termenii și condițiile de utilizare a aplicației Popas pentru Suflet: Biblia online, devoțional zilnic, rugăciuni și jurnal spiritual.',
  path: '/termeni',
  ogTitle: 'Termeni și condiții — Popas pentru Suflet',
  ogDescription: 'Condițiile de utilizare a aplicației creștine gratuite Popas pentru Suflet.',
  imageTitle: 'Termeni și condiții',
  imageSubtitle: 'Popas pentru Suflet — reguli simple și clare',
  imageTag: 'Termeni',
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
};

export default function TermeniPage() {
  return (
    <div style={styles.wrapper}>
      <Link href="/landing" style={styles.back}>← Înapoi la pagina principală</Link>
      <h1 style={styles.h1}>Termeni și condiții</h1>
      <p style={styles.updated}>Ultima actualizare: 11 noiembrie 2026</p>

      <p style={styles.p}>
        Bine ai venit la Popas pentru Suflet — aplicație creștină gratuită pentru citirea Bibliei, devoțional
        zilnic, rugăciuni și jurnal spiritual. Prin utilizarea aplicației, ești de acord cu acești termeni.
      </p>

      <h2 style={styles.h2}>1. Serviciul</h2>
      <p style={styles.p}>
        Oferim gratuit: Biblia Cornilescu completă online (31.102 versete), devoțional zilnic, gândul și
        rugăciunea zilei, audio Biblie, rugăciuni comunitare, plan de citire, jurnal spiritual și instrumente
        pentru crearea de imagini cu versete. Serviciul este oferit „ca atare", fără garanții exprese.
      </p>

      <h2 style={styles.h2}>2. Contul tău</h2>
      <ul style={styles.ul}>
        <li style={styles.li}>Ești responsabil pentru confidențialitatea parolei tale.</li>
        <li style={styles.li}>Furnizează informații corecte la înregistrare.</li>
        <li style={styles.li}>Ne rezervăm dreptul de a suspenda conturi care încalcă acești termeni.</li>
      </ul>

      <h2 style={styles.h2}>3. Conținut generat de utilizatori</h2>
      <p style={styles.p}>
        Rugăciunile și postările comunitare sunt moderate. Prin publicarea conținutului, confirmi că ai dreptul
        să-l postezi și că nu încalcă drepturile altora. Putem elimina conținut care este abuziv, discriminatoriu
        sau contrar valorilor creștine ale comunității.
      </p>

      <h2 style={styles.h2}>4. Conținut AI</h2>
      <p style={styles.p}>
        Devoționalele și textele generate cu inteligență artificială sunt instrumente de sprijin pentru meditație.
        Nu înlocuiesc studiul personal al Scripturii, predicile sau îndrumarea pastorală. Te încurajăm să verifici
        întotdeauna referințele biblice în context.
      </p>

      <h2 style={styles.h2}>5. Proprietate intelectuală</h2>
      <p style={styles.p}>
        Textul Bibliei Cornilescu este domeniu public în România. Design-ul, codul și conținutul original al
        aplicației aparțin Popas pentru Suflet și nu pot fi copiate fără acord. Imaginile generate de tine cu
        instrumentele noastre îți aparțin și le poți folosi liber.
      </p>

      <h2 style={styles.h2}>6. Limitarea răspunderii</h2>
      <p style={styles.p}>
        Depunem eforturi rezonabile pentru continuitatea serviciului, dar nu garantăm funcționarea neîntreruptă.
        Nu suntem răspunzători pentru daune rezultate din utilizarea aplicației, în măsura permisă de lege.
      </p>

      <h2 style={styles.h2}>7. Modificări</h2>
      <p style={styles.p}>
        Putem actualiza acești termeni. Modificările importante vor fi anunțate în aplicație. Continuarea
        utilizării după modificări înseamnă acceptarea lor.
      </p>

      <p style={styles.p}>
        Vezi și <Link href="/confidentialitate" style={styles.a}>Politica de confidențialitate</Link>.
        Întrebări? <Link href="/contact" style={styles.a}>Contactează-ne</Link>.
      </p>
    </div>
  );
}
