// backend/routes/journal.js
const express = require('express');
const router = express.Router();
const JournalEntry = require('../models/JournalEntry');
const { protect } = require('../middleware/auth');
const { markDailyActivity } = require('../utils/spiritualJourneyService');

// ═══════════════════════════════════════
// GET /api/journal — toate intrările userului
// ═══════════════════════════════════════
router.get('/', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 30,
      search = '',
      luna = ''
    } = req.query;

    const filter = { userId: req.user._id };

    // Căutare text
    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { notita: regex },
        { cuvantDeLaDumnezeu: regex },
        { rugaciune: regex },
        { 'vpierset.text': regex },
        { 'vpierset.referinta': regex }
      ];
    }

    // Filtru pe lună (format: "2026-05")
    if (luna.trim()) {
      filter.dateKey = { $regex: `^${luna.trim()}` };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [entries, total] = await Promise.all([
      JournalEntry.find(filter)
        .sort({ dateKey: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      JournalEntry.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: entries,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════
// GET /api/journal/calendar — zile cu intrări (ultimele 90 zile)
// ═══════════════════════════════════════
router.get('/calendar', protect, async (req, res) => {
  try {
    const acum90Zile = new Date();
    acum90Zile.setDate(acum90Zile.getDate() - 89);
    const startKey = acum90Zile.toISOString().split('T')[0];

    const entries = await JournalEntry.find({
      userId: req.user._id,
      dateKey: { $gte: startKey }
    })
      .select('dateKey stare')
      .sort({ dateKey: -1 })
      .lean();

    const map = {};
    entries.forEach(e => {
      map[e.dateKey] = e.stare;
    });

    res.json({ success: true, map, total: entries.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════
// GET /api/journal/today — intrarea de azi
// ═══════════════════════════════════════
router.get('/today', protect, async (req, res) => {
  try {
    const dateKey = new Date().toISOString().split('T')[0];

    const entry = await JournalEntry.findOne({
      userId: req.user._id,
      dateKey
    }).lean();

    res.json({
      success: true,
      data: entry,
      dateKey
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════
// GET /api/journal/:dateKey — intrare specifică
// ═══════════════════════════════════════
router.get('/:dateKey', protect, async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      userId: req.user._id,
      dateKey: req.params.dateKey
    }).lean();

    if (!entry) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════
// POST /api/journal — creează sau actualizează intrarea zilei
// ═══════════════════════════════════════
router.post('/', protect, async (req, res) => {
  try {
    const {
      dateKey,
      notita = '',
      cuvantDeLaDumnezeu = '',
      stare = 'recunoscator',
      vpierset = {},
      rugaciune = ''
    } = req.body;

    const ziKey = dateKey || new Date().toISOString().split('T')[0];

    // Verifică dacă textul are conținut
    const areContinut = notita.trim() || cuvantDeLaDumnezeu.trim() || rugaciune.trim();
    if (!areContinut) {
      return res.status(400).json({
        success: false,
        error: 'Scrie cel puțin o notiță, un cuvânt de la Dumnezeu sau o rugăciune.'
      });
    }

    const entry = await JournalEntry.findOneAndUpdate(
      { userId: req.user._id, dateKey: ziKey },
      {
        notita: notita.trim(),
        cuvantDeLaDumnezeu: cuvantDeLaDumnezeu.trim(),
        stare,
        vpierset: {
          text: vpierset.text || '',
          referinta: vpierset.referinta || ''
        },
        rugaciune: rugaciune.trim()
      },
      { upsert: true, new: true }
    );

    // Hook spiritual journey
    markDailyActivity(req.user._id, 'jurnal', {}).catch(console.error);

    res.json({
      success: true,
      data: entry,
      message: 'Jurnal salvat cu succes 🕊️'
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Există deja o intrare pentru această zi.'
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════
// DELETE /api/journal/:dateKey — șterge intrare
// ═══════════════════════════════════════
router.delete('/:dateKey', protect, async (req, res) => {
  try {
    const result = await JournalEntry.findOneAndDelete({
      userId: req.user._id,
      dateKey: req.params.dateKey
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Intrarea nu a fost găsită.'
      });
    }

    res.json({
      success: true,
      message: 'Intrare ștearsă.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════
// GET /api/journal/stats/summary — statistici jurnal
// ═══════════════════════════════════════
router.get('/stats/summary', protect, async (req, res) => {
  try {
    const total = await JournalEntry.countDocuments({
      userId: req.user._id
    });

    const stariCount = await JournalEntry.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$stare', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const stariMap = {};
    stariCount.forEach(s => { stariMap[s._id] = s.count; });

    // Ultima intrare
    const ultima = await JournalEntry.findOne({
      userId: req.user._id
    }).sort({ dateKey: -1 }).lean();

    res.json({
      success: true,
      stats: {
        totalIntrari: total,
        stari: stariMap,
        ultimaIntrare: ultima?.dateKey || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;