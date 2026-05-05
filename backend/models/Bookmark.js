const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  carte: {
    type: String,
    required: true
  },
  capitol: {
    type: Number,
    required: true
  },
  verset: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  referinta: {
    type: String,
    default: ''
  },
  testament: {
    type: String,
    default: ''
  },
  tip: {
    type: String,
    enum: ['bookmark', 'highlight', 'note'],
    default: 'bookmark'
  },
  culoare: {
    type: String,
    enum: ['gold', 'red', 'green', 'blue', 'purple', 'none'],
    default: 'gold'
  },
  nota: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  collection: 'bookmarks'
});

BookmarkSchema.index({ userId: 1, carte: 1, capitol: 1, verset: 1 }, { unique: true });
BookmarkSchema.index({ userId: 1, tip: 1 });
BookmarkSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Bookmark', BookmarkSchema);