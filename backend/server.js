// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// ═══════════════════════════════════════
// SECURITY HEADERS — helmet
// ═══════════════════════════════════════
app.use(helmet({
  contentSecurityPolicy: false, // dezactivat pentru că avem CDN-uri externe (Fonts, Cloudinary)
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// ═══════════════════════════════════════
// RATE LIMITING GLOBAL
// ═══════════════════════════════════════
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 300, // max 300 requests per IP per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Prea multe cereri. Încearcă din nou în 15 minute.' }
});
app.use(globalLimiter);

// Rate limit strict pentru auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // max 10 încercări de login per 15 min
  message: { success: false, error: 'Prea multe încercări de autentificare. Încearcă din nou în 15 minute.' },
  skipSuccessfulRequests: true // nu numără request-urile reușite
});

// Rate limit pentru generate (AI)
const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 oră
  max: 30, // max 30 generări per oră
  message: { success: false, error: 'Limită de generări atinsă. Încearcă din nou în 1 oră.' }
});

// ═══════════════════════════════════════
// CORS — strict în producție
// ═══════════════════════════════════════
const ALLOWED_ORIGINS = [
  'https://popas-pentru-suflet.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite request-uri fără origin (mobile apps, Postman în dev)
    if (!origin) {
      if (!isProd) return callback(null, true);
      return callback(null, true); // permite și în prod pentru mobile PWA
    }

    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    // În development permite localhost
    if (!isProd && origin.startsWith('http://localhost')) {
      return callback(null, true);
    }

    console.warn('⚠️ CORS blocat pentru origin:', origin);
    return callback(new Error('CORS: Origin nepermis'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // cache preflight 24h
}));

// ═══════════════════════════════════════
// BODY PARSING — limite rezonabile
// ═══════════════════════════════════════
app.use(express.json({ limit: '10mb' })); // redus de la 50mb
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ═══════════════════════════════════════
// DATABASE
// ═══════════════════════════════════════
const connectDB = require('./config/database');
connectDB();

// ═══════════════════════════════════════
// SITEMAP.XML
// ═══════════════════════════════════════
app.get('/sitemap.xml', (req, res) => {
  const baseUrl = 'https://popas-pentru-suflet.vercel.app';
  const azi = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${baseUrl}/dashboard</loc><lastmod>${azi}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>${baseUrl}/devotional</loc><lastmod>${azi}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${baseUrl}/biblia</loc><lastmod>${azi}</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>${baseUrl}/audio</loc><lastmod>${azi}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>${baseUrl}/reading</loc><lastmod>${azi}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
  <url><loc>${baseUrl}/generate</loc><lastmod>${azi}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
  <url><loc>${baseUrl}/rugaciuni</loc><lastmod>${azi}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(xml);
});

// ═══════════════════════════════════════
// ROUTES — cu rate limiting aplicat
// ═══════════════════════════════════════
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/generate', generateLimiter, require('./routes/generate'));
app.use('/api/og-image', require('./routes/ogImage'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/verses', require('./routes/verses'));
app.use('/api/social', require('./routes/social'));
app.use('/api/reading', require('./routes/reading'));
app.use('/api/bookmarks', require('./routes/bookmarks'));
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
// HEALTH CHECK — info minimă în producție
// ═══════════════════════════════════════
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// ═══════════════════════════════════════
// RUTE TEST — doar în development
// ═══════════════════════════════════════
if (!isProd) {
  app.get('/test-ai', async (req, res) => {
    try {
      const geminiService = require('./services/geminiService');
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
      res.json({ models: r.data.models.map(m => m.name) });
    } catch (e) {
      res.json({ error: e.message });
    }
  });

  app.get('/test-notif', async (req, res) => {
    try {
      const { runNotificationsJob } = require('./services/notificationService');
      await runNotificationsJob();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
}

// ═══════════════════════════════════════
// KEEP-ALIVE pentru Render free tier
// ═══════════════════════════════════════
if (isProd && process.env.RENDER_EXTERNAL_URL) {
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
  // Nu expune detalii interne în producție
  const message = isProd ? 'Eroare internă server.' : err.message;
  console.error('❌ Eroare globală:', err.message);
  res.status(err.status || 500).json({ success: false, message });
});

// ═══════════════════════════════════════
// 404 HANDLER
// ═══════════════════════════════════════
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Resursă negăsită.' });
});

// ═══════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('');
  console.log('🕊️ ════════════════════════════════');
  console.log('🕊️ Popas pentru Suflet API');
  console.log(`🕊️ Port: ${PORT}`);
  console.log(`🕊️ Mediu: ${process.env.NODE_ENV || 'development'}`);
  console.log('🕊️ ════════════════════════════════');
  console.log('');
});
