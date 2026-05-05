const mongoose = require('mongoose');

const dailyDevotionalSchema = new mongoose.Schema(
  {
    dateKey: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    theme: {
      type: String,
      default: 'credinta'
    },
    verseText: {
      type: String,
      required: true
    },
    verseReference: {
      type: String,
      required: true
    },
    verseBook: String,
    verseChapter: Number,
    verseNumber: Number,

    introduction: {
      type: String,
      required: true
    },
    reflection: {
      type: String,
      required: true
    },
    practicalApplication: {
      type: String,
      required: true
    },
    prayer: {
      type: String,
      required: true
    },
    thoughtOfTheDay: {
      type: String,
      required: true
    },

    generatedBy: {
      type: String,
      default: 'fallback'
    },
    aiModel: {
      type: String,
      default: ''
    },
    published: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DailyDevotional', dailyDevotionalSchema);