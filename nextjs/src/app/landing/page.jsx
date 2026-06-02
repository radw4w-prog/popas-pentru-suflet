import LandingPage from '@/views/LandingPage';
import { getLandingFaqSchema } from '@/lib/structuredData';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Popas pentru Suflet — Biblia online, devoțional zilnic și rugăciuni în română',
  description: 'Aplicație creștină gratuită: Biblia Cornilescu completă online, devoțional zilnic generat cu AI, rugăciuni și imagini cu versete pentru social media.',
  openGraph: {
    title: 'Popas pentru Suflet — Aplicație creștină gratuită',
    description: 'Biblia online, devoțional zilnic, rugăciuni și imagini cu versete. Gratuit.',
    url: 'https://popas-pentru-suflet.vercel.app/',
    type: 'website',
  },
};

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
