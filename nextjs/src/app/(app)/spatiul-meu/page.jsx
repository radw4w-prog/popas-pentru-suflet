import Link from 'next/link';
import { navigationGroups } from '@/lib/navigation';
export const metadata = {title: 'Spațiul meu — Popas pentru Suflet', robots: {index: false, follow: false}};
export default function PersonalSpace() {
  const items = navigationGroups(true, false).find(group => group.title === 'Spațiul meu').items.filter(item => item.path !== '/spatiul-meu');
  const descriptions = {
    '/reading': 'Deschide planul și continuă lectura zilnică.',
    '/journey': 'Vezi consecvența, progresul și reperele tale.',
    '/journal': 'Păstrează gânduri, rugăciuni și reflecții.',
    '/bookmarks': 'Revino la versetele pe care le-ai salvat.',
    '/profile': 'Gestionează profilul și preferințele tale.',
    '/notifications': 'Vezi mesajele și reamintirile primite.',
  };
  return <main style={{maxWidth: 960, margin: '0 auto', padding: '1rem'}}>
    <h1 style={{fontFamily: 'var(--font-playfair), Georgia, serif'}}>Spațiul meu</h1>
    <p style={{color: 'var(--text-secondary)', margin: '1rem 0 2rem'}}>Lectura, reflecțiile și progresul tău, într-un singur loc. Autentifică-te pentru funcțiile personale.</p>
    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1rem'}}>
      {items.map(item => <Link key={item.path} href={item.path} className="card" style={{display: 'block', padding: '1.5rem', textDecoration: 'none', color: 'var(--text-primary)'}}>
        <span aria-hidden="true" style={{fontSize: '1.7rem'}}>{item.icon}</span>
        <h2 style={{fontSize: '1.2rem', margin: '.75rem 0'}}>{item.label} →</h2>
        <p style={{color: 'var(--text-secondary)', lineHeight: 1.6}}>{descriptions[item.path]}</p>
      </Link>)}
    </div>
  </main>;
}
