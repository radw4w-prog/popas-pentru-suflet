// backend/models/SpiritualJourney.js
const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  nume: { type: String, required: true },
  descriere: { type: String, required: true },
  icon: { type: String, required: true },
  categorie: {
    type: String,
    enum: ['statornicie', 'biblie', 'audio', 'devotional', 'rugaciune'],
    required: true
  },
  deblocatLa: { type: Date, default: Date.now }
}, { _id: false });

const spiritualJourneySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },

  // ═══ STREAK ═══
  streakCurent: { type: Number, default: 0 },
  streakMaxim: { type: Number, default: 0 },
  ultimaZiActiva: { type: Date, default: null },

  // ═══ ZILE ACTIVE ═══
  totalZileActive: { type: Number, default: 0 },

  // ═══ OBIECTIV SĂPTĂMÂNAL ═══
  obiectivSaptamanal: { type: Number, default: 5 }, // zile/săptămână
  zileSaptamanaAceasta: { type: Number, default: 0 },
  saptamanaTrackingKey: { type: String, default: '' }, // ex: "2026-W19"

  // ═══ STATISTICI ═══
  stats: {
    capitoleCitite: { type: Number, default: 0 },
    capitoleAscultate: { type: Number, default: 0 },
    devotionaleParcurse: { type: Number, default: 0 },
    rugaciuniInteractionate: { type: Number, default: 0 }
  },

  // ═══ NIVEL / ETAPĂ ═══
  nivel: {
    type: String,
    enum: ['samanta', 'rasarire', 'crestere', 'rodire', 'statornicie', 'umblare'],
    default: 'samanta'
  },
  puncteTotal: { type: Number, default: 0 },

  // ═══ BADGE-URI ═══
  badgesDeblocate: [badgeSchema],

  // ═══ MILESTONE HISTORY ═══
  milestoneHistory: [{
    tip: String,
    valoare: Number,
    data: { type: Date, default: Date.now }
  }]

}, { timestamps: true });

module.exports = mongoose.model('SpiritualJourney', spiritualJourneySchema);