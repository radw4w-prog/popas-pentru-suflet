// backend/routes/profile.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { getProfilComplet } = require('../utils/spiritualJourneyService');

// ═══════════════════════════════════════
// GET /api/profile/me — profil complet
// ═══════════════════════════════════════
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilizator negăsit' });
    }

    // Spiritual Journey
    let journey = null;
    try {
      journey = await getProfilComplet(req.user._id);
    } catch (e) {}

    // Statistici citire
    const ReadingProgress = require('../models/ReadingProgress');
    const capitoleCitite = await ReadingProgress.countDocuments({ userId: req.user._id });

    // Statistici audio
    const AudioProgress = require('../models/AudioProgress');
    const audioTotal = await AudioProgress.countDocuments({ userId: req.user._id });
    const audioComplete = await AudioProgress.countDocuments({ userId: req.user._id, complet: true });

    // Statistici jurnal
    const JournalEntry = require('../models/JournalEntry');
    const jurnalTotal = await JournalEntry.countDocuments({ userId: req.user._id });

    // Statistici rugăciune
    const PrayerRequest = require('../models/PrayerRequest');
    const rugaciuniPostate = await PrayerRequest.countDocuments({ userId: req.user._id });

    // Bookmarks
    const Bookmark = require('../models/Bookmark');
    const bookmarksTotal = await Bookmark.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      user: {
        id: user._id,
        nume: user.nume,
        email: user.email,
        avatar: user.avatar,
        rol: user.rol,
        facebookConectat: !!user.facebookId,
        membruDin: user.createdAt,
        lastLogin: user.lastLogin,
        setari: user.setari
      },
      journey: journey?.success ? journey : null,
      stats: {
        capitoleCitite,
        procentBiblie: Math.round((capitoleCitite / 1189) * 100),
        audioAscultate: audioTotal,
        audioComplete,
        jurnalIntrari: jurnalTotal,
        rugaciuniPostate,
        bookmarks: bookmarksTotal
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════
// PUT /api/profile/me — editare nume
// ═══════════════════════════════════════
router.put('/me', protect, async (req, res) => {
  try {
    const { nume } = req.body;

    if (!nume || nume.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Numele trebuie să aibă cel puțin 2 caractere.'
      });
    }

    if (nume.trim().length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Numele poate avea maxim 50 de caractere.'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { nume: nume.trim() },
      { new: true }
    ).lean();

    res.json({
      success: true,
      message: 'Numele a fost actualizat.',
      user: {
        id: user._id,
        nume: user.nume,
        email: user.email,
        avatar: user.avatar,
        rol: user.rol
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════
// PUT /api/profile/password — schimbare parolă
// ═══════════════════════════════════════
router.put('/password', protect, async (req, res) => {
  try {
    const { parolaVeche, parolaNoua } = req.body;

    if (!parolaNoua || parolaNoua.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Parola nouă trebuie să aibă cel puțin 6 caractere.'
      });
    }

    const user = await User.findById(req.user._id).select('+parola');
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilizator negăsit' });
    }

    // Dacă userul are parolă (nu e cont Facebook-only)
    if (user.parola) {
      if (!parolaVeche) {
        return res.status(400).json({
          success: false,
          error: 'Parola veche este obligatorie.'
        });
      }

      const match = await user.compareParola(parolaVeche);
      if (!match) {
        return res.status(400).json({
          success: false,
          error: 'Parola veche este incorectă.'
        });
      }
    }

    user.parola = parolaNoua;
    await user.save();

    res.json({
      success: true,
      message: 'Parola a fost schimbată cu succes.'
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════
// POST /api/profile/avatar — upload avatar (base64)
// ═══════════════════════════════════════
router.post('/avatar', protect, async (req, res) => {
  try {
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({
        success: false,
        error: 'Avatarul este obligatoriu.'
      });
    }

    // Validare simplă base64
    if (!avatar.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        error: 'Format invalid. Trimite o imagine base64.'
      });
    }

    // Limita ~500KB pentru base64
    if (avatar.length > 700000) {
      return res.status(400).json({
        success: false,
        error: 'Imaginea este prea mare. Maxim 500KB.'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true }
    ).lean();

    res.json({
      success: true,
      message: 'Avatarul a fost actualizat.',
      avatar: user.avatar
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ═══════════════════════════════════════
// DELETE /api/profile/avatar — șterge avatar
// ═══════════════════════════════════════
router.delete('/avatar', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { avatar: null });
    res.json({ success: true, message: 'Avatarul a fost șters.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;