// backend/routes/ogImage.js
const express = require('express');
const router = express.Router();
const path = require('path');
const { protect } = require('../middleware/auth');

// ── Generare PNG cu node-canvas ─────────────────────────────────────────────
// Facebook/X/WhatsApp/Telegram NU acceptă SVG ca og:image — de aceea generăm
// PNG 1200×630 direct aici (fără dependențe noi; canvas e deja în package.json).
// Fonturile sunt incluse în repo (assets/fonts) ca să nu depindem de fonturile
// sistemului pe Render (Alpine nu are fonturi implicite → text invizibil).
const { createCanvas, registerFont } = require('canvas');

const FONTS_DIR = path.join(__dirname, '..', 'assets', 'fonts');
registerFont(path.join(FONTS_DIR, 'DejaVuSans.ttf'), { family: 'OG Sans' });
registerFont(path.join(FONTS_DIR, 'DejaVuSans-Bold.ttf'), { family: 'OG Sans', weight: 'bold' });
registerFont(path.join(FONTS_DIR, 'DejaVuSerif-Bold.ttf'), { family: 'OG Serif', weight: 'bold' });

// Împarte textul în linii de max maxWidth (măsurat cu fontul curent)
function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function generateOgPng({ title, subtitle, tag }) {
  const W = 1200, H = 630;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Fundal: gradient diagonal închis
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#0a0a0f');
  bg.addColorStop(0.55, '#111827');
  bg.addColorStop(1, '#1f2937');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Cercuri decorative
  ctx.fillStyle = 'rgba(212,175,55,0.08)';
  ctx.beginPath(); ctx.arc(1040, 110, 170, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(59,130,246,0.08)';
  ctx.beginPath(); ctx.arc(120, 540, 210, 0, Math.PI * 2); ctx.fill();

  // Pastilă cu tag (lățime după text)
  ctx.font = 'bold 22px "OG Sans"';
  const tagW = Math.max(140, ctx.measureText(tag).width + 48);
  roundRect(ctx, 80, 82, tagW, 56, 24);
  ctx.fillStyle = 'rgba(212,175,55,0.10)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(212,175,55,0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#d4af37';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(tag, 80 + tagW / 2, 82 + 29);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Titlu: serif bold, micșorat dacă e lung (max 2 linii)
  let titleSize = 64;
  let titleLines = [];
  while (titleSize >= 40) {
    ctx.font = `bold ${titleSize}px "OG Serif"`;
    titleLines = wrapText(ctx, title, 1040);
    if (titleLines.length <= 2) break;
    titleSize -= 6;
  }
  ctx.fillStyle = '#f9fafb';
  const titleLineHeight = titleSize * 1.15;
  const titleStartY = 240 - (titleLines.length - 1) * titleLineHeight;
  titleLines.forEach((line, i) => {
    ctx.fillText(line, 80, titleStartY + i * titleLineHeight);
  });

  // Subtitlu: sans 30px, max 3 linii (cu … dacă e prea lung)
  ctx.font = '30px "OG Sans"';
  let subLines = wrapText(ctx, subtitle, 980);
  if (subLines.length > 3) {
    subLines = subLines.slice(0, 3);
    subLines[2] = subLines[2].replace(/\s+\S*$/, '') + '…';
  }
  ctx.fillStyle = '#d1d5db';
  const subStartY = titleStartY + titleLines.length * titleLineHeight + 55;
  subLines.forEach((line, i) => {
    ctx.fillText(line, 80, subStartY + i * 44);
  });

  // Linie aurie
  const accent = ctx.createLinearGradient(80, 0, 1120, 0);
  accent.addColorStop(0, '#d4af37');
  accent.addColorStop(1, '#f4d03f');
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = accent;
  ctx.fillRect(80, 520, 1040, 2);
  ctx.globalAlpha = 1;

  // URL site
  ctx.font = '22px "OG Sans"';
  ctx.fillStyle = '#9ca3af';
  ctx.fillText('popas-pentru-suflet.vercel.app', 80, 565);

  return canvas.toBuffer('image/png');
}

let currentOgImageUrl = null;

router.get('/', async (req, res) => {
  const title = typeof req.query.title === 'string' && req.query.title.trim()
    ? req.query.title.trim()
    : null;
  const subtitle = typeof req.query.subtitle === 'string' ? req.query.subtitle.trim() : '';
  const tag = typeof req.query.tag === 'string' && req.query.tag.trim()
    ? req.query.tag.trim()
    : 'Popas pentru Suflet';

  if (!title && currentOgImageUrl) {
    return res.redirect(302, currentOgImageUrl);
  }

  try {
    const png = generateOgPng({
      title: title || 'Popas pentru Suflet',
      subtitle: subtitle || 'Biblia online, devoțional zilnic și rugăciuni în română',
      tag
    });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(png);
  } catch (err) {
    console.error('❌ OG image generate error:', err.message);
    res.status(500).json({ success: false, error: 'Generarea imaginii OG a eșuat' });
  }
});

// Upload OG pe Cloudinary — necesită autentificare (altfel oricine arde cota Cloudinary)
router.post('/upload', protect, async (req, res) => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey    = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    console.log('📸 OG upload — env check:', {
      cloudName,
      apiKey: apiKey ? apiKey.substring(0, 6) + '...' : '❌ lipsă',
      apiSecret: apiSecret ? '✅ ' + apiSecret.length + ' chars' : '❌ lipsă'
    });

    const { image, date } = req.body;
    if (!image || !image.startsWith('data:image')) {
      return res.status(400).json({ success: false, error: 'Imagine lipsă' });
    }

    const crypto   = require('crypto');
    const axios    = require('axios');
    const FormData = require('form-data');

    // Public ID cu data zilei — URL nou în fiecare zi = Facebook nu cachează
    const azi = date || new Date().toISOString().split('T')[0];
    const publicId = `popas-og-${azi}`;

    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = `folder=popas-pentru-suflet&overwrite=true&public_id=${publicId}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash('sha256')
      .update(paramsToSign + apiSecret)
      .digest('hex');

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const form = new FormData();
    form.append('file', `data:image/jpeg;base64,${base64Data}`);
    form.append('api_key', apiKey);
    form.append('timestamp', timestamp);
    form.append('signature', signature);
    form.append('public_id', publicId);
    form.append('folder', 'popas-pentru-suflet');
    form.append('overwrite', 'true');

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      form,
      { headers: form.getHeaders() }
    );

    currentOgImageUrl = response.data.secure_url;
    console.log('✅ Upload reușit:', currentOgImageUrl);

    res.json({ success: true, url: currentOgImageUrl });

  } catch (err) {
    const errMsg = err.response?.data || err.message;
    console.error('❌ Upload error:', JSON.stringify(errMsg));
    res.status(500).json({ success: false, error: JSON.stringify(errMsg) });
  }
});

module.exports = router;
