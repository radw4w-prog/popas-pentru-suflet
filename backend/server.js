const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://serene-khapse-8c6464.netlify.app',
    /\.netlify\.app$/
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database
const connectDB = require('./config/database');
connectDB();

// Routes
const postsRouter = require('./routes/posts');
const versesRouter = require('./routes/verses');
const generateRouter = require('./routes/generate');
const socialRouter = require('./routes/social');

app.use('/api/posts', postsRouter);
app.use('/api/verses', versesRouter);
app.use('/api/generate', generateRouter);
app.use('/api/social', socialRouter);

// Scheduler
const schedulerService = require('./services/schedulerService');
schedulerService.init();

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Keep-alive pentru Render free
if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
  setInterval(async () => {
    try {
      await api.get(`${process.env.RENDER_EXTERNAL_URL}/health`);
      console.log('💓 Keep-alive OK');
    } catch (e) {
      console.log('💓 Keep-alive failed:', e.message);
    }
  }, 14 * 60 * 1000);
}

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🕊️ Popas pentru Suflet API rulează pe portul ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});

