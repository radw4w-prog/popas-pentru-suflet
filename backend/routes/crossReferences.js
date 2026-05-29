// backend/routes/crossReferences.js
const express = require('express');
const router = express.Router();
const CrossReference = require('../models/CrossReference');
const Verse = require('../models/Verse');

// GET /api/cross-references?carte=Ioan&capitol=3&verset=16
// Returnează referințele încrucișate pentru un verset
router.get('/', async (req, res) => {
  try {
    const { carte, capitol, verset } = req.query;

    if (!carte || !capitol || !verset) {
      return res.status(400).json({ success: false, error: 'carte, capitol și verset sunt obligatorii' });
    }

    const doc = await CrossReference.findOne({
      carte,
      capitol: parseInt(capitol),
      verset: parseInt(verset)
    }).lean();

    if (!doc) {
      return res.json({ success: true, referinte: [] });
    }

    res.json({ success: true, referinte: doc.referinte });
  } catch (err) {
    console.error('CrossRef error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/cross-references/verset?carte=Ioan&capitol=3&verset=16
// Returnează textul unui verset după referință
router.get('/verset', async (req, res) => {
  try {
    const { carte, capitol, verset } = req.query;

    if (!carte || !capitol || !verset) {
      return res.status(400).json({ success: false, error: 'Parametri lipsă' });
    }

    const verse = await Verse.findOne({
      carte,
      capitol: parseInt(capitol),
      verset: parseInt(verset)
    }).lean();

    if (!verse) {
      return res.status(404).json({ success: false, error: 'Versetul nu a fost găsit' });
    }

    res.json({ success: true, verset: verse });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/cross-references/capitol?carte=Ioan&capitol=3
// Returnează toate referințele pentru un capitol întreg (optimizat)
router.get('/capitol', async (req, res) => {
  try {
    const { carte, capitol } = req.query;

    if (!carte || !capitol) {
      return res.status(400).json({ success: false, error: 'carte și capitol sunt obligatorii' });
    }

    const docs = await CrossReference.find({
      carte,
      capitol: parseInt(capitol)
    }).lean();

    // Transformă în map: { versetNr: [referinte] }
    const referinteMap = {};
    for (const doc of docs) {
      referinteMap[doc.verset] = doc.referinte;
    }

    res.json({ success: true, referinteMap });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
