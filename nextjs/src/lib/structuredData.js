const BASE_URL = 'https://popas-pentru-suflet.vercel.app';
const OG_IMAGE_URL = 'https://popas-pentru-suflet-backend.onrender.com/api/og-image';

export const landingFaqItems = [
  {
    question: 'Ce este Popas pentru Suflet?',
    answer: 'Popas pentru Suflet este o aplicație creștină gratuită în limba română, cu Biblia Cornilescu online, devoțional zilnic, audio Biblie, jurnal spiritual și notificări push.'
  },
  {
    question: 'Pot citi Biblia Cornilescu gratuit?',
    answer: 'Da. Biblia Cornilescu este disponibilă gratuit în aplicație, cu acces rapid la cele 66 de cărți, capitole și versete.'
  },
  {
    question: 'Cum primesc devoționalul zilnic?',
    answer: 'După ce îți creezi cont și activezi notificările push, poți primi zilnic devoționalul și reminder-ele de citire direct pe dispozitivul tău.'
  },
  {
    question: 'Pot instala aplicația pe telefon?',
    answer: 'Da. Popas pentru Suflet poate fi instalată ca PWA pe Android și iPhone, pentru acces mai rapid din ecranul principal.'
  },
  {
    question: 'Cum activez notificările?',
    answer: 'După autentificare, acceptă permisiunea de notificări când apare popup-ul sau activează manual notificările din Profil → Setări.'
  }
];

export function getWebApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Popas pentru Suflet',
    url: BASE_URL,
    description: 'Aplicație creștină gratuită pentru citirea Bibliei Cornilescu, devoțional zilnic, rugăciuni și imagini cu versete.',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Android, iOS, Web',
    inLanguage: 'ro-RO',
    isAccessibleForFree: true,
    browserRequirements: 'Necesită browser modern cu JavaScript activat.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'RON' },
    image: OG_IMAGE_URL,
    author: {
      '@type': 'Organization',
      name: 'Popas pentru Suflet',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Popas pentru Suflet',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/icons/icon-512.png`
      }
    }
  };
}

export function getBreadcrumbSchema(items = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function getBibleBookSchemas(book) {
  const pageUrl = `${BASE_URL}/biblia/${book.slug}`;
  const breadcrumb = getBreadcrumbSchema([
    { name: 'Acasă', url: `${BASE_URL}/landing` },
    { name: 'Biblia', url: `${BASE_URL}/biblia` },
    { name: book.name, url: pageUrl },
  ]);

  const bookSchema = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.name,
    url: pageUrl,
    inLanguage: 'ro-RO',
    abridged: false,
    bookEdition: 'Biblia Cornilescu',
    numberOfPages: book.chapters,
    isPartOf: {
      '@type': 'Book',
      name: 'Biblia Cornilescu',
      inLanguage: 'ro-RO',
      url: `${BASE_URL}/biblia`,
    },
    author: {
      '@type': 'Organization',
      name: 'Popas pentru Suflet'
    },
    about: book.theme,
    genre: book.testament === 'VT' ? 'Vechiul Testament' : 'Noul Testament'
  };

  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${book.name} — Biblia Cornilescu online`,
    url: pageUrl,
    inLanguage: 'ro-RO',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Popas pentru Suflet',
      url: BASE_URL
    },
    about: {
      '@type': 'Book',
      name: book.name,
      bookEdition: 'Biblia Cornilescu'
    }
  };

  return [bookSchema, breadcrumb, collectionPageSchema];
}

export function getLandingFaqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: landingFaqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      }
    }))
  };
}

export function getDevotionalSchemas(devotional) {
  const pageUrl = `${BASE_URL}/devotional`;
  const title = devotional?.title || 'Devoțional zilnic';
  const intro = devotional?.introduction || 'Meditație zilnică, verset și rugăciune pentru viața spirituală.';
  const datePublished = devotional?.createdAt || devotional?.updatedAt || new Date().toISOString();
  const dateModified = devotional?.updatedAt || datePublished;

  const breadcrumb = getBreadcrumbSchema([
    { name: 'Acasă', url: `${BASE_URL}/landing` },
    { name: 'Devoțional zilnic', url: pageUrl },
  ]);

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: intro,
    url: pageUrl,
    inLanguage: 'ro-RO',
    datePublished,
    dateModified,
    image: [OG_IMAGE_URL],
    articleSection: 'Devoțional',
    author: {
      '@type': 'Organization',
      name: 'Popas pentru Suflet'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Popas pentru Suflet',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/icons/icon-512.png`
      }
    },
    mainEntityOfPage: pageUrl
  };

  return [article, breadcrumb];
}
