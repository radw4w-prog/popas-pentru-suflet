import PrayerPage from '@/views/PrayerPage';
import { createSeoMetadata } from '@/lib/seoMetadata';

export const metadata = createSeoMetadata({
  title: 'Rugăciuni zilnice — Cereri de rugăciune',
  description: 'Comunitate de rugăciune creștină. Trimite cereri de rugăciune, roagă-te pentru alții și rămâi aproape de Dumnezeu în fiecare zi.',
  path: '/rugaciuni',
  ogTitle: 'Rugăciuni zilnice și cereri de rugăciune',
  ogDescription: 'O comunitate creștină în care te poți ruga pentru alții și poți cere sprijin în rugăciune.',
  imageTitle: 'Rugăciuni zilnice',
  imageSubtitle: 'Comunitate de rugăciune creștină și sprijin spiritual',
  imageTag: 'Cereri de rugăciune',
});

export default function Rugaciuni() { return <PrayerPage />; }

export const dynamic = 'force-dynamic';