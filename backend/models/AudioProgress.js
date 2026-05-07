// backend/models/AudioProgress.js
const mongoose = require('mongoose');

const audioProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    carteIndex: { type: Number, required: true }, // 1-66
    carte: { type: String, required: true },
    capitol: { type: Number, required: true },
    pozitieSecunde: { type: Number, default: 0 },
    durataSecunde: { type: Number, default: 0 },
    complet: { type: Boolean, default: false },
    completatLa: { type: Date, default: null }
  },
  { timestamps: true }
);

audioProgressSchema.index(
  { userId: 1, carteIndex: 1, capitol: 1 },
  { unique: true }
);

module.exports = mongoose.model('AudioProgress', audioProgressSchema);