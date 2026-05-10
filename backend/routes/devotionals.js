// backend/routes/devotionals.js
const express = require('express');
const router = express.Router();
const {
  getTodayDevotional,
  getDevotionalByDate,
  getRecentDevotionals,
  createDevotionalForDate,
  getRomaniaDateKey
} = require('../services/devotionalService');

const { protect } = require('../middleware/auth');
const { markDailyActivity } = require('../utils/spiritualJourneyService');

// ═══════════════════════════════════════
// GET /api/devotionals/today
// ═══════════════════════════════════════
router.get('/today', async (req, res) => {
  try {
    const devotional = await getTodayDevotional();
    res.json({ success: true, data: devotional });
  } catch (error) {
    console.error('❌ today devotional error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════
// GET /api/devotionals/history?limit=30
// ═══════════════════════════════════════
router.get('/history', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 30, 100);
    const items = await getRecentDevotionals(limit);
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════
// GET /api/devotionals/regenerate-today
// Test regenerare cu prompt nou
// ═══════════════════════════════════════
router.get('/regenerate-today', async (req, res) => {
  try {
    const DailyDevotional = require('../models/DailyDevotional');

    const dateKey = getRomaniaDateKey();

    // Șterge ce există
    await DailyDevotional.deleteOne({ dateKey });
    console.log('🗑️ Devoțional șters pentru:', dateKey);

    // Creează unul nou
    const devotional = await createDevotionalForDate(new Date());
    console.log('✅ Devoțional nou creat:', devotional?.title);

    res.json({ success: true, data: devotional });
  } catch (error) {
    console.error('❌ Eroare regenerare:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════
// POST /api/devotionals/generate/manual
// ═══════════════════════════════════════
router.post('/generate/manual', async (req, res) => {
  try {
    const DailyDevotional = require('../models/DailyDevotional');
    const dateKey = getRomaniaDateKey();
    await DailyDevotional.deleteOne({ dateKey });
    const devotional = await createDevotionalForDate(new Date());
    res.json({ success: true, data: devotional });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════
// POST /api/devotionals/viewed
// Marchează devoționalul ca văzut
// ═══════════════════════════════════════
router.post('/viewed', protect, async (req, res) => {
  try {
    markDailyActivity(
      req.user._id,
      'devotional',
      { devotionaleParcurse: 1 }
    ).catch(console.error);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// ═══════════════════════════════════════
// GET /api/devotionals/:dateKey
// ATENȚIE: această rută trebuie să fie ULTIMA
// ═══════════════════════════════════════
router.get('/:dateKey', async (req, res) => {
  try {
    const devotional = await getDevotionalByDate(req.params.dateKey);

    if (!devotional) {
      return res.status(404).json({
        success: false,
        error: 'Devoțional negăsit'
      });
    }

    res.json({ success: true, data: devotional });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;