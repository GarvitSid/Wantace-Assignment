const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  answers: { type: mongoose.Schema.Types.Mixed, required: true }, // Flexible JSON
  config_version: { type: Number, required: true },
  estimate_low: { type: Number, required: true },
  estimate_high: { type: Number, required: true }
}, { timestamps: { createdAt: 'captured_at', updatedAt: false } });

module.exports = mongoose.model('Lead', LeadSchema);