const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ═══════════════════════════════════════
// MIDDLEWARE (primul!)
// ═══════════════════════════════════════
app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://serene-khapse-8c6464.netlify.app',
      'https://sweet-axolotl-c510b8.netlify.app',
    ];

    // Permite requesturi fără origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    // Permite orice subdomain netlify
    if (origin.endsWith('.netlify.app')) return callback(null, true);

    if (allowed.includes(origin)) return callback(null, true);

    callback(new Error('CORS: origin neautorizat: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ═══════════════════════════════════════
// DATABASE
// ═══════════════════════════════════════
const connectDB = require('./config/database');
connectDB();

// ═══════════════════════════════════════
// ROUTES - Existente
// ═══════════════════════════════════════
const postsRouter = require('./routes/posts');
const versesRouter = require('./routes/verses');
const generateRouter = require('./routes/generate');
const socialRouter = require('./routes/social');
const readingRouter = require('./routes/reading');

app.use('/api/posts', postsRouter);
app.use('/api/verses', versesRouter);
app.use('/api/generate', generateRouter);
app.use('/api/social', socialRouter);
app.use('/api/reading', readingRouter);

// ═══════════════════════════════════════
// ROUTES - Noi (Auth + Admin + Notifications)
// ═══════════════════════════════════════
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// ═══════════════════════════════════════
// SCHEDULER
// ═══════════════════════════════════════
const schedulerService = require('./services/schedulerService');
schedulerService.init();

// ═══════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

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


// ═══ TEMPORAR - TEST NOTIFICĂRI ═══
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
// 404 HANDLER
// ═══════════════════════════════════════
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.url} nu există.`
  });
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

// Pre-încarcă modelul ReadingPlan
require('./models/ReadingPlan');




// ═══════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('');
  console.log('🕊️  ════════════════════════════════');
  console.log('🕊️  Popas pentru Suflet API');
  console.log(`🕊️  http://localhost:${PORT}`);
  console.log(`🕊️  Mediu: ${process.env.NODE_ENV || 'development'}`);
  console.log('🕊️  ════════════════════════════════');
  console.log('');
});



