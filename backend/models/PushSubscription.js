const mongoose = require('mongoose');

const pushSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  endpoint: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  keys: {
    p256dh: {
      type: String,
      required: true
    },
    auth: {
      type: String,
      required: true
    }
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  },
  userAgent: {
    type: String,
    default: null
  },
  lastUsedAt: {
    type: Date,
    default: null
  },
  lastSuccessAt: {
    type: Date,
    default: null
  },
  lastError: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

pushSubscriptionSchema.index({ userId: 1, active: 1 });

module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);
