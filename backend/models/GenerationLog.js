const mongoose = require('mongoose');

const GenerationLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  type: {
    type: String,
    enum: ['guest', 'user', 'admin'],
    required: true
  },
  action: {
    type: String,
    enum: ['generate'],
    default: 'generate'
  },
  ip: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  meta: {
    tema: { type: String, default: '' },
    platform: { type: String, default: '' }
  }
}, {
  timestamps: true,
  collection: 'generation_logs'
});

GenerationLogSchema.index({ userId: 1, createdAt: -1 });
GenerationLogSchema.index({ ip: 1, createdAt: -1 });
GenerationLogSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('GenerationLog', GenerationLogSchema);