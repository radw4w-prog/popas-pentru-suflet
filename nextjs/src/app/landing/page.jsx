import LandingPage from '@/views/LandingPage';
import { getLandingFaqSchema } from '@/lib/structuredData';
import { createSeoMetadata } from '@/lib/seoMetadata';

export const dynamic = 'force-dynamic';

export const metadata = createSeoMetadata({
  title: 'Popas pentru Suflet — Biblia online, devoțional zilnic și rugăciuni în română',
  description: 'Aplicație creștină gratuită: Biblia Cornilescu completă online, devoțional zilnic generat cu AI, rugăciuni și imagini cu versete pentru social media.',
  path: '/landing',
  ogTitle: 'Popas pentru Suflet — Aplicație creștină gratuită',
  ogDescription: 'Biblia online, devoțional zilnic, rugăciuni și imagini cu versete. Gratuit.',
  imageTitle: 'Popas pentru Suflet',
  imageSubtitle: 'Biblia online, devoțional zilnic și rugăciuni în română',
  imageTag: 'Aplicație creștină gratuită',
});

export default function Landing() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getLandingFaqSchema()) }}
      />
      <LandingPage />
    </>
  );
}
