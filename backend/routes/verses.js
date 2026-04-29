const express = require('express');
const router = express.Router();
const Verse = require('../models/Verse');

// ═══════════════════════════════════════════════════
// IMPORTANT: Rutele specifice TREBUIE sa fie
// INAINTE de /:id altfel sunt interceptate!
// ═══════════════════════════════════════════════════

// GET /api/verses/statistici
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

// GET /api/verses/versetul-zilei
router.get('/versetul-zilei', async (req, res) => {
  try {
    // Verifica direct in baza de date
    const count = await Verse.countDocuments();
    console.log('Total versete in DB:', count);
    
    if (count === 0) {
      return res.json({
        text: "Fiindca atat de mult a iubit Dumnezeu lumea...",
        referinta: "Ioan 3:16",
        carte: "Ioan",
        testament: "NT"
      });
    }

    const today = new Date();
    const dayOfYear = Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / 86400000
    );
    const index = dayOfYear % count;
    
    // Foloseste skip cu sort consistent
    const verse = await Verse.findOne()
      .sort({ _id: 1 })
      .skip(index)
      .lean();
      
    console.log('Versetul zilei:', verse?.referinta || verse?.reference);
    res.json(verse);
    
  } catch (error) {
    console.error('Eroare versetul zilei:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/verses/random
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

// GET /api/verses/carti
router.get('/carti', async (req, res) => {
  try {
    console.log('Fetch carti...');
    
    // Verifica ce campuri exista
    const sample = await Verse.findOne().lean();
    console.log('Sample document keys:', sample ? Object.keys(sample) : 'none');
    
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
        $match: {
          '_id.carte': { $ne: null, $ne: '' }
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

    console.log(`Carti gasite: ${carti.length}`);
    res.json(carti);
    
  } catch (error) {
    console.error('Eroare carti:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/verses/capitol/:abrev/:capitol
router.get('/capitol/:abrev/:capitol', async (req, res) => {
  try {
    const versete = await Verse.find({
      abreviere: req.params.abrev,
      capitol: parseInt(req.params.capitol)
    })
    .sort({ verset: 1 })
    .lean();

    res.json(versete);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/verses - Lista cu filtre si paginare
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

    if (search) {
      filter.$or = [
        { text: new RegExp(search, 'i') },
        { referinta: new RegExp(search, 'i') },
        { carte: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNr = Math.min(parseInt(limit), 100);

    const [versete, total] = await Promise.all([
      Verse.find(filter)
        .sort({ testament: 1, carte: 1, capitol: 1, verset: 1 })
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

// GET /api/verses/:id - Verset specific dupa ID
// ⚠️ ACEASTA TREBUIE SA FIE ULTIMA!
router.get('/:id', async (req, res) => {
  try {
    const verse = await Verse.findById(req.params.id).lean();
    if (!verse) return res.status(404).json({ error: 'Versetul nu a fost gasit' });
    res.json(verse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/verses/:id/favorit
router.put('/:id/favorit', async (req, res) => {
  try {
    const verse = await Verse.findById(req.params.id);
    if (!verse) return res.status(404).json({ error: 'Nu gasit' });
    verse.favorit = !verse.favorit;
    await verse.save();
    res.json(verse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;