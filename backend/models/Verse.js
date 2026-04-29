const mongoose = require('mongoose');

const VerseSchema = new mongoose.Schema({
  carte: { type: String, index: true },
  abreviere: { type: String, index: true },
  testament: { type: String, index: true },
  capitol: { type: Number, index: true },
  verset: { type: Number },
  text: { type: String },
  referinta: { type: String, index: true },
  tema: [{ type: String }],
  favorit: { type: Boolean, default: false }
}, {
  timestamps: true,
  collection: 'versets'
});

VerseSchema.index({ text: 'text' });
VerseSchema.index({ carte: 1, capitol: 1, verset: 1 });

module.exports = mongoose.model('Verse', VerseSchema);