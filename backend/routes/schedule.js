// backend/routes/schedule.js
const express = require('express');
const router = express.Router();
const Schedule = require('../models/Schedule');
const Post = require('../models/Post');

// GET - Toate programările
router.get('/', async (req, res) => {
  try {
    const schedules = await Schedule.find().sort({ createdAt: -1 });
    res.json({ success: true, data: schedules });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET - Programarea activă
router.get('/active', async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ isActive: true });
    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST - Creează o programare nouă
router.post('/', async (req, res) => {
  try {
    const schedule = new Schedule(req.body);
    await schedule.save();
    res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT - Actualizează o programare
router.put('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Programarea nu a fost găsită' });
    }
    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE - Șterge o programare
router.delete('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Programarea nu a fost găsită' });
    }
    res.json({ success: true, message: 'Programare ștearsă cu succes' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET - Calendar postări programate
router.get('/calendar', async (req, res) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()) - 1, 1);
    const endDate = new Date(year || new Date().getFullYear(), month || new Date().getMonth(), 0);

    const posts = await Post.find({
      scheduledFor: { $gte: startDate, $lte: endDate },
      status: { $in: ['scheduled', 'published'] }
    })
    .populate('verse', 'text reference')
    .sort({ scheduledFor: 1 });

    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;