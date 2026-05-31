const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Template = require('../models/Template');
const PrayerRequest = require('../models/PrayerRequest');
const DailyDevotional = require('../models/DailyDevotional');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const acum = new Date();
    const azi = new Date(acum.getFullYear(), acum.getMonth(), acum.getDate());

    const [
      totalUseri,
      useriNoi,
      useriAziActivi,
      totalPostari,
      postariPublicate,
      totalTemplates,
      templatesActive,
      totalRugaciuni,
      rugaciuniNeaprobate,
      totalDevotionale
    ] = await Promise.all([
      User.countDocuments({ rol: 'user' }),
      User.countDocuments({
        rol: 'user',
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      User.countDocuments({ lastLogin: { $gte: azi } }),
      Post.countDocuments(),
      Post.countDocuments({ status: 'published' }),
      Template.countDocuments(),
      Template.countDocuments({ activ: true }),
      PrayerRequest.countDocuments(),
      PrayerRequest.countDocuments({ aprobat: false }),
      DailyDevotional.countDocuments()
    ]);

    res.json({
      success: true,
      stats: {
        useri: {
          total: totalUseri,
          noiSaptamana: useriNoi,
          activiAzi: useriAziActivi
        },
        postari: {
          total: totalPostari,
          publicate: postariPublicate,
          draft: totalPostari - postariPublicate
        },
        templates: {
          total: totalTemplates,
          active: templatesActive,
          inactive: totalTemplates - templatesActive
        },
        rugaciuni: {
          total: totalRugaciuni,
          neaprobate: rugaciuniNeaprobate
        },
        devotionale: {
          total: totalDevotionale
        }
      }
    });
  } catch (error) {
    console.error('Eroare admin dashboard:', error);
    res.status(500).json({ success: false, message: 'Eroare server.' });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', rol = '' } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { nume: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (rol) filter.rol = rol;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [useri, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-parola -facebookToken')
        .lean(),
      User.countDocuments(filter)
    ]);

    res.json({
      success: true,
      useri,
      total,
      pagini: Math.ceil(total / parseInt(limit)),
      paginaCurenta: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Eroare la încărcarea userilor.' });
  }
});

