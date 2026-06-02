const BASE_URL = 'https://popas-pentru-suflet.vercel.app';
const OG_BASE_URL = 'https://popas-pentru-suflet-backend.onrender.com/api/og-image';

export function buildOgImageUrl({ title, subtitle = '', tag = 'Popas pentru Suflet' }) {
  const params = new URLSearchParams({
    title,
    subtitle,
    tag,
  });
  return `${OG_BASE_URL}?${params.toString()}`;
}

export function createSeoMetadata({
  title,
  description,
  path,
  type = 'website',
  ogTitle,
  ogDescription,
  imageTitle,
  imageSubtitle,
  imageTag,
}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${BASE_URL}${normalizedPath}`;
  const finalOgTitle = ogTitle || title;
  const finalOgDescription = ogDescription || description;
  const imageUrl = buildOgImageUrl({
    title: imageTitle || finalOgTitle,
    subtitle: imageSubtitle || finalOgDescription,
    tag: imageTag || 'Popas pentru Suflet',
  });

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: finalOgTitle,
      description: finalOgDescription,
      url,
      type,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: finalOgTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: finalOgTitle,
      description: finalOgDescription,
      images: [imageUrl],
    },
  };
}
