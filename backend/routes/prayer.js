// backend/routes/prayer.js
const express = require('express');
const router = express.Router();
const PrayerRequest = require('../models/PrayerRequest');
const { protect, optionalAuth } = require('../middleware/auth');

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════
const getUserId = (req) => {
  return req.user?._id?.toString() || req.user?.id?.toString() || null;
};

const checkAdmin = (req) => {
  return (
    req.user?.rol === 'admin' ||
    req.user?.role === 'admin' ||
    req.user?.isAdmin === true
  );
};

const checkOwner = (cerere, req) => {
  const userId = getUserId(req);
  const ownerId = cerere.userId ? cerere.userId.toString() : null;
  return !!(userId && ownerId && ownerId === userId);
};

const checkPermission = (cerere, req) => {
  return checkAdmin(req) || checkOwner(cerere, req);
};

// ═══════════════════════════════════════
// RUTE FIXE - ÎNAINTE DE /:id
// ═══════════════════════════════════════

// GET /api/prayer/stats
router.get('/stats', async (req, res) => {
  try {
    const [total, rezolvate, rugaciuniTotal] = await Promise.all([
      PrayerRequest.countDocuments({ aprobat: true, vizibilitate: 'public' }),
      PrayerRequest.countDocuments({ aprobat: true, rezolvat: true }),
      PrayerRequest.aggregate([
        { $match: { aprobat: true } },
        { $group: { _id: null, total: { $sum: '$rugaciuni' } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        total,
        rezolvate,
        rugaciuniTotal: rugaciuniTotal[0]?.total || 0,
        active: total - rezolvate
      }
    });
  } catch (error) {
    console.error('❌ Prayer stats error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/prayer/ale-mele
router.get('/ale-mele', protect, async (req, res) => {
  try {
    const userId = getUserId(req);
    console.log('📋 Ale mele - userId:', userId);

    const cereri = await PrayerRequest.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: cereri });
  } catch (error) {
    console.error('❌ Prayer ale-mele error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════
// GET /api/prayer - Lista cereri publice
// ═══════════════════════════════════════
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      categorie,
      page = 1,
      limit = 20,
      sort = 'nou'
    } = req.query;

    const filter = { aprobat: true, vizibilitate: 'public' };
    if (categorie && categorie !== 'toate') {
      filter.categorie = categorie;
    }

    const sortOptions = {
      nou: { createdAt: -1 },
      rugaciuni: { rugaciuni: -1 },
      vechi: { createdAt: 1 }
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [cereri, total] = await Promise.all([
      PrayerRequest.find(filter)
        .sort(sortOptions[sort] || sortOptions.nou)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      PrayerRequest.countDocuments(filter)
    ]);

    const userId = getUserId(req);
    const isAdmin = checkAdmin(req);

    console.log('📋 Prayer list - userId:', userId, '| isAdmin:', isAdmin);

    const cereriCuFlag = cereri.map(c => {
      const ownerId = c.userId ? c.userId.toString() : null;
      const esteAlMeu = !!(userId && ownerId && ownerId === userId);

      return {
        ...c,
        euMAmRugat: userId
          ? c.rugaciuniUseri?.some(id => id.toString() === userId)
          : false,
        esteAlMeu,
        poateSterge: isAdmin || esteAlMeu,
        poateEdita: isAdmin || esteAlMeu,
        rugaciuniUseri: undefined
      };
    });

    res.json({
      success: true,
      data: cereriCuFlag,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    });

  } catch (error) {
    console.error('❌ Prayer GET error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════
// POST /api/prayer - Adaugă cerere (trebuie logat)
// ═══════════════════════════════════════
router.post('/', protect, async (req, res) => {
  try {
    const {
      titlu,
      cerere,
      categorie = 'altele',
      anonim = false,
      vizibilitate = 'public'
    } = req.body;

    if (!titlu || titlu.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Titlul trebuie să aibă cel puțin 3 caractere'
      });
    }

    if (!cerere || cerere.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Cererea trebuie să aibă cel puțin 10 caractere'
      });
    }

    const numeAfisat = anonim ? 'Anonim' : (req.user.nume || req.user.name || 'Utilizator');

    console.log('➕ Prayer create - userId:', req.user._id, '| anonim:', anonim, '| nume:', numeAfisat);

    const cerereNoua = await PrayerRequest.create({
      titlu: titlu.trim(),
      cerere: cerere.trim(),
      categorie,
      anonim,
      numeAfisat,
      userId: req.user._id,
      vizibilitate,
      aprobat: true
    });

    res.status(201).json({ success: true, data: cerereNoua });

  } catch (error) {
    console.error('❌ Prayer POST error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════
// POST /api/prayer/:id/pray
// ═══════════════════════════════════════
router.post('/:id/pray', optionalAuth, async (req, res) => {
  try {
    const cerere = await PrayerRequest.findById(req.params.id);
    if (!cerere) {
      return res.status(404).json({ success: false, error: 'Cererea nu a fost găsită' });
    }

    const userId = getUserId(req);
    let euMAmRugat = false;

    if (userId) {
      const idx = cerere.rugaciuniUseri.findIndex(
        id => id.toString() === userId
      );
      if (idx === -1) {
        cerere.rugaciuniUseri.push(req.user._id);
        cerere.rugaciuni += 1;
        euMAmRugat = true;
      } else {
        cerere.rugaciuniUseri.splice(idx, 1);
        cerere.rugaciuni = Math.max(0, cerere.rugaciuni - 1);
        euMAmRugat = false;
      }
    } else {
      cerere.rugaciuni += 1;
      euMAmRugat = true;
    }

    await cerere.save();
    res.json({ success: true, rugaciuni: cerere.rugaciuni, euMAmRugat });

  } catch (error) {
    console.error('❌ Prayer pray error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════
// PATCH /api/prayer/:id/resolve
// ═══════════════════════════════════════
router.patch('/:id/resolve', protect, async (req, res) => {
  try {
    const cerere = await PrayerRequest.findById(req.params.id);
    if (!cerere) {
      return res.status(404).json({ success: false, error: 'Nu există' });
    }

    const hasPermission = checkPermission(cerere, req);
    console.log('✅ Resolve - hasPermission:', hasPermission, '| isAdmin:', checkAdmin(req), '| isOwner:', checkOwner(cerere, req));

    if (!hasPermission) {
      return res.status(403).json({ success: false, error: 'Nu ai permisiune' });
    }

    cerere.rezolvat = !cerere.rezolvat;
    cerere.rezolvatLa = cerere.rezolvat ? new Date() : null;
    cerere.mesajRezolvare = req.body.mesaj || '';
    await cerere.save();

    res.json({ success: true, data: cerere });

  } catch (error) {
    console.error('❌ Prayer resolve error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════
// PUT /api/prayer/:id - Editare
// ═══════════════════════════════════════
router.put('/:id', protect, async (req, res) => {
  try {
    const cerere = await PrayerRequest.findById(req.params.id);
    if (!cerere) {
      return res.status(404).json({ success: false, error: 'Nu există' });
    }

    const hasPermission = checkPermission(cerere, req);
    console.log('✏️ Edit - hasPermission:', hasPermission, '| isAdmin:', checkAdmin(req), '| isOwner:', checkOwner(cerere, req));

    if (!hasPermission) {
      return res.status(403).json({ success: false, error: 'Nu ai permisiune' });
    }

    const { titlu, cerere: text, categorie, anonim } = req.body;

    if (titlu !== undefined) cerere.titlu = titlu.trim();
    if (text !== undefined) cerere.cerere = text.trim();
    if (categorie !== undefined) cerere.categorie = categorie;
    if (typeof anonim === 'boolean') {
      cerere.anonim = anonim;
      cerere.numeAfisat = anonim ? 'Anonim' : (req.user.nume || req.user.name || 'Utilizator');
    }

    await cerere.save();
    res.json({ success: true, data: cerere });

  } catch (error) {
    console.error('❌ Prayer edit error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════
// DELETE /api/prayer/:id
// ═══════════════════════════════════════
router.delete('/:id', protect, async (req, res) => {
  try {
    const cerere = await PrayerRequest.findById(req.params.id);
    if (!cerere) {
      return res.status(404).json({ success: false, error: 'Nu există' });
    }

    const hasPermission = checkPermission(cerere, req);
    console.log('🗑️ Delete - hasPermission:', hasPermission, '| isAdmin:', checkAdmin(req), '| isOwner:', checkOwner(cerere, req));
    console.log('   cerere.userId:', cerere.userId?.toString(), '| req.user._id:', getUserId(req));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'Nu ai permisiune să ștergi această cerere',
        debug: {
          isAdmin: checkAdmin(req),
          isOwner: checkOwner(cerere, req),
          cerereUserId: cerere.userId?.toString(),
          requestUserId: getUserId(req)
        }
      });
    }

    await cerere.deleteOne();
    res.json({ success: true, message: 'Cerere ștearsă' });

  } catch (error) {
    console.error('❌ Prayer delete error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;