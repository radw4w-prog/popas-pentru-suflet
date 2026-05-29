'use client';
// frontend/src/services/ogImageService.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const OG_CACHE_KEY = 'og_image_uploaded_date';

export async function uploadOgImage(dataUrl) {
  try {
    const lastUpload = localStorage.getItem(OG_CACHE_KEY);
    const azi = new Date().toISOString().split('T')[0];
    if (lastUpload === azi) return;

    if (!dataUrl || !dataUrl.startsWith('data:image')) return;

    const response = await fetch(`${API_URL}/api/og-image/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: dataUrl, date: azi })
    });

    if (response.ok) {
      localStorage.setItem(OG_CACHE_KEY, azi);
      console.log('✅ OG Image actualizată cu versetul zilei');

      // Notifică Facebook Debugger automat (best effort)
      fetch(`https://graph.facebook.com/?id=https://popas-pentru-suflet.vercel.app/&scrape=true`, {
        method: 'POST'
      }).catch(() => {}); // Silențios dacă eșuează
    }
  } catch (err) {
    console.warn('⚠️ OG Image upload failed (non-critical):', err.message);
  }
}
