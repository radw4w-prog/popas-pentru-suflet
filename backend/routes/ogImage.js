// backend/routes/ogImage.js
// GET  /api/og-image        → redirect spre Cloudinary URL
// POST /api/og-image/upload → primește base64 din frontend, uploadează pe Cloudinary

const express = require('express');
const router = express.Router();
const https = require('https');

// URL-ul curent al imaginii OG (se actualizează după fiecare upload)
// Fallback: SVG simplu dacă nu s-a uploadat nicio imagine încă
let currentOgImageUrl = null;

// ══════════════════════════════════════════════════════
// GET /api/og-image
// Redirect spre Cloudinary (sau fallback SVG)
// ══════════════════════════════════════════════════════
router.get('/', (req, res) => {
  if (currentOgImageUrl) {
    // Redirect 302 spre Cloudinary — mereu online
    return res.redirect(302, currentOgImageUrl);
  }

  // Fallback SVG dacă nu există încă nicio imagine
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=300');
  res.send(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#0a0a0f"/>
    <rect x="24" y="24" width="1152" height="582" fill="none" stroke="#d4af37" stroke-width="2" stroke-opacity="0.4"/>
    <text x="600" y="290" font-family="serif" font-size="48" fill="#d4af37" text-anchor="middle">🕊️ Popas pentru Suflet</text>
    <text x="600" y="360" font-family="sans-serif" font-size="26" fill="rgba(255,255,255,0.6)" text-anchor="middle">Biblia online · Devoțional zilnic · Rugăciuni</text>
    <text x="600" y="570" font-family="sans-serif" font-size="18" fill="rgba(255,255,255,0.25)" text-anchor="middle">popas-pentru-suflet.vercel.app</text>
  </svg>`);
});

// ══════════════════════════════════════════════════════
// POST /api/og-image/upload
// Primește imaginea base64 din frontend
// Uploadează pe Cloudinary și salvează URL-ul
// ══════════════════════════════════════════════════════
router.post('/upload', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image || !image.startsWith('data:image')) {
      return res.status(400).json({ success: false, error: 'Imagine lipsă sau format invalid' });
    }

    // Verifică că avem credențialele Cloudinary
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey    = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({ success: false, error: 'Cloudinary neconfigurat' });
    }

    // Uploadează pe Cloudinary via REST API (fără SDK — mai simplu)
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

    const result = await cloudinary.uploader.upload(image, {
      public_id: 'popas-pentru-suflet-og',  // mereu același ID → suprascrie imaginea veche
      overwrite: true,
      transformation: [
        { width: 1200, height: 630, crop: 'fill' }  // dimensiuni OG standard
      ],
      folder: 'og-images',
      format: 'jpg',
      quality: 90
    });

    // Salvează URL-ul în memorie
    currentOgImageUrl = result.secure_url;

    console.log('✅ OG Image pe Cloudinary:', currentOgImageUrl);

    res.json({
      success: true,
      url: currentOgImageUrl
    });

  } catch (err) {
    console.error('❌ Cloudinary upload error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
