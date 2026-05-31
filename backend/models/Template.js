// backend/models/Template.js
const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema(
  {
    templateId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    url: {
      type: String,
      required: true
    },
    thumbnail: {
      type: String,
      required: true
    },
    categorie: {
      type: String,
      enum: ['spiritual', 'apus', 'rasarit', 'munte', 'padure', 'mare', 'flori', 'cer', 'minimalist', 'iarna'],
      default: 'spiritual'
    },
    activ: {
      type: Boolean,
      default: true
    },
    ordine: {
      type: Number,
      default: 0
    },
    sursa: {
      type: String,
      enum: ['builtin', 'upload', 'admin'],
      default: 'builtin'
    }
  },
  {
    timestamps: true
  }
);

templateSchema.index({ categorie: 1, activ: 1 });
templateSchema.index({ activ: 1, ordine: 1 });

module.exports = mongoose.model('Template', templateSchema);
