const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
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
      postariPublicate
    ] = await Promise.all([
      User.countDocuments({ rol: 'user' }),
      User.countDocuments({
        rol: 'user',
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      User.countDocuments({ lastLogin: { $gte: azi } }),
      Post.countDocuments(),
      Post.countDocuments({ status: 'published' })
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

module.exports = router;
