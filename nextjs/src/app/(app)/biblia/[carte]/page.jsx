import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getAdjacentBibleBooks, getBibleBookBySlug, getBibleBookDescription, bibleBooks } from '@/data/bibleBooks';
import { getBibleBookSchemas } from '@/lib/structuredData';
import { buildOgImageUrl } from '@/lib/seoMetadata';
import BibleBookClient from './BibleBookClient';

export const dynamicParams = false;

export function generateStaticParams() {
  return bibleBooks.map((book) => ({ carte: book.slug }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const book = getBibleBookBySlug(resolvedParams.carte);
  if (!book) {
    return { title: 'Carte negăsită' };
  }

  const description = getBibleBookDescription(book);
  const url = `https://popas-pentru-suflet.vercel.app/biblia/${book.slug}`;
  const imageUrl = buildOgImageUrl({
    title: `${book.name} — Biblia Cornilescu`,
    subtitle: `${book.chapters} capitole din ${book.testament === 'VT' ? 'Vechiul Testament' : 'Noul Testament'}`,
    tag: 'Biblia online',
  });

  return {
    title: `${book.name} — Biblia Cornilescu online`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${book.name} — Biblia Cornilescu online`,
      description,
      url,
      type: 'article',
      images: [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: `${book.name} — Biblia Cornilescu online`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${book.name} — Biblia Cornilescu online`,
      description,
      images: [imageUrl],
    },
  };
}

// Loading component for Suspense
function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      gap: '1rem'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid var(--border-color)',
        borderTopColor: '#d4af37',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <p>Se încarcă...</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default async function BibleBookPage({ params }) {
  const resolvedParams = await params;
  const book = getBibleBookBySlug(resolvedParams.carte);
  if (!book) notFound();

  const schemas = getBibleBookSchemas(book);

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <Suspense fallback={<LoadingFallback />}>
        <BibleBookClient bookSlug={book.slug} />
      </Suspense>
    </>
  );
}