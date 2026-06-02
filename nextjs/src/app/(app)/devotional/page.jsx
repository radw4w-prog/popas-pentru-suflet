import DevotionalPage from '@/views/DevotionalPage';
import { getDevotionalSchemas } from '@/lib/structuredData';
import { buildOgImageUrl } from '@/lib/seoMetadata';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://popas-pentru-suflet-backend.onrender.com';

async function getTodayDevotionalData() {
  try {
    const res = await fetch(`${API}/api/devotionals/today`, { next: { revalidate: 3600 } });
    const data = await res.json();
    return data?.data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata() {
  const d = await getTodayDevotionalData();
  if (d?.title) {
    const description = d.introduction?.substring(0, 155) || 'Meditație zilnică, rugăciune și încurajare biblică.';
    const imageUrl = buildOgImageUrl({
      title: d.title,
      subtitle: description,
      tag: 'Devoțional zilnic',
    });
    return {
      title: `${d.title} - Devoțional zilnic`,
      description,
      alternates: { canonical: 'https://popas-pentru-suflet.vercel.app/devotional' },
      openGraph: {
        title: `${d.title} - Devoțional zilnic`,
        description,
        url: 'https://popas-pentru-suflet.vercel.app/devotional',
        type: 'article',
        images: [{ url: imageUrl, width: 1200, height: 630, alt: d.title }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${d.title} - Devoțional zilnic`,
        description,
        images: [imageUrl],
      },
    };
  }
  const fallbackDescription = 'Meditație zilnică cu verset, mesaj, rugăciune și gândul zilei. Hrană spirituală pentru fiecare dimineață.';
  const fallbackImageUrl = buildOgImageUrl({
    title: 'Devoțional zilnic',
    subtitle: fallbackDescription,
    tag: 'Popas pentru Suflet',
  });
  return {
    title: 'Devoțional zilnic - Meditație creștină',
    description: fallbackDescription,
    alternates: { canonical: 'https://popas-pentru-suflet.vercel.app/devotional' },
    openGraph: {
      title: 'Devoțional zilnic - Meditație creștină',
      description: fallbackDescription,
      url: 'https://popas-pentru-suflet.vercel.app/devotional',
      type: 'article',
      images: [{ url: fallbackImageUrl, width: 1200, height: 630, alt: 'Devoțional zilnic' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Devoțional zilnic - Meditație creștină',
      description: fallbackDescription,
      images: [fallbackImageUrl],
    },
  };
}

export default async function Devotional() {
  const devotional = await getTodayDevotionalData();
  const schemas = getDevotionalSchemas(devotional);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <DevotionalPage />
    </>
  );
}

export const dynamic = 'force-dynamic';