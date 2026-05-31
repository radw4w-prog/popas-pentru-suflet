import { Inter, Playfair_Display, Lora } from 'next/font/google';
import Script from 'next/script';
import '@/styles/App.css';
import '@/styles/Premium.css';
import '@/styles/BottomNav.css';
import '@/components/Sidebar.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap', style: ['normal', 'italic'], weight: ['400', '600', '700'] });
const lora = Lora({ subsets: ['latin'], variable: '--font-lora', display: 'swap', style: ['normal', 'italic'], weight: ['400', '700'] });

export const metadata = {
  metadataBase: new URL('https://popas-pentru-suflet.vercel.app'),
  title: {
    default: 'Popas pentru Suflet - Aplicație creștină | Biblia online, versete și rugăciuni zilnice',
    template: '%s | Popas pentru Suflet',
  },
  description: 'Aplicație creștină gratuită: Biblia Cornilescu online cu 31.102 versete, devoțional zilnic, rugăciuni și imagini cu versete.',
  openGraph: {
    type: 'website',
    locale: 'ro_RO',
    url: 'https://popas-pentru-suflet.vercel.app',
    siteName: 'Popas pentru Suflet',
    images: [{ url: 'https://popas-pentru-suflet-backend.onrender.com/api/og-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://popas-pentru-suflet-backend.onrender.com/api/og-image'],
  },
  manifest: '/manifest.json',
  icons: { icon: '/logo.png', apple: '/icons/icon-192.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro" data-theme="dark" className={`${inter.variable} ${playfair.variable} ${lora.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Popas pentru Suflet",
              "url": "https://popas-pentru-suflet.vercel.app",
              "description": "Aplicație creștină gratuită pentru citirea Bibliei Cornilescu.",
              "applicationCategory": "LifestyleApplication",
              "operatingSystem": "Android, iOS, Web",
              "inLanguage": "ro-RO",
              "isAccessibleForFree": true,
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "RON" },
              "author": { "@type": "Organization", "name": "Popas pentru Suflet" }
            })
          }}
        />
      </head>
	 
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/service-worker.js')
                    .then(function(reg) { console.log('SW registered:', reg.scope); })
                    .catch(function(err) { console.log('SW registration failed:', err); });
                });
              }
            `
          }}
        />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');`}
            </Script>
          </>
        )}
        {children}
      </body>
    </html>
  );
}
