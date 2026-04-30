const mongoose = require('mongoose');

const ReadingProgressSchema = new mongoose.Schema({
  carte: { type: String, required: true },
  capitol: { type: Number, required: true },
  citit: { type: Boolean, default: true },
  cititLa: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'reading_progress'
});

ReadingProgressSchema.index({ carte: 1, capitol: 1 }, { unique: true });

module.exports = mongoose.model('ReadingProgress', ReadingProgressSchema);