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

    let result;

// Video direct
if (req.body.videoBase64 && req.body.videoBase64.startsWith('data:video')) {
  // ── Video ──
  console.log('🎬 Publicare video direct...');
  result = await facebookService.publishVideo({
    content,
    hashtags,
    videoBase64: req.body.videoBase64
  });

} else {
  // ── Imagine sau text ──
  let imagePath = null;

  if (imageBase64 && imageBase64.startsWith('data:image')) {
    imagePath = saveBase64Image(imageBase64, 'publish');
  }

  const postObj = {
    content,
    hashtags,
    imageBase64: imageBase64 || null,
    imageUrl: imagePath || imageUrl || null
  };

  result = await facebookService.publishPost(postObj);

  if (imagePath && fs.existsSync(imagePath)) {
    try { fs.unlinkSync(imagePath); } catch (e) {}
  }
}

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
// POST /api/social/schedule
router.post('/schedule', async (req, res) => {
  try {
    const {
      content, hashtags, imageBase64, imageUrl,
      videoBase64, tipMedia,
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

    const post = await Post.create({
      content,
      hashtags,
      imageUrl: (imageBase64 || videoBase64) ? null : (imageUrl || null),
      imageBase64: imageBase64 || null,
      videoBase64: videoBase64 || null,
      tipMedia: tipMedia || (videoBase64 ? 'video' : 'image'),
      platform,
      tema,
      verset,
      status: 'scheduled',
      scheduledDate: dateObj
    });

    res.json({
      success: true,
      message: `✅ ${tipMedia === 'video' ? 'Reel' : 'Postare'} programat pentru ${dateObj.toLocaleString('ro-RO')}`,
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
// POST /api/social/publish/:id
router.post('/publish/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Postarea nu există!' });
    }

    let result;

    // Video sau imagine
    if (post.tipMedia === 'video' && post.videoBase64) {
      console.log('🎬 Publicare video Reel...');
      result = await facebookService.publishVideo(post);
    } else {
      console.log('🖼️ Publicare imagine/text...');
      result = await facebookService.publishPost(post);
    }

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
    console.log('🗑️ Delete scheduled:', req.params.id);

    const post = await Post.findById(req.params.id);

    if (!post) {
      console.log('❌ Post not found:', req.params.id);
      return res.status(404).json({ error: 'Postarea nu există!' });
    }

    // Șterge imaginea locală dacă există
    if (post.imageUrl && !post.imageUrl.startsWith('http')) {
      try {
        const absPath = path.isAbsolute(post.imageUrl)
          ? post.imageUrl
          : path.join(__dirname, '..', post.imageUrl);

        if (fs.existsSync(absPath)) {
          fs.unlinkSync(absPath);
          console.log('🗑️ Imagine ștearsă:', absPath);
        }
      } catch (e) {
        console.log('⚠️ Nu am putut șterge imaginea:', e.message);
      }
    }

    await Post.findByIdAndDelete(req.params.id);
    console.log('✅ Post șters:', req.params.id);

    res.json({ success: true, message: 'Programare ștearsă.' });
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});


// ═══════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════

// GET /api/social/analytics/page?period=week
router.get('/analytics/page', async (req, res) => {
  try {
    const { period = 'week' } = req.query;

    if (!facebookService.isConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'Facebook neconectat!'
      });
    }

    const analytics = await facebookService.getPageAnalytics(period);

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    // Dacă analytics eșuează, returnăm date parțiale
    console.error('Analytics page error:', error.message);

    // Încearcă cel puțin info pagină
    try {
      const fbStatus = await facebookService.verifyToken();
      res.json({
        success: true,
        analytics: {
          pageName: fbStatus.pageName || 'Pagina ta',
          fans: fbStatus.followers || 0,
          followers: fbStatus.followers || 0,
          picture: fbStatus.picture || null,
          period,
          impressions: 0,
          reach: 0,
          engagedUsers: 0,
          engagements: 0,
          newFans: 0,
          pageViews: 0,
          insightsLimitate: true
        }
      });
    } catch (e) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

// GET /api/social/analytics/posts?limit=10
router.get('/analytics/posts', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    if (!facebookService.isConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'Facebook neconectat!'
      });
    }

    const posts = await facebookService.getRecentPostsWithStats(
      parseInt(limit)
    );

    // Calculează totale
    const totals = posts.reduce((acc, p) => ({
      likes: acc.likes + p.likes,
      comments: acc.comments + p.comments,
      shares: acc.shares + p.shares,
      reactions: acc.reactions + p.reactions
    }), { likes: 0, comments: 0, shares: 0, reactions: 0 });

    // Top post după engagement
    const topPost = posts.length > 0
      ? posts.reduce((top, p) =>
          (p.likes + p.comments + p.shares) >
          (top.likes + top.comments + top.shares) ? p : top
        )
      : null;

    res.json({
      success: true,
      posts,
      totals,
      topPost,
      total: posts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/social/analytics/post/:postId
router.get('/analytics/post/:postId', async (req, res) => {
  try {
    if (!facebookService.isConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'Facebook neconectat!'
      });
    }

    const analytics = await facebookService.getPostAnalytics(
      req.params.postId
    );

    if (!analytics) {
      return res.status(404).json({
        success: false,
        error: 'Postarea nu a fost găsită.'
      });
    }

    res.json({ success: true, analytics });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/social/analytics/sync
// Sincronizează stats din Facebook în DB
router.put('/analytics/sync', async (req, res) => {
  try {
    if (!facebookService.isConfigured()) {
      return res.status(400).json({
        success: false,
        error: 'Facebook neconectat!'
      });
    }

    const posts = await Post.find({
      status: 'published',
      socialPostId: { $exists: true, $ne: null }
    }).limit(20);

    let actualizate = 0;

    for (const post of posts) {
      try {
        const stats = await facebookService.getPostStats(post.socialPostId);

        await Post.findByIdAndUpdate(post._id, {
          'analytics.likes': stats.likes,
          'analytics.comments': stats.comments,
          'analytics.shares': stats.shares,
          'analytics.syncedAt': new Date()
        });

        actualizate++;
      } catch (e) {
        console.error(`Eroare sync post ${post._id}:`, e.message);
      }
    }

    res.json({
      success: true,
      message: `${actualizate} postări sincronizate.`,
      actualizate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;