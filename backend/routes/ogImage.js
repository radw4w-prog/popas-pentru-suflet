// backend/routes/ogImage.js
const express = require('express');
const router = express.Router();

let currentOgImageUrl = null;

router.get('/', (req, res) => {
  const escapeXml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

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

  const finalTitle = escapeXml(title || 'Popas pentru Suflet');
  const finalSubtitle = escapeXml(subtitle || 'Biblia online, devoțional zilnic și rugăciuni în română');
  const finalTag = escapeXml(tag);

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(`<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${finalTitle}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0a0a0f" />
        <stop offset="55%" stop-color="#111827" />
        <stop offset="100%" stop-color="#1f2937" />
      </linearGradient>
      <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#d4af37" />
        <stop offset="100%" stop-color="#f4d03f" />
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)" />
    <circle cx="1040" cy="110" r="170" fill="rgba(212,175,55,0.08)" />
    <circle cx="120" cy="540" r="210" fill="rgba(59,130,246,0.08)" />
    <rect x="80" y="82" rx="24" ry="24" width="220" height="56" fill="rgba(212,175,55,0.10)" stroke="rgba(212,175,55,0.25)" />
    <text x="190" y="117" font-family="Inter, Arial, sans-serif" font-size="22" fill="#d4af37" text-anchor="middle" font-weight="700">${finalTag}</text>
    <text x="80" y="240" font-family="Georgia, serif" font-size="64" fill="#f9fafb" font-weight="700">${finalTitle}</text>
    <foreignObject x="80" y="275" width="1040" height="180">
      <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Inter, Arial, sans-serif; font-size: 30px; line-height: 1.45; color: #d1d5db; max-width: 980px;">
        ${finalSubtitle}
      </div>
    </foreignObject>
    <rect x="80" y="520" width="1040" height="2" fill="url(#accent)" opacity="0.55" />
    <text x="80" y="565" font-family="Inter, Arial, sans-serif" font-size="22" fill="#9ca3af">popas-pentru-suflet.vercel.app</text>
  </svg>`);
});

router.post('/upload', async (req, res) => {
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
