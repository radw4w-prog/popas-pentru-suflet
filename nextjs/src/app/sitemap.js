// ═══ Sitemap dinamic generat de Next.js ═══
// Acesta va fi servit la /sitemap.xml automat de App Router

export default function sitemap() {
  const baseUrl = 'https://popas-pentru-suflet.vercel.app';
  const azi = new Date().toISOString().split('T')[0];

  return [
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
      changeFrequency: 'monthly',
      priority: 0.9,
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
}
