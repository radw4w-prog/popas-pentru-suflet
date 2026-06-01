const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tip: {
    type: String,
    enum: ['reminder', 'milestone', 'intarziere', 'sistem', 'devotional'],
    required: true
  },
  titlu: {
    type: String,
    required: true
  },
  mesaj: {
    type: String,
    required: true
  },
  citit: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: '🔔'
  }
}, {
  timestamps: true
});

// Index pentru queries rapide
notificationSchema.index({ userId: 1, citit: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);