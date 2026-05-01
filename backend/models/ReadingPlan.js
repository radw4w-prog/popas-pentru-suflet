const mongoose = require('mongoose');

const ReadingPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  dataStart: {
    type: Date,
    required: true
  },
  dataFinal: {
    type: Date,
    required: true
  },
  capitolePerZi: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  totalCapitole: {
    type: Number,
    default: 1189
  },
  activ: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'reading_plans'
});

module.exports = mongoose.model('ReadingPlan', ReadingPlanSchema);