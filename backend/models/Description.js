const mongoose = require('mongoose');

const DescriptionSchema = new mongoose.Schema({
  tema: { type: String, required: true, index: true },
  text: { type: String, required: true },
  stil: { type: String, default: 'inspirational' },
  activ: { type: Boolean, default: true }
}, {
  timestamps: true,
  collection: 'descriptions'
});

module.exports = mongoose.model('Description', DescriptionSchema);