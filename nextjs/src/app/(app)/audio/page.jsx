import AudioBiblePage from '@/views/AudioBiblePage';
import { createSeoMetadata } from '@/lib/seoMetadata';

export const metadata = createSeoMetadata({
  title: 'Biblia Audio — Ascultă Biblia în română',
  description: 'Ascultă Biblia Cornilescu completă în limba română. Redare continuă, progres salvat automat și experiență optimizată pentru mobil.',
  path: '/audio',
  ogTitle: 'Biblia Audio — Ascultă Biblia Cornilescu în română',
  ogDescription: 'Redare continuă, progres salvat automat și acces rapid la cărțile Bibliei.',
  imageTitle: 'Biblia Audio',
  imageSubtitle: 'Ascultă Biblia Cornilescu completă în limba română',
  imageTag: 'Audio Biblie',
});

export default function Audio() { return <AudioBiblePage />; }

export const dynamic = 'force-dynamic';