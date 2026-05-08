// backend/models/JournalEntry.js
const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // O singură intrare pe zi
  dateKey: {
    type: String,
    required: true
  },

  // Notiță liberă
  notita: {
    type: String,
    default: ''
  },

  // Ce ți-a vorbit Dumnezeu azi
  cuvantDeLaDumnezeu: {
    type: String,
    default: ''
  },

  // Stare spirituală
  stare: {
    type: String,
    enum: ['recunoscator', 'bucuros', 'linistit', 'incercat', 'trist', 'confuz', 'hotarat', 'plin_de_har'],
    default: 'recunoscator'
  },

  // Verset asociat
  vpierset: {
    text: { type: String, default: '' },
    referinta: { type: String, default: '' }
  },

  // Rugăciune personală
  rugaciune: {
    type: String,
    default: ''
  }

}, {
  timestamps: true,
  collection: 'journal_entries'
});

// O singură intrare per user per zi
journalEntrySchema.index({ userId: 1, dateKey: 1 }, { unique: true });

// Pentru căutare text
journalEntrySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('JournalEntry', journalEntrySchema);