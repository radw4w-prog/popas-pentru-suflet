// backend/routes/audioBible.js
const express = require('express');
const router = express.Router();
const AudioProgress = require('../models/AudioProgress');
const { protect } = require('../middleware/auth');

// GET /api/audio-bible/progress — tot progresul userului
router.get('/progress', protect, async (req, res) => {
  try {
    const progress = await AudioProgress.find({ userId: req.user._id }).lean();

    const map = {};
    progress.forEach(p => {
      if (!map[p.carteIndex]) map[p.carteIndex] = {};
      map[p.carteIndex][p.capitol] = {
        pozitieSecunde: p.pozitieSecunde,
        durataSecunde: p.durataSecunde,
        complet: p.complet,
        completatLa: p.completatLa,
        updatedAt: p.updatedAt
      };
    });

    const completate = progress.filter(p => p.complet);
    const timpTotal = progress.reduce((s, p) => s + (p.pozitieSecunde || 0), 0);

    const ultimul = await AudioProgress.findOne({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .lean();

    res.json({
      success: true,
      map,
      stats: {
        capitoleAscultate: progress.length,
        capitoleComplete: completate.length,
        timpTotalSecunde: timpTotal,
        timpTotalMinute: Math.round(timpTotal / 60),
        timpTotalOre: Math.round(timpTotal / 3600 * 10) / 10
      },
      ultimul: ultimul ? {
        carteIndex: ultimul.carteIndex,
        carte: ultimul.carte,
        capitol: ultimul.capitol,
        pozitieSecunde: ultimul.pozitieSecunde,
        complet: ultimul.complet
      } : null
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/audio-bible/progress — salvează progres
router.post('/progress', protect, async (req, res) => {
  try {
    const {
      carteIndex,
      carte,
      capitol,
      pozitieSecunde,
      durataSecunde,
      complet = false
    } = req.body;

    if (!carteIndex || !capitol) {
      return res.status(400).json({
        success: false,
        error: 'carteIndex și capitol sunt obligatorii'
      });
    }

    const progress = await AudioProgress.findOneAndUpdate(
      { userId: req.user._id, carteIndex, capitol },
      {
        carte,
        pozitieSecunde,
        durataSecunde,
        complet,
        completatLa: complet ? new Date() : null
      },
      { upsert: true, new: true }
    );

    // Hook spiritual journey — doar când capitolul e complet
    if (complet) {
      const { markDailyActivity } = require('../utils/spiritualJourneyService');
      markDailyActivity(req.user._id, 'audio', { capitoleAscultate: 1 }).catch(console.error);
    }

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/audio-bible/progress/:carteIndex — progres per carte
router.get('/progress/:carteIndex', protect, async (req, res) => {
  try {
    const { carteIndex } = req.params;

    const progress = await AudioProgress.find({
      userId: req.user._id,
      carteIndex: Number(carteIndex)
    }).lean();

    const map = {};
    progress.forEach(p => {
      map[p.capitol] = {
        pozitieSecunde: p.pozitieSecunde,
        durataSecunde: p.durataSecunde,
        complet: p.complet
      };
    });

    res.json({ success: true, map });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;