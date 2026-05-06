// backend/routes/prayer.js
const express = require('express');
const router = express.Router();
const PrayerRequest = require('../models/PrayerRequest');
const { protect, optionalAuth } = require('../middleware/auth');


const getCurrentUserId = (req) => {
  return req.user?._id?.toString() || req.user?.id?.toString() || null;
};

const isAdminUser = (req) => {
  return (
    req.user?.rol === 'admin' ||
    req.user?.role === 'admin' ||
    req.user?.isAdmin === true
  );
};

// ═══════════════════════════════════════
// IMPORTANT: Rutele fixe ÎNAINTE de /:id
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
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/prayer/ale-mele
router.get('/ale-mele', protect, async (req, res) => {
  try {
    const cereri = await PrayerRequest.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: cereri });
  } catch (error) {
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

    const userId = getCurrentUserId(req);
const isAdmin = isAdminUser(req);

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
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════
// POST /api/prayer - Adaugă cerere
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

    let numeAfisat = 'Anonim';
    if (!anonim && req.user) {
      numeAfisat = req.user.nume || 'Utilizator';
    }

    const cerereNoua = await PrayerRequest.create({
      titlu: titlu.trim(),
      cerere: cerere.trim(),
      categorie,
      anonim,
      numeAfisat,
      userId: req.user?._id || null,
      vizibilitate,
      aprobat: true
    });

    res.status(201).json({ success: true, data: cerereNoua });

  } catch (error) {
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

    const userId = req.user?._id;
    let euMAmRugat = false;

    if (userId) {
      const idx = cerere.rugaciuniUseri.findIndex(
        id => id.toString() === userId.toString()
      );
      if (idx === -1) {
        cerere.rugaciuniUseri.push(userId);
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

    const currentUserId = getCurrentUserId(req);
const ownerId = cerere.userId ? cerere.userId.toString() : null;
const isAutor = !!(currentUserId && ownerId && ownerId === currentUserId);
const isAdmin = isAdminUser(req);

    if (!isAutor && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Nu ai permisiune' });
    }

    cerere.rezolvat = !cerere.rezolvat;
    cerere.rezolvatLa = cerere.rezolvat ? new Date() : null;
    cerere.mesajRezolvare = req.body.mesaj || '';
    await cerere.save();

    res.json({ success: true, data: cerere });

  } catch (error) {
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

    const currentUserId = getCurrentUserId(req);
const ownerId = cerere.userId ? cerere.userId.toString() : null;
const isAutor = !!(currentUserId && ownerId && ownerId === currentUserId);
const isAdmin = isAdminUser(req);

    if (!isAutor && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Nu ai permisiune' });
    }

    const { titlu, cerere: text, categorie, anonim } = req.body;

    if (titlu) cerere.titlu = titlu.trim();
    if (text) cerere.cerere = text.trim();
    if (categorie) cerere.categorie = categorie;
    if (typeof anonim === 'boolean') {
      cerere.anonim = anonim;
      cerere.numeAfisat = anonim ? 'Anonim' : (req.user.nume || 'Utilizator');
    }

    await cerere.save();
    res.json({ success: true, data: cerere });

  } catch (error) {
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

    const currentUserId = getCurrentUserId(req);
const ownerId = cerere.userId ? cerere.userId.toString() : null;
const isAutor = !!(currentUserId && ownerId && ownerId === currentUserId);
const isAdmin = isAdminUser(req);

    if (!isAutor && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Nu ai permisiune' });
    }

    await cerere.deleteOne();
    res.json({ success: true, message: 'Cerere ștearsă' });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;