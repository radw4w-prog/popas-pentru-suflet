// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sanitizeMongo, sanitizeXss } = require('./middleware/sanitize');
require('dotenv').config();

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// ═══════════════════════════════════════
// SECURITY HEADERS — helmet
// ═══════════════════════════════════════
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// ═══════════════════════════════════════
// TRUST PROXY — necesar pentru Render
// ═══════════════════════════════════════
app.set('trust proxy', 1);

// ═══════════════════════════════════════
// RATE LIMITING
// ═══════════════════════════════════════
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  // Folosim email din body pentru auth, altfel IP
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.socket?.remoteAddress
      || 'unknown';
  },
  message: { success: false, error: 'Prea multe cereri. Încearcă din nou în 15 minute.' }
});
app.use(globalLimiter);

// Rate limit auth bazat pe EMAIL (nu IP) — mai precis
const authAttempts = new Map(); // email -> { count, firstAttempt }

const authLimiter = (req, res, next) => {
  const email = req.body?.email?.toLowerCase() || req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minute
  const maxAttempts = 10;

  const record = authAttempts.get(email);

  if (record) {
    // Resetează dacă a trecut fereastra de timp
    if (now - record.firstAttempt > windowMs) {
      authAttempts.delete(email);
    } else if (record.count >= maxAttempts) {
      const remainingMs = windowMs - (now - record.firstAttempt);
      const remainingMin = Math.ceil(remainingMs / 60000);
      return res.status(429).json({
        success: false,
        message: `Prea multe încercări pentru acest email. Încearcă din nou în ${remainingMin} minute.`
      });
    }
  }

  // Continuă - contorizează doar la eșec (în route handler)
  req._authEmail = email;
  req._authAttempts = authAttempts;
  next();
};

// Middleware pentru a înregistra eșecul de auth
const recordAuthFailure = (email, authAttempts) => {
  const now = Date.now();
  const record = authAttempts.get(email);
  if (!record) {
    authAttempts.set(email, { count: 1, firstAttempt: now });
  } else {
    record.count++;
  }
};

// Curăță Map-ul la fiecare 30 minute
setInterval(() => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  for (const [key, value] of authAttempts.entries()) {
    if (now - value.firstAttempt > windowMs) {
      authAttempts.delete(key);
    }
  }
}, 30 * 60 * 1000);

const generateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: { success: false, error: 'Limită de generări atinsă. Încearcă din nou în 1 oră.' }
});

// ═══════════════════════════════════════
// CORS
// ═══════════════════════════════════════
const ALLOWED_ORIGINS = [
  'https://popas-pentru-suflet.vercel.app',        // ← trebuie să existe
  'https://popas-pentru-suflet-9515.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    if (!isProd && origin.startsWith('http://localhost')) return callback(null, true);
    console.warn('⚠️ CORS blocat:', origin);
    return callback(new Error('CORS: Origin nepermis'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));

// ═══════════════════════════════════════
// BODY PARSING
// ═══════════════════════════════════════
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ═══════════════════════════════════════
// SANITIZARE INPUT
// ═══════════════════════════════════════
app.use(sanitizeMongo);
app.use(sanitizeXss);

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
// ROUTES
// ═══════════════════════════════════════
// Exportăm recordAuthFailure pentru auth route
app.locals.recordAuthFailure = recordAuthFailure;
app.locals.authAttempts = authAttempts;

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
app.use('/api/cross-references', require('./routes/crossReferences'));

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
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
    } catch(e) { res.status(500).json({ error: e.message }); }
  });

  app.get('/test-notif', async (req, res) => {
    try {
      const { runNotificationsJob } = require('./services/notificationService');
      await runNotificationsJob();
      res.json({ success: true });
    } catch (error) { res.status(500).json({ message: error.message }); }
  });
}

// ═══════════════════════════════════════
// KEEP-ALIVE
// ═══════════════════════════════════════
if (isProd && process.env.RENDER_EXTERNAL_URL) {
  const axios = require('axios');
  setInterval(async () => {
    try {
      await axios.get(`${process.env.RENDER_EXTERNAL_URL}/health`);
    } catch (e) {}
  }, 14 * 60 * 1000);
}

// ═══════════════════════════════════════
// ERROR HANDLER
// ═══════════════════════════════════════
app.use((err, req, res, next) => {
  const message = isProd ? 'Eroare internă server.' : err.message;
  console.error('❌ Eroare:', err.message);
  res.status(err.status || 500).json({ success: false, message });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Resursă negăsită.' });
});

// ═══════════════════════════════════════
// START
// ═══════════════════════════════════════
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🕊️ Server pornit pe portul ${PORT} (${process.env.NODE_ENV || 'development'})`);
});
