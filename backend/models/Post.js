const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  hashtags: {
    type: String,
    default: ''
  },
  platform: {
    type: String,
    default: 'facebook'
  },
  tema: {
    type: String,
    default: ''
  },
  verset: {
    text: String,
    referinta: String,
    referintaCompleta: String
  },
  imageUrl: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'failed'],
    default: 'draft'
  },
  scheduledDate: {
    type: Date,
    default: null
  },
  publishedAt: {
    type: Date,
    default: null
  },
  socialPostId: {
    type: String,
    default: null
  },
  publishedPlatform: {
    type: String,
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  analytics: {
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  reach: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 },
  syncedAt: { type: Date, default: null }
},
  failedReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  collection: 'posts'
});

PostSchema.index({ status: 1 });
PostSchema.index({ scheduledDate: 1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ userId: 1 });

module.exports = mongoose.model('Post', PostSchema);