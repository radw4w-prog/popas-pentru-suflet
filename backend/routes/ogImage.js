// backend/routes/ogImage.js
const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;

// Configurare Cloudinary la pornirea modulului
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// URL curent în memorie
let currentOgImageUrl = null;

// ══════════════════════════════════════════════════════
// GET /api/og-image
// ══════════════════════════════════════════════════════
router.get('/', (req, res) => {
  if (currentOgImageUrl) {
    return res.redirect(302, currentOgImageUrl);
  }
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#0a0a0f"/>
    <text x="600" y="315" font-family="serif" font-size="48" fill="#d4af37" text-anchor="middle">🕊️ Popas pentru Suflet</text>
  </svg>`);
});

// ══════════════════════════════════════════════════════
// POST /api/og-image/upload
// ══════════════════════════════════════════════════════
router.post('/upload', async (req, res) => {
  try {
    console.log('📸 OG Image upload primit');
    console.log('Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? '✅ setat' : '❌ lipsă',
      api_secret: process.env.CLOUDINARY_API_SECRET ? '✅ setat' : '❌ lipsă'
    });

    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, error: 'Imagine lipsă' });
    }

    if (!image.startsWith('data:image')) {
      return res.status(400).json({ success: false, error: 'Format invalid' });
    }

    const result = await cloudinary.uploader.upload(image, {
      public_id: 'popas-og-image',
      overwrite: true,
      folder: 'popas-pentru-suflet',
      format: 'jpg',
      quality: 85,
      transformation: [{ width: 1200, height: 630, crop: 'fill' }]
    });

    currentOgImageUrl = result.secure_url;
    console.log('✅ Cloudinary upload reușit:', currentOgImageUrl);

    res.json({ success: true, url: currentOgImageUrl });

  } catch (err) {
    console.error('❌ Cloudinary error detaliat:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      details: err.error || err.http_code || 'unknown'
    });
  }
});

module.exports = router;
