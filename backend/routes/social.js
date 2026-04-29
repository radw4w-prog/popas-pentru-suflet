const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const facebookService = require('../services/facebookService');
const Post = require('../models/Post');

// ═══════════════════════════════════════
// helper - salvează imagine base64 pe disc
// ═══════════════════════════════════════
function saveBase64Image(imageBase64, prefix = 'generated') {
  if (!imageBase64 || !imageBase64.startsWith('data:image')) return null;

  const matches = imageBase64.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) return null;

  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const data = matches[2];

  const uploadDir = path.join(__dirname, '../uploads/generated');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `${prefix}_${Date.now()}.${ext}`;
  const filePath = path.join(uploadDir, fileName);

  fs.writeFileSync(filePath, Buffer.from(data, 'base64'));

  // returnăm cale relativă pentru backend
  return `uploads/generated/${fileName}`;
}

// ═══════════════════════════════════════
// GET /api/social/status
// ═══════════════════════════════════════
router.get('/status', async (req, res) => {
  try {
    const fbStatus = await facebookService.verifyToken();

    res.json({
      facebook: {
        configured: facebookService.isConfigured(),
        ...fbStatus
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════
// POST /api/social/publish-direct
// publică imediat
// ═══════════════════════════════════════
router.post('/publish-direct', async (req, res) => {
  try {
    const { content, hashtags, imageBase64, imageUrl, platform = 'facebook', tema = '', verset = null } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Conținut lipsă!' });
    }

    if (!facebookService.isConfigured()) {
      return res.status(400).json({ error: 'Facebook neconectat!' });
    }

    let finalImageUrl = null;

    if (imageBase64 && imageBase64.startsWith('data:image')) {
      finalImageUrl = saveBase64Image(imageBase64, 'publish');
    } else if (imageUrl) {
      finalImageUrl = imageUrl;
    }

    const postObj = {
      content,
      hashtags,
      imageUrl: finalImageUrl
    };

    const result = await facebookService.publishPost(postObj);

    const saved = await Post.create({
      content,
      hashtags,
      imageUrl: finalImageUrl,
      platform,
      tema,
      verset,
      status: 'published',
      publishedAt: new Date(),
      socialPostId: result.postId,
      publishedPlatform: 'facebook'
    });

    res.json({
      success: true,
      message: '✅ Publicat pe Facebook!',
      dbPostId: saved._id,
      ...result
    });
  } catch (error) {
    console.error('❌ Publish error:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ═══════════════════════════════════════
// POST /api/social/schedule
// programează automat
// ═══════════════════════════════════════
router.post('/schedule', async (req, res) => {
  try {
    const {
      content,
      hashtags,
      imageBase64,
      imageUrl,
      platform = 'facebook',
      scheduledDate,
      tema = '',
      verset = null
    } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Conținut lipsă!' });
    }

    if (!scheduledDate) {
      return res.status(400).json({ error: 'Data programării lipsește!' });
    }

    const dateObj = new Date(scheduledDate);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ error: 'Data programării este invalidă!' });
    }

    if (dateObj <= new Date()) {
      return res.status(400).json({ error: 'Data trebuie să fie în viitor!' });
    }

    let finalImageUrl = null;

    // foarte important: dacă vine base64, o salvăm permanent
    if (imageBase64 && imageBase64.startsWith('data:image')) {
      finalImageUrl = saveBase64Image(imageBase64, 'scheduled');
    } else if (imageUrl) {
      finalImageUrl = imageUrl;
    }

    const post = await Post.create({
      content,
      hashtags,
      imageUrl: finalImageUrl,
      platform,
      tema,
      verset,
      status: 'scheduled',
      scheduledDate: dateObj
    });

    res.json({
      success: true,
      message: `✅ Programat pentru ${dateObj.toLocaleString('ro-RO')}`,
      post
    });
  } catch (error) {
    console.error('❌ Schedule error:', error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ═══════════════════════════════════════
// GET /api/social/scheduled
// lista programărilor
// ═══════════════════════════════════════
router.get('/scheduled', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'scheduled' })
      .sort({ scheduledDate: 1 })
      .lean();

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════
// GET /api/social/history
// istoric publicate / failed
// ═══════════════════════════════════════
router.get('/history', async (req, res) => {
  try {
    const posts = await Post.find({
      status: { $in: ['published', 'failed'] }
    })
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════
// POST /api/social/publish/:id
// publică manual o postare din DB
// ═══════════════════════════════════════
router.post('/publish/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Postarea nu există!' });
    }

    const result = await facebookService.publishPost(post);

    await Post.findByIdAndUpdate(post._id, {
      status: 'published',
      publishedAt: new Date(),
      socialPostId: result.postId,
      publishedPlatform: 'facebook',
      failedReason: null
    });

    res.json({
      success: true,
      message: '✅ Publicat manual!',
      ...result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ═══════════════════════════════════════
// DELETE /api/social/scheduled/:id
// anulează programarea
// ═══════════════════════════════════════
router.delete('/scheduled/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Postarea nu există!' });
    }

    // ștergem și imaginea salvată local, dacă există
    if (post.imageUrl && post.imageUrl.startsWith('uploads/generated/')) {
      const abs = path.join(__dirname, '..', post.imageUrl);
      if (fs.existsSync(abs)) {
        try { fs.unlinkSync(abs); } catch (e) {}
      }
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Programare ștearsă.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;