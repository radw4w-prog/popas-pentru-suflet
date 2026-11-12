import { bibleBooks } from '@/data/bibleBooks';

// ═══ Sitemap dinamic generat de Next.js ═══
// Acesta va fi servit la /sitemap.xml automat de App Router

export default function sitemap() {
  const baseUrl = 'https://popas-pentru-suflet.vercel.app';
  const azi = new Date().toISOString().split('T')[0];

  const staticPages = [
    {
      url: `${baseUrl}/landing`,
      lastModified: azi,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: azi,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/devotional`,
      lastModified: azi,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/biblia`,
      lastModified: azi,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/audio`,
      lastModified: azi,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/generate`,
      lastModified: azi,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/rugaciuni`,
      lastModified: azi,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/reading`,
      lastModified: azi,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  const bibleBookPages = bibleBooks.map((book) => ({
    url: `${baseUrl}/biblia/${book.slug}`,
    lastModified: azi,
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  // Pagini capitole (1.189 capitole) — pentru indexare SEO completă
  const bibleChapterPages = bibleBooks.flatMap((book) =>
    Array.from({ length: book.chapters }, (_, i) => ({
      url: `${baseUrl}/biblia/${book.slug}?capitol=${i + 1}`,
      lastModified: azi,
      changeFrequency: 'monthly',
      priority: 0.7,
    }))
  );

  return [...staticPages, ...bibleBookPages, ...bibleChapterPages];
}
