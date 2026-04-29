// backend/models/Settings.js
const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['general', 'social', 'content', 'image', 'schedule'],
    default: 'general'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);