// backend/routes/ogImage.js
// GET  /api/og-image        → returnează imaginea curentă salvată
// POST /api/og-image/upload → frontend trimite imaginea generată (base64)

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const OG_PATH = path.join(__dirname, '../uploads/og-image.png');

// ── Asigură că folderul uploads există ──────────────────────────
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ══════════════════════════════════════════════════════
// GET /api/og-image
// Returnează imaginea PNG salvată
// ══════════════════════════════════════════════════════
router.get('/', (req, res) => {
  if (fs.existsSync(OG_PATH)) {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.sendFile(OG_PATH);
  }

  // Fallback — dacă nu există încă nicio imagine uploadată
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(`
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#0a0a0f"/>
      <rect x="24" y="24" width="1152" height="582" fill="none" stroke="#d4af37" stroke-width="2" stroke-opacity="0.4"/>
      <text x="600" y="260" font-family="serif" font-size="60" fill="#d4af37" text-anchor="middle">🕊️</text>
      <text x="600" y="340" font-family="serif" font-size="42" fill="#f0f0f0" text-anchor="middle">Popas pentru Suflet</text>
      <text x="600" y="400" font-family="sans-serif" font-size="24" fill="rgba(255,255,255,0.5)" text-anchor="middle">Biblia online · Devoțional zilnic · Rugăciuni</text>
      <text x="600" y="570" font-family="sans-serif" font-size="18" fill="rgba(255,255,255,0.3)" text-anchor="middle">popas-pentru-suflet.vercel.app</text>
    </svg>
  `);
});

// ══════════════════════════════════════════════════════
// POST /api/og-image/upload
// Frontend trimite imaginea ca base64 JPEG/PNG
// Body: { image: "data:image/jpeg;base64,..." }
// ══════════════════════════════════════════════════════
router.post('/upload', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image || !image.startsWith('data:image')) {
      return res.status(400).json({ success: false, error: 'Imagine lipsă sau format invalid' });
    }

    // Extrage base64 pur
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Salvează ca PNG
    fs.writeFileSync(OG_PATH, buffer);

    console.log('✅ OG Image actualizată:', new Date().toISOString());

    res.json({
      success: true,
      url: `${process.env.RENDER_EXTERNAL_URL || 'https://popas-pentru-suflet-backend.onrender.com'}/api/og-image`,
      size: buffer.length
    });

  } catch (err) {
    console.error('❌ OG Image upload error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
