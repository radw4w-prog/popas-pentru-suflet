// backend/routes/spiritualJourney.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  markDailyActivity,
  getProfilComplet
} = require('../utils/spiritualJourneyService');

// GET /api/journey/profil — profil complet
router.get('/profil', protect, async (req, res) => {
  try {
    const result = await getProfilComplet(req.user._id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/journey/activity — marchează activitate
// Body: { sursa: 'citire'|'audio'|'devotional'|'rugaciune', stats: {} }
router.post('/activity', protect, async (req, res) => {
  try {
    const { sursa = 'general', stats = {} } = req.body;
    const result = await markDailyActivity(req.user._id, sursa, stats);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;