// PUT /api/admin/users/:id/rol
router.put('/users/:id/rol', async (req, res) => {
  try {
    const { rol } = req.body;
    if (!['user', 'admin'].includes(rol)) {
      return res.status(400).json({ success: false, message: 'Rol invalid.' });
    }
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Nu poți schimba propriul rol.' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { rol }, { new: true }).select('-parola');
    if (!user) return res.status(404).json({ success: false, message: 'Utilizatorul nu a fost găsit.' });
    res.json({ success: true, user, message: `Rolul a fost schimbat în ${rol}.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Eroare la schimbarea rolului.' });
  }
});

// PUT /api/admin/users/:id/toggle-activ
router.put('/users/:id/toggle-activ', async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Nu poți bloca propriul cont.' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Utilizatorul nu a fost găsit.' });
    user.activ = !user.activ;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, activ: user.activ, message: user.activ ? 'Contul a fost activat.' : 'Contul a fost blocat.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Eroare la actualizarea contului.' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Nu poți șterge propriul cont.' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Utilizatorul a fost șters.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Eroare la ștergerea utilizatorului.' });
  }
});

// GET /api/admin/posts — fără imageBase64/videoBase64 (sunt uriașe!)
router.get('/posts', async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [postari, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-imageBase64 -videoBase64') // ← FIX: exclude câmpurile uriașe
        .lean(),
      Post.countDocuments(filter)
    ]);

    res.json({
      success: true,
      postari,
      total,
      pagini: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Eroare la încărcarea postărilor.' });
  }
});

// ═══════════════════════════════════════════════
// TEMPLATE-URI CRUD
// ═══════════════════════════════════════════════

// GET /api/admin/templates
router.get('/templates', async (req, res) => {
  try {
    const { categorie = '', activ = '', page = 1, limit = 50 } = req.query;
    const filter = {};
    if (categorie) filter.categorie = categorie;
    if (activ !== '') filter.activ = activ === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [templates, total] = await Promise.all([
      Template.find(filter).sort({ ordine: 1 }).skip(skip).limit(parseInt(limit)).lean(),
      Template.countDocuments(filter)
    ]);

    // Statistici pe categorii
    const stats = await Template.aggregate([
      { $group: { _id: '$categorie', total: { $sum: 1 }, active: { $sum: { $cond: ['$activ', 1, 0] } } } },
      { $sort: { total: -1 } }
    ]);

    res.json({ success: true, templates, total, stats, pagini: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Eroare la încărcarea template-urilor.' });
  }
});

// POST /api/admin/templates — Adaugă template nou
router.post('/templates', async (req, res) => {
  try {
    const { name, thumbnail, categorie } = req.body;
    let { url } = req.body;
    if (!name || !url) {
      return res.status(400).json({ success: false, message: 'Numele și URL-ul sunt obligatorii.' });
    }

    // ═══ Normalizare URL Unsplash ═══
    // Cazul 1: URL pagină unsplash.com/photos/slug-ID → extrage imagine reală
    if (url.includes('unsplash.com/photos/') && !url.includes('images.unsplash.com')) {
      try {
        const axios = require('axios');
        const pageRes = await axios.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          maxRedirects: 5,
          timeout: 10000
        });
        const html = typeof pageRes.data === 'string' ? pageRes.data : JSON.stringify(pageRes.data);
        const match = html.match(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9_-]+/);
        if (match) {
          url = `${match[0]}?w=1080&h=1350&fit=crop&q=85`;
        } else {
          return res.status(400).json({ success: false, message: 'Nu am putut extrage imaginea. Copiază URL-ul imaginii direct (click dreapta pe imagine → Copy Image Address).' });
        }
      } catch (fetchErr) {
        console.error('Fetch Unsplash page error:', fetchErr.message);
        return res.status(400).json({ success: false, message: 'Nu pot accesa pagina Unsplash. Copiază URL-ul imaginii direct (click dreapta pe imagine → Copy Image Address).' });
      }
    }
    // Cazul 2: URL direct images.unsplash.com — curăță TOȚI parametrii, setează standard
    else if (url.includes('images.unsplash.com')) {
      // Extrage doar base URL (fără NICIUN parametru - ixlib, ixid, auto, etc.)
      const base = url.split('?')[0];
      url = `${base}?w=1080&h=1350&fit=crop&q=85`;
    }

    console.log('📸 Template URL normalizat:', url);

    // Generează ID unic
    const ultimul = await Template.findOne().sort({ templateId: -1 }).lean();
    const ultimulNr = ultimul ? parseInt(ultimul.templateId.replace('t', '')) : 0;
    const templateId = `t${String(ultimulNr + 1).padStart(3, '0')}`;

    // Generează thumbnail automat (300×375, calitate redusă)
    const thumbUrl = thumbnail || url.replace('w=1080', 'w=400').replace('h=1350', 'h=500').replace('q=85', 'q=60');

    const template = await Template.create({
      templateId,
      name,
      url,
      thumbnail: thumbUrl,
      categorie: categorie || 'spiritual',
      activ: true,
      ordine: ultimulNr + 1,
      sursa: 'admin'
    });

    res.json({ success: true, template, message: `Template "${name}" adăugat!` });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Template-ul există deja.' });
    }
    res.status(500).json({ success: false, message: 'Eroare la adăugarea template-ului.' });
  }
});

// PUT /api/admin/templates/:id — Editează template
router.put('/templates/:id', async (req, res) => {
  try {
    const { name, url, thumbnail, categorie, activ, ordine } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (url !== undefined) update.url = url;
    if (thumbnail !== undefined) update.thumbnail = thumbnail;
    if (categorie !== undefined) update.categorie = categorie;
    if (activ !== undefined) update.activ = activ;
    if (ordine !== undefined) update.ordine = ordine;

    const template = await Template.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!template) return res.status(404).json({ success: false, message: 'Template-ul nu a fost găsit.' });

    res.json({ success: true, template, message: `Template "${template.name}" actualizat!` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Eroare la actualizarea template-ului.' });
  }
});

// PUT /api/admin/templates/:id/toggle — Toggle activ/inactiv
router.put('/templates/:id/toggle', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ success: false, message: 'Template-ul nu a fost găsit.' });
    template.activ = !template.activ;
    await template.save();
    res.json({ success: true, activ: template.activ, message: template.activ ? 'Template activat.' : 'Template dezactivat.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Eroare la toggle template.' });
  }
});

// DELETE /api/admin/templates/:id — Șterge template
router.delete('/templates/:id', async (req, res) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);
    if (!template) return res.status(404).json({ success: false, message: 'Template-ul nu a fost găsit.' });
    res.json({ success: true, message: `Template "${template.name}" șters definitiv.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Eroare la ștergerea template-ului.' });
  }
});

// ═══════════════════════════════════════════════
// MODERARE CERERI DE RUGĂCIUNE
// ═══════════════════════════════════════════════

// GET /api/admin/prayers
router.get('/prayers', async (req, res) => {
  try {
    const { aprobat = '', categorie = '', page = 1, limit = 20 } = req.query;
    const filter = {};
    if (aprobat !== '') filter.aprobat = aprobat === 'true';
    if (categorie) filter.categorie = categorie;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [cereri, total] = await Promise.all([
      PrayerRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      PrayerRequest.countDocuments(filter)
    ]);

    const stats = {
      total: await PrayerRequest.countDocuments(),
      aprobate: await PrayerRequest.countDocuments({ aprobat: true }),
      neaprobate: await PrayerRequest.countDocuments({ aprobat: false }),
      rezolvate: await PrayerRequest.countDocuments({ rezolvat: true })
    };

    res.json({ success: true, cereri, total, stats, pagini: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Eroare la încărcarea cererilor.' });
  }
});

// PUT /api/admin/prayers/:id/toggle-aprobare
router.put('/prayers/:id/toggle-aprobare', async (req, res) => {
  try {
    const cerere = await PrayerRequest.findById(req.params.id);
    if (!cerere) return res.status(404).json({ success: false, message: 'Cererea nu a fost găsită.' });
    cerere.aprobat = !cerere.aprobat;
    await cerere.save();
    res.json({ success: true, aprobat: cerere.aprobat, message: cerere.aprobat ? 'Cerere aprobată.' : 'Cerere respinsă.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Eroare la moderare.' });
  }
});

// PUT /api/admin/prayers/:id/rezolvat
router.put('/prayers/:id/rezolvat', async (req, res) => {
  try {
    const { mesajRezolvare = '' } = req.body;
    const cerere = await PrayerRequest.findById(req.params.id);
    if (!cerere) return res.status(404).json({ success: false, message: 'Cererea nu a fost găsită.' });
    cerere.rezolvat = !cerere.rezolvat;
    cerere.rezolvatLa = cerere.rezolvat ? new Date() : null;
    cerere.mesajRezolvare = mesajRezolvare;
    await cerere.save();
    res.json({ success: true, rezolvat: cerere.rezolvat, message: cerere.rezolvat ? 'Marcat ca rezolvat.' : 'Marcat ca nerezolvat.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Eroare la actualizare.' });
  }
});

// DELETE /api/admin/prayers/:id
router.delete('/prayers/:id', async (req, res) => {
  try {
    const cerere = await PrayerRequest.findByIdAndDelete(req.params.id);
    if (!cerere) return res.status(404).json({ success: false, message: 'Cererea nu a fost găsită.' });
    res.json({ success: true, message: 'Cererea de rugăciune a fost ștearsă.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Eroare la ștergere.' });
  }
});

// ═══════════════════════════════════════════════
// MANAGEMENT DEVOȚIONALE
// ═══════════════════════════════════════════════

// GET /api/admin/devotionals
router.get('/devotionals', async (req, res) => {
  try {
    const { page = 1, limit = 15, published = '' } = req.query;
    const filter = {};
    if (published !== '') filter.published = published === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [devotionale, total] = await Promise.all([
      DailyDevotional.find(filter).sort({ dateKey: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      DailyDevotional.countDocuments(filter)
    ]);

    res.json({ success: true, devotionale, total, pagini: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Eroare la încărcarea devoționalelor.' });
  }
});

// PUT /api/admin/devotionals/:id — Editare devoțional
router.put('/devotionals/:id', async (req, res) => {
  try {
    const allowed = ['title', 'verseText', 'verseReference', 'introduction', 'reflection', 'practicalApplication', 'prayer', 'thoughtOfTheDay', 'published'];
    const update = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    });

    const devotional = await DailyDevotional.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!devotional) return res.status(404).json({ success: false, message: 'Devoționalul nu a fost găsit.' });

    res.json({ success: true, devotional, message: 'Devoțional actualizat!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Eroare la actualizare.' });
  }
});

// PUT /api/admin/devotionals/:id/toggle-published
router.put('/devotionals/:id/toggle-published', async (req, res) => {
  try {
    const devotional = await DailyDevotional.findById(req.params.id);
    if (!devotional) return res.status(404).json({ success: false, message: 'Devoționalul nu a fost găsit.' });
    devotional.published = !devotional.published;
    await devotional.save();
    res.json({ success: true, published: devotional.published, message: devotional.published ? 'Publicat.' : 'Ascuns.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Eroare la toggle.' });
  }
});

// DELETE /api/admin/devotionals/:id
router.delete('/devotionals/:id', async (req, res) => {
  try {
    const devotional = await DailyDevotional.findByIdAndDelete(req.params.id);
    if (!devotional) return res.status(404).json({ success: false, message: 'Devoționalul nu a fost găsit.' });
    res.json({ success: true, message: `Devoțional "${devotional.title}" șters.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Eroare la ștergere.' });
  }
});

module.exports = router;
