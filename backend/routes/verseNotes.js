// backend/routes/verseNotes.js
const express = require('express');
const router = express.Router();
const VerseNote = require('../models/VerseNote');
const { protect } = require('../middleware/auth');

// Toate rutele necesită autentificare
router.use(protect);

// GET /api/verse-notes/capitol?carte=Ioan&capitol=3
// Returnează notele utilizatorului pentru un capitol
router.get('/capitol', async (req, res) => {
  try {
    const { carte, capitol } = req.query;
    if (!carte || !capitol) {
      return res.status(400).json({ success: false, message: 'carte și capitol sunt obligatorii' });
    }

    const note = await VerseNote.find({
      userId: req.user._id,
      carte,
      capitol: parseInt(capitol)
    }).sort({ verset: 1, createdAt: -1 }).lean();

    // Grupează pe verset
    const noteMap = {};
    note.forEach(n => {
      if (!noteMap[n.verset]) noteMap[n.verset] = [];
      noteMap[n.verset].push(n);
    });

    res.json({ success: true, note, noteMap, total: note.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Eroare la încărcarea notelor.' });
  }
});

// GET /api/verse-notes — Toate notele utilizatorului (cu paginare)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [note, total] = await Promise.all([
      VerseNote.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      VerseNote.countDocuments({ userId: req.user._id })
    ]);

    res.json({ success: true, note, total, pagini: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Eroare la încărcarea notelor.' });
  }
});

// POST /api/verse-notes — Adaugă notă
router.post('/', async (req, res) => {
  try {
    const { carte, capitol, verset, referinta, textVerset, nota } = req.body;
    if (!carte || !capitol || !verset || !nota) {
      return res.status(400).json({ success: false, message: 'carte, capitol, verset și nota sunt obligatorii' });
    }

    const verseNote = await VerseNote.create({
      userId: req.user._id,
      carte,
      capitol: parseInt(capitol),
      verset: parseInt(verset),
      referinta: referinta || `${carte} ${capitol}:${verset}`,
      textVerset: textVerset || '',
      nota
    });

    res.json({ success: true, nota: verseNote, message: 'Notă adăugată!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Eroare la salvarea notei.' });
  }
});

// PUT /api/verse-notes/:id — Editează notă
router.put('/:id', async (req, res) => {
  try {
    const { nota } = req.body;
    const verseNote = await VerseNote.findOne({ _id: req.params.id, userId: req.user._id });
    if (!verseNote) return res.status(404).json({ success: false, message: 'Nota nu a fost găsită.' });

    verseNote.nota = nota;
    await verseNote.save();
    res.json({ success: true, nota: verseNote, message: 'Notă actualizată!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Eroare la actualizarea notei.' });
  }
});

// DELETE /api/verse-notes/:id — Șterge notă
router.delete('/:id', async (req, res) => {
  try {
    const verseNote = await VerseNote.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!verseNote) return res.status(404).json({ success: false, message: 'Nota nu a fost găsită.' });
    res.json({ success: true, message: 'Notă ștearsă.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Eroare la ștergerea notei.' });
  }
});

module.exports = router;
