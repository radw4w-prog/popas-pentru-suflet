const express = require('express');
const router = express.Router();
const axios = require('axios');

// Cache în memorie
const audioCache = new Map();
const MAX_CACHE = 300;

// ═══════════════════════════════════════
// POST /api/tts/speak
// ═══════════════════════════════════════
// backend/routes/tts.js — înlocuiește tot router.post('/speak')
router.post('/speak', async (req, res) => {
  try {
    const { text, referinta, rate = 0 } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Text lipsă' });
    }

    const apiKey = process.env.VOICERSS_API_KEY;
    if (!apiKey) {
      return res.json({ success: false, fallbackToBrowser: true });
    }

    const cacheKey = `${referinta || ''}_${rate}_${text.substring(0, 80)}`;
    if (audioCache.has(cacheKey)) {
      console.log('🎵 TTS cache hit:', referinta);
      return res.json({ success: true, audio: audioCache.get(cacheKey), cached: true });
    }

    console.log(`🎙️ TTS generating: ${referinta || text.substring(0, 30)}`);

    // ✅ Fără b64 — primim MP3 binar
    const response = await axios.get('https://api.voicerss.org/', {
      params: {
        key: apiKey,
        hl: 'ro-ro',
        src: text.trim(),
        r: rate,
        c: 'mp3',
        f: '44khz_16bit_stereo',
        ssml: 'false'
        // fără b64: true
      },
      responseType: 'arraybuffer', // ← primim binar
      timeout: 20000
    });

    // Verifică dacă e eroare (VoiceRSS returnează text pentru erori)
    const firstBytes = Buffer.from(response.data).toString('utf8', 0, 20);
    if (firstBytes.startsWith('ERROR')) {
      console.error('❌ VoiceRSS error:', firstBytes);
      return res.json({ success: false, fallbackToBrowser: true, error: firstBytes });
    }

    // Convertim binar → base64
    const audioBase64 = Buffer.from(response.data).toString('base64');

    // Cache
    if (audioCache.size >= MAX_CACHE) {
      audioCache.delete(audioCache.keys().next().value);
    }
    audioCache.set(cacheKey, audioBase64);

    console.log(`✅ TTS OK. Cache: ${audioCache.size}`);
    res.json({ success: true, audio: audioBase64, cached: false });

  } catch (error) {
    console.error('❌ TTS Error:', error.message);
    res.json({ success: false, fallbackToBrowser: true, error: error.message });
  }
});

    const audioData = response.data;

// VoiceRSS cu b64=true returnează data URI complet
// Trebuie să extragem doar base64-ul
let audioBase64 = audioData;

if (typeof audioData === 'string' && audioData.includes('base64,')) {
  // Are prefix data:audio/...;base64, — îl scoatem
  audioBase64 = audioData.split('base64,')[1];
}

if (typeof audioData === 'string' && audioData.startsWith('ERROR')) {
  console.error('❌ VoiceRSS error:', audioData);
  return res.json({
    success: false,
    fallbackToBrowser: true,
    error: audioData
  });
}

// Salvează în cache
if (audioCache.size >= MAX_CACHE) {
  const firstKey = audioCache.keys().next().value;
  audioCache.delete(firstKey);
}
audioCache.set(cacheKey, audioBase64);

res.json({ success: true, audio: audioBase64, cached: false });

// ═══════════════════════════════════════
// GET /api/tts/status
// ═══════════════════════════════════════
router.get('/status', (req, res) => {
  const hasKey = !!process.env.VOICERSS_API_KEY;

  res.json({
    success: true,
    configured: hasKey,
    provider: hasKey ? 'VoiceRSS - Română' : 'Browser TTS (fallback)',
    voice: 'ro-ro',
    cacheSize: audioCache.size,
    maxCache: MAX_CACHE
  });
});

// ═══════════════════════════════════════
// DELETE /api/tts/cache — curăță cache
// ═══════════════════════════════════════
router.delete('/cache', (req, res) => {
  const size = audioCache.size;
  audioCache.clear();
  res.json({
    success: true,
    message: `Cache curățat: ${size} intrări șterse`
  });
});

module.exports = router;