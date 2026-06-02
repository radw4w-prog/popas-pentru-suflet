import DevotionalPage from '@/views/DevotionalPage';
import { getDevotionalSchemas } from '@/lib/structuredData';

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
    return {
      title: `${d.title} - Devoțional zilnic`,
      description: d.introduction?.substring(0, 155),
    };
  }
  return { title: 'Devoțional zilnic - Meditație creștină', description: 'Meditație zilnică cu verset, mesaj, rugăciune și gândul zilei. Hrană spirituală pentru fiecare dimineață.' };
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