// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ═══════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.endsWith('.netlify.app')) return callback(null, true);
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    if (origin.startsWith('http://localhost')) return callback(null, true);
    const allowed = [
      'https://popas-pentru-suflet.vercel.app',
      'https://serene-khapse-8c6464.netlify.app',
      'https://sweet-axolotl-c510b8.netlify.app',
    ];
    if (allowed.includes(origin)) return callback(null, true);
    console.log('⚠️ CORS origin necunoscut (permis temporar):', origin);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ═══════════════════════════════════════
// DATABASE
// ═══════════════════════════════════════
const connectDB = require('./config/database');
connectDB();

// ═══════════════════════════════════════
// SITEMAP.XML — înainte de toate rutele API
// ═══════════════════════════════════════
app.get('/sitemap.xml', (req, res) => {
  const baseUrl = 'https://popas-pentru-suflet.vercel.app';
  const azi = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/dashboard</loc>
    <lastmod>${azi}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/devotional</loc>
    <lastmod>${azi}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/biblia</loc>
    <lastmod>${azi}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/audio</loc>
    <lastmod>${azi}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/reading</loc>
    <lastmod>${azi}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/generate</loc>
    <lastmod>${azi}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/rugaciuni</loc>
    <lastmod>${azi}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(xml);
});

// ═══════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════
app.use('/api/posts', require('./routes/posts'));
app.use('/api/verses', require('./routes/verses'));
app.use('/api/generate', require('./routes/generate'));
app.use('/api/social', require('./routes/social'));
app.use('/api/reading', require('./routes/reading'));
app.use('/api/bookmarks', require('./routes/bookmarks'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/devotionals', require('./routes/devotionals'));
app.use('/api/prayer', require('./routes/prayer'));
app.use('/api/tts', require('./routes/tts'));
app.use('/api/audio-bible', require('./routes/audioBible'));
app.use('/api/journey', require('./routes/spiritualJourney'));
app.use('/api/journal', require('./routes/journal'));
app.use('/api/profile', require('./routes/profile'));

// ═══════════════════════════════════════
// SCHEDULER
// ═══════════════════════════════════════
const schedulerService = require('./services/schedulerService');
schedulerService.init();

require('./models/ReadingPlan');

// ═══════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    gemini: !!process.env.GEMINI_API_KEY,
    mongodb: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// ═══════════════════════════════════════
// TEST ROUTES
// ═══════════════════════════════════════
app.get('/test-ai', async (req, res) => {
  try {
    const geminiService = require('./services/geminiService');
    if (!geminiService.isConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'GEMINI_API_KEY lipsă!',
        key_exists: !!process.env.GEMINI_API_KEY,
        key_length: process.env.GEMINI_API_KEY?.length || 0
      });
    }
    const result = await geminiService.testConnection();
    res.json(result);
  } catch(e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/test-gemini-models', async (req, res) => {
  const axios = require('axios');
  try {
    const r = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    const models = r.data.models
      .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      .map(m => m.name);
    res.json({
      models,
      key_exists: !!process.env.GEMINI_API_KEY,
      key_preview: process.env.GEMINI_API_KEY?.substring(0, 15) + '...'
    });
  } catch (e) {
    res.json({ error: e.response?.data || e.message, key_exists: !!process.env.GEMINI_API_KEY });
  }
});

app.get('/test-notif', async (req, res) => {
  try {
    const { runNotificationsJob } = require('./services/notificationService');
    await runNotificationsJob();
    res.json({ success: true, message: 'Job notificări rulat cu succes!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════
// KEEP-ALIVE pentru Render free tier
// ═══════════════════════════════════════
if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
  const axios = require('axios');
  setInterval(async () => {
    try {
      await axios.get(`${process.env.RENDER_EXTERNAL_URL}/health`);
      console.log('💓 Keep-alive OK');
    } catch (e) {
      console.log('💓 Keep-alive failed:', e.message);
    }
  }, 14 * 60 * 1000);
}

// ═══════════════════════════════════════
// ERROR HANDLER GLOBAL
// ═══════════════════════════════════════
app.use((err, req, res, next) => {
  console.error('❌ Eroare globală:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Eroare internă server.'
  });
});

// ═══════════════════════════════════════
// 404 HANDLER
// ═══════════════════════════════════════
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.url} nu există.`
  });
});

// ═══════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('');
  console.log('🕊️ ════════════════════════════════');
  console.log('🕊️ Popas pentru Suflet API');
  console.log(`🕊️ http://localhost:${PORT}`);
  console.log(`🕊️ Mediu: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🕊️ Gemini: ${process.env.GEMINI_API_KEY ? '✅ Configurat' : '❌ Lipsă KEY'}`);
  console.log(`🕊️ MongoDB: ${process.env.MONGODB_URI ? '✅ URI setat' : '❌ Lipsă URI'}`);
  console.log('🕊️ ════════════════════════════════');
  console.log('');
});
