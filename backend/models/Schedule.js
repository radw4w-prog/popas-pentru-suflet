// backend/models/Schedule.js
const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Programare zilnică
  dailySchedule: [{
    time: {
      type: String, // Format "HH:MM"
      required: true
    },
    platforms: [{
      type: String,
      enum: ['facebook', 'instagram', 'tiktok']
    }],
    category: {
      type: String,
      default: 'general'
    },
    imageStyle: {
      type: String,
      default: 'nature'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  // Zile active (0 = Duminică, 6 = Sâmbătă)
  activeDays: [{
    type: Number,
    min: 0,
    max: 6
  }],
  timezone: {
    type: String,
    default: 'Europe/Bucharest'
  },
  autoGenerate: {
    type: Boolean,
    default: true
  },
  autoPublish: {
    type: Boolean,
    default: false // Implicit: necesită aprobare manuală
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Schedule', scheduleSchema);