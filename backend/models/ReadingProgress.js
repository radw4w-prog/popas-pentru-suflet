const mongoose = require('mongoose');

const ReadingProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  carte: {
    type: String,
    required: true
  },
  abreviere: {
    type: String,
    default: ''
  },
  capitol: {
    type: Number,
    required: true
  },
  ordineBiblie: {
    type: Number,
    default: 0
  },
  citit: {
    type: Boolean,
    default: true
  },
  cititLa: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'reading_progress'
});

ReadingProgressSchema.index({ userId: 1, carte: 1, capitol: 1 }, { unique: true });
ReadingProgressSchema.index({ userId: 1, cititLa: -1 });
ReadingProgressSchema.index({ userId: 1, ordineBiblie: 1 });

module.exports = mongoose.model('ReadingProgress', ReadingProgressSchema);