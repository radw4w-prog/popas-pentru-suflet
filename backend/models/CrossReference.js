// backend/models/CrossReference.js
const mongoose = require('mongoose');

const CrossReferenceSchema = new mongoose.Schema({
  // Versetul sursă
  carte: { type: String, required: true, index: true },
  capitol: { type: Number, required: true, index: true },
  verset: { type: Number, required: true, index: true },

  // Referințele încrucișate
  referinte: [{
    carte: String,
    capitol: Number,
    versetStart: Number,
    versetEnd: Number,    // pentru range (ex: Ioan 3:16-17)
    referinta: String,    // text formatat: "Ioan 3:16"
  }]
}, {
  collection: 'crossreferences',
  timestamps: false
});

CrossReferenceSchema.index({ carte: 1, capitol: 1, verset: 1 }, { unique: true });

module.exports = mongoose.model('CrossReference', CrossReferenceSchema);
