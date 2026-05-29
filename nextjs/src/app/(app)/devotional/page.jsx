import DevotionalPage from '@/pages/DevotionalPage';
const API = process.env.NEXT_PUBLIC_API_URL || 'https://popas-pentru-suflet-backend.onrender.com';
export async function generateMetadata() {
  try {
    const res = await fetch(`${API}/api/devotionals/today`, { next: { revalidate: 3600 } });
    const data = await res.json();
    const d = data?.data;
    if (d?.title) {
      return {
        title: `${d.title} - Devotional zilnic`,
        description: d.introduction?.substring(0, 155),
      };
    }
  } catch {}
  return { title: 'Devotional zilnic - Meditatie crestina' };
}
export default function Devotional() { return <DevotionalPage />; }

export const dynamic = 'force-dynamic';