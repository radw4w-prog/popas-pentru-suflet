const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const facebookService = require('../services/facebookService');
const Post = require('../models/Post');

// ═══ HELPER - salvează imagine ═══
function saveBase64Image(imageBase64, prefix = 'generated') {
  if (!imageBase64 || !imageBase64.startsWith('data:image')) return null;

  try {
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
    console.log(`✅ Imagine salvată: ${fileName} (${Math.round(data.length / 1024)} KB)`);

    return filePath; // ✅ Returnăm calea ABSOLUTĂ
  } catch (e) {
    console.error('❌ Eroare salvare imagine:', e.message);
    return null;
  }
}

// GET /api/social/status
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

// POST /api/social/publish-direct
router.post('/publish-direct', async (req, res) => {
  try {
    const {
      content, hashtags, imageBase64,
      imageUrl, platform = 'facebook',
      tema = '', verset = null
    } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Conținut lipsă!' });
    }

    if (!facebookService.isConfigured()) {
      return res.status(400).json({ error: 'Facebook neconectat!' });
    }

    let imagePath = null;

    if (imageBase64 && imageBase64.startsWith('data:image')) {
      imagePath = saveBase64Image(imageBase64, 'publish');
    }

    const postObj = {
      content,
      hashtags,
      imageUrl: imagePath || imageUrl || null
    };

    const result = await facebookService.publishPost(postObj);

    // Cleanup imagine temporară
    if (imagePath && fs.existsSync(imagePath)) {
      try { fs.unlinkSync(imagePath); } catch (e) {}
    }

    await Post.create({
      content, hashtags,
      imageUrl: imageUrl || null,
      platform, tema, verset,
      status: 'published',
      publishedAt: new Date(),
      socialPostId: result.postId,
      publishedPlatform: 'facebook'
    });

    res.json({
      success: true,
      message: '✅ Publicat pe Facebook!',
      ...result
    });
  } catch (error) {
    console.error('❌ Publish error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

// POST /api/social/schedule
router.post('/schedule', async (req, res) => {
  try {
    const {
      content, hashtags, imageBase64, imageUrl,
      platform = 'facebook', scheduledDate,
      tema = '', verset = null
    } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Conținut lipsă!' });
    }

    if (!scheduledDate) {
      return res.status(400).json({ error: 'Data programării lipsește!' });
    }

    const dateObj = new Date(scheduledDate);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({ error: 'Data invalidă!' });
    }

    if (dateObj <= new Date()) {
      return res.status(400).json({ error: 'Data trebuie să fie în viitor!' });
    }

    // ✅ Salvează imaginea permanent pentru programare
    let savedImagePath = null;

    if (imageBase64 && imageBase64.startsWith('data:image')) {
      savedImagePath = saveBase64Image(imageBase64, 'scheduled');
      console.log('📅 Imagine programare salvată:', savedImagePath);
    }

    const post = await Post.create({
      content, hashtags,
      imageUrl: savedImagePath || imageUrl || null,
      platform, tema, verset,
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
    res.status(400).json({ success: false, error: error.message });
  }
});

// GET /api/social/scheduled
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

// GET /api/social/history
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

// POST /api/social/publish/:id
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

    res.json({ success: true, message: '✅ Publicat!', ...result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/social/scheduled/:id
router.delete('/scheduled/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Nu există!' });
    }

    // Șterge imaginea salvată
    if (post.imageUrl && path.isAbsolute(post.imageUrl)) {
      if (fs.existsSync(post.imageUrl)) {
        try { fs.unlinkSync(post.imageUrl); } catch (e) {}
      }
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;