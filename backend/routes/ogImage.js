// backend/routes/ogImage.js
const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;

// Cloudinary se configurează automat din CLOUDINARY_URL
// Format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
// Nu mai e nevoie de config manual dacă CLOUDINARY_URL e setat în env

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
    <text x="600" y="315" font-family="serif" font-size="48" fill="#d4af37" text-anchor="middle">Popas pentru Suflet</text>
  </svg>`);
});

// ══════════════════════════════════════════════════════
// POST /api/og-image/upload
// ══════════════════════════════════════════════════════
router.post('/upload', async (req, res) => {
  try {
    console.log('📸 OG Image upload primit');
    console.log('CLOUDINARY_URL setat:', !!process.env.CLOUDINARY_URL);

    const { image } = req.body;

    if (!image || !image.startsWith('data:image')) {
      return res.status(400).json({ success: false, error: 'Imagine lipsă sau format invalid' });
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
    console.error('❌ Cloudinary error:', err.message, err.http_code);
    res.status(500).json({
      success: false,
      error: err.message,
      http_code: err.http_code
    });
  }
});

module.exports = router;
