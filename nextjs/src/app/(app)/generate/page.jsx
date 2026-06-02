import GeneratePage from '@/views/GeneratePage';
import { createSeoMetadata } from '@/lib/seoMetadata';

export const metadata = createSeoMetadata({
  title: 'Creează imagini cu versete biblice',
  description: 'Generează imagini frumoase cu versete biblice pentru Facebook, Instagram și WhatsApp. Template-uri gratuite, texte creștine și design rapid.',
  path: '/generate',
  ogTitle: 'Creează imagini cu versete biblice — gratuit',
  ogDescription: 'Generează imagini cu versete pentru social media, rapid și elegant.',
  imageTitle: 'Imagini cu versete biblice',
  imageSubtitle: 'Generează vizualuri creștine pentru Facebook, Instagram și WhatsApp',
  imageTag: 'Generator creștin',
});

export default function Generate() { return <GeneratePage />; }

export const dynamic = 'force-dynamic';