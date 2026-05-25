// backend/routes/ogImage.js
const express = require('express');
const router = express.Router();

let currentOgImageUrl = null;

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
