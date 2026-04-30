const express = require('express');
const router = express.Router();
const Verse = require('../models/Verse');

// ═══ HELPER - parsează referință biblică ═══
function parseReference(search) {
  const s = search.trim();

  // Pattern: "Luca 3:12" sau "Luca 3" sau "Ioan 3:16"
  const pattern = /^([\u00C0-\u024F\w\s]+?)\s+(\d+)(?::(\d+))?$/i;
  const match = s.match(pattern);

  if (match) {
    return {
      carte: match[1].trim(),
      capitol: parseInt(match[2]),
      verset: match[3] ? parseInt(match[3]) : null,
      isReference: true
    };
  }
  return { isReference: false };
}

// ═══ GET /api/verses/statistici ═══
router.get('/statistici', async (req, res) => {
  try {
    const [total, vt, nt, carti] = await Promise.all([
      Verse.countDocuments(),
      Verse.countDocuments({ testament: 'VT' }),
      Verse.countDocuments({ testament: 'NT' }),
      Verse.distinct('carte')
    ]);
    res.json({
      totalVersete: total,
      testamentVechi: vt,
      testamentNou: nt,
      totalCarti: carti.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══ GET /api/verses/versetul-zilei ═══
router.get('/versetul-zilei', async (req, res) => {
  try {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / 86400000
    );
    const count = await Verse.countDocuments();
    if (count === 0) return res.json(null);
    const index = dayOfYear % count;
    const verse = await Verse.findOne().sort({ _id: 1 }).skip(index).lean();
    res.json(verse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══ GET /api/verses/random ═══
router.get('/random', async (req, res) => {
  try {
    const { testament = '', carte = '' } = req.query;
    const filter = {};
    if (testament) filter.testament = testament;
    if (carte) filter.carte = new RegExp(carte, 'i');
    const count = await Verse.countDocuments(filter);
    if (count === 0) return res.json(null);
    const random = Math.floor(Math.random() * count);
    const verse = await Verse.findOne(filter).skip(random).lean();
    res.json(verse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══ GET /api/verses/carti ═══
router.get('/carti', async (req, res) => {
  try {
    const carti = await Verse.aggregate([
      {
        $group: {
          _id: {
            carte: '$carte',
            abreviere: '$abreviere',
            testament: '$testament'
          },
          totalVersete: { $sum: 1 },
          capitole: { $addToSet: '$capitol' }
        }
      },
      {
        $project: {
          _id: 0,
          carte: '$_id.carte',
          abreviere: '$_id.abreviere',
          testament: '$_id.testament',
          totalVersete: 1,
          totalCapitole: { $size: '$capitole' }
        }
      },
      { $sort: { testament: 1, carte: 1 } }
    ]);
    res.json(carti);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══ GET /api/verses/capitol/:abrev/:capitol ═══
router.get('/capitol/:abrev/:capitol', async (req, res) => {
  try {
    const versete = await Verse.find({
      abreviere: req.params.abrev,
      capitol: parseInt(req.params.capitol)
    }).sort({ verset: 1 }).lean();
    res.json(versete);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══ GET /api/verses ═══
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 24,
      search = '',
      carte = '',
      testament = '',
      capitol = '',
      favorit = ''
    } = req.query;

    const filter = {};

    if (testament && testament !== 'all') filter.testament = testament;
    if (carte && carte !== 'all') filter.carte = new RegExp(carte, 'i');
    if (capitol) filter.capitol = parseInt(capitol);
    if (favorit === 'true') filter.favorit = true;

    if (search && search.trim()) {
      const ref = parseReference(search);

      if (ref.isReference) {
        // ✅ Căutare după referință biblică
        const conditions = [];

        if (ref.verset) {
          // Exact: Luca 3:12
          conditions.push({
            carte: new RegExp(ref.carte, 'i'),
            capitol: ref.capitol,
            verset: ref.verset
          });
          // Și abreviere: Luc 3:12
          conditions.push({
            abreviere: new RegExp(ref.carte, 'i'),
            capitol: ref.capitol,
            verset: ref.verset
          });
        }

        // Capitol: Luca 3
        conditions.push({
          carte: new RegExp(ref.carte, 'i'),
          capitol: ref.capitol
        });

        // Abreviere capitol: Luc 3
        conditions.push({
          abreviere: new RegExp(ref.carte, 'i'),
          capitol: ref.capitol
        });

        // Fallback text
        conditions.push({ referinta: new RegExp(search.trim(), 'i') });
        conditions.push({ text: new RegExp(search.trim(), 'i') });

        filter.$or = conditions;
      } else {
        // ✅ Căutare normală în text
        filter.$or = [
          { text: new RegExp(search.trim(), 'i') },
          { referinta: new RegExp(search.trim(), 'i') },
          { carte: new RegExp(search.trim(), 'i') },
          { abreviere: new RegExp(search.trim(), 'i') }
        ];
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNr = Math.min(parseInt(limit), 500);

    // Sort inteligent
    let sortBy = { testament: 1, carte: 1, capitol: 1, verset: 1 };

    const [versete, total] = await Promise.all([
      Verse.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limitNr)
        .lean(),
      Verse.countDocuments(filter)
    ]);

    res.json({
      versete,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limitNr),
      limit: limitNr
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══ GET /api/verses/:id ═══
router.get('/:id', async (req, res) => {
  try {
    const verse = await Verse.findById(req.params.id).lean();
    if (!verse) return res.status(404).json({ error: 'Nu există' });
    res.json(verse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══ PUT /api/verses/:id/favorit ═══
router.put('/:id/favorit', async (req, res) => {
  try {
    const verse = await Verse.findById(req.params.id);
    if (!verse) return res.status(404).json({ error: 'Nu există' });
    verse.favorit = !verse.favorit;
    await verse.save();
    res.json(verse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;