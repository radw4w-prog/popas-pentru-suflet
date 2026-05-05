const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// GET /api/posts
router.get('/', async (req, res) => {
  try {
    const { limit = 20, page = 1, status = '' } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Post.countDocuments(filter)
    ]);

    res.json({ posts, total, page: parseInt(page) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/posts/:id
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post) return res.status(404).json({ error: 'Postare negăsită' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/posts
router.post('/', async (req, res) => {
  try {
    const post = new Post(req.body);
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/posts/:id
router.put('/:id', async (req, res) => {
  try {
    const { content, hashtags, scheduledDate } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { content, hashtags, scheduledDate },
      { new: true }
    );
    if (!post) return res.status(404).json({ error: 'Postarea nu există' });
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/posts/:id
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: 'Postare negăsită' });
    res.json({ success: true, message: 'Postare ștearsă' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/posts/stats/summary
router.get('/stats/summary', async (req, res) => {
  try {
    const [total, drafts, scheduled, published] = await Promise.all([
      Post.countDocuments(),
      Post.countDocuments({ status: 'draft' }),
      Post.countDocuments({ status: 'scheduled' }),
      Post.countDocuments({ status: 'published' })
    ]);

    res.json({ total, drafts, scheduled, published });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;