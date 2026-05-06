// backend/models/PrayerRequest.js
const mongoose = require('mongoose');

const prayerRequestSchema = new mongoose.Schema(
  {
    // Conținut
    titlu: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    cerere: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    categorie: {
      type: String,
      enum: ['sanatate', 'familie', 'munca', 'credinta', 'relatii', 'financiar', 'multumire', 'altele'],
      default: 'altele'
    },

    // Autor
    anonim: {
      type: Boolean,
      default: false
    },
    numeAfisat: {
      type: String,
      default: 'Anonim'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    // Statistici
    rugaciuni: {
      type: Number,
      default: 0
    },
    rugaciuniUseri: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],

    // Moderare
    aprobat: {
      type: Boolean,
      default: true
    },
    rezolvat: {
      type: Boolean,
      default: false
    },
    rezolvatLa: {
      type: Date,
      default: null
    },
    mesajRezolvare: {
      type: String,
      default: ''
    },

    // Vizibilitate
    vizibilitate: {
      type: String,
      enum: ['public', 'privat'],
      default: 'public'
    }
  },
  {
    timestamps: true
  }
);

// Index pentru sortare rapidă
prayerRequestSchema.index({ createdAt: -1 });
prayerRequestSchema.index({ categorie: 1 });
prayerRequestSchema.index({ aprobat: 1 });

module.exports = mongoose.model('PrayerRequest', prayerRequestSchema);