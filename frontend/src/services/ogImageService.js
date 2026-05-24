// frontend/src/services/ogImageService.js
// Trimite automat imaginea generată pe Canvas la backend
// ca să fie folosită ca OG Image la share pe Facebook/WhatsApp

const API_URL = process.env.REACT_APP_API_URL || '';

// Cache local — nu trimite de mai multe ori în aceeași zi
const OG_CACHE_KEY = 'og_image_uploaded_date';

/**
 * Trimite imaginea generată (dataURL) la backend ca OG Image.
 * Se execută silențios — nu blochează UI-ul.
 *
 * @param {string} dataUrl - imaginea ca data:image/jpeg;base64,...
 */
export async function uploadOgImage(dataUrl) {
  try {
    // Verifică dacă am trimis deja azi
    const lastUpload = localStorage.getItem(OG_CACHE_KEY);
    const azi = new Date().toISOString().split('T')[0];
    if (lastUpload === azi) return; // Deja trimis azi

    if (!dataUrl || !dataUrl.startsWith('data:image')) return;

    const response = await fetch(`${API_URL}/api/og-image/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: dataUrl })
    });

    if (response.ok) {
      localStorage.setItem(OG_CACHE_KEY, azi);
      console.log('✅ OG Image actualizată cu versetul zilei');
    }
  } catch (err) {
    // Silențios — nu afectează UX-ul
    console.warn('⚠️ OG Image upload failed (non-critical):', err.message);
  }
}
