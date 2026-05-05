const express = require('express');
const router = express.Router();
const Bookmark = require('../models/Bookmark');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/bookmarks — toate semnele userului
router.get('/', async (req, res) => {
  try {
    const { tip = '', culoare = '' } = req.query;
    const filter = { userId: req.user._id };
    if (tip) filter.tip = tip;
    if (culoare) filter.culoare = culoare;

    const bookmarks = await Bookmark.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const stats = {
      total: bookmarks.length,
      bookmarks: bookmarks.filter(b => b.tip === 'bookmark').length,
      highlights: bookmarks.filter(b => b.tip === 'highlight').length,
      notes: bookmarks.filter(b => b.tip === 'note').length
    };

    res.json({
      success: true,
      bookmarks,
      stats
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/bookmarks/check — verifică dacă un verset e salvat
router.get('/check', async (req, res) => {
  try {
    const { carte, capitol, verset } = req.query;

    const bookmark = await Bookmark.findOne({
      userId: req.user._id,
      carte,
      capitol: Number(capitol),
      verset: Number(verset)
    }).lean();

    res.json({
      success: true,
      exists: !!bookmark,
      bookmark: bookmark || null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/bookmarks/capitol — verifică toate versetele dintr-un capitol
router.get('/capitol', async (req, res) => {
  try {
    const { carte, capitol } = req.query;

    const bookmarks = await Bookmark.find({
      userId: req.user._id,
      carte,
      capitol: Number(capitol)
    }).lean();

    const map = {};
    bookmarks.forEach(b => {
      map[b.verset] = b;
    });

    res.json({
      success: true,
      bookmarks: map
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/bookmarks — adaugă/actualizează
router.post('/', async (req, res) => {
  try {
    const { carte, capitol, verset, text, referinta, testament, tip, culoare, nota } = req.body;

    if (!carte || !capitol || !verset || !text) {
      return res.status(400).json({
        success: false,
        message: 'Carte, capitol, verset și text sunt obligatorii.'
      });
    }

    const existing = await Bookmark.findOne({
      userId: req.user._id,
      carte,
      capitol: Number(capitol),
      verset: Number(verset)
    });

    if (existing) {
      existing.tip = tip || existing.tip;
      existing.culoare = culoare || existing.culoare;
      existing.nota = nota !== undefined ? nota : existing.nota;
      await existing.save();

      return res.json({
        success: true,
        bookmark: existing,
        action: 'updated',
        message: 'Semnul a fost actualizat.'
      });
    }

    const bookmark = await Bookmark.create({
      userId: req.user._id,
      carte,
      capitol: Number(capitol),
      verset: Number(verset),
      text,
      referinta: referinta || `${carte} ${capitol}:${verset}`,
      testament: testament || '',
      tip: tip || 'bookmark',
      culoare: culoare || 'gold',
      nota: nota || ''
    });

    res.json({
      success: true,
      bookmark,
      action: 'created',
      message: 'Verset salvat!'
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Acest verset este deja salvat.'
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/bookmarks/:id — actualizează notă/culoare/tip
router.put('/:id', async (req, res) => {
  try {
    const { tip, culoare, nota } = req.body;

    const bookmark = await Bookmark.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Semnul nu a fost găsit.'
      });
    }

    if (tip) bookmark.tip = tip;
    if (culoare) bookmark.culoare = culoare;
    if (nota !== undefined) bookmark.nota = nota;

    await bookmark.save();

    res.json({
      success: true,
      bookmark,
      message: 'Actualizat cu succes.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/bookmarks/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await Bookmark.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Semnul nu a fost găsit.'
      });
    }

    res.json({
      success: true,
      message: 'Semn șters.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/bookmarks/verse — șterge după carte/capitol/verset
router.delete('/verse/:carte/:capitol/:verset', async (req, res) => {
  try {
    const result = await Bookmark.findOneAndDelete({
      userId: req.user._id,
      carte: decodeURIComponent(req.params.carte),
      capitol: Number(req.params.capitol),
      verset: Number(req.params.verset)
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Semnul nu a fost găsit.'
      });
    }

    res.json({
      success: true,
      message: 'Semn șters.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;