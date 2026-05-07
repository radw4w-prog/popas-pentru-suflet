// backend/routes/tts.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Cache audio în memorie
const audioCache = new Map();
const MAX_CACHE = 300;

// ═══════════════════════════════════════
// POST /api/tts/speak
// ═══════════════════════════════════════
router.post('/speak', async (req, res) => {
  try {
    const { text, referinta, rate = 0 } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Text lipsă'
      });
    }

    const apiKey = process.env.VOICERSS_API_KEY;

    if (!apiKey) {
      return res.json({
        success: false,
        fallbackToBrowser: true,
        message: 'VOICERSS_API_KEY nu este configurat'
      });
    }

    // Verifică cache
    const cacheKey = `${referinta || ''}_${rate}_${text.substring(0, 80)}`;
    if (audioCache.has(cacheKey)) {
      console.log('🎵 TTS cache hit:', referinta);
      return res.json({
        success: true,
        audio: audioCache.get(cacheKey),
        cached: true
      });
    }

    console.log(`🎙️ TTS generating: ${referinta || text.substring(0, 30)}`);

    // Call VoiceRSS — primim MP3 binar
    const response = await axios.get('https://api.voicerss.org/', {
      params: {
        key: apiKey,
        hl: 'ro-ro',
        src: text.trim(),
        r: String(rate),
        c: 'mp3',
        f: '44khz_16bit_stereo',
        ssml: 'false'
      },
      responseType: 'arraybuffer',
      timeout: 20000
    });

    // Verifică dacă e eroare
    // VoiceRSS returnează text ASCII pentru erori chiar și cu arraybuffer
    const rawData = Buffer.from(response.data);
    const firstChars = rawData.toString('utf8', 0, 30);

    if (firstChars.startsWith('ERROR')) {
      const errorMsg = rawData.toString('utf8').trim();
      console.error('❌ VoiceRSS error:', errorMsg);
      return res.json({
        success: false,
        fallbackToBrowser: true,
        error: errorMsg
      });
    }

    // Verifică dimensiunea — un MP3 valid trebuie să aibă > 1KB
    if (rawData.length < 1000) {
      console.error('❌ VoiceRSS: audio prea mic:', rawData.length, 'bytes');
      return res.json({
        success: false,
        fallbackToBrowser: true,
        error: 'Audio generat invalid (prea mic)'
      });
    }

    // Convertim binar → base64
    const audioBase64 = rawData.toString('base64');

    // Salvează în cache
    if (audioCache.size >= MAX_CACHE) {
      const firstKey = audioCache.keys().next().value;
      audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, audioBase64);

    console.log(`✅ TTS OK: ${referinta || ''} | ${rawData.length} bytes | Cache: ${audioCache.size}`);

    res.json({
      success: true,
      audio: audioBase64,
      cached: false,
      size: rawData.length
    });

  } catch (error) {
    console.error('❌ TTS Error:', error.message);

    // Dacă e timeout sau eroare de rețea
    if (error.code === 'ECONNABORTED') {
      return res.json({
        success: false,
        fallbackToBrowser: true,
        error: 'Timeout la generare audio. Încearcă din nou.'
      });
    }

    res.json({
      success: false,
      fallbackToBrowser: true,
      error: error.message
    });
  }
});

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
// DELETE /api/tts/cache
// ═══════════════════════════════════════
router.delete('/cache', (req, res) => {
  const size = audioCache.size;
  audioCache.clear();
  console.log(`🗑️ TTS cache cleared: ${size} entries`);

  res.json({
    success: true,
    message: `Cache curățat: ${size} intrări șterse`
  });
});

// ═══════════════════════════════════════
// POST /api/tts/test — test rapid TTS
// ═══════════════════════════════════════
router.post('/test', async (req, res) => {
  try {
    const apiKey = process.env.VOICERSS_API_KEY;

    if (!apiKey) {
      return res.json({
        success: false,
        error: 'VOICERSS_API_KEY nu e setat'
      });
    }

    const response = await axios.get('https://api.voicerss.org/', {
      params: {
        key: apiKey,
        hl: 'ro-ro',
        src: 'Dumnezeu te iubește',
        c: 'mp3',
        f: '44khz_16bit_stereo'
      },
      responseType: 'arraybuffer',
      timeout: 15000
    });

    const rawData = Buffer.from(response.data);
    const firstChars = rawData.toString('utf8', 0, 30);

    if (firstChars.startsWith('ERROR')) {
      return res.json({
        success: false,
        error: rawData.toString('utf8').trim()
      });
    }

    const audioBase64 = rawData.toString('base64');

    res.json({
      success: true,
      message: 'VoiceRSS funcționează!',
      audioSize: rawData.length,
      audio: audioBase64
    });

  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;