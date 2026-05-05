const express = require('express');
const router = express.Router();
const {
  getTodayDevotional,
  getDevotionalByDate,
  getRecentDevotionals,
  createDevotionalForDate
} = require('../services/devotionalService');

// GET /api/devotionals/today
router.get('/today', async (req, res) => {
  try {
    const devotional = await getTodayDevotional();
    res.json({
      success: true,
      data: devotional
    });
  } catch (error) {
    console.error('❌ today devotional error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/devotionals/history?limit=30
router.get('/history', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 30, 100);
    const items = await getRecentDevotionals(limit);
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/devotionals/:dateKey
router.get('/:dateKey', async (req, res) => {
  try {
    const devotional = await getDevotionalByDate(req.params.dateKey);

    if (!devotional) {
      return res.status(404).json({
        success: false,
        error: 'Devoțional negăsit'
      });
    }

    res.json({
      success: true,
      data: devotional
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/devotionals/generate/:dateKey?  (manual)
router.post('/generate/manual', async (req, res) => {
  try {
    const devotional = await createDevotionalForDate(new Date());
    res.json({
      success: true,
      data: devotional
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;