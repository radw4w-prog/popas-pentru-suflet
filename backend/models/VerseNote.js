// backend/models/VerseNote.js
const mongoose = require('mongoose');

const verseNoteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
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
    referinta: {
      type: String,
      required: true
    },
    textVerset: {
      type: String,
      default: ''
    },
    nota: {
      type: String,
      required: true,
      maxlength: 2000
    }
  },
  {
    timestamps: true,
    collection: 'verse_notes'
  }
);

// Un user poate avea mai multe note pe același verset
verseNoteSchema.index({ userId: 1, carte: 1, capitol: 1, verset: 1 });
verseNoteSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('VerseNote', verseNoteSchema);
