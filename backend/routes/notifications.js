const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const { limit = 20, necitite = 'false' } = req.query;

    const filter = { userId: req.user._id };
    if (necitite === 'true') filter.citit = false;

    const notificari = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const totalNecitite = await Notification.countDocuments({
      userId: req.user._id,
      citit: false
    });

    res.json({
      success: true,
      notificari,
      totalNecitite
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Eroare la încărcarea notificărilor.'
    });
  }
});

// PUT /api/notifications/citit-toate
router.put('/citit-toate', async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, citit: false },
      { citit: true }
    );
    res.json({
      success: true,
      message: 'Toate notificările marcate ca citite.'
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// PUT /api/notifications/:id/citit
router.put('/:id/citit', async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { citit: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// DELETE /api/notifications/:id
router.delete('/:id', async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// DELETE /api/notifications (sterge toate)
router.delete('/', async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });
    res.json({ success: true, message: 'Toate notificările au fost șterse.' });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;