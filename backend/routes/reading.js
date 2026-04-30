const express = require('express');
const router = express.Router();
const ReadingProgress = require('../models/ReadingProgress');
const Verse = require('../models/Verse');

// GET /api/reading/progress
router.get('/progress', async (req, res) => {
  try {
    const totalCapitole = 1189; // Biblia are 1189 capitole
    const citite = await ReadingProgress.countDocuments();
    const procent = Math.round((citite / totalCapitole) * 100 * 10) / 10;

    const ultimeleCitite = await ReadingProgress.find()
      .sort({ cititLa: -1 })
      .limit(10)
      .lean();

    // Cărți cu progres
    const cartiProgress = await ReadingProgress.aggregate([
      {
        $group: {
          _id: '$carte',
          capitoleCitite: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalCapitole,
      capitoleCitite: citite,
      procent,
      ultimeleCitite,
      cartiProgress
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/reading/mark
router.post('/mark', async (req, res) => {
  try {
    const { carte, capitol } = req.body;

    if (!carte || !capitol) {
      return res.status(400).json({ error: 'Carte și capitol sunt obligatorii!' });
    }

    const existing = await ReadingProgress.findOne({ carte, capitol });

    if (existing) {
      await ReadingProgress.deleteOne({ carte, capitol });
      res.json({
        success: true,
        action: 'unmarked',
        message: `${carte} ${capitol} - nemarcată`
      });
    } else {
      await ReadingProgress.create({ carte, capitol });
      res.json({
        success: true,
        action: 'marked',
        message: `${carte} ${capitol} - citit! ✅`
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reading/carte/:abrev
router.get('/carte/:abrev', async (req, res) => {
  try {
    const { abrev } = req.params;

    const versete = await Verse.aggregate([
      { $match: { abreviere: abrev } },
      {
        $group: {
          _id: '$capitol',
          totalVersete: { $sum: 1 },
          carte: { $first: '$carte' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const citite = await ReadingProgress.find({
      carte: versete[0]?.carte || abrev
    }).lean();

    const capitoleCitite = citite.map(c => c.capitol);

    const capitole = versete.map(v => ({
      capitol: v._id,
      totalVersete: v.totalVersete,
      citit: capitoleCitite.includes(v._id)
    }));

    res.json({
      carte: versete[0]?.carte || abrev,
      capitole,
      totalCapitole: capitole.length,
      citite: capitole.filter(c => c.citit).length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/reading/suggest
router.get('/suggest', async (req, res) => {
  try {
    const planZilnic = [
      { carte: 'Geneza', capitol: 1, descriere: 'Crearea lumii' },
      { carte: 'Psalmi', capitol: 23, descriere: 'Domnul este Păstorul meu' },
      { carte: 'Proverbe', capitol: 3, descriere: 'Încrede-te în Domnul' },
      { carte: 'Matei', capitol: 5, descriere: 'Predica de pe Munte' },
      { carte: 'Ioan', capitol: 3, descriere: 'Dumnezeu a iubit lumea' },
      { carte: 'Romani', capitol: 8, descriere: 'Nicio osândire' },
      { carte: 'Filipeni', capitol: 4, descriere: 'Pot totul în Hristos' },
      { carte: 'Isaia', capitol: 40, descriere: 'Putere celor obosiți' },
      { carte: 'Psalmi', capitol: 91, descriere: 'Sub ocrotirea Celui Preaînalt' },
      { carte: 'Efeseni', capitol: 6, descriere: 'Armătura lui Dumnezeu' },
      { carte: 'Evrei', capitol: 11, descriere: 'Credința' },
      { carte: 'Apocalipsa', capitol: 21, descriere: 'Cer nou și pământ nou' },
      { carte: 'Psalmi', capitol: 119, descriere: 'Cuvântul Tău' },
      { carte: 'Ioan', capitol: 14, descriere: 'Eu sunt Calea' },
    ];

    const dayOfYear = Math.floor(
      (new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
    );
    const sugestie = planZilnic[dayOfYear % planZilnic.length];

    res.json(sugestie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;