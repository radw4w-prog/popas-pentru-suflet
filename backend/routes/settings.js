// backend/routes/settings.js
const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// GET - Toate setările
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const settings = await Settings.find(query);
    
    // Convertim la un obiect key-value
    const settingsObj = {};
    settings.forEach(s => { settingsObj[s.key] = s.value; });
    
    res.json({ success: true, data: settingsObj, raw: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET - O setare specifică
router.get('/:key', async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });
    if (!setting) {
      return res.status(404).json({ success: false, error: 'Setarea nu a fost găsită' });
    }
    res.json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT - Actualizează/Creează o setare
router.put('/:key', async (req, res) => {
  try {
    const setting = await Settings.findOneAndUpdate(
      { key: req.params.key },
      { 
        key: req.params.key,
        value: req.body.value,
        description: req.body.description,
        category: req.body.category 
      },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: setting });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST - Inițializează setările implicite
router.post('/init', async (req, res) => {
  try {
    const defaults = [
      { key: 'page_name', value: 'Popas pentru Suflet', category: 'general', description: 'Numele paginii' },
      { key: 'default_platforms', value: ['facebook', 'instagram'], category: 'social', description: 'Platforme implicite' },
      { key: 'default_image_style', value: 'nature', category: 'image', description: 'Stilul implicit al imaginilor' },
      { key: 'default_post_style', value: 'inspirational', category: 'content', description: 'Stilul implicit al postărilor' },
      { key: 'auto_publish', value: false, category: 'schedule', description: 'Publicare automată' },
      { key: 'posting_times', value: ['07:00', '12:00', '19:00'], category: 'schedule', description: 'Orele de postare' },
      { key: 'timezone', value: 'Europe/Bucharest', category: 'general', description: 'Fusul orar' },
      { key: 'max_daily_posts', value: 3, category: 'schedule', description: 'Număr maxim postări pe zi' }
    ];

    for (const setting of defaults) {
      await Settings.findOneAndUpdate(
        { key: setting.key },
        setting,
        { upsert: true, new: true }
      );
    }

    res.json({ success: true, message: 'Setări inițializate cu succes' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;