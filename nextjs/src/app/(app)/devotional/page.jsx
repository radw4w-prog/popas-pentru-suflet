import DevotionalPage from '@/views/DevotionalPage';
const API = process.env.NEXT_PUBLIC_API_URL || 'https://popas-pentru-suflet-backend.onrender.com';
export async function generateMetadata() {
  try {
    const res = await fetch(`${API}/api/devotionals/today`, { next: { revalidate: 3600 } });
    const data = await res.json();
    const d = data?.data;
    if (d?.title) {
      return {
        title: `${d.title} - Devoțional zilnic`,
        description: d.introduction?.substring(0, 155),
      };
    }
  } catch {}
  return { title: 'Devoțional zilnic - Meditație creștină', description: 'Meditație zilnică cu verset, mesaj, rugăciune și gândul zilei. Hrană spirituală pentru fiecare dimineață.' };
}
export default function Devotional() { return <DevotionalPage />; }

export const dynamic = 'force-dynamic